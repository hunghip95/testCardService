module.exports.buildRequest = function (req) {
    var app = require('../server');
    req.startLogTime = new Date;
    var logMessageOb = app.models.LogMessage;
    var logRequest = new logMessageOb();
    logRequest.MESSAGEID = req.body.Header.Common.MessageId;
    logRequest.TRANSACTIONID = req.body.Header.Common.TransactionId;
    logRequest.SOURCEID = req.body.Header.Client.SourceAppID;
    logRequest.TARGETID = req.body.Header.Client.TargetAppIds.TargetAppID;
    logRequest.MESSAGETIMESTAMP = req.body.Header.Common.MessageTimestamp;
    
    var originalUrl = req.originalUrl.split('/');
    logRequest.SERVICENAME = originalUrl[3];
    logRequest.OPERATION = originalUrl[5];
    logRequest.SERVICEVERSION = req.body.Header.Common.ServiceVersion;
    logRequest.STATUS = "Request";
    logRequest.ADDITIONALMSG = JSON.stringify(req.body.Header.Common.AdditionalInformation);
    logRequest.TRANSACTIONDETAIL = JSON.stringify(req.body);//escape(JSON.stringify(req.body));
    logRequest.RESPONSESTATUS = '';
    logRequest.ERRORCODE = '';
    logRequest.ERRORMSG = '';
    logRequest.LOGTIMESTAMP = new Date();
    logRequest.HOSTNAME = req.host;
    logRequest.CLIENTIP = req.ip;
    return logRequest;
}

module.exports.buildResponse = function (req, res) {
    var app = require('../server');
    var logMessageOb = app.models.LogMessage;
    var logResponse = new logMessageOb();
    logResponse.MESSAGEID = res.Header.Common.MessageId;
    logResponse.TRANSACTIONID = res.Header.Common.TransactionId;
    logResponse.SOURCEID = res.Header.Client.SourceAppID;
    logResponse.TARGETID = res.Header.Client.TargetAppIds.TargetAppID;
    logResponse.MESSAGETIMESTAMP = res.Header.Common.MessageTimestamp;
    
    var originalUrl = req.originalUrl.split('/');
    logResponse.SERVICENAME = originalUrl[3];
    logResponse.OPERATION = originalUrl[5];
    logResponse.SERVICEVERSION = res.Header.Common.ServiceVersion;
    logResponse.STATUS = "Response";
    logResponse.ADDITIONALMSG = (JSON.stringify(res.Header.Common.AdditionalInformation));
    logResponse.TRANSACTIONDETAIL = JSON.stringify(res);//escape(JSON.stringify(res));
    logResponse.RESPONSESTATUS = (res.ResponseStatus.Status);
    logResponse.ERRORCODE = res.ResponseStatus.GlobalErrorCode;
    logResponse.ERRORMSG = res.ResponseStatus.GlobalErrorDescription;//escape(res.ResponseStatus.GlobalErrorDesc);
    logResponse.TIMEDURATION = Math.abs(new Date - req.startLogTime);
    logResponse.LOGTIMESTAMP = new Date();
    logResponse.HOSTNAME = req.host;
    logResponse.CLIENTIP = req.ip;
    return logResponse;
}
module.exports.buildException = function (err, req, res) {
    var logExceptionOb = req.app.models.ExceptionMessage;
    var logException = new logExceptionOb();

    logException.MESSAGEID = req.body.Header.Common.MessageId;
    logException.TRANSACTIONID = req.body.Header.Common.TransactionId;
    logException.MESSAGETIMESTAMP = req.body.Header.Common.MessageTimestamp;
    var originalUrl = req.originalUrl.split('/');
    logException.SERVICENAME = originalUrl[3];
    logException.OPERATION = originalUrl[5];
    logException.SERVICEVERSION = req.body.Header.Common.ServiceVersion;
    logException.HOSTNAME = req.host;
    logException.ERRORMSG = res.ResponseStatus.GlobalErrorDescription;//escape(res.ResponseStatus.GlobalErrorDesc);
    logException.ERRORCODE = res.ResponseStatus.GlobalErrorCode;

    var errDetail = "message: "+ err.message + ",\nerrorCode: "
    + err.errorCode+",\nerrorInfoDesc: "+ err.errInfoDesc +",\nstack:" + err.stack;
    
    logException.ERRORDETAILS = errDetail.toString();//escape(errDetail.toString());
    logException.DATA = JSON.stringify(res);//escape(JSON.stringify(res));
    logException.CLIENTIP = req.ip;

    return logException;
}

module.exports.putRequest = function (req) {
    var configVariables = require('../../../configVariables.json');
    var putLogUrl = configVariables.Microservices.PutLogService.Operations.PutLog.Url;
    var putLogTimeout = configVariables.Microservices.PutLogService.Operations.PutLog.Timeout;
    var LogUtil = require('./logUtil');
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    var logMessageRequest = LogUtil.buildRequest(req);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                clearTimeout(timeoutCallBackend);
                console.log("Call putRequest " +xmlhttp.responseText);
            }
            else{
                console.log("Call putRequest error: " +xmlhttp.responseText);    
            }
        }
    }
    var timeoutCallBackend = setTimeout(function () {
        xmlhttp.abort();
        console.log("Call putRequest time out!!");
        //throw ("020--Timeout when call to Backend");
    }, parseInt(putLogTimeout));
    xmlhttp.open("POST", putLogUrl, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(logMessageRequest));

}

module.exports.putResponse = function (req, res) {
    var configVariables = require('../../../configVariables.json');
    var putLogUrl = configVariables.Microservices.PutLogService.Operations.PutLog.Url;
    var putLogTimeout = configVariables.Microservices.PutLogService.Operations.PutLog.Timeout;
    var logMessage = require('./logUtil');
    var logMessageRes = logMessage.buildResponse(req, res);
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                clearTimeout(timeoutCallBackend);
                console.log("Call putResponse " +xmlhttp.responseText);
            }else{
                console.log("Call putResponse error: " +xmlhttp.responseText);    
            }
        }
    }
    var timeoutCallBackend = setTimeout(function () {
        xmlhttp.abort();
        console.log("Call putResponse time out!!");
        //throw ("020--Timeout when call to Backend");
    }, parseInt(putLogTimeout));

    xmlhttp.open("POST", putLogUrl, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(logMessageRes));
}

module.exports.putException = function (err, req, dataR) {
    var buildLog = require('./logUtil');
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    var configVariables = require('../../../configVariables.json');
    var putExceptionUrl = configVariables.Microservices.PutLogService.Operations.PutException.Url;
    var putExceptionTimeout = configVariables.Microservices.PutLogService.Operations.PutException.Timeout;
    var logException = buildLog.buildException(err, req, dataR);

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                clearTimeout(timeoutCallBackend);
                console.log("Call putException " +xmlhttp.responseText);
            }else{
                console.log("Call putException error: " +xmlhttp.responseText);    
            }
        }
    }
    var timeoutCallBackend = setTimeout(function () {
        xmlhttp.abort();
        console.log("Call putException time out!!");
        //throw ("020--Timeout when call to Backend");
    }, parseInt(putExceptionTimeout));
    xmlhttp.open("POST", putExceptionUrl, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(JSON.stringify(logException));

}