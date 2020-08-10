'use strict';

module.exports = function (Inquiryoffersreq) {
    var soap = require('strong-soap').soap;
    var XMLHandler = soap.XMLHandler;
    var app = require('../server');
    Inquiryoffersreq.beforeRemote("*", function (ctx, unused, next) {
        console.log("before remote hook wrote");
        var queueReq = require('../functions/queue');
        queueReq.putRequest(ctx.req);
        next();
    })

    Inquiryoffersreq.testService = function (msg, cb) {
         console.log("Building request ...");
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xmlhttp = new XMLHttpRequest();
        // build SOAP request
        var sr =
            '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://bpc.ru/SVIS/cms/v1.1/">'+
			'<soapenv:Header>'+
      			'<wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">'+
         		'<wsse:UsernameToken wsu:Id="UsernameToken-12" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'+
            		'<wsse:Username>ebanking</wsse:Username>'+
            		'<wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">ebanking1</wsse:Password>'+
        		'</wsse:UsernameToken>'+
     			'</wsse:Security>'+
   			'</soapenv:Header>'+
			'<soapenv:Body>'+
			'<v1:doCreditCardPaymentAcctRequest>'+
			'<v1:datetime>2018-04-10T09:00:00</v1:datetime>'+
			'<v1:trace>826900</v1:trace>'+
			'<v1:terminalId>33300222</v1:terminalId>'+
			'<v1:merchantId>000000000000224</v1:merchantId>'+
			'<v1:amount>50000</v1:amount>'+
			'<v1:currency>704</v1:currency>'+
			'<v1:sourceAccount>00002580016</v1:sourceAccount>'+
			'<v1:cardId>1726790</v1:cardId>'+
			'</v1:doCreditCardPaymentAcctRequest>'+
			'</soapenv:Body>'+
			'</soapenv:Envelope>';

        var isCalledCB = false;

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                if ( !isCalledCB){
                    isCalledCB = true;
                    clearTimeout(timeoutCallBackend);
                    if (xmlhttp.status == 200) {
                        try {
                            console.log(xmlhttp.responseText);
                            var xmlHandler = new XMLHandler();
                            var jsonResult = xmlHandler.xmlToJson(null, xmlhttp.responseText, null);
                            cb (null,jsonResult);
                        }
                        catch (err) {
                            console.log(err);
                            cb ("021--Error when handle response from Backend");
                        }
                    }
                    else{
                        cb("022--Error when call to Backend--"+xmlhttp.responseText);    
                    }
                }
            }
        }
        xmlhttp.open('POST', 'http://10.1.14.213:7001/svis/Cms', true);
        // Send the POST request
        xmlhttp.setRequestHeader('Content-Type', 'text/xml');
        //xmlhttp.setRequestHeader('SOAPAction', 'http://bpc.ru/SVIS/cms/v1.1/doCreditCardPaymentAcct');
        var timeoutCallBackend = setTimeout(function(){
            if ( !isCalledCB){
                isCalledCB = true;
                cb("020--Timeout when call to Backend");
            }
        },10000);
        xmlhttp.send(sr);
    }

    Inquiryoffersreq.afterRemote("*", function (ctx, unused, next) {
        console.log("after remote hook wrote");
		console.log("Received response from backend");
        var queueRes = require('../functions/queue');
        var messageResponseOb = app.models.InquiryOffersRes;
        var responseStatusOb = app.models.ResponseStatus;
        var messageResponse = new messageResponseOb();
        var responseStatus = new responseStatusOb();
        messageResponse.Header = ctx.req.body.Header;
        messageResponse.ResponseStatus = responseStatus;
        messageResponse.ResponseStatus.Status = '0';
        messageResponse.ResponseStatus.GlobalErrorCode = '000';
        messageResponse.ResponseStatus.GlobalErrorDesc = 'Successful';

        ctx.result = messageResponse;
        //Mapping Response

        queueRes.putResponse(ctx.req, ctx.result);
        next();
    })
    Inquiryoffersreq.remoteMethod('testService', {
        accepts: { arg: 'inquiryOffersReq', type: 'InquiryOffersReq', 'http': { source: 'body' } },
        returns: { arg: 'inquiryOffersRes', type: 'InquiryOffersRes', root: true },
        http: { verb: 'post', path: '/testService' },
    });
};
