module.exports.callDoCreditCardPaymentAcct = function (msg) {
    return new Promise(function (resolve, reject) {
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xmlhttp = new XMLHttpRequest();
        var messageUtil = require('../functions/messageUtil');
        var configVariables = require('../../../configVariables.json');
        var smvUrl = configVariables.Smartvista.Url;
        var smvTimeout = configVariables.Smartvista.Operations.DoCreditCardPaymentAcct.Timeout ;
        //valid message
        //var isValid = messageUtil.validateDoCreditCardPaymentAcctReq(msg);
        var isValid;
        if (isValid != null) {
            return reject(isValid);
        }
        else {
            var backEndReq = messageUtil.buildDoCreditCardPaymentAcctReq(msg);

            var isCalledCB = false;

            xmlhttp.open('POST', smvUrl, true);
            // Send the POST request
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
            //xmlhttp.setRequestHeader('SOAPAction', 'http://bpc.ru/SVIS/cms/v1.1/doCreditCardPaymentAcct');

            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    if (isCalledCB == false) {
                        clearTimeout(timeoutCallBackend);
                        if (xmlhttp.status == 200) {
                            resolve(xmlhttp.responseText);
                        }
                        else {
                            var error = new Error("Error when calling to Backend")
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
                var error = new Error("Timeout when calling to Backend")
                error.errorCode = "020";
                reject(error);
            }, parseInt(smvTimeout));
            xmlhttp.send(backEndReq);
        }
    })
}