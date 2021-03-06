﻿function CreateTextArea(parameters) {
    var retorno = "";
    var readonlybool = "";

    //titulo, classe, tamanho, nome, tooltip, controlID, propertyID, containerID, mask, defaultValue, readOnly, maxLength
    var titulo = parameters.titulo;
    var classe = parameters.classe;
    var tamanho = parameters.tamanho;
    var nome = parameters.nome;
    var tooltip = parameters.tooltip;
    var controlID = parameters.controlID;
    var propertyID = parameters.propertyID;
    var containerID = parameters.containerID;
    var mask = parameters.mask;
    var defaultValue = parameters.defaultValue;
    var readOnly = parameters.readOnly;
    var maxLength = parameters.maxLength;
    var id = parameters.id;

    var nativeDataType = parameters.nativeDataType;
    var table = parameters.table;
    var field = parameters.field;
    var sequenceRecording = parameters.sequenceRecording;
    var derivedFrom = parameters.derivedFrom;
    var serializable = parameters.serializable;


    var value;
    if (parameters.newValue.length > 0) {
        value = parameters.newValue[0];
    } else {
        value = parameters.defaultValue;
    }


    //CreateEvent
    var onLostFocusName = parameters.onLostFocusName;
    var onFocusName = parameters.onFocusName;
    var onKeyPressName = parameters.onKeyPressName;
    var onClickName = parameters.onClickName;
    var onChangeName = parameters.onChangeName;

    if (readOnly == true || readOnly == "true") {
        readonlybool = "readonly"
    }

    //retorno = "<div class='form-group " + classe + " " + tamanho + "'>"
    //retorno = retorno + "<label>" + titulo + "</label>"

    retorno = retorno + "<textarea   data-oldvalue='' data-serializable='" + serializable + "' data-nativeDataType='" + nativeDataType + "' data-table='" + table + "' data-field='" + field + "' data-sequenceRecording='" + sequenceRecording + "' data-derivedFrom='" + derivedFrom + "'  maxlength='" + maxLength + "' data-controlID='" + controlID + "' data-propertyID='" + propertyID + "'  class='form-control " + classe + "' id='" + id + "' name='" + nome + "' placeholder='" + titulo + "' title='" + tooltip + "' onblur='" + onLostFocusName + "' onclick='" + onClickName + "' onfocus='" + onFocusName + "' onchange='" + onChangeName + "' onkeypress='" + onKeyPressName + "' " + readonlybool + " >" + value + "</textarea>"

    //retorno = retorno + "</div>"

    containerID = "#" + containerID;
    $(containerID).append(retorno);


    //if (Value != null && Value != "" && Value != undefined) {
        $("#" + id).val(value);
    //} else {
    //    $("#" + id).val(defaultValue);
    //}

    if (value) {
        $("#" + id).attr("data-oldvalue", value)
    }
}