/*************************************************************************
**************************************************************************
*                             ROUTER
*                   /WEBS_NEWGUI/WEBPAGES/LIB/
*            Copyright (C) 2012 Hitron Technologies Inc.
*                        All Rights Reserved.
**************************************************************************
*  Filename    : hitronSync.js
*  Author      : htx_xinwei
*  Description : Override the orignall sync function in Backbone.js
*                We need to save the data to "postUrl", usually "goform/XXX"
*                Session timeout handler is also implemented here.
**************************************************************************
*/

// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
var methodMap = {
'create': 'POST',
'update': 'PUT',
'delete': 'DELETE',
'read':   'GET'
};
var getValue = function(object, prop) {
if (!(object && object[prop])) return null;
return _.isFunction(object[prop]) ? object[prop]() : object[prop];
};
// Throw an error when a URL is needed, and none is supplied.
var urlError = function() {
throw new Error('A "url" property or function must be specified');
};

Backbone.emulateHTTP = true;
Backbone.emulateJSON = true;

Backbone.sync = function(method, model, options) {
var type = methodMap[method];

// Default options, unless specified.
options || (options = {});

// Default JSON-request options.
var params = {type: type, dataType: 'json'};

//override the post url
if(method!='read')
{
if(!options.url) {
params.url =getValue(model, 'postUrl') || getValue(model.collection, 'postUrl')|| getValue(model,'urlRoot')||urlError();
}
}
else
{
// Ensure that we have a URL.
if (!options.url) {
params.url = getValue(model, 'url') || urlError();
}
}

var originalErrorCb = options.error;
var newErrorCb = function(model,resp){
if(resp == 'parsererror'&& model.responseText.indexOf('RedirectLoginIdentify')>0){
alert('Session timed out, please login!');
window.location.reload();
} else {
if(originalErrorCb)
originalErrorCb(model,resp);
}
}
//Handle session time out.
options.error=newErrorCb;

// Ensure that we have the appropriate request data.
if (!options.data && model && (method == 'create' || method == 'update' || method == 'delete')) {
params.contentType = 'application/json';
params.data = JSON.stringify(model);
}

// For older servers, emulate JSON by encoding the request into an HTML-form.
if (Backbone.emulateJSON) {
params.contentType = 'application/x-www-form-urlencoded';
params.data = params.data ? {model: params.data} : {};
}

// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
// And an `X-HTTP-Method-Override` header.
if (Backbone.emulateHTTP) {
if (type === 'PUT' || type === 'DELETE') {
if (Backbone.emulateJSON) params.data._method = type;
params.type = 'POST';
params.beforeSend = function(xhr) {
xhr.setRequestHeader('X-HTTP-Method-Override', type);
};
}
}

// Don't process data on a non-GET request.
if (params.type !== 'GET' && !Backbone.emulateJSON) {
params.processData = false;
}
// Disable cache here, instead of disable global cache in mainApp.js --xinwei.
params.cache = false;

//reset session time
if(params.url.indexOf('data/getUser.asp') == -1){
SessionResetFlag = 1;
}

// Make the request, allowing the user to override any Ajax options.
return Backbone.ajax(_.extend(params, options));
};
