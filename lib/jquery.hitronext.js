/*Common show alert function in all pages.*/
function showAlert(css,title,message){
$('#alertType').text('['+title+']');
$('#alertInfo').html(message);
$('#alertArea').attr('class','alert alert-'+css);
$('#alertArea').fadeIn();

toggleLoading();
if (title == $.tag_get("Info_Success")) {
setTimeout("hideAlert()", 3000);
}
}

function toggleLoading() {
var str = "[" + $.tag_get("Info_Pending") + "]";
if ($('#alertType').text() == str) {
$('#alertType').parent().append("<img src='img/loading.gif' width='20px' height='20px' />");
}
else {
$('#alertType').parent().find('img').remove();
}
}

function hideAlert() {
$('#alertArea').fadeOut();
$('#alertType').parent().find('img').remove();
}

function appendAlert(css,title,message){
var oldMsg = $('#alertInfo').html();
$('#alertType').text('['+title+']');
$('#alertInfo').html(message+'</span></p><p><span>'+oldMsg);
$('#alertArea').attr('class','alert alert-'+css);
$('#alertArea').fadeIn();
}

function showErrMsg(element, message) {
$("#"+element+"Err").html("<p>" + message + "</p>");
}

function clearAlert(){
$('#alertArea').fadeOut();
$('#alertType').html('');
$('#alertInfo').html('');
}

function setCookie(name,val,hours,path)
{
var name = escape(name);
var val = escape(val);
var expires  = new Date();
expires.setTime(expires.getTime() + hours*3600000);
path = path == "" ? "":";path=" + path;
_expires = (typeof hours) == "string" ? "" : ";expires=" +expires.toUTCString();
document.cookie = name + "=" + val + _expires + path;
}
/* getCookie*/
function getCookieValue(name)
{
var name = escape(name);
var allcookies = document.cookie;
name += "=";
var pos = allcookies.indexOf(name);
if(pos != -1)
{
var start = pos + name.length;
var end = allcookies.indexOf(";", start);
if(end == -1)
{
end = allcookies.length;
}
var val = allcookies.substring(start, end);
return unescape(val);
}
else
{
return "";
}
}
/* delete Cookie */
function deleteCookie(name,path){
var name = escape(name);
var expires = new Date(0);
path = path == "" ? "" : ";path=" + path;
document.cookie = name + "="+ ";expires=" + expires.toUTCString() + path;
}

/*Extend jquery, adding dictinaries to support multilanguage*/
$.extend({
hitron:{
alert:{
show_alert:showAlert,
hide_alert:hideAlert,
append_alert:appendAlert
},
checkInInput: function(val, begin, end) {
var reg = /^\+?[0-9]*$/;
var ret1 = reg.test(val);
if (!ret1)
return false;
if (parseInt(val, 10) != val)
return false;
if ((val < begin) || (val > end))
return false;
else
return true;
},
checkMacAddress: function (addr) {
var regex = /^([0-9a-fA-F]{2})(([:][0-9a-fA-F]{2}){5})$/;
if (!regex.test(addr))
return false;
return true;
},
checkIpInput: function(val, extra) {
var tmp = val.split(".");
if(val.lastIndexOf('.') == val.length - 1 || tmp.length != 4){
return false;
}

for (var i=0; i<4; i++)
{
if (i == 0)
{
if (this.checkInInput(tmp[i], 1, 223) == false)
return false;
}
else if(i == 3)
{
if (extra == 'StaticRoute') {
if (this.checkInInput(tmp[i], 0, 254) == false)
return false;
} else {
if (this.checkInInput(tmp[i], 1, 254) == false)
return false;
}
}
else
{
if (this.checkInInput(tmp[i], 0, 255) == false)
return false;
}
if ((tmp[i].charCodeAt(tmp[i].length-1) == 46) ||
(tmp[i].charCodeAt(tmp[i].length-1) == 32))
return false;
}
return true;
},
checkWANIpInput: function(val) {
var tmpip = val.split("/");
var tmp = tmpip[0].split(".");

for (var i=0; i<4; i++)
{
if (i == 0)
{
if (this.checkInInput(tmp[i], 1, 223) == false)
return false;
}
else if(i == 3)
{
if (this.checkInInput(tmp[i], 1, 254) == false)
return false;
}
else
{
if (this.checkInInput(tmp[i], 0, 255) == false)
return false;
}
if ((tmp[i].charCodeAt(tmp[i].length-1) == 46) ||
(tmp[i].charCodeAt(tmp[i].length-1) == 32))
return false;
}
return true;
},
adjustDhcp: function(priIp, dhcpIp) {
var pritmp = priIp.split(".");
var dhcptmp = dhcpIp.split(".");
var adjust;
adjust = pritmp[0]+"."+pritmp[1]+"."+pritmp[2]+"."+dhcptmp[3];
return adjust;
},
checkMaskInput: function(val) {
if(val == "0.0.0.0")
return false;
var tmp = val.split(".");
for(var i=0; i<4; i++)
{
if (this.checkInInput(tmp[i], 0, 255) == false)
return false;
if ((tmp[i].charCodeAt(tmp[i].length-1) == 46) ||
(tmp[i].charCodeAt(tmp[i].length-1) == 32))
return false;
}
var mask ="";
for(var i=0; i<4; i++)
{
var m = "00000000";
base = eval(tmp[i]);
var tmper = base.toString(2);
m = m.substr(0,8-tmper.length);
m += tmper;
mask += m;
}
pZero = eval(mask.indexOf("0",0));
pOne = eval(mask.lastIndexOf("1",32));
if(pZero != -1)
{
if (pOne != (pZero-1))
return false;
}
return true;
},
checkSameSubnet: function(ipStringNameA,ipStringNameB,maskStringName) {
var ipNameA = ipStringNameA.split(".");
var ipNameB = ipStringNameB.split(".");
var maskName = maskStringName.split(".");
var tmpA, tmpB, tmpM;
for (var i=0; i<4; i++)
{
tmpA = eval(ipNameA[i]);
tmpB = eval(ipNameB[i]);
tmpM = eval(maskName[i]);
if (eval(tmpA&tmpM)!=eval(tmpB&tmpM))
return false;
}
return true;
},
checkLanAndSub: function(lanIp, submask){
var baseIp = lanIp.split(".");
var maskIp = submask.split(".");
var tmpA = eval(baseIp[3]);
var tmpM = eval(maskIp[3])
if(tmpM != 0)
{
var check = eval(tmpA&(~tmpM));
if((check == 0) || (check==(255-tmpM)))
return false;
else
return true;
}
else
return true;
},
checkDhcpRange: function (dhcpS, dhcpE, lanIp) {
var ipNameA = dhcpS.split(".");
var ipNameB = dhcpE.split(".");
var ipNameC = lanIp.split(".");
var tmpA = eval(ipNameA[3]);
var tmpB = eval(ipNameB[3]);
var tmpC = eval(ipNameC[3]);
if(tmpA > tmpB)
{
return -1;
}
if(tmpA == tmpC)
{
return -2;
}
if(tmpB == tmpC)
{
return -3;
}
if((tmpA<=tmpC) && (tmpB>=tmpC))
{
return -4;
}
return true;
},
checkIpRangeOverlap: function(beginA, endA, beginB, endB) {
var beginAValue = eval(beginA.split(".")[3]);
var endAValue = eval(endA.split(".")[3]);
var beginBValue = eval(beginB.split(".")[3]);
var endBValue = eval(endB.split(".")[3]);

if ((beginBValue<beginAValue && endBValue<beginAValue) || (beginBValue>endAValue && endBValue>endAValue))
{
return false;
} else {
return true;
}
},
checkDomainName: function(val) {

var regdomain = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,63}$/;
if (regdomain.test(val))
return 0;

/* Invalid domain suffix */
var domain = val.split(".");

if (domain.length != 2) {

/* The valid domain suffix must have only two level
domain name separated with dot(.).
*/
return -1;
}

var regexp1 = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
if (!regexp1.test(domain[0])) {

/* Domain name of the second level must have more than
1 character and less than 63 characters. It must use
only alphanumeric characters and dashes(-), and must
not begin or end with dashes(-).
*/
return -2;
}

var regexp2 = /^[a-zA-Z]{2,63}$/;
if (!regexp2.test(domain[1])) {

/* Domain name of the top level must have more than
2 characters and less than 63 characters. It must use
only alphabetic characters, such as a-z and A-Z.
*/
return -3;
}
},
checkRange:function(startIp, endIp) {
var ipNameA = startIp.split(".");
var ipNameB = endIp.split(".");
var tmpA = eval(ipNameA[3]);
var tmpB = eval(ipNameB[3]);
if(tmpA > tmpB)
{
return false;
}
else
{
return true;
}
},
checkIpRange:function(startIp, endIp) {
var ipNameA = startIp.split(".");
var ipNameB = endIp.split(".");
var i;
for(i=0;i<4;i++) {
var tmpA = eval(ipNameA[i]);
var tmpB = eval(ipNameB[i]);
if(tmpA > tmpB)
{
return false;
}
}
if (i == 4) {
return true;
}
},
checkSpecialChar: function(specialVal) {
var pattern = new RegExp("[`~!@#$%^&*()_+=|{}':;',\\[\\].<>/?~]");
var inputLen = specialVal.length;
var curVal = '';
for(var i=0; i<inputLen; i++) {
curVal = curVal+specialVal.substr(i,1).replace(pattern,'');
}
var curLen = curVal.length;
if (curLen < inputLen) {
return false;
} else {
if (curVal.match(" ") != null) {
return false;
}
return true;
}
},
checkServiceName: function(specialVal) {
var rel = /^[a-zA-Z0-9-_]{1,64}$/i;
var status = rel.test(specialVal);
if(!status)
{
return false;
} else {
return true;
}
},
IsRangeOverlap: function(beginA, endA, beginB, endB) {
var beginAValue = eval(beginA);
var endAValue = eval(endA);
var beginBValue = eval(beginB);
var endBValue = eval(endB);

if ((beginBValue<beginAValue) && (endBValue<beginAValue))
return false;
if ((beginBValue>endAValue) && (endBValue>endAValue))
return false;
return true;
},
checkIpv6Address: function (ipv6) {
var regex = /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/;
if (regex.test(ipv6))
return true;
else
return false;
},
languages:{
lang_current:"en_US",
/*Init language*/
lang_init:function(){
var lang_cookie = this.lang_get_cookie("LANG_COOKIE")
//this.lang_set(lang_cookie);
this.lang_current = lang_cookie;
$('#currentLanguage').text($('#'+lang_cookie).text());
},
lang_load:function(){
$('.langTag').each(function(){
var tagName = $(this).attr("id");
$(this).html($.hitron.languages.lang_get_tag(tagName));
})
} ,
/*Set language*/
lang_set:function(lang){
this.lang_set_cookie("LANG_COOKIE",lang);
window.location.reload();
} ,
/*Get language settings from cookie*/
lang_get_cookie:function(name)
{
var arr = document.cookie.split("; ");
for(i=0;i<arr.length;i++)
{
if (arr[i].split("=")[0] == name)
return unescape(arr[i].split("=")[1]);
}
this.lang_set_cookie("LANG_COOKIE", "en_US");
return "en_US";
} ,
/*Write language settings to cookie*/
lang_set_cookie:function(name,val)
{
var today = new Date();
var expires = new Date();
expires.setTime(today.getTime() + 1000*60*60*24*2000);
document.cookie = name + "=" + escape(val) + "; expires=" + expires.toGMTString() + "; path=/";
} ,
lang_get_tag:function(tagName) {
var langObj = '$.hitron.languages.lang_'+this.lang_current;
/* Fixed GUI cannot display sometimes --caojun 2013/04/07*/
if (tagName == "(null)") {
return "Undefined";
}
/* caojun add end */
var result = eval(langObj+'.'+tagName);
if(result)
return result;
else
return "Undefined";

}
}
}
});
$.extend({
/*An alias for $.hitron.languages.lang_get_tag*/
tag_get:function(tagName){
return $.hitron.languages.lang_get_tag(tagName);
}
})

function showProgress(table, time) {
var count = 1;
var fn;
var interval;
table.removeClass("success");
table.children("tbody").hide();
table.find(".bar").css("width", "0%");
table.find(".progress").parents("tr").fadeIn();
table.children("tbody").empty();
fn = function () {
if ((count > 100 && interval != null) || table.hasClass("success")) {
clearInterval(interval);
table.find(".bar").css("width", "100%");
} else {
table.find(".bar").css("width", count + "%");
count++;
}
}
interval = setInterval(fn, time * 10);
}

function hideProgress(table) {
var fn;
table.addClass("success");
fn = function () {
table.find(".progress").parents("tr").hide();
table.children("tbody").fadeIn();
}
setTimeout(fn, 1000);
}

$.extend({
myBackbone: {
valueClone: function (origin, clone) {
clone.remove(clone.models, {silent: true});
for (var i = 0; i < origin.length; i++)
clone.add(origin.models[i].attributes);
},
isSame: function (coll1, coll2) {
if(coll1.length != coll2.length)
return false;
for (var i = 0; i < coll1.length; i++) {
if (coll2.where(coll1.models[i].attributes).length == 0)
return false;
}
return true;
},
sortById: function (col) {
if (!col.models[0].get("index"))
return;
var list = _.sortBy(col, 'index');
var tmp = new Backbone.Collection;
$.each(list, function (item) {
var s = '{"index": "' + item + '"}';
tmp.add(col.where($.parseJSON(s)));
});
col.reset(tmp.models);
}
}
});
