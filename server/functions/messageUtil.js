module.exports.buildDoCreditCardPaymentAcctReq = function (msg) {
    var configVariables = require('../../../configVariables.json');
    var destinationCard = '<v1:destinationCard>' + (msg.BodyReq.DestinationCard) + '</v1:destinationCard>';
    var cardId = '<v1:cardId>' + (msg.BodyReq.CardId) + '</v1:cardId>';
    var backEndReq =
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://bpc.ru/SVIS/cms/v1.1/">' +
        '<soapenv:Header>' +
        '<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">' +
        '<wsse:UsernameToken wsu:Id="UsernameToken-12" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">' +
        '<wsse:Username>ebanking</wsse:Username>' +
        '<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">ebanking1</wsse:Password>' +
        '</wsse:UsernameToken>' +
        '</wsse:Security>' +
        '</soapenv:Header>' +
        '<soapenv:Body>' +
        '<v1:doCreditCardPaymentAcctRequest>' +
        '<v1:datetime>' + msg.BodyReq.DateTime + '</v1:datetime>' +
        '<v1:trace>'+ configVariables.Smartvista.Operations.DoCreditCardPaymentAcct.Trace+'</v1:trace>' +
        '<v1:terminalId>'+ configVariables.Smartvista.Operations.DoCreditCardPaymentAcct.TerminalId+'</v1:terminalId>' +
        '<v1:merchantId>'+ configVariables.Smartvista.Operations.DoCreditCardPaymentAcct.MerchantId+'</v1:merchantId>' +
        '<v1:amount>' + msg.BodyReq.Amount + '</v1:amount>' +
        '<v1:currency>'+ configVariables.Smartvista.Operations.DoCreditCardPaymentAcct.Currency+'</v1:currency>' +
        '<v1:sourceAccount>' + msg.BodyReq.SourceAccount + '</v1:sourceAccount>' +
        'optional_element' +
        '</v1:doCreditCardPaymentAcctRequest>' +
        '</soapenv:Body>' +
        '</soapenv:Envelope>';
    if (msg.BodyReq.CardId == undefined || msg.BodyReq.CardId ==""){
        backEndReq = backEndReq.replace("optional_element", destinationCard);   
    }
    else{
        backEndReq = backEndReq.replace("optional_element", cardId);  
    }
    return backEndReq;
}
module.exports.validateDoCreditCardPaymentAcctReq = function (msg) {
    if (msg.doCreditCardPaymentAcctReqBody.cardId == null || msg.doCreditCardPaymentAcctReqBody.cardId == "") {
        var error = new Error("Invalid Card_Id")
        error.errorCode = "SE008";
        return (error);
    } else if (msg.doCreditCardPaymentAcctReqBody.amount <= 0 || msg.doCreditCardPaymentAcctReqBody.amount == ""
        || msg.doCreditCardPaymentAcctReqBody.amount == null) {
        var error = new Error("Invalid payment amount: " + msg.doCreditCardPaymentAcctReqBody.amount)
        error.errorCode = "SE008";
        return (error);
    }
}
module.exports.buildDoCreditCardPaymentAcctRes = function (ctx) {
    var app =  ctx.req.app;
    var messageResponseOb = app.models.doCreditCardPaymentAcctRes;
    var bodyResOb = app.models.doCreditCardPaymentAcctRes;
    var bodyRes = new bodyResOb();
    var responseStatusOb = app.models.ResponseStatus;
    var errorInfoOb = app.models.ErrorInfo;

    var messageResponse = new messageResponseOb();
    var responseStatus = new responseStatusOb();
    var errorInfo = new errorInfoOb();


    messageResponse.Header = ctx.req.body.Header;
    //messageResponse.Header.Common.MessageTimestamp = messageResponse.Header.Common.MessageTimestamp.when;
    messageResponse.ResponseStatus = responseStatus;
    messageResponse.ResponseStatus.ErrorInfo = [];

    if (ctx.result.Body.doCreditCardPaymentAcctResponse.status == '0') {
        messageResponse.ResponseStatus.Status = '0';
        messageResponse.ResponseStatus.GlobalErrorCode = '000';
        messageResponse.ResponseStatus.GlobalErrorDescription = 'Successful';
        messageResponse.ResponseStatus.ErrorInfo.push({});
        messageResponse.ResponseStatus.ErrorInfo[0].ErrorCode = ctx.result.Body.doCreditCardPaymentAcctResponse.errorCode;
        bodyRes.Status = ctx.result.Body.doCreditCardPaymentAcctResponse.status;
        bodyRes.ErrorCode = ctx.result.Body.doCreditCardPaymentAcctResponse.errorCode;
        bodyRes.RefNum = ctx.result.Body.doCreditCardPaymentAcctResponse.refNum;
        bodyRes.AuthId = ctx.result.Body.doCreditCardPaymentAcctResponse.authId;
        messageResponse.BodyRes = bodyRes;
    }
    else {
        messageResponse.ResponseStatus.Status = '1';
        messageResponse.ResponseStatus.GlobalErrorCode = '004';
        messageResponse.ResponseStatus.GlobalErrorDescription = 'Error in backend';
        messageResponse.ResponseStatus.ErrorInfo.push({});
        messageResponse.ResponseStatus.ErrorInfo[0].ErrorCode = ctx.result.Body.doCreditCardPaymentAcctResponse.errorCode;
        messageResponse.ResponseStatus.ErrorInfo[0].ErrorDesc = ctx.result.Body.doCreditCardPaymentAcctResponse.errorDesc;
    }
    return messageResponse;
}
function getValIfNull(sourceVal) {
    if (sourceVal == null || sourceVal == undefined) {
        return "";
    }
    return sourceVal;
}