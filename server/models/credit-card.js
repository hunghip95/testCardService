'use strict';

module.exports = function (CreditCard) {
    var soap = require('strong-soap').soap;
    var XMLHandler = soap.XMLHandler;
    
    CreditCard.beforeRemote("doCreditCardPaymentAcct", function (ctx, unused, next) {
        var LogUtil = require('../functions/logUtil');
        LogUtil.putRequest(ctx.req);
        var configVariables = require('../../../configVariables.json');
        var security = configVariables.Microservices.Security;
        if ( security.toUpperCase() == "ON"){
            if (ctx.req.body.Header.Client.UserDetail != undefined && ctx.req.body.Header.Client.UserDetail != "") {
                var authenUtil = require('../functions/authenUtil');
                authenUtil.callAuthenticateService(ctx)
                    .then(function (result) {
                        next();
                    })
                    .catch(function (err) {
                        next(err);
                    });
            }
            else {
                var error = new Error("Request is invalid")
                error.errorCode = "003";
                next(error);
            }
        }
        else{
            next();
        }   
    })

    CreditCard.doCreditCardPaymentAcct = function (msg, cb) {
        console.log("Building request ...");
        var backendCallout = require('../functions/backendCallout');
        backendCallout.callDoCreditCardPaymentAcct(msg)
            .then(function (result) {
                var xmlHandler = new XMLHandler();
                var jsonResult = xmlHandler.xmlToJson(null, result, null);
                cb(null, jsonResult);
            })
            .catch(function (err) {
                cb(err);
            });
    }

    CreditCard.afterRemote("doCreditCardPaymentAcct", function (ctx, unused, next) {
        var LogUtil = require('../functions/logUtil');
        var messageUtil = require('../functions/messageUtil');
        var messageResponse = messageUtil.buildDoCreditCardPaymentAcctRes(ctx);
        ctx.result = messageResponse;
        LogUtil.putResponse(ctx.req, ctx.result);
        next();
    })
    CreditCard.remoteMethod('doCreditCardPaymentAcct', {
        accepts: { arg: 'doCreditCardPaymentAcctReq', type: 'doCreditCardPaymentAcctReq', 'http': { source: 'body' } },
        returns: { arg: 'doCreditCardPaymentAcctRes', type: 'doCreditCardPaymentAcctRes', root: true },
        http: { verb: 'post', path: '/v1/creditCardPaymentAcct' },
    });
};
