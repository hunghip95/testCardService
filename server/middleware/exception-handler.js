module.exports = function (options) {
  return function logError(err, req, res, next) {

    var dataRes = req.app.models.InquiryOffersRes;
    var responseStatusRes = req.app.models.ResponseStatus;
    var dataR = new dataRes();
    var responseStatusR = new responseStatusRes();
    responseStatusR.Status = "1";

    var errorInfoOb = req.app.models.ErrorInfo;
    var errorInfo = new errorInfoOb();
    responseStatusR.ErrorInfo = [];

    if (!(err.message == null)) {
      if ((err.message.includes("has no method handling")) || (err.message.includes("There is no method to handle"))) {
        responseStatusR.GlobalErrorCode = "030";
        responseStatusR.GlobalErrorDescription = err.message;
      }
      else {
        if (!(err.errorCode == null)) {
          responseStatusR.GlobalErrorCode = err.errorCode;
          responseStatusR.GlobalErrorDescription = err.message;
          if (err.errorInfo != undefined) {
            var errorInfo = err.errorInfo;
            for (var i = 0; i < errorInfo.length; i++) {
              responseStatusR.ErrorInfo.push({});
              responseStatusR.ErrorInfo[i].ErrorCode = errorInfo[i].ecode;
              responseStatusR.ErrorInfo[i].ErrorDesc = errorInfo[i].edesc;
            }
          }
        }
        else {
          responseStatusR.GlobalErrorCode = "001";
          responseStatusR.GlobalErrorDescription = "Error when process Service";
          responseStatusR.ErrorInfo = [];
          responseStatusR.ErrorInfo.push({});
          responseStatusR.ErrorInfo[0].ErrorDesc = err.message;
        }
      }
    }

    dataR.Header = req.body.Header;
    dataR.ResponseStatus = responseStatusR;
    console.log(err);
    //var buildLog = require('../functions/LogUtil');
    var LogUtil = require('../functions/logUtil');
    LogUtil.putException(err, req, dataR);
    LogUtil.putResponse(req,dataR);
    res.send(dataR);
  };
};