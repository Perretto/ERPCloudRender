const _ = require('lodash')
const database = require('./database')
const server = require('../config/server')
const express = require('express')
const dados = require('./connections')
var sql = require("mssql");
const general = require('./general')

const router = express.Router()
server.use('/api', router)
// config for your database
var config = {user: 'sa', password: 'IntSql2015@', server: '52.89.63.119',  database: 'eCloud-homologa'};
var configMetaObjecto = {user: 'sa', password: 'IntSql2015@', server: '52.89.63.119',  database: 'intelecta10_homologa'};

//var config = {user: 'sa', password: 'IntSql2015@', server: '52.89.63.119',  database: 'eCloud-foodtown'};
//var configMetaObjecto = {user: 'sa', password: 'IntSql2015@', server: '52.89.63.119',  database: 'intelecta10_foodtown_up'};


//var url = "mongodb://localhost:27017/foodtown";
var base = "erpcloud"; // erpcloudfoodtown
var url = "mongodb://localhost:27017/erpcloud";
//var config = {user: 'sa', password: '1nt3l3ct@', server: '54.149.163.193',  database: 'eCloud-roadmap'};

router.route('/listall/:id').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    //var url = "mongodb://localhost:27017/erpcloud";
    var id = req.param('id');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("layouts").find({"layoutID": id}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].listall;
            }
        }
        
        db.close();
      });
    });

    sql.close()
    // connect to your database
    sql.connect(config, function (err) {    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();       

        // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset)            
        });
    });    

});

router.route('/findid/:id').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var id = "d82d11c8-ea16-47c7-be04-10423467f04e"; //req.param('id');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("layouts").find({"layoutID": id}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].finddata;                                
            }
        }
        
        db.close();
      });
    });

    sql.close()

    // connect to your database
    sql.connect(config, function (err) {    
        if (err) console.log(err);
        
        var id = req.param('id');

        // create Request object
        var request = new sql.Request();
        
        select = select.replace("{{id}}", id)
         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset)            
        });
    });    
});

router.route('/editGridLine/:id/:filtro').get(function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var id = req.param('id');
    var filtro = req.param('filtro');
    var select = ""; //'select Id, nm_razaosocial, nr_codigo, dt_cadastro, nm_nomefantasia, sn_pessoafisica, nm_cpf, nm_cnpj FROM entidade'

    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("containers").find({"containerID": id}, { _id: false }).toArray(function(err, result) {
        if (err) throw err;
        if (result) {
            if (result.length > 0) {
                select = result[0].findgriddata;                                
            }
        }
        
        db.close();
      });
    });

    sql.close()

    // connect to your database
    sql.connect(config, function (err) {    
        if (err) console.log(err);
        
        // create Request object
        var request = new sql.Request();
        
        select = select.replace("{{id}}", filtro)
         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset)            
        });
    });    
});



router.route('/save').post(function(req, res) {   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    var update = "";
    var retorno = "0"
    var setrecord;
    var error = "";

    var submit = req.body;
    var insertOrUpdate = ""
    var request = new sql.Request();
    sql.close()

    var guid = general.guid(); 
    
    for (var index = 0; index < submit.length; index++) {
        if (submit[index]["id"] == "") {
            insertOrUpdate = createInsert(submit, index, guid)
        }else{
            guid = submit[index]["id"];
            insertOrUpdate = createUpdate(submit, index)
        }
    }

        sql.close()

        sql.connect(config).then(function() {
                request = new sql.Request();
                request.query(insertOrUpdate).then(function(recordset) {
                //console.log('Recordset: ' + recordset);
                //console.log('Affected: ' + request.rowsAffected);
                var retorno = '{ "status": "success", "id": "' + guid + '" }'
                var obj = JSON.parse(retorno)
                res.send(obj)
            }).catch(function(err) {
                console.log('Request error: ' + err);
                var retorno = '{ "status": "error", "message": "' + err + '" }'
                var obj = JSON.parse(retorno)
                res.send(obj)
            });
        }).catch(function(err) {
            if (err) {
            console.log('SQL Connection Error: ' + err);
            var retorno = '{ "status": "error", "message": "' + err + '" }'
            var obj = JSON.parse(retorno)
            res.send(obj)
            }
        }); 
    
});

function createInsert(submit, index, guid){
    var insertOrUpdate = ""
    var ind = 0;
    var table = "";    
    
    var sqlfields = ""
    var sqlvalues = ""         
        
    ind = 0;
        
    sqlfields = "( "
    sqlvalues = " VALUES( "

    for (var key in submit[index]) {            
        if (key === "TABLE") {
            table = submit[index][key]
        }else{
            if (key == "id" && submit[index][key] == "") {
                submit[index][key] = "" + guid + ""
            }
            
            var prefixo = key[0] + key[1];

            switch (prefixo) {
                case "id":
                    if (submit[index][key] == "") {
                        submit[index][key] = "NULL"
                    }else{
                        submit[index][key] = "'" + submit[index][key] + "'"
                    }
                    break;
                case "sn":
                    if (submit[index][key] == "" || submit[index][key] == "false") {
                        submit[index][key] = "0"
                    }else{
                        submit[index][key] = "1"
                    }
                    break;
                case "nm":
                    submit[index][key] = "'" + submit[index][key] + "'"                   
                    break;
                case "dt":
                    if (submit[index][key] == "" || submit[index][key] == "01/01/1900") {
                        submit[index][key] = "NULL"
                    }else{
                        submit[index][key] = "'" + submit[index][key] + "'"
                    }                     
                    break;
                default:
                    break;
            }


            if (ind == 0) {
                sqlfields += key                    
                sqlvalues += "" + submit[index][key] + " "
            }else{
                sqlfields = sqlfields + ", " + key
                sqlvalues = sqlvalues + ", " + submit[index][key] + " "
            }

            ind += 1
        }      
        
    }
    
    
    sqlfields += ") "
    sqlvalues += ") "

    insertOrUpdate += " INSERT INTO " + table
    insertOrUpdate +=  sqlfields + " " + sqlvalues

    //}

    return insertOrUpdate;
}

function createUpdate(submit, index){
    var update = "OK";
    var ind = 0;
    var table = "";        
    var id = "";
    var sqlvalues = ""

    for (var key in submit[index]) {            
        if (key === "TABLE" || key === "id") {
            if (key === "TABLE") {
                table = submit[index][key]
            }else{
                id = "'" + submit[index][key] + "'"
            }            
        }else{            
            var prefixo = key[0] + key[1];
            switch (prefixo) {
                case "id":
                    if (submit[index][key] == "" || submit[index][key] == undefined || submit[index][key] == "undefined") {
                        submit[index][key] = "NULL"
                    }else{
                        submit[index][key] = "'" + submit[index][key] + "'"
                    }
                    break;
                case "sn":
                    if (submit[index][key] == "" || submit[index][key] == "false") {
                        submit[index][key] = "0"
                    }else{
                        submit[index][key] = "1"
                    }
                    break;
                case "nm":
                    submit[index][key] = "'" + submit[index][key] + "'"                   
                    break;
                case "dt":
                    if (submit[index][key] == "" || submit[index][key] == "01/01/1900") {
                        submit[index][key] = "NULL"
                    }else{
                        submit[index][key] = "'" + submit[index][key] + "'"
                    }                  
                    break;
                default:
                    break;
            }


            if (ind == 0) {                  
                sqlvalues += key + "=" + submit[index][key] + " "
            }else{
                sqlvalues += ", " + key + "=" + submit[index][key] + " "
            }

            ind += 1
        }      
        
    }
    
    update = "UPDATE " + table + " SET " + sqlvalues + " WHERE id=" + id;
    
    return update;

}


router.route('/teste').get(function(req, res) {
    var Client = require('node-rest-client').Client;
    
   // direct way 
   var client = new Client();
    
   var args = {
       path: { "id": 120, "arg1": "hello", "arg2": "world" },	
       headers: { "test-header": "client-api" }
   };
    
   client.get("http://localhost:2444/api/compiler/CsharpCompiler?EnterpriseID=f1495bcf-9258-4245-8edf-d0fac225412d&Class=CadCliente&Function=ConsultaCNPJ&ValueParameters[0]=07.361.429/0001-53",
       function (data, response) {
           // parsed response body as js object 
           res.send(data)
           // raw response 
           console.log(response);
       });
});

module.exports = database


router.route('/saveHtml').post(function(req, res) {   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    const ObjectID = require('mongodb').ObjectID
    
    var objectId = new ObjectID();
    var submit = req.body;
    //var p_ID = submit["_id"];
    var p_layoutID = submit["layoutID"].toUpperCase();
    var p_html = submit["html"];
    var p_tabgenid = submit["tabgenid"];
    var p_listall = submit["listall"];
    var p_finddata = submit["finddata"];
    
    var myobj = {
        //"_id": objectId,
        "layoutID": p_layoutID,
        "html": p_html, 
        "tabgenid": p_tabgenid, 
        "listall": p_listall, 
        "finddata": p_finddata};

    var MongoClient = require('mongodb').MongoClient;
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("layouts").find({"layoutID": p_layoutID}, { _id: false }).toArray(function(err, result) {
            if (err) throw err;
            if (result) {
                if (result.length > 0) {
                    //remove old
                    db.collection("layouts").remove({"layoutID": p_layoutID}, function(err, res) {
                    if (err) throw err;
                    db.close();
                    });
                }
                //create new
                db.collection("layouts").insert(myobj, function(err, res) {
                if (err) throw err;
                db.close();
                });
                
            }
        });
    });
});

router.route('/getSelectListAll/:enterpriseID/:layoutID').get(function(req, res) {
    var enterpriseID = req.param('enterpriseID');
    var layoutID = req.param('layoutID');

    //var select = "SELECT bTab.nm_SystemName +'.'+ bProp.nm_SystemName AS Col, bTab.nm_SystemName AS Tab, ";
    var select = "SELECT bTab.nm_SystemName + '.' + bProp.nm_SystemName + ' AS ''' + bTab.nm_SystemName + '.' + bProp.nm_SystemName + '''' AS Col, bTab.nm_SystemName AS Tab, ";
    select += "    (select top 1 bt.nm_SystemName from BaseObject b ";
    select += "		inner join Property p on b.id=p.id inner join BaseObject bt on bt.id=p.DataTypeID ";
    //select += "		where b.id=bProp.id and bProp.nm_SystemName like 'id_%') AS TabFK ";
    select += "		where b.id=bProp.id and bProp.nm_SystemName like 'id_%') AS TabFK, ";
    select += "(select nm_SystemName FROM BaseObject p WHERE p.ID=c.Fill2PropertyID) as ColFKFill2, ";
    select += "(bProp.nm_SystemName) as Coluna ";
    select += "FROM Control c ";
    select += "INNER JOIN BaseObject b ON c.id=b.ID ";
    select += "INNER JOIN Property prop ON prop.id=c.PropertyID ";
    select += "INNER JOIN BaseObject bProp ON bProp.id=prop.id ";
    select += "INNER JOIN BaseObject bTab ON bTab.id=bProp.OwnerObjectID ";
    select += "WHERE (c.sn_visiblegrid = 1 OR prop.sn_PrimaryKey=1) AND ";
    select += "b.OwnerObjectID = ( SELECT TOP 1 Co.ID AS IDContainerPrincipal FROM Layout L  ";
    select += "                    INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "                    LEFT JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "                    LEFT JOIN Container Co ON Co.ID=fxc.ContainerID ";
    select += "                    WHERE L.ID='" + layoutID + "'  and bTab.ID=L.PrincipalDataTypeID ";
    select += "                    ORDER BY fxc.nr_DisplaySequence ) ";
    select += "ORDER BY c.nr_ScreenSequence ";

    sql.close()
    // connect to your database
    sql.connect(configMetaObjecto, function (err) {    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) console.log(err)
            //select no sql
            var sqlfinal = ""
            if(recordset.recordsets[0].length > 0){
                sqlfinal = "SELECT"
                for (let i = 0; i < recordset.recordsets[0].length; i++) {
                    const element = recordset.recordsets[0][i];
                    if(i == 0){
                        if(element.ColFKFill2 != null && element.TabFK != null){
                            sqlfinal += " (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                        }else{
                            sqlfinal += " " + element.Col;
                        }
                    }else{
                        if(element.ColFKFill2 != null && element.TabFK != null){
                            sqlfinal += ", (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                        }else{
                            sqlfinal += ", " + element.Col;
                        }
                    }
                }
                sqlfinal += " FROM " + recordset.recordsets[0][0].Tab
                
                switch (layoutID.toLowerCase()) {
                    case "d82d11c8-ea16-47c7-be04-10423467f04e":
                        sqlfinal += " WHERE entidade.sn_tipoentidadecliente=1" 
                        break;
                    case "589b6dae-4b0b-41f1-9516-3eaf235dff61":
                        sqlfinal += " WHERE entidade.sn_tipoentidadefornecedor=1" 
                        break;
                    case "74cfff79-da65-4172-8f8c-e6ce92da5819":
                        sqlfinal += " WHERE entidade.sn_tipoentidadeprestador=1" 
                        break;
                    case "26d46f90-5b1f-4e64-b2a8-b97090df03dc":
                        sqlfinal += " WHERE entidade.sn_tipoentidadevendedor=1" 
                        break;
                    default:
                        break;
                }
            }
            // send records as a response
            res.send(sqlfinal)
            

        });
    });
});

router.route('/saveLayout').post(function(req, res) {   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    const ObjectID = require('mongodb').ObjectID
    
    var objectId = new ObjectID();
    var submit = req.body;
    
    getSelecFinddata(submit, function(submitFindData){        
        getSelectListAll(submitFindData, function(submitListAll){
            savehtml(submitListAll);        
        })
    })

})

function savehtml(submitIn){
    var submit = new Object();

    submit["layoutID"] = submitIn["layoutID"]
    submit["html"] = submitIn["html"];
    submit["tabgenid"] = submitIn["tabgenid"];
    submit["listall"] = submitIn["listall"];
    submit["finddata"] = submitIn["finddata"];

    const ObjectID = require('mongodb').ObjectID
    
    var objectId = new ObjectID();
    //var submit = req.body;
    var p_layoutID = submit["layoutID"].toUpperCase();
    var p_html = submit["html"];
    var p_tabgenid = submit["tabgenid"];
    var p_listall = submit["listall"];
    var p_finddata = submit["finddata"];
    
    var myobj = {
        //"_id": objectId,
        "layoutID": p_layoutID,
        "html": p_html, 
        "tabgenid": p_tabgenid, 
        "listall": p_listall, 
        "finddata": p_finddata};

    var MongoClient = require('mongodb').MongoClient;
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("layouts").find({"layoutID": p_layoutID}, { _id: false }).toArray(function(err, result) {
            if (err) throw err;
            if (result) {
                
                if (result.length > 0) {
                    //remove old
                    db.collection("layouts").remove({"layoutID": p_layoutID}, function(err, res) {
                    if (err) throw err;
                    db.close();
                    });
                }
                //create new
                db.collection("layouts").insert(myobj, function(err, res) {
                if (err) throw err;
                db.close();
                });
                
            }
        });
    });
}

function getSelecFinddata(submit, callback) {
    var enterpriseID = submit["enterpriseID"]
    var layoutID= submit["layoutID"];

    var select = "SELECT bTab.nm_SystemName + '.' + bCol.nm_SystemName + ' AS ''' + bTab.nm_SystemName + '.' + bCol.nm_SystemName + '''' as Col, ";
    select += "	bTab.nm_SystemName as Tab, bCol.nm_SystemName as Coluna, ";
    select += "    (select top 1 BaseObject.nm_SystemName from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID ";
    select += "		where form.LayoutID='" + layoutID + "' ";
    select += "		order by FormXContainer.nr_DisplaySequence";
    select += "	) As TabPrincipal, ";
    select += "	bTab.DerivedFromID, ";
    
    //select += "	(select top 1 bt.nm_SystemName from BaseObject b ";
    //select += "		inner join Property p on b.id=p.id inner join BaseObject bt on bt.id=p.DataTypeID ";
    //select += "	    where b.id=bCol.id and bCol.nm_SystemName like 'id_%'";
    //select += "	) AS TabFK, ";
    select += "(select top 1 bb.nm_SystemName ";
    select += "from form ";
    select += "    inner join FormXContainer ON form.id=FormXContainer.BaseObjectID  ";
    select += "    inner join Container ON Container.ID=FormXContainer.ContainerID  ";
    select += "    inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID "; 
    select += "    inner join Control CTR ON CTR.PropertyID=bCol.ID  ";
    //select += "    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill1PropertyID "; 
    select += "    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID "; 
    select += "    inner join baseobject bb ON bb.id=bCTR.Ownerobjectid ";
    select += "    where form.LayoutID='" + layoutID + "' and Container.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID) AS TabFK,  ";
      
    //select += "    (select top 1 bCTR.nm_SystemName ";
    //select += "      from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    //select += "      inner join Container ON Container.ID=FormXContainer.ContainerID ";
    //select += "      inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID ";
    //select += "      inner join Control CTR ON CTR.PropertyID=bCol.ID ";
    //select += "      inner join BaseObject bCTR ON bCTR.ID=CTR.Fill1PropertyID ";
    //select += "      where form.LayoutID='" + layoutID + "' and Container.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID) AS ColFKFill1, ";
    
    select += "(SELECT top 1 bProp.nm_SystemName ";
    select += "    FROM Control  ";
    select += "    INNER JOIN BaseObject bctr ON bctr.ID=Control.ID ";
    select += "    INNER JOIN BaseObject bProp ON bProp.ID=Control.Fill1PropertyID ";
    select += "    inner join Container ON Container.ID=bctr.OwnerObjectID  ";
    select += "    inner join FormXContainer ON Container.ID=FormXContainer.ContainerID ";
    select += "    inner join Form ON Form.ID=FormXContainer.BaseObjectID ";    
    select += "    WHERE Control.PropertyID = bCol.ID  ";
    select += "    AND Form.LayoutID='" + layoutID + "') AS ColFKFill1 , ";

    select += "	(select top 1 bCTR.nm_SystemName ";
    select += "		from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "     inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "     inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID ";
    select += "     inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "     where form.LayoutID='" + layoutID + "' and Container.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID ";
    select += "	UNION ";
    select += "		(select top 1 bCTR.nm_SystemName ";
    select += "	    from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "     where form.LayoutID='" + layoutID + "' and Co2.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID";
    select += "	    GROUP BY bCTR.nm_SystemName)";
    select += "	UNION";
    select += "		(select top 1 bCTR.nm_SystemName ";
    select += "	    from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "		LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc2.ContainerID ";
    select += "		LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "     where form.LayoutID='" + layoutID + "' and Co3.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID";
    select += "	    GROUP BY bCTR.nm_SystemName)";
    select += "	) AS ColFKFill2,";
    
    
    select += "	(select top 1 Template.nm_TemplateType";
    select += "		from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "     inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "     inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "	    inner join Template ON Template.ID=FormXContainer.TemplateID";
    select += "     where form.LayoutID='" + layoutID + "' and Container.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID ";
    select += "	    GROUP BY Template.nm_TemplateType";
    select += "	UNION ";
    select += "		(select top 1 Template.nm_TemplateType";
    select += "	    from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "		inner join Template ON Template.ID=fxc2.TemplateID";
    select += "     where form.LayoutID='" + layoutID + "' and Co2.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID";
    select += "	    GROUP BY Template.nm_TemplateType) ";
    select += "	UNION";
    select += "		(select top 1 Template.nm_TemplateType";
    select += "	    from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "		LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc2.ContainerID ";
    select += "		LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "		inner join Template ON Template.ID=fxc3.TemplateID";
    select += "     where form.LayoutID='" + layoutID + "' and Co3.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID";
    select += "	    GROUP BY Template.nm_TemplateType)";
    select += "	) AS Template ";
    
    
    select += "FROM BaseObject bTab ";
    select += "    inner join BaseObject bCol ON bTab.ID = bCol.OwnerObjectID ";
    select += "    inner join Property prop ON prop.ID = bCol.ID ";
    select += "    inner join DataType dt ON dt.ID = bTab.ID ";
    select += "    inner join BaseObject bDT ON bDT.ID = prop.DataTypeID ";
    select += "WHERE bCol.ID ";
    select += "	in ( ";
    select += "			SELECT c.PropertyID FROM Control c ";
    select += "			INNER JOIN BaseObject b ON c.id=b.ID ";
    select += "			WHERE c.sn_virtual=0 AND b.OwnerObjectID in ";
    select += "			( ";
    select += "				(SELECT Co1.ID FROM Layout L ";
    select += "					INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "					INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "					INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "				WHERE L.ID='" + layoutID + "' ";
    select += "				GROUP BY Co1.ID) ";
    select += "				UNION ";
    select += "				(SELECT Co2.ID FROM Layout L ";
    select += "					INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "					INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "					INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "				WHERE L.ID='" + layoutID + "' ";
    select += "				GROUP BY Co2.ID) ";
    select += "				UNION ";
    select += "				(SELECT Co3.ID FROM Layout L ";
    select += "					INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "					INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "					INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "				WHERE L.ID='" + layoutID + "' ";
    select += "				GROUP BY Co3.ID) ";
    select += "			) ";
    select += "		) ";
    select += "ORDER BY bTab.nm_SystemName, bCol.nm_SystemName, prop.nr_Sequence";
    

    sql.close()
    // connect to your database
    sql.connect(configMetaObjecto, function (err) {    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
        // query to the database and get the records
        request.query(select, function (err, recordset) {
            if (err) console.log(err)
            //select no sql
            var sqlfinal = "";
            var join = "";
            var listaTabelas = "";
            var tabelaPrincipal = "";
            if(recordset.recordsets[0].length > 0){
                sqlfinal = "SELECT";
                for (let i = 0; i < recordset.recordsets[0].length; i++) {
                    const element = recordset.recordsets[0][i];
                    if (element.ColFKFill1) {

                        if(i == 0){                            
                                if(element.ColFKFill1 != null && element.TabFK != null && (element.Template == "MASTERDETAIL" || element.Template == "GRID")){
                                   
                                    sqlfinal += " (SELECT TOP 1 " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE " + element.ColFKFill1 + "=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                                }else{
                                    sqlfinal += " " + element.Col;
        
                                    if(element.ColFKFill1 != null && element.TabFK != null){
                                        sqlfinal += " (SELECT  TOP 1 " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE " + element.ColFKFill1 + "=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "_FK'";
                                    }
                                }     
                        }else{

                            if(element.ColFKFill1 != null && element.TabFK != null && (element.Template == "MASTERDETAIL" || element.Template == "GRID")){
                                sqlfinal += ", (SELECT  TOP 1 " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE " + element.ColFKFill1 + "=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                            }else{
                                sqlfinal += ", " + element.Col;

                                if(element.ColFKFill1 != null && element.TabFK != null){
                                    sqlfinal += ", (SELECT  TOP 1 " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE " + element.ColFKFill1 + "=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "_FK'";
                                }
                            }
                        }
                    }else{
                        if(i == 0){ 
                            sqlfinal += " " + element.Col;
                        }else{
                            sqlfinal += ", " + element.Col;
                        }
                        
                    }
                    tabelaPrincipal = element.TabPrincipal;
                    //evita duplicação de tabelas
                    if(listaTabelas.indexOf("#" + element.Tab + "#") == -1){
                        listaTabelas += "#" + element.Tab + "#";
                    
                        var tempFK = "id_" + element.TabPrincipal;
                        if(join == ""){ join = element.TabPrincipal }
                        if(element.TabPrincipal != element.Tab){

                            if(element.TabPrincipal == "entidade"){
                                if(element.Tab == "cliente" || element.Tab == "vendedor" || element.Tab == "prestador" || element.Tab == "fornecedor" || element.Tab == "vendedor"){
                                    tempFK = "id";
                                }else{
                                    tempFK = "id_" + element.TabPrincipal;
                                }
                            }

                            if(element.DerivedFromID == "00000000-0000-0000-0000-000000000000"){
                                join += " LEFT JOIN " + element.Tab + " ON " + element.TabPrincipal + ".id=" + element.Tab + "." + tempFK;
                            }else{
                                join += " INNER JOIN " + element.Tab + " ON " + element.TabPrincipal + ".id=" + element.Tab + "." + tempFK;
                            }
                        }
                    }
                }
                sqlfinal += " FROM " + join //recordset.recordsets[0][0].Tab
                sqlfinal += " WHERE " + tabelaPrincipal + ".id='{{id}}'"
            }
            
            // send records as a response
            //res.send(sqlfinal);
            submit["finddata"] = sqlfinal;
            callback(submit);
        });
    });
}

function getSelectListAll(submit, callback){
    var enterpriseID = submit["enterpriseID"];
    var layoutID = submit["layoutID"];
    //var select = "SELECT bTab.nm_SystemName +'.'+ bProp.nm_SystemName AS Col, bTab.nm_SystemName AS Tab, ";
    var select = "SELECT bTab.nm_SystemName + '.' + bProp.nm_SystemName + ' AS ''' + bTab.nm_SystemName + '.' + bProp.nm_SystemName + '''' AS Col, bTab.nm_SystemName AS Tab, ";
    select += "    (select top 1 bt.nm_SystemName from BaseObject b ";
    select += "		inner join Property p on b.id=p.id inner join BaseObject bt on bt.id=p.DataTypeID ";
    //select += "		where b.id=bProp.id and bProp.nm_SystemName like 'id_%') AS TabFK ";
    select += "		where b.id=bProp.id and bProp.nm_SystemName like 'id_%') AS TabFK, ";
    select += "(select nm_SystemName FROM BaseObject p WHERE p.ID=c.Fill2PropertyID) as ColFKFill2, ";
    select += "(bProp.nm_SystemName) as Coluna ";
    select += "FROM Control c ";
    select += "LEFT JOIN BaseObject b ON c.id=b.ID ";
    select += "LEFT JOIN Property prop ON prop.id=c.PropertyID ";
    select += "LEFT JOIN BaseObject bProp ON bProp.id=prop.id ";
    select += "LEFT JOIN BaseObject bTab ON bTab.id=bProp.OwnerObjectID ";
    select += "WHERE (c.sn_visiblegrid = 1 OR prop.sn_PrimaryKey=1) AND ";
    select += "b.OwnerObjectID = ( SELECT TOP 1 Co.ID AS IDContainerPrincipal FROM Layout L  ";
    select += "                    LEFT JOIN Form f ON L.ID=f.LayoutID ";
    select += "                    LEFT JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "                    LEFT JOIN Container Co ON Co.ID=fxc.ContainerID ";
    select += "                    WHERE L.ID='" + layoutID + "'  and bTab.ID=L.PrincipalDataTypeID ";
    select += "                    ORDER BY fxc.nr_DisplaySequence ) ";
    select += "ORDER BY c.nr_ScreenSequence ";
console.log(select)
    sql.close()
    // connect to your database
    sql.connect(configMetaObjecto, function (err) {    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) console.log(err)
            //select no sql
            var sqlfinal = ""
            if(recordset.recordsets[0].length > 0){
                sqlfinal = "SELECT"
                for (let i = 0; i < recordset.recordsets[0].length; i++) {
                    const element = recordset.recordsets[0][i];
                    if(i == 0){
                        if(element.ColFKFill2 != null && element.TabFK != null){
                            sqlfinal += " (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                        }else{
                            sqlfinal += " " + element.Col;
                        }
                    }else{
                        if(element.ColFKFill2 != null && element.TabFK != null){
                            sqlfinal += ", (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                        }else{
                            sqlfinal += ", " + element.Col;
                        }
                    }
                }
                sqlfinal += " FROM " + recordset.recordsets[0][0].Tab
                
                switch (layoutID.toLowerCase()) {
                    case "d82d11c8-ea16-47c7-be04-10423467f04e":
                        sqlfinal += " WHERE entidade.sn_tipoentidadecliente=1" 
                        break;
                    case "589b6dae-4b0b-41f1-9516-3eaf235dff61":
                        sqlfinal += " WHERE entidade.sn_tipoentidadefornecedor=1" 
                        break;
                    case "74cfff79-da65-4172-8f8c-e6ce92da5819":
                        sqlfinal += " WHERE entidade.sn_tipoentidadeprestador=1" 
                        break;
                    case "26d46f90-5b1f-4e64-b2a8-b97090df03dc":
                        sqlfinal += " WHERE entidade.sn_tipoentidadevendedor=1" 
                        break;
                    default:
                        break;
                }
            }
            // send records as a response
            //res.send(sqlfinal)
            submit["listall"] = sqlfinal;
            callback(submit);

        });
    });
}

router.route('/getSelecFinddata/:enterpriseID/:layoutID').get(function(req, res) {
    var enterpriseID = req.param('enterpriseID');
    var layoutID = req.param('layoutID');

    var select = "SELECT bTab.nm_SystemName + '.' + bCol.nm_SystemName + ' AS ''' + bTab.nm_SystemName + '.' + bCol.nm_SystemName + '''' as Col, ";
    select += "	bTab.nm_SystemName as Tab, bCol.nm_SystemName as Coluna, ";
    select += "    (select top 1 BaseObject.nm_SystemName from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID ";
    select += "		where form.LayoutID='" + layoutID + "' ";
    select += "		order by FormXContainer.nr_DisplaySequence";
    select += "	) As TabPrincipal, ";
    select += "	bTab.DerivedFromID, ";
    
    //select += "	(select top 1 bt.nm_SystemName from BaseObject b ";
    //select += "		inner join Property p on b.id=p.id inner join BaseObject bt on bt.id=p.DataTypeID ";
    //select += "	    where b.id=bCol.id and bCol.nm_SystemName like 'id_%'";
    //select += "	) AS TabFK, ";
    select += "(select top 1 bb.nm_SystemName ";
    select += "from form ";
    select += "    inner join FormXContainer ON form.id=FormXContainer.BaseObjectID  ";
    select += "    inner join Container ON Container.ID=FormXContainer.ContainerID  ";
    select += "    inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID "; 
    select += "    inner join Control CTR ON CTR.PropertyID=bCol.ID  ";
    select += "    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill1PropertyID "; 
    select += "    inner join baseobject bb ON bb.id=bCTR.Ownerobjectid ";
    select += "    where form.LayoutID='" + layoutID + "' and Container.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID) AS TabFK,  ";
      
    //select += "    (select top 1 bCTR.nm_SystemName ";
    //select += "      from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    //select += "      inner join Container ON Container.ID=FormXContainer.ContainerID ";
    //select += "      inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID ";
    //select += "      inner join Control CTR ON CTR.PropertyID=bCol.ID ";
    //select += "      inner join BaseObject bCTR ON bCTR.ID=CTR.Fill1PropertyID ";
    //select += "      where form.LayoutID='" + layoutID + "' and Container.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID) AS ColFKFill1, ";
    
    select += "(SELECT top 1 bProp.nm_SystemName ";
    select += "    FROM Control  ";
    select += "    INNER JOIN BaseObject bctr ON bctr.ID=Control.ID ";
    select += "    INNER JOIN BaseObject bProp ON bProp.ID=Control.Fill1PropertyID ";
    select += "    inner join Container ON Container.ID=bctr.OwnerObjectID  ";
    select += "    inner join FormXContainer ON Container.ID=FormXContainer.ContainerID ";
    select += "    inner join Form ON Form.ID=FormXContainer.BaseObjectID ";    
    select += "    WHERE Control.PropertyID = bCol.ID  ";
    select += "    AND Form.LayoutID='" + layoutID + "') AS ColFKFill1 , ";

    select += "	(select top 1 bCTR.nm_SystemName ";
    select += "		from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "     inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "     inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID ";
    select += "     inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "     where form.LayoutID='" + layoutID + "' and Container.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID ";
    select += "	UNION ";
    select += "		(select top 1 bCTR.nm_SystemName ";
    select += "	    from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "     where form.LayoutID='" + layoutID + "' and Co2.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID";
    select += "	    GROUP BY bCTR.nm_SystemName)";
    select += "	UNION";
    select += "		(select top 1 bCTR.nm_SystemName ";
    select += "	    from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "		LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc2.ContainerID ";
    select += "		LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "     where form.LayoutID='" + layoutID + "' and Co3.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID";
    select += "	    GROUP BY bCTR.nm_SystemName)";
    select += "	) AS ColFKFill2,";
    
    
    select += "	(select top 1 Template.nm_TemplateType";
    select += "		from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "     inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "     inner join BaseObject ON BaseObject.ID=Container.PrincipalDataTypeID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "	    inner join Template ON Template.ID=FormXContainer.TemplateID";
    select += "     where form.LayoutID='" + layoutID + "' and Container.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID ";
    select += "	    GROUP BY Template.nm_TemplateType";
    select += "	UNION ";
    select += "		(select top 1 Template.nm_TemplateType";
    select += "	    from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "		inner join Template ON Template.ID=fxc2.TemplateID";
    select += "     where form.LayoutID='" + layoutID + "' and Co2.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID";
    select += "	    GROUP BY Template.nm_TemplateType) ";
    select += "	UNION";
    select += "		(select top 1 Template.nm_TemplateType";
    select += "	    from form inner join FormXContainer ON form.id=FormXContainer.BaseObjectID ";
    select += "		inner join Container ON Container.ID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=FormXContainer.ContainerID ";
    select += "		LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "	    inner join Control CTR ON CTR.PropertyID=bCol.ID";
    select += "	    inner join BaseObject bCTR ON bCTR.ID=CTR.Fill2PropertyID";
    select += "		LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc2.ContainerID ";
    select += "		LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "		inner join Template ON Template.ID=fxc3.TemplateID";
    select += "     where form.LayoutID='" + layoutID + "' and Co3.PrincipalDataTypeID=bTab.ID and bCol.ID=CTR.PropertyID";
    select += "	    GROUP BY Template.nm_TemplateType)";
    select += "	) AS Template ";
    
    
    select += "FROM BaseObject bTab ";
    select += "    inner join BaseObject bCol ON bTab.ID = bCol.OwnerObjectID ";
    select += "    inner join Property prop ON prop.ID = bCol.ID ";
    select += "    inner join DataType dt ON dt.ID = bTab.ID ";
    select += "    inner join BaseObject bDT ON bDT.ID = prop.DataTypeID ";
    select += "WHERE bCol.ID ";
    select += "	in ( ";
    select += "			SELECT c.PropertyID FROM Control c ";
    select += "			INNER JOIN BaseObject b ON c.id=b.ID ";
    select += "			WHERE c.sn_virtual=0 AND b.OwnerObjectID in ";
    select += "			( ";
    select += "				(SELECT Co1.ID FROM Layout L ";
    select += "					INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "					INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "					INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "				WHERE L.ID='" + layoutID + "' ";
    select += "				GROUP BY Co1.ID) ";
    select += "				UNION ";
    select += "				(SELECT Co2.ID FROM Layout L ";
    select += "					INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "					INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "					INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "				WHERE L.ID='" + layoutID + "' ";
    select += "				GROUP BY Co2.ID) ";
    select += "				UNION ";
    select += "				(SELECT Co3.ID FROM Layout L ";
    select += "					INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "					INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "					INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "					LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "					LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "				WHERE L.ID='" + layoutID + "' ";
    select += "				GROUP BY Co3.ID) ";
    select += "			) ";
    select += "		) ";
    select += "ORDER BY bTab.nm_SystemName, bCol.nm_SystemName, prop.nr_Sequence";
    

    sql.close()
    // connect to your database
    sql.connect(configMetaObjecto, function (err) {    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
        // query to the database and get the records
        request.query(select, function (err, recordset) {
            if (err) console.log(err)
            //select no sql
            var sqlfinal = "";
            var join = "";
            var listaTabelas = "";
            var tabelaPrincipal = "";
            if(recordset.recordsets[0].length > 0){
                sqlfinal = "SELECT";
                for (let i = 0; i < recordset.recordsets[0].length; i++) {
                    const element = recordset.recordsets[0][i];
                    if (element.ColFKFill1) {

                        if(i == 0){                            
                                if(element.ColFKFill1 != null && element.TabFK != null && (element.Template == "MASTERDETAIL" || element.Template == "GRID")){
                                   
                                    sqlfinal += " (SELECT TOP 1 " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE " + element.ColFKFill1 + "=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                                }else{
                                    sqlfinal += " " + element.Col;
        
                                    if(element.ColFKFill1 != null && element.TabFK != null){
                                        sqlfinal += " (SELECT  TOP 1 " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE " + element.ColFKFill1 + "=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "_FK'";
                                    }
                                }     
                        }else{

                            if(element.ColFKFill1 != null && element.TabFK != null && (element.Template == "MASTERDETAIL" || element.Template == "GRID")){
                                sqlfinal += ", (SELECT  TOP 1 " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE " + element.ColFKFill1 + "=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                            }else{
                                sqlfinal += ", " + element.Col;

                                if(element.ColFKFill1 != null && element.TabFK != null){
                                    sqlfinal += ", (SELECT  TOP 1 " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE " + element.ColFKFill1 + "=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "_FK'";
                                }
                            }
                        }
                    }else{
                        if(i == 0){ 
                            sqlfinal += " " + element.Col;
                        }else{
                            sqlfinal += ", " + element.Col;
                        }
                        
                    }
                    tabelaPrincipal = element.TabPrincipal;
                    //evita duplicação de tabelas
                    if(listaTabelas.indexOf("#" + element.Tab + "#") == -1){
                        listaTabelas += "#" + element.Tab + "#";
                    
                        var tempFK = "id_" + element.TabPrincipal;
                        if(join == ""){ join = element.TabPrincipal }
                        if(element.TabPrincipal != element.Tab){

                            if(element.TabPrincipal == "entidade"){
                                if(element.Tab == "cliente" || element.Tab == "vendedor" || element.Tab == "prestador" || element.Tab == "fornecedor" || element.Tab == "vendedor"){
                                    tempFK = "id";
                                }else{
                                    tempFK = "id_" + element.TabPrincipal;
                                }
                            }

                            if(element.DerivedFromID == "00000000-0000-0000-0000-000000000000"){
                                join += " LEFT JOIN " + element.Tab + " ON " + element.TabPrincipal + ".id=" + element.Tab + "." + tempFK;
                            }else{
                                join += " INNER JOIN " + element.Tab + " ON " + element.TabPrincipal + ".id=" + element.Tab + "." + tempFK;
                            }
                        }
                    }
                }
                sqlfinal += " FROM " + join //recordset.recordsets[0][0].Tab
                sqlfinal += " WHERE " + tabelaPrincipal + ".id='{{id}}'"
            }
            
            // send records as a response
            res.send(sqlfinal);
            
        });
    });
});



router.route('/getSelecFindDataGrid').post(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    var submit = req.body;
    
        sql.close()
        // connect to your database
        sql.connect(configMetaObjecto, function (err) { 
            if (err) console.log(err);
            // create Request object
            var request = new sql.Request();

            for (let index = 0; index < submit.length; index++) {
                var p_containerID = submit[index]["containerID"];
                
                var select = "";
                select += "SELECT (cTab.nm_SystemName + '.' + cprop.nm_SystemName + ' AS ''' + cTab.nm_SystemName + '.' + cprop.nm_SystemName + '''') AS Col, ";
                select += "(cTab.nm_SystemName) AS Tab, ";
                select += "(cprop.nm_SystemName) AS Coluna,";
                select += "(SELECT nm_SystemName FROM BaseObject bPFK WHERE bPFK.ID=ctr.Fill2PropertyID ) AS ColFKFill2,";
                select += "(SELECT dtFK.nm_SystemName FROM BaseObject bPFK INNER JOIN BaseObject dtFK ON bPFK.OwnerObjectID=dtFK.ID WHERE bPFK.ID=ctr.Fill2PropertyID) AS TabFK";
        
                select += " FROM BaseObject bctr ";
                select += "INNER JOIN Control ctr ON ctr.ID=bctr.ID ";
                select += "INNER JOIN BaseObject cprop ON cprop.ID=ctr.PropertyID ";
                select += "INNER JOIN BaseObject cTab ON cprop.OwnerObjectID=cTab.ID ";
                select += "WHERE ctr.sn_virtual=0 AND bctr.OwnerObjectID='" + p_containerID + "'";
               
            
            // query to the database and get the records
            request.query(select, function (err, recordset) {
                if (err) console.log(err)
                //select no sql
                var sqlfinal = "";
                var join = "";
                var listaTabelas = "";
                var tabelaPrincipal = "";
                if(recordset.recordsets[0].length > 0){
                    sqlfinal = "SELECT";
                    for (let i = 0; i < recordset.recordsets[0].length; i++) {
                        const element = recordset.recordsets[0][i];
                        if(i == 0){
                                sqlfinal += " " + element.Col;
                               
                        }else{
                                sqlfinal += ", " + element.Col; 
                                                     
                        }
                        
                        if(element.ColFKFill2 != null && element.TabFK != null){
                            sqlfinal += ", (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "_FK'";
                        } 
                        

                        tabelaPrincipal = element.Tab;
                        if(listaTabelas.indexOf("#" + element.Tab + "#") == -1){
                            listaTabelas += "#" + element.Tab + "#";
                        
                            var tempFK = "id_" + element.Tab;
                            if(join == ""){ join = element.Tab }
                            
                        }
                    }
                    sqlfinal += " FROM " + join //recordset.recordsets[0][0].Tab
                    sqlfinal += " WHERE " + tabelaPrincipal + ".id='{{id}}'"
                }
                
                submit[index]["findgriddata"] = sqlfinal;
                if(submit.length == index + 1){
                    // send records as a response
                    res.send(submit);
                }
               
            });
        }
    });    
    
});


router.route('/getListContainersLayout/:enterpriseID/:layoutID').get(function(req, res) {
    var enterpriseID = req.param('enterpriseID');
    var layoutID = req.param('layoutID');
    
    var select = "(SELECT Co1.ID, bs.nm_SystemName FROM Layout L ";
    select += "   INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "    INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "     INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "     INNER JOIN BaseObject bs ON bs.ID=Co1.ID ";
    select += "    LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "    LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "WHERE L.ID='" + layoutID + "' ";
    select += "GROUP BY Co1.ID, bs.nm_SystemName) ";
    select += "UNION ";
    select += "(SELECT Co2.ID, bs.nm_SystemName FROM Layout L ";
    select += "    INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "    INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "    INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "    LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "     LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "    INNER JOIN BaseObject bs ON bs.ID=Co2.ID ";
    select += "    LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "WHERE L.ID='" + layoutID + "' ";
    select += "GROUP BY Co2.ID, bs.nm_SystemName) ";
    select += "UNION ";
    select += "(SELECT Co3.ID, bs.nm_SystemName FROM Layout L ";
    select += "    INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "    INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "    INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "    LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "    LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "    INNER JOIN BaseObject bs ON bs.ID=Co3.ID ";
    select += "WHERE L.ID='" + layoutID + "' ";
    select += "GROUP BY Co3.ID, bs.nm_SystemName) ";
    
    var objCoReturn = [];
    
    sql.close()
    // connect to your database
    sql.connect(configMetaObjecto, function (err) {    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) console.log(err)
            if(recordset.recordsets[0].length > 0){

                for (let i = 0; i < recordset.recordsets[0].length; i++) {
                    const element = recordset.recordsets[0][i];
                    const ObjectID = require('mongodb').ObjectID
                    var objectId = new ObjectID();
                    var objCo = {};
                   // objCo["_id"] = objectId;
                    objCo["containerID"] = element.ID.toUpperCase();
                    objCo["findgriddata"] = "";
                    objCo["deletedata"] = "";
                    objCo["fillgrid"] = "";
                    objCo["LayoutID"] = layoutID.toUpperCase();
                        
                    objCoReturn.push(objCo);
                }
            }
            // send records as a response
            res.send(objCoReturn)
        });
    });
});

router.route('/getSelecFindFillGrid').post(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed

    var submit = req.body;
    
        sql.close()
        // connect to your database
        sql.connect(configMetaObjecto, function (err) {   
            
    for (let index = 0; index < submit.length; index++) {
        var p_containerID = submit[index]["containerID"];
        var p_LayoutID  = submit[index]["LayoutID"];
        
        var select = "";
        select += "SELECT (cTab.nm_SystemName + '.' + cprop.nm_SystemName + ' AS ''' + cTab.nm_SystemName + '.' + cprop.nm_SystemName + '''') AS Col, ";
        select += "(cTab.nm_SystemName) AS Tab, ";
        select += "(SELECT nm_SystemName FROM BaseObject WHERE ID=ctr.Fill2PropertyID ) AS ColFKFill2, ";
        select += "(SELECT TOP 1 tab.nm_SystemName FROM BaseObject INNER JOIN BaseObject tab ON BaseObject.OwnerObjectID=tab.ID  WHERE BaseObject.ID=ctr.Fill2PropertyID ) AS TabFK ";
        select += ", (cprop.nm_SystemName) AS Coluna, ";
        select += " (SELECT nm_SystemName FROM BaseObject WHERE ID=ctr.Fill1PropertyID ) AS ColFKFill1 "
        select += ", (SELECT bPrinc.nm_Systemname FROM BaseObject bPrinc INNER JOIN Layout ON Layout.principalDataTypeID=bPrinc.ID WHERE Layout.ID='" + p_LayoutID + "') AS TabPricipal ";
        select += " FROM BaseObject bctr ";
        select += "INNER JOIN Control ctr ON ctr.ID=bctr.ID ";
        select += "INNER JOIN BaseObject cprop ON cprop.ID=ctr.PropertyID ";
        select += "INNER JOIN Property ON Property.ID=ctr.PropertyID ";
        select += "INNER JOIN BaseObject cTab ON cprop.OwnerObjectID=cTab.ID ";
        select += " WHERE bctr.OwnerObjectID='" + p_containerID + "'  AND (ctr.sn_visibleGrid=1 OR Property.sn_primarykey=1)";
        
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
        // query to the database and get the records
        request.query(select, function (err, recordset) {
            if (err) console.log(err)
            //select no sql
            var sqlfinal = "";
            var join = "";
            var listaTabelas = "";
            var tabelaPrincipal = "";
            var tabelaPrincipalLayout = "";
            if(recordset.recordsets[0].length > 0){
                sqlfinal = "SELECT";
                for (let i = 0; i < recordset.recordsets[0].length; i++) {
                    const element = recordset.recordsets[0][i];
                    if(i == 0){
                        if(element.ColFKFill2 != null && element.TabFK != null ){
                            sqlfinal += " (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                        }else{
                            sqlfinal += " " + element.Col;
                        }
                    }else{
                        if(element.ColFKFill2 != null && element.TabFK != null){
                            sqlfinal += ", (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                        }else{
                            sqlfinal += ", " + element.Col;
                        }
                    }

                    tabelaPrincipalLayout = element.TabPricipal;
                    tabelaPrincipal = element.Tab;
                    if(listaTabelas.indexOf("#" + element.Tab + "#") == -1){
                        listaTabelas += "#" + element.Tab + "#";
                    
                        var tempFK = "id_" + element.Tab;
                        if(join == ""){ join = element.Tab }
                        
                    }
                }
                sqlfinal += " FROM " + join //recordset.recordsets[0][0].Tab
                sqlfinal += " WHERE " + tabelaPrincipal + ".id_" + tabelaPrincipalLayout + "='{{id}}'"
            }
            
            submit[index]["fillgrid"] = sqlfinal;
            if(submit.length == index + 1){
                // send records as a response
                res.send(submit);
            }
               
        });
        }
    });
   
    
});

router.route('/getDeleteData').post(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    
    var submit = req.body;
    
    sql.close()
    // connect to your database
    sql.connect(configMetaObjecto, function (err) {   
        
        for (let index = 0; index < submit.length; index++) {
            var p_containerID = submit[index]["containerID"];
            
            var select = "SELECT bbt.nm_SystemName AS Tab ";
            select += "FROM Container ";
            select += "INNER JOIN DataType dt ON Container.PrincipalDataTypeID=dt.ID ";
            select += "INNER JOIN BaseObject bbt ON bbt.ID=dt.ID ";
            select += "WHERE Container.ID = '" + p_containerID + "' ";
            
            if (err) console.log(err);

            // create Request object
            var request = new sql.Request();

            // query to the database and get the records
            request.query(select, function (err, recordset) {
                if (err) console.log(err)
                
                //select no sql
                var sqlfinal = "";
                if(recordset.recordsets[0].length > 0){
                    const element = recordset.recordsets[0][0];
                    
                    if (element) {
                        if (element.Tab) {
                            sqlfinal = "DELETE FROM " + element.Tab + " WHERE id='{{id}}'";
                        }
                    }
                }
                
                submit[index]["deletedata"] = sqlfinal;
                if(submit.length == index + 1){
                    // send records as a response
                    res.send(submit);
                }
            
            });
        };
    });    
});

router.route('/saveCollectionContainers').post(function(req, res) {   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    
    var submit = req.body;

    var MongoClient = require('mongodb').MongoClient;
    var p_layoutID = submit[0]["LayoutID"];
    
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
        db.collection("containers").find({"LayoutID": p_layoutID}, { _id: false }).toArray(function(err, result) {
            if (err) throw err;
            
            if (result) {
                if (result.length > 0) {
                    //remove old
                    db.collection("containers").remove({"LayoutID": p_layoutID}, function(err, res) {
                    if (err) throw err;
                    db.close();
                    });
                }
            }
            for (let index = 0; index < submit.length; index++) {
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;

                    console.log(submit[index])
                    //create new
                    db.collection("containers").insert(submit[index], function(err, res) {
                    if (err) throw err;
                    db.close();
                    });
                });
            };
        });
    });

});

router.route('/getSelecControls/:enterpriseID/:layoutID').get(function(req, res) {
    var enterpriseID = req.param('enterpriseID');
    var layoutID = req.param('layoutID');

    var select = "SELECT c.ID, bTab.nm_SystemName AS Tabela, bPropF1.nm_SystemName As CampoFill1, bPropF2.nm_SystemName As CampoFill2, bPropF3.nm_SystemName As CampoFill3, c.nm_ControlType AS nm_ControlType, c.nm_Filter AS nm_Filter ";
    select += "FROM Control c ";
    select += "    INNER JOIN BaseObject b ON c.id=b.ID  ";
    select += "     LEFT JOIN Property propF1 ON propF1.id=c.Fill1PropertyID  ";
    select += "     LEFT JOIN BaseObject bPropF1 ON bPropF1.id=propF1.id  ";
    select += "    LEFT JOIN Property propF2 ON propF2.id=c.Fill2PropertyID  ";
    select += "    LEFT JOIN BaseObject bPropF2 ON bPropF2.id=propF2.id  ";
    select += "    LEFT JOIN Property propF3 ON propF3.id=c.Fill3PropertyID "; 
    select += "    LEFT JOIN BaseObject bPropF3 ON bPropF3.id=propF3.id  ";
    select += "    LEFT JOIN BaseObject bTab ON bPropF2.OwnerObjectID=bTab.ID ";
    select += " WHERE (c.Fill1PropertyID != '00000000-0000-0000-0000-000000000000' AND c.Fill2PropertyID != '00000000-0000-0000-0000-000000000000')  ";
    select += "  AND (c.nm_ControlType='AUTOCOMPLETE' OR c.nm_ControlType='DROPDOWN' OR c.nm_ControlType='DROPDOWNDSG') AND b.OwnerObjectID in (  ";
    select += "    (SELECT Co1.ID FROM Layout L  ";
    select += "        INNER JOIN Form f ON L.ID=f.LayoutID  ";
    select += "        INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID  ";
    select += "         INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID  ";
    select += "         INNER JOIN BaseObject bs ON bs.ID=Co1.ID  ";
    select += "        LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID  ";
    select += "        LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID  ";
    select += "        LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID  ";
    select += "        LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID  ";
    select += "    WHERE L.ID='" + layoutID + "'  ";
    select += "    GROUP BY Co1.ID)  ";
    select += "    UNION  ";
    select += "    (SELECT Co2.ID FROM Layout L  ";
    select += "        INNER JOIN Form f ON L.ID=f.LayoutID  ";
    select += "        INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID  ";
    select += "        INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID  ";
    select += "        LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID  ";
    select += "        LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID  ";
    select += "        INNER JOIN BaseObject bs ON bs.ID=Co2.ID  ";
    select += "        LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID  ";
    select += "        LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID  ";
    select += "    WHERE L.ID='" + layoutID + "'  ";
    select += "    GROUP BY Co2.ID)  ";
    select += "    UNION  ";
    select += "    (SELECT Co3.ID FROM Layout L  ";
    select += "        INNER JOIN Form f ON L.ID=f.LayoutID  ";
    select += "        INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID  ";
    select += "        INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID  ";
    select += "         LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID  ";
    select += "        LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID  ";
    select += "        LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID  ";
    select += "        LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID  ";
    select += "        INNER JOIN BaseObject bs ON bs.ID=Co3.ID  ";
    select += "    WHERE L.ID='" + layoutID + "'  ";
    select += "    GROUP BY Co3.ID)  ";
    select += "    ) ";
    
    sql.close()
    // connect to your database
    sql.connect(configMetaObjecto, function (err) {    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) console.log(err)
            //select no sql
            var sqlfinal = "";
            var objCtrlReturn = [];
            if(recordset.recordsets[0].length > 0){
                for (let i = 0; i < recordset.recordsets[0].length; i++) {

                    const element = recordset.recordsets[0][i];
                    
                    if (element.nm_ControlType == "DROPDOWNDSG" || element.nm_ControlType == "DROPDOWN") {
                        sqlfinal = "SELECT ";
                    }else{
                        sqlfinal = "SELECT TOP 20 ";
                    }
                    
                    sqlfinal += element.Tabela + "." + element.CampoFill1 + " as 'id', ";
                    sqlfinal += element.Tabela + "." + element.CampoFill2 + " as 'label' ";

                    sqlfinal += " FROM " + element.Tabela;
                    
                    var where = "";
                    if(element.nm_Filter){
                        where += " WHERE " + element.nm_Filter;
                    }
                    /*
                    if(element.Tabela.toLowerCase() == "entidade"){
                        switch (layoutID) {
                            case "d82d11c8-ea16-47c7-be04-10423467f04e":
                                where += " WHERE entidade.sn_tipoentidadecliente=1";
                                break;
                            case "589b6dae-4b0b-41f1-9516-3eaf235dff61":
                                where += " WHERE entidade.sn_tipoentidadefornecedor=1";
                                break;
                            case "74cfff79-da65-4172-8f8c-e6ce92da5819":
                                where += " WHERE entidade.sn_tipoentidadeprestador=1";
                                break;
                            case "26d46f90-5b1f-4e64-b2a8-b97090df03dc":
                                where += " WHERE entidade.sn_tipoentidadevendedor=1";
                                break;
                            default:
                                break;
                        }
                    }
                    */
                    
                    if(where){
                        where += " AND " + element.Tabela + "." + element.CampoFill2 + " LIKE '{{id}}%' ";
                    }else{
                        where += " WHERE " + element.Tabela + "." + element.CampoFill2 + " LIKE '{{id}}%' ";                        
                    }

                    if (element.nm_ControlType == "DROPDOWNDSG" || element.nm_ControlType == "DROPDOWN") {
                        where = "";
                    }

                    var orderby = " ORDER BY " + element.Tabela + "." + element.CampoFill2;
                    
                    var objCtrl = {};
                    objCtrl["controlID"] = element.ID.toUpperCase();
                    objCtrl["layoutID"] = layoutID.toUpperCase();
                    objCtrl["autocompleteChange"] = sqlfinal + where + orderby;
                    objCtrlReturn.push(objCtrl);
                }
            }
            // send records as a response
            res.send(objCtrlReturn)
        });
    });
});

router.route('/saveCollectionControls').post(function(req, res) {   
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,contenttype'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    
    var submit = req.body;
    var MongoClient = require('mongodb').MongoClient;

if (submit) {
    if (submit.length > 0) {
    
    var p_layoutID = submit[0]["layoutID"];
    
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("controls").find({"layoutID": p_layoutID, _id: 0}).toArray(function(err, result) {
            if (err) throw err;

            if (result) {
                if (result.length > 0) {
                    //remove old
                    db.collection("controls").remove({"layoutID": p_layoutID}, function(err, res) {
                    if (err) throw err;
                    db.close();
                    });
                }
            }

            for (let index = 0; index < submit.length; index++) {
                MongoClient.connect(url, function(err, db) {
                
                //console.log(submit[index]["controlID"]);
                //remove old
                db.collection("controls").remove({"controlID": submit[index]["controlID"]}, function(err, res) {
                    //if (err) throw err;
                    //db.close();
                });
                
                //if (err) throw err;
                        //create new
                        db.collection("controls").insert(submit[index], function(err, res) {
                        if (err) throw err;
                        db.close();
                        });
                });
            }
        });
    });
    
    }
}
});


function getListContainersLayout(enterpriseID, layoutID, callback){
    
    //var enterpriseID = submit["enterpriseID"];
    //var layoutID = submit["layoutID"];
    
    var select = "(SELECT Co1.ID, bs.nm_SystemName FROM Layout L ";
    select += "   INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "    INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "     INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "     INNER JOIN BaseObject bs ON bs.ID=Co1.ID ";
    select += "    LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "    LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "WHERE L.ID='" + layoutID + "' ";
    select += "GROUP BY Co1.ID, bs.nm_SystemName) ";
    select += "UNION ";
    select += "(SELECT Co2.ID, bs.nm_SystemName FROM Layout L ";
    select += "    INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "    INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "    INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "    LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "     LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "    INNER JOIN BaseObject bs ON bs.ID=Co2.ID ";
    select += "    LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "WHERE L.ID='" + layoutID + "' ";
    select += "GROUP BY Co2.ID, bs.nm_SystemName) ";
    select += "UNION ";
    select += "(SELECT Co3.ID, bs.nm_SystemName FROM Layout L ";
    select += "    INNER JOIN Form f ON L.ID=f.LayoutID ";
    select += "    INNER JOIN FormXContainer fxc ON fxc.BaseObjectID=f.ID ";
    select += "    INNER JOIN Container Co1 ON Co1.ID=fxc.ContainerID ";
    select += "    LEFT JOIN FormXContainer fxc2 ON fxc2.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co2 ON Co2.ID=fxc2.ContainerID ";
    select += "    LEFT JOIN FormXContainer fxc3 ON fxc3.BaseObjectID=fxc.ContainerID ";
    select += "    LEFT JOIN Container Co3 ON Co3.ID=fxc3.ContainerID ";
    select += "    INNER JOIN BaseObject bs ON bs.ID=Co3.ID ";
    select += "WHERE L.ID='" + layoutID + "' ";
    select += "GROUP BY Co3.ID, bs.nm_SystemName) ";
    
    var objCoReturn = [];
    
    sql.close()
    // connect to your database
    sql.connect(configMetaObjecto, function (err) {    
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
         // query to the database and get the records
        request.query(select, function (err, recordset) {            
            if (err) console.log(err)
            if(recordset.recordsets[0].length > 0){

                for (let i = 0; i < recordset.recordsets[0].length; i++) {
                    const element = recordset.recordsets[0][i];
                    const ObjectID = require('mongodb').ObjectID
                    var objectId = new ObjectID();
                    var objCo = {};
                   // objCo["_id"] = objectId;
                    objCo["containerID"] = element.ID.toUpperCase();
                    objCo["findgriddata"] = "";
                    objCo["deletedata"] = "";
                    objCo["fillgrid"] = "";
                    objCo["LayoutID"] = layoutID.toUpperCase();
                        
                    objCoReturn.push(objCo);
                }
            }
            
            // send records as a response
            callback(objCoReturn)
        });
    });
}

function getSelecFindFillGrid(submit, callback){
        
        sql.close()
        // connect to your database
        sql.connect(configMetaObjecto, function (err) {   
            
    for (let index = 0; index < submit.length; index++) {
        var p_containerID = submit[index]["containerID"];
        var p_LayoutID  = submit[index]["LayoutID"];
        
        var select = "";
        select += "SELECT (cTab.nm_SystemName + '.' + cprop.nm_SystemName + ' AS ''' + cTab.nm_SystemName + '.' + cprop.nm_SystemName + '''') AS Col, ";
        select += "(cTab.nm_SystemName) AS Tab, ";
        select += "(SELECT nm_SystemName FROM BaseObject WHERE ID=ctr.Fill2PropertyID ) AS ColFKFill2, ";
        select += "(SELECT TOP 1 tab.nm_SystemName FROM BaseObject INNER JOIN BaseObject tab ON BaseObject.OwnerObjectID=tab.ID  WHERE BaseObject.ID=ctr.Fill2PropertyID ) AS TabFK ";
        select += ", (cprop.nm_SystemName) AS Coluna, ";
        select += " (SELECT nm_SystemName FROM BaseObject WHERE ID=ctr.Fill1PropertyID ) AS ColFKFill1 "
        select += ", (SELECT bPrinc.nm_Systemname FROM BaseObject bPrinc INNER JOIN Layout ON Layout.principalDataTypeID=bPrinc.ID WHERE Layout.ID='" + p_LayoutID + "') AS TabPricipal ";
        select += " FROM BaseObject bctr ";
        select += "INNER JOIN Control ctr ON ctr.ID=bctr.ID ";
        select += "INNER JOIN BaseObject cprop ON cprop.ID=ctr.PropertyID ";
        select += "INNER JOIN Property ON Property.ID=ctr.PropertyID ";
        select += "INNER JOIN BaseObject cTab ON cprop.OwnerObjectID=cTab.ID ";
        select += " WHERE bctr.OwnerObjectID='" + p_containerID + "'  AND (ctr.sn_visibleGrid=1 OR Property.sn_primarykey=1)";
        
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
        // query to the database and get the records
        request.query(select, function (err, recordset) {
            if (err) console.log(err)
            //select no sql
            var sqlfinal = "";
            var join = "";
            var listaTabelas = "";
            var tabelaPrincipal = "";
            var tabelaPrincipalLayout = "";
            if(recordset.recordsets[0].length > 0){
                sqlfinal = "SELECT";
                for (let i = 0; i < recordset.recordsets[0].length; i++) {
                    const element = recordset.recordsets[0][i];
                    if(i == 0){
                        if(element.ColFKFill2 != null && element.TabFK != null ){
                            sqlfinal += " (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                        }else{
                            sqlfinal += " " + element.Col;
                        }
                    }else{
                        if(element.ColFKFill2 != null && element.TabFK != null){
                            sqlfinal += ", (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "'";
                        }else{
                            sqlfinal += ", " + element.Col;
                        }
                    }

                    tabelaPrincipalLayout = element.TabPricipal;
                    tabelaPrincipal = element.Tab;
                    if(listaTabelas.indexOf("#" + element.Tab + "#") == -1){
                        listaTabelas += "#" + element.Tab + "#";
                    
                        var tempFK = "id_" + element.Tab;
                        if(join == ""){ join = element.Tab }
                        
                    }
                }
                sqlfinal += " FROM " + join //recordset.recordsets[0][0].Tab
                sqlfinal += " WHERE " + tabelaPrincipal + ".id_" + tabelaPrincipalLayout + "='{{id}}'"
            }
            
            submit[index]["fillgrid"] = sqlfinal;
            if(submit.length == index + 1){
                // send records as a response
                callback(submit);
            }               
        });
        }
    });
}

function getSelecFindDataGrid(submit, callback){
    
    sql.close()
    
    // connect to your database
    sql.connect(configMetaObjecto, function (err) { 
        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();

        for (let index = 0; index < submit.length; index++) {
            var p_containerID = submit[index]["containerID"];
            
            var select = "";
            select += "SELECT (cTab.nm_SystemName + '.' + cprop.nm_SystemName + ' AS ''' + cTab.nm_SystemName + '.' + cprop.nm_SystemName + '''') AS Col, ";
            select += "(cTab.nm_SystemName) AS Tab, ";
            select += "(cprop.nm_SystemName) AS Coluna,";
            select += "(SELECT nm_SystemName FROM BaseObject bPFK WHERE bPFK.ID=ctr.Fill2PropertyID ) AS ColFKFill2,";
            select += "(SELECT dtFK.nm_SystemName FROM BaseObject bPFK INNER JOIN BaseObject dtFK ON bPFK.OwnerObjectID=dtFK.ID WHERE bPFK.ID=ctr.Fill2PropertyID) AS TabFK";
    
            select += " FROM BaseObject bctr ";
            select += "INNER JOIN Control ctr ON ctr.ID=bctr.ID ";
            select += "INNER JOIN BaseObject cprop ON cprop.ID=ctr.PropertyID ";
            select += "INNER JOIN BaseObject cTab ON cprop.OwnerObjectID=cTab.ID ";
            select += "WHERE ctr.sn_virtual=0 AND bctr.OwnerObjectID='" + p_containerID + "'";
       
        
            // query to the database and get the records
            request.query(select, function (err, recordset) {
                if (err) console.log(err)
                //select no sql
                var sqlfinal = "";
                var join = "";
                var listaTabelas = "";
                var tabelaPrincipal = "";
                if(recordset.recordsets[0].length > 0){
                    sqlfinal = "SELECT";
                    for (let i = 0; i < recordset.recordsets[0].length; i++) {
                        const element = recordset.recordsets[0][i];
                        if(i == 0){
                                sqlfinal += " " + element.Col;
                            
                        }else{
                                sqlfinal += ", " + element.Col; 
                                                    
                        }
                        
                        if(element.ColFKFill2 != null && element.TabFK != null){
                            sqlfinal += ", (SELECT " + element.ColFKFill2 + " FROM " + element.TabFK + " WHERE id=" + element.Tab + "." + element.Coluna + ") AS '" + element.Tab + "." + element.Coluna + "_FK'";
                        } 
                        

                        tabelaPrincipal = element.Tab;
                        if(listaTabelas.indexOf("#" + element.Tab + "#") == -1){
                            listaTabelas += "#" + element.Tab + "#";
                        
                            var tempFK = "id_" + element.Tab;
                            if(join == ""){ join = element.Tab }
                            
                        }
                    }
                    sqlfinal += " FROM " + join //recordset.recordsets[0][0].Tab
                    sqlfinal += " WHERE " + tabelaPrincipal + ".id='{{id}}'"
                }
                
                submit[index]["findgriddata"] = sqlfinal;
                if(submit.length == index + 1){
                    // send records as a response
                    callback(submit);
                }
            
            });
        }
    });  
}

function getDeleteData(submit, callback){
    sql.close()
    // connect to your database
    sql.connect(configMetaObjecto, function (err) {   
        
        for (let index = 0; index < submit.length; index++) {
            var p_containerID = submit[index]["containerID"];
            
            var select = "SELECT bbt.nm_SystemName AS Tab ";
            select += "FROM Container ";
            select += "INNER JOIN DataType dt ON Container.PrincipalDataTypeID=dt.ID ";
            select += "INNER JOIN BaseObject bbt ON bbt.ID=dt.ID ";
            select += "WHERE Container.ID = '" + p_containerID + "' ";
            
            if (err) console.log(err);

            // create Request object
            var request = new sql.Request();

            // query to the database and get the records
            request.query(select, function (err, recordset) {
                if (err) console.log(err)
                
                //select no sql
                var sqlfinal = "";
                if(recordset.recordsets[0].length > 0){
                    const element = recordset.recordsets[0][0];
                    
                    if (element) {
                        if (element.Tab) {
                            sqlfinal = "DELETE FROM " + element.Tab + " WHERE id='{{id}}'";
                        }
                    }
                }
                
                submit[index]["deletedata"] = sqlfinal;
                if(submit.length == index + 1){
                    // send records as a response
                    callback(submit);
                }
            
            });
        };
    });    
}

function saveContainer(submit){
    var MongoClient = require('mongodb').MongoClient;
    var p_layoutID = submit[0]["LayoutID"];
    
    MongoClient.connect(url, function(err, db) {
    if (err) throw err;
        db.collection("containers").find({"LayoutID": p_layoutID}, { _id: false }).toArray(function(err, result) {
            if (err) throw err;
            
            if (result) {
                if (result.length > 0) {
                    //remove old
                    db.collection("containers").remove({"LayoutID": p_layoutID}, function(err, res) {
                    if (err) throw err;
                    db.close();
                    });
                }
            }
            for (let index = 0; index < submit.length; index++) {
                MongoClient.connect(url, function(err, db) {
                    if (err) throw err;
                    //create new
                    db.collection("containers").insert(submit[index], function(err, res) {
                    if (err) throw err;
                    db.close();
                    });
                });
            };
        });
    });
}

router.route('/saveContainers/:enterpriseID/:layoutID').get(function(req, res) {   
    var enterpriseID = req.param('enterpriseID');
    var layoutID = req.param('layoutID');
    const ObjectID = require('mongodb').ObjectID
    
    var objectId = new ObjectID();

    getListContainersLayout(enterpriseID, layoutID, function(submitListContainers){               
        getSelecFindFillGrid(submitListContainers, function(submitFindFillGrid){
            getSelecFindDataGrid(submitFindFillGrid, function(submitFindDataGrid){
                getDeleteData(submitFindDataGrid, function(submitDeleteData){
                    saveContainer(submitDeleteData);
                })
            })     
        })
    })
})