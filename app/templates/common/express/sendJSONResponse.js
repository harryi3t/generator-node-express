'use strict';
var self = sendJSONResponse;
module.exports = self;
global.sendJSONResponse = self;

function sendJSONResponse(res, obj) {
  if (Array.isArray(obj) && obj[0] && obj[0].toApi)
    obj = obj.map(_autoCallToApi);
  else obj = _autoCallToApi(obj);

  return res.json(200, obj);
}

function _autoCallToApi(obj) {
  if (obj && obj.toApi)
    return obj.toApi();

  return obj;
}
