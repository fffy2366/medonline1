/********************************************************************************
storage存储操作库
*******************************************************************************/
var G_Storage = new yingSoftStorage();

function yingSoftStorage() {
}

/********************************************************************************
函数名：checkLocalStorageSupport
功能：检查浏览器是否支持localStorage
输入参数: 无
返回值：bool true支持 false不支持
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.checkLocalStorageSupport = function () {
    return !!window.localStorage;

}

/********************************************************************************
函数名：setLocalStorage
功能：存储LocalStorage
输入参数: name参数名 value参数值
返回值：无
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.setLocalStorageValue = function (name, value) {
    localStorage.setItem(name, JSON.stringify(value));
}

/********************************************************************************
函数名：getLocalStorage
功能：读取LocalStorage
输入参数: name参数名
返回值：string参数值
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.getLocalStorageValue = function (name) {
    return JSON.parse(localStorage.getItem(name));
}

/********************************************************************************
函数名：removeLocalStorage
功能：删除LocalStorage
输入参数: name参数名
返回值：无
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.removeLocalStorageValue = function (name) {
    localStorage.removeItem(name);
}

/********************************************************************************
函数名：cleanLocalStorage
功能：清空localStorage
输入参数: 无
返回值：无
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.cleanLocalStorage = function () {
    localStorage.clear();
}

/********************************************************************************
函数名：checkSessionStorageSupport
功能：检查浏览器是否支持sessionStorage
输入参数: 无
返回值：bool true支持 false不支持
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.checkSessionStorageSupport = function () {
    return !!window.sessionStorage;

}

/********************************************************************************
函数名：setSessionStorage
功能：存储sessionStorage
输入参数: name参数名 value参数值
返回值：无
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.setSessionStorageValue = function (name, value) {
    sessionStorage.setItem(name, JSON.stringify(value));
}

/********************************************************************************
函数名：getSessionStorage
功能：读取sessionStorage
输入参数: name参数名
返回值：string参数值
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.getSessionStorageValue = function (name) {
    return JSON.parse(sessionStorage.getItem(name));
}

/********************************************************************************
函数名：removeSessionStorage
功能：删除sessionStorage
输入参数: name参数名
返回值：无
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.removeSessionStorageValue = function (name) {
    sessionStorage.removeItem(name);
}

/********************************************************************************
函数名：cleanSessionStorage
功能：清空sessionStorage
输入参数: 无
返回值：无
创建信息：谢建沅(2014-06-04)
修改记录：无
审查人：无
*******************************************************************************/
yingSoftStorage.prototype.cleanSessionStorage = function () {
    sessionStorage.clear();
}
