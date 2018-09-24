﻿var resultadoParametroExterno;

function checkLogin() {
    
    var c_name = document.cookie;
    if (c_name) {
        var posCookie = c_name.indexOf('empresarioERP');
        if (posCookie >= 0) {
        }
        else {
            location.href = "login.html";
        }
    } else {
        location.href = "login.html";
    }
}

function checkEnvironment(sn_loadEnterprises) {

    var url = getGlobalParameters("urlPlataforma") + "/api/Environment/GetEnvironment";
    var dados = "";

    //Produção
    /*
    var full = window.location.host;
    var parts = full.split('.');
    if (parts.length > 3) {
        dados = parts[0];
        if (dados == "54") {
            dados = "demo";
        }

        if (!sn_loadEnterprises)
            getAjaxParameter(url, dados, function (result) { welcome(result) });
        else
            getAjaxParameter(url, dados, function (result) { CreateEnterprise(result) });
    }
    else {
        window.location = "http://intelecta.com.br";;
    }
    */

    //Desenvolvimento
    dados = "broker";

    if (!sn_loadEnterprises)
        getAjaxParameter(url, dados, function (result) { welcome(result) });
    else
        getAjaxParameter(url, dados, function (result) { CreateEnterprise(result) });
}

function welcome(json) {

    $("#welcome").html(json.companyName).removeClass('hidden');
    loaderImage("login-form", false);
    $("#enterpriseLink").append("<option data-enterpriseID='" + json.ID + "' value='" + json.ID + "' >" + json.companyName + "</option>");

    if (json.linkEnterprise != null) {
        for (var i = 0; i < json.linkEnterprise.length; i++) {
            $("#enterpriseLink").append("<option data-enterpriseID='" + json.linkEnterprise[i].ID + "' value='" + json.linkEnterprise[i].ID + "' >" + json.linkEnterprise[i].companyName + "</option>");
        }
    }

    $("#iEnterpriseID").val(json.ID);

    if (json.textLanguage != null) {
        for (var i = 0; i < json.textLanguage.length; i++) {
            $("#idiom").append("<option data-idiom='" + json.valueLanguage[i] + "' value='" + json.valueLanguage[i] + "' >" + json.textLanguage[i] + "</option>");
        }
    }

    if (json == null) {
        alert("Empresa não encontrada");
    } else {
        loaderImage("data-loginbox", false);
        createMessageJS();
    }
}
