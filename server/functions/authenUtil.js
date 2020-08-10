module.exports.callAuthenticateService = function (ctx) {
    return new Promise(function (resolve, reject) {
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xmlhttp = new XMLHttpRequest();
        var configVariables = require('../../../configVariables.json');
        var securityUrl = configVariables.Microservices.SecurityService.operations.Authenticate.url;
        var authenDetail = ctx.req.app.models.AuthenDetail;
        var authenDetaillOb = new authenDetail();
        authenDetaillOb.UserName = ctx.req.body.Header.Client.UserDetail.UserID;
        authenDetaillOb.UserPassword = ctx.req.body.Header.Client.UserDetail.UserPassword;
        authenDetaillOb.UserRole = ctx.req.baseUrl + ctx.req.path;
        var isCalledCB = false;

        xmlhttp.open('POST', securityUrl, true);
        // Send the POST request
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        //xmlhttp.setRequestHeader('SOAPAction', 'http://bpc.ru/SVIS/cms/v1.1/doCreditCardPaymentAcct');

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if (isCalledCB == false) {
                    clearTimeout(timeoutCallBackend);
                    if (xmlhttp.status == 200) {
                        if (xmlhttp.responseText == "true") {
                            resolve(true);
                        }
                        else {
                            var error = new Error("Access is unauthorized")
                            error.errorCode = "002";
                            reject(error);
                        }
                    }
                    else {
                        var error = new Error("Error when calling to SecurityService")
                        error.errorCode = "022";
                        error.errorInfo = [];
                        error.errorInfo.push({});
                        error.errorInfo[0].edesc = xmlhttp.responseText;
                        reject(error);
                    }
                }
            }
        }

        var timeoutCallBackend = setTimeout(function () {
            isCalledCB = true;
            var error = new Error("Timeout when calling to SecurityService")
            error.errorCode = "020";
            reject(error);
        }, 10000);
        xmlhttp.send(JSON.stringify(authenDetaillOb));
    });
}