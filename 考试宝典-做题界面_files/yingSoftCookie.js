/********************************************************************************
cookie二次封装库
*******************************************************************************/
var G_Cookie = new yingSoftCookie();

function yingSoftCookie() { }

/********************************************************************************
函数名：setApp(必须引用yingsoft_prg.js)
功能：设置cookie中的App
输入参数: appID 软件ID
appEName 软件英文名
appName 软件中文名称
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.setApp = function (appID, appEName, appName) {
    G_Prg.setCookie('APP', JSON.stringify({ AppID: appID, AppEName: appEName, AppName: appName })); //SELECTEDAPP 
}
/********************************************************************************
函数名：setSelectedApp
功能：更新用户最近已选择科目
输入参数: appName 软件中文名, appEName 软件英文名, appID 软件ID
返回值： 无
创建信息: 韦友爱（2014-07-01）
修改信息：韦友爱（2014-07-10）将最新选择的科目存放在数组的最后
         韦友爱（2014-07-31）添加数组长度为4，新选择科目未重复时将数组第一个元素删除，实现记录更新
审查人：无
********************************************************************************/
yingSoftCookie.prototype.setSelectedApp = function (appName, appEName, appID) {
    //判断当前点击节点是否与G_ArrSelectedApp中存在重复
    var selectedAppJson = this.getSelectedApp(); //用户最近选择的科目
    var arrSelectedApp = [];
    var newSelected = {
        AppName: appName,
        AppEName: appEName,
        AppID: appID
    };
    if (selectedAppJson) {
        arrSelectedApp = JSON.parse(selectedAppJson);
        for (var i = 0; i < arrSelectedApp.length; i++) {
            if (arrSelectedApp[i].AppEName === appEName) {
                if (i === arrSelectedApp.length - 1) { //与最后一个（最新的）重复
                    return;
                }
                arrSelectedApp.splice(i, 1); //i为要删除元素的开始下标，1说明删除一个元素
                break;
            }
        }
        if (arrSelectedApp.length < 5) { //用户选择过的科目不足四个
            arrSelectedApp.push(newSelected);
        } else {
            arrSelectedApp.splice(0, 1);
            arrSelectedApp[4] = newSelected;
        }
    } else {
        arrSelectedApp[0] = newSelected;
    }
    //将当前选择节点添加至G_ArrSelectedApp[0]
    json = JSON.stringify(arrSelectedApp);
    G_Prg.setCookie('SELECTEDAPP', json);
    if (G_Storage.checkSessionStorageSupport) {//移除sessionStorage
        G_Storage.removeSessionStorageValue('firstLoad');
    }
    if (G_Storage.checkSessionStorageSupport) {//移除sessionStorage
        G_Storage.removeSessionStorageValue('showTime');
    } 
}

/********************************************************************************
函数名：getAppID(必须引用yingsoft_prg.js)
功能：获取cookie中的AppID
输入参数: 无
返回值：appID 软件ID
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getAppID = function () {
    var selectedApp = G_Prg.getCookie('SELECTEDAPP');
    if (!selectedApp) {
        return null
    }
    var appArr = JSON.parse(selectedApp);
    if (!appArr || appArr.length === 0) {
        return null;
    }
    if (!appArr[appArr.length - 1] || !appArr[appArr.length - 1].AppID) {
        return null;
    }
    return appArr[appArr.length - 1].AppID;


}


/********************************************************************************
函数名：getAppEName(必须引用yingsoft_prg.js)
功能：获取cookie中的AppEName（软件英文名）
输入参数: 无
返回值：appEName 软件英文名
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getAppEName = function () {
    var selectedApp = G_Prg.getCookie('SELECTEDAPP');
    if (!selectedApp) {
        return null
    }
    var appArr = JSON.parse(selectedApp);
    if (!appArr || appArr.length === 0) {
        return null;
    }
    if (!appArr[appArr.length - 1] || !appArr[appArr.length - 1].AppEName) {
        return null;
    }
    return appArr[appArr.length - 1].AppEName;
}

/********************************************************************************
函数名：getAppName(必须引用yingsoft_prg.js)
功能：获取cookie中的AppName（软件中文名）
输入参数: 无
返回值：appName 软件中文名
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getAppName = function () {
    var selectedApp = G_Prg.getCookie('SELECTEDAPP');
    if (!selectedApp) {
        return null
    }
    var appArr = JSON.parse(selectedApp);
    if (!appArr || appArr.length === 0) {
        return null;
    }
    if (!appArr[appArr.length - 1] || !appArr[appArr.length - 1].AppName) {
        return null;
    }
    return appArr[appArr.length - 1].AppName;
}

/********************************************************************************
函数名：setUserName(必须引用yingsoft_prg.js)
功能：设置cookie中的UserName
输入参数: username 用户名
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.setUserName = function (username) {
    G_Prg.setCookie('USERNAME', username);
}

/********************************************************************************
函数名：getUserName(必须引用yingsoft_prg.js)
功能：获取cookie中的UserName
输入参数: 无
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getUserName = function () {
    return G_Prg.getCookie('USERNAME');
}

/********************************************************************************
函数名：removeUserName(必须引用yingsoft_prg.js)
功能：删除cookie中的UserName
输入参数: 无
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.removeUserName = function () {
    G_Prg.removeCookie('USERNAME');
}

/********************************************************************************
函数名：setFontSize(必须引用yingsoft_prg.js)
功能：设置cookie中的fontSize
输入参数: fontSize 字体大小
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.setFontSize = function (fontSize) {
    G_Prg.setCookie('FONTSIZE', fontSize);
}

/********************************************************************************
函数名：getFontSize(必须引用yingsoft_prg.js)
功能：获取cookie中的fontSize
输入参数: 无
返回值：fontSize 字体大小
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getFontSize = function () {
    return G_Prg.getCookie('FONTSIZE');
}

/********************************************************************************
函数名：setVipData(必须引用yingsoft_prg.js)
功能：设置cookie中的VipData
输入参数: vipData VIP数据
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.setVipData = function (vipData) {
    G_Prg.setCookie('VIPDATA', vipData);
}

/********************************************************************************
函数名：getVipData(必须引用yingsoft_prg.js)
功能：获取cookie中的VipData
输入参数: 无
返回值：vipData 已购买科目信息
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getVipData = function () {
    return G_Prg.getCookie('VIPDATA');
}

/********************************************************************************
函数名：removeVipData(必须引用yingsoft_prg.js)
功能：删除cookie中的VipData
输入参数: 无
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.removeVipData = function () {
    G_Prg.removeCookie('VIPDATA');
}

/********************************************************************************
函数名：setVipKey(必须引用yingsoft_prg.js)
功能：设置cookie中的vipKey
输入参数: vipKey VIP效验码
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.setVipKey = function (vipKey) {
    G_Prg.setCookie('VIPKEY', vipKey);
}

/********************************************************************************
函数名：getVipData(必须引用yingsoft_prg.js)
功能：获取cookie中的vipKey
输入参数: 无
返回值：vipKey 已购买科目加密效验码
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getVipKey = function () {
    return G_Prg.getCookie('VIPKEY');
}

/********************************************************************************
函数名：setCptId(必须引用yingsoft_prg.js)
功能：设置cookie中的cptId
输入参数: cptId VIP效验码
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.setCptID = function (cptId) {
    G_Prg.setCookie('CPTID', cptId);
}

/********************************************************************************
函数名：getCptId(必须引用yingsoft_prg.js)
功能：获取cookie中的cptId
输入参数: 无
返回值：cptID 章节ID
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getCptID = function () {
    return G_Prg.getCookie('CPTID');
}

/********************************************************************************
函数名：setUserId(必须引用yingsoft_prg.js)
功能：设置cookie中的userId
输入参数: userId 用户ID
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.setUserID = function (userId) {
    G_Prg.setCookie('USERID', userId);
}

/********************************************************************************
函数名：getUserId(必须引用yingsoft_prg.js)
功能：获取cookie中的UserId
输入参数: 无
返回值：userID 用户ID
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getUserID = function () {
    return G_Prg.getCookie('USERID');
}

/********************************************************************************
函数名：removeUserId(必须引用yingsoft_prg.js)
功能：删除cookie中的UserId
输入参数: 无
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.removeUserID = function () {
    return G_Prg.removeCookie('USERID');
}

/********************************************************************************
函数名：setGuid(必须引用yingsoft_prg.js)
功能：设置cookie中的guid
输入参数: guid 效验码
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.setGuid = function (guid) {
    G_Prg.setCookie('GUID', guid);
}

/********************************************************************************
函数名：getGuid(必须引用yingsoft_prg.js)
功能：获取cookie中的guid
输入参数: 无
返回值：guid 登录效验码
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getGuid = function () {
    return G_Prg.getCookie('GUID');
}

/********************************************************************************
函数名：removeGuid(必须引用yingsoft_prg.js)
功能：删除cookie中的guid
输入参数: 无
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.removeGuid = function () {
    return G_Prg.removeCookie('GUID');
}

/********************************************************************************
函数名：setFirstLoad(必须引用yingsoft_prg.js)
功能：设置cookie中的firstLoad='1'标识启动界面已经出现过，以后不再出现
输入参数: 无
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.setFirstLoad = function () {
    G_Prg.setCookie('FIRSTLOAD', '1', false);
}

/********************************************************************************
函数名：getFirstLoad(必须引用yingsoft_prg.js)
功能：获取cookie中的firstLoad
输入参数: 无
返回值：firstLoad 第一次登录标识
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getFirstLoad = function () {
    return G_Prg.getCookie('FIRSTLOAD');
}

/********************************************************************************
函数名：setSelectedApp(必须引用yingsoft_prg.js)
功能：设置cookie中的selectedApp
输入参数: 无
返回值：无
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
//yingSoftCookie.prototype.setSelectedApp = function (selectedApp) {
//    G_Prg.setCookie('SELECTEDAPP', selectedApp);
//}

/********************************************************************************
函数名：getSelectedApp(必须引用yingsoft_prg.js)
功能：获取cookie中的selectedApp
输入参数: 无
返回值：selectedApp 已选科目记录
创建信息：谢建沅（2014-06-26）
修改记录：无
审查人：黎萍（2014-06-26）
*******************************************************************************/
yingSoftCookie.prototype.getSelectedApp = function () {
    return G_Prg.getCookie('SELECTEDAPP');
}
/********************************************************************************
函数名：setMiddleSize(必须引用yingsoft_prg.js)
功能：设置cookie中的middleSize
输入参数: fontSize 具体设置的字号大小
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setMiddleSize = function (fontSize) {
    G_Prg.setCookie('MIDDLESIZE', fontSize);
}
/********************************************************************************
函数名：getMiddleSize(必须引用yingsoft_prg.js)
功能：获取cookie中的middleSize
输入参数: 无
返回值：middleSize 中号字体
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getMiddleSize = function () {
    return G_Prg.getCookie('MIDDLESIZE');
}
/********************************************************************************
函数名：removeMiddleSize(必须引用yingsoft_prg.js)
功能：移除cookie中的middleSize
输入参数: 无
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeMiddleSize = function () {
    return G_Prg.removeCookie('MIDDLESIZE');
}
/********************************************************************************
函数名：setBigSize(必须引用yingsoft_prg.js)
功能：设置cookie中的bigSize
输入参数: fontSize 具体设置的字号大小
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setBigSize = function (fontSize) {
    G_Prg.setCookie('BIGSIZE', fontSize);
}
/********************************************************************************
函数名：getBigSize(必须引用yingsoft_prg.js)
功能：获取cookie中的bigSize
输入参数: 无
返回值：bigSize 大号字体
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getBigSize = function () {
    return G_Prg.getCookie('BIGSIZE');
}
/********************************************************************************
函数名：removeBigSize(必须引用yingsoft_prg.js)
功能：移除cookie中的bigSize
输入参数: 无
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeBigSize = function () {
    return G_Prg.removeCookie('BIGSIZE');
}
/********************************************************************************
函数名：setSmallSize(必须引用yingsoft_prg.js)
功能：设置cookie中的smallSize
输入参数: fontSize 具体设置的字号大小
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setSmallSize = function (fontSize) {
    G_Prg.setCookie('SMALLSIZE', fontSize);
}
/********************************************************************************
函数名：getSmallSize(必须引用yingsoft_prg.js)
功能：获取cookie中的smallSize
输入参数: 无
返回值：smallSize 小号字体
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getSmallSize = function () {
    return G_Prg.getCookie('SMALLSIZE');
}
/********************************************************************************
函数名：removeSmallSize(必须引用yingsoft_prg.js)
功能：移除cookie中的smallSize
输入参数: 无
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeSmallSize = function () {
    return G_Prg.removeCookie('SMALLSIZE');
}
/********************************************************************************
函数名：setDayMode(必须引用yingsoft_prg.js)
功能：设置cookie中的dayMode
输入参数: mode 根据模式设置的样式
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setDayMode = function (mode) {
    G_Prg.setCookie('DAYMODE', mode);
}
/********************************************************************************
函数名：getDayMode(必须引用yingsoft_prg.js)
功能：获取cookie中的dayMode
输入参数: 无
返回值：dayMode 白天模式
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getDayMode = function () {
    return G_Prg.getCookie('DAYMODE');
}
/********************************************************************************
函数名：removeDayMode(必须引用yingsoft_prg.js)
功能：移除cookie中的dayMode
输入参数: 无
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeDayMode = function () {
    return G_Prg.removeCookie('DAYMODE');
}
/********************************************************************************
函数名：setNightMode(必须引用yingsoft_prg.js)
功能：设置cookie中的nightMode
输入参数: mode 根据模式设置的样式
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setNightMode = function (mode) {
    G_Prg.setCookie('NIGHTMODE', mode);
}
/********************************************************************************
函数名：getNightMode(必须引用yingsoft_prg.js)
功能：获取cookie中的nightMode
输入参数: 无
返回值：nightMode 夜间模式
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getNightMode = function () {
    return G_Prg.getCookie('NIGHTMODE');
}
/********************************************************************************
函数名：removeNightMode(必须引用yingsoft_prg.js)
功能：移除cookie中的nightMode
输入参数: 无
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeNightMode = function () {
    return G_Prg.removeCookie('NIGHTMODE');
}
/********************************************************************************
函数名：setNFontColor(必须引用yingsoft_prg.js)
功能：设置cookie中的nightMode
输入参数: NFontColor 夜间模式下的字体颜色
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setNFontColor = function (NFontColor) {
    G_Prg.setCookie('NFONTCOLOR', NFontColor);
}
/********************************************************************************
函数名：getNFontColor(必须引用yingsoft_prg.js)
功能：获取cookie中的NFontColor
输入参数: 无
返回值：NFontColor 夜间模式文字颜色
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getNFontColor = function () {
    return G_Prg.getCookie('NFONTCOLOR');
}
/********************************************************************************
函数名：removeNFontColor(必须引用yingsoft_prg.js)
功能：移除cookie中的NFontColor
输入参数: 无
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeNFontColor = function () {
    return G_Prg.removeCookie('NFONTCOLOR');
}
/********************************************************************************
函数名：setDFontColor(必须引用yingsoft_prg.js)
功能：设置cookie中的DFontColor
输入参数: DFontColor 白天模式下的字体颜色
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setDFontColor = function (DFontColor) {
    G_Prg.setCookie('DFONTCOLOR', DFontColor);
}
/********************************************************************************
函数名：getDFontColor(必须引用yingsoft_prg.js)
功能：获取cookie中的DFontColor
输入参数: 无
返回值：DFontColor 白天模式文字颜色
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getDFontColor = function () {
    return G_Prg.getCookie('DFONTCOLOR');
}
/********************************************************************************
函数名：removeDFontColor(必须引用yingsoft_prg.js)
功能：移除cookie中的DFontColor
输入参数: 无
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeDFontColor = function () {
    return G_Prg.removeCookie('DFONTCOLOR');
}

/********************************************************************************
函数名：setOrderID(必须引用yingsoft_prg.js)
功能：设置cookie中的OrderID
输入参数: orderID 订单编号
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setOrderID = function (orderID) {
    G_Prg.setCookie('ORDERID', orderID);
}

/********************************************************************************
函数名：getOrderID(必须引用yingsoft_prg.js)
功能：获取cookie中的OrderID
输入参数: 无
返回值：OrderID 订单编号
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getOrderID = function () {
    return G_Prg.getCookie('ORDERID');
}

/********************************************************************************
函数名：removeOrderID(必须引用yingsoft_prg.js)
功能：移除cookie中的OrderID
输入参数: 无
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeOrderID = function () {
    G_Prg.removeCookie('ORDERID');
}

/********************************************************************************
函数名：setUserPwd
功能：设置cookie中的userPwd
输入参数: userPwd 用户密码(md5)
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setUserPwd = function (userPwd) {
    G_Prg.setCookie('USERPWD', userPwd);
}

/********************************************************************************
函数名：getUserPwd
功能：获取cookie中的OrderID
输入参数: 无
返回值：userPwd 用户密码(md5)
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getUserPwd = function () {
    return G_Prg.getCookie('USERPWD');
}

/********************************************************************************
函数名：removeUserPwd
功能：移除cookie中的userPwd
输入参数: 无
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeUserPwd = function () {
    G_Prg.removeCookie('USERPWD');
}

/********************************************************************************
函数名：setTestInfoHistory
功能：设置cookie中的TestInfoHistory
输入参数: appEName 软件英文名称
testInfoID 考试指南id
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setTestInfoHistory = function (appEName, testInfoID) {
    var hisCookie = G_Prg.getCookie('TESTINFOHISTORY');
    if (hisCookie) {
        hisCookie = JSON.parse(hisCookie);
        if (hisCookie.AppEName === appEName) {
            for (var i = 0; i < hisCookie.TestInfoID.length; i++) {
                if (hisCookie.TestInfoID[i] === testInfoID) {
                    return;
                }
            }
            hisCookie.TestInfoID.push(testInfoID);
            var hisJson = JSON.stringify(hisCookie);
            G_Prg.setCookie('TESTINFOHISTORY', hisJson);
            return;
        }
    }

    var hisJson = JSON.stringify({AppEName: appEName, TestInfoID: [testInfoID] });
    G_Prg.setCookie('TESTINFOHISTORY', hisJson);
}

/********************************************************************************
函数名：getTestInfoHistory
功能：获取cookie中匹配的TestInfoHistory
输入参数: appEName 软件英文名称
返回值： testInfoID 考试指南id
创建信息：黎萍（2014-07-02）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getTestInfoHistory = function (appEName) {
    var hisCookie = G_Prg.getCookie('TESTINFOHISTORY');
    if (hisCookie) {
        hisCookie = JSON.parse(hisCookie);
        if (hisCookie.AppEName === appEName) {
            return hisCookie.TestInfoID;
        }
    }
    return null;
}

yingSoftCookie.prototype.setKeyHistory = function (userID, appEName, key, testCount) {
    var hisCookie = G_Prg.getCookie('KEYHISTORY');
    var his = {Key: key, Count: testCount};
    if (hisCookie) {
        hisCookie = JSON.parse(hisCookie);
        if (hisCookie.AppEName === appEName && hisCookie.UserID === userID) {
            for (var i = 0; i < hisCookie.KeyArr.length; i++) {
                if (hisCookie.KeyArr[i].Key === key) {
                    if (i === hisCookie.KeyArr.length - 1) { //与最后一个（最新的）重复
                        return;
                    }
                    hisCookie.KeyArr.splice(i, 1); //i为要删除元素的开始下标，1说明删除一个元素
                    break;
                }
            }
            if (hisCookie.KeyArr.length < 10) {
                hisCookie.KeyArr.push(his);
            } else {
                hisCookie.KeyArr.splice(0, 1);
                hisCookie.KeyArr[9] = his;
            }
            var hisJson = JSON.stringify(hisCookie);
            G_Prg.setCookie('KEYHISTORY', hisJson);
            return;
        }
    }
    var hisJson = JSON.stringify({ UserID: userID, AppEName: appEName, KeyArr: [his] });
    G_Prg.setCookie('KEYHISTORY', hisJson);
}
yingSoftCookie.prototype.getKeyHistory = function (userID, appEName) {
    var hisCookie = G_Prg.getCookie('KEYHISTORY');
    if (hisCookie) {
        hisCookie = JSON.parse(hisCookie);
        if (hisCookie.AppEName === appEName&&hisCookie.UserID===userID) {
            return hisCookie.KeyArr;
        }
    }
    return null;
}

yingSoftCookie.prototype.getLoginURL = function () {
    return G_Prg.getCookie('LOGINURL');
}

yingSoftCookie.prototype.removeLoginURL = function () {
    G_Prg.removeCookie('LOGINURL');
}
/********************************************************************************
函数名：setOnMedia
功能：设置Cookie中设置音频打开的状态
输入参数: onMedia 音频打开状态标记
返回值：无
创建信息：黎萍（2014-09-17）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setOnMedia = function (onMedia) {
    G_Prg.setCookie('ONMEDIA', onMedia);
}
/********************************************************************************
函数名：getOnMedia
功能：获取Cookie中设置音频打开的状态
输入参数: 无
返回值：无
创建信息：黎萍（2014-09-17）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getOnMedia = function () {
    return G_Prg.getCookie('ONMEDIA');
}
/********************************************************************************
函数名：removeOnMedia
功能：移除Cookie中设置音频打开的状态
输入参数: 无
返回值：无
创建信息：黎萍（2014-09-17）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeOnMedia = function () {
    return G_Prg.removeCookie('ONMEDIA');
}
/********************************************************************************
函数名：setOffMedia
功能：设置Cookie中设置音频关闭的状态
输入参数: offMedia 音频关闭状态标记
返回值：无
创建信息：黎萍（2014-09-17）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setOffMedia = function (offMedia) {
    G_Prg.setCookie('OFFMEDIA', offMedia);
}
/********************************************************************************
函数名：getOffMedia
功能：获取Cookie中设置音频关闭的状态
输入参数: 无
返回值：无
创建信息：黎萍（2014-09-17）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getOffMedia = function () {
    return G_Prg.getCookie('OFFMEDIA');
}
/********************************************************************************
函数名：removeOffMedia
功能：移除Cookie中设置音频关闭的状态
输入参数: 无
返回值：无
创建信息：黎萍（2014-09-17）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeOffMedia = function () {
    return G_Prg.removeCookie('OFFMEDIA');
}
/********************************************************************************
函数名：setSmsVerifyCode
功能：设置Cookie中的SMSVERIFYCODE
输入参数: 无
返回值：无
创建信息：韦友爱（2014-10-27）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setSmsVerifyCode = function (smsVerifyCode) {
    return G_Prg.setCookie('SMSVERIFYCODE', smsVerifyCode);
}
/********************************************************************************
函数名：getSmsVerifyCode
功能：获取Cookie中的SMSVERIFYCODE
输入参数: 无
返回值：Cookie中的SMSVERIFYCODE值
创建信息：韦友爱（2014-10-27）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getSmsVerifyCode = function () {
    return G_Prg.getCookie('SMSVERIFYCODE');
}
/********************************************************************************
函数名：setClientType
功能：设置Cookie中的CLIENTTYPE
输入参数: 无
返回值：无
创建信息：韦友爱（2014-11-13）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setClientType = function (clientType) {
    return G_Prg.setCookie('CLIENTTYPE', clientType);
}
/********************************************************************************
函数名：getClientType
功能：获取Cookie中的CLIENTTYPE
输入参数: 无
返回值：Cookie中的CLIENTTYPE的值
创建信息：韦友爱（2014-11-13）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getClientType = function () {
    return G_Prg.getCookie('CLIENTTYPE');
}
/********************************************************************************
函数名：setVersion
功能：设置Cookie中的VERSION
输入参数: 无
返回值：无
创建信息：韦友爱（2015-01-06）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setNoticeDate = function (noticeDate) {
    return G_Prg.setCookie('NOTICEDATE', noticeDate);
}
/********************************************************************************
函数名：getVersion
功能：获取Cookie中的VERSION
输入参数: 无
返回值：Cookie中的VERSION的值
创建信息：韦友爱（2015-01-06）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getNoticeDate = function () {
    return G_Prg.getCookie('NOTICEDATE');
}
/********************************************************************************
函数名：setTestCount
功能：获取Cookie中的TESTCOUNT
输入参数: 无
返回值：testCount 试题数量
创建信息：黎萍（2015-05-12）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setTestCount = function (testCount) {
	return G_Prg.setCookie('TESTCOUNT', testCount);
}
/********************************************************************************
函数名：getTestCount
功能：获取Cookie中的TESTCOUNT
输入参数: 无
返回值：试题数量
创建信息：黎萍（2015-05-12）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getTestCount = function () {
	return G_Prg.getCookie('TESTCOUNT');
}
/********************************************************************************
函数名：setVideoName
功能：设置Cookie中的VIDEONAME
输入参数: videoName 视频名称
返回值：无
创建信息：黎萍（2015-05-12）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setVideoName = function (videoName) {
	return G_Prg.setCookie('VIDEONAME', videoName);
}
/********************************************************************************
函数名：getVideoName
功能：获取Cookie中的VIDEONAME
输入参数: 无
返回值：videoName 视频名称
创建信息：黎萍（2015-05-12）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getVideoName = function () {
	return G_Prg.getCookie('VIDEONAME');
}
/********************************************************************************
函数名：removeVideoName
功能：移除Cookie中设置视频名称
输入参数: 无
返回值：无
创建信息：黎萍（2015-05-12）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeVideoName = function () {
	return G_Prg.removeCookie('VIDEONAME');
}
/********************************************************************************
函数名：setLoginType
功能：设置Cookie中的LOGINTYPE
输入参数: loginType 登录类型【用于区分第三方登录】
返回值：无
创建信息：韦友爱（2015-05-14）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.setLoginType = function (loginType) {
    return G_Prg.setCookie('LOGINTYPE', loginType);
}
/********************************************************************************
函数名：getLoginType
功能：获取Cookie中的LOGINTYPE
输入参数: 无
返回值：loginType 登录类型【用于区分第三方登录】
创建信息：韦友爱（2015-05-14）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.getLoginType = function () {
    return G_Prg.getCookie('LOGINTYPE');
}
/********************************************************************************
函数名：removeLoginType
功能：移除Cookie中设置视频名称
输入参数: 无
返回值：无
创建信息：韦友爱（2015-05-14）
修改记录：无
审查人：无
*******************************************************************************/
yingSoftCookie.prototype.removeLoginType = function () {
    return G_Prg.removeCookie('LOGINTYPE');
}

/********************************************************************************
功能：设置Cookie中的AGENTCODE
输入参数: 无
返回值：无
最后修改人（时间）：韦友爱（2015-02-04）
修改内容：创建
*******************************************************************************/
yingSoftCookie.prototype.setAgentCode = function (agentCode) {
    G_Prg.setCookie('AGENTCODE', agentCode);
}
/********************************************************************************
功能：获取Cookie中的AGENTCODE
输入参数: 无
返回值：Cookie中的AGENTCODE的值
最后修改人（时间）：韦友爱（2015-02-04）
修改内容：创建
*******************************************************************************/
yingSoftCookie.prototype.getAgentCode = function () {
    return G_Prg.getCookie('AGENTCODE');
}
/********************************************************************************
功能：设置Cookie中的AGENTURL
输入参数: 无
返回值：无
最后修改人（时间）：韦友爱（2015-02-04）
修改内容：创建
*******************************************************************************/
yingSoftCookie.prototype.setAgentUrl = function (agentUrl) {
    G_Prg.setCookie('AGENTURL', agentUrl);
}
/********************************************************************************
功能：获取Cookie中的AGENTURL
输入参数: 无
返回值：Cookie中的AGENTURL的值
最后修改人（时间）：韦友爱（2015-02-04）
修改内容：创建
*******************************************************************************/
yingSoftCookie.prototype.getAgentUrl = function () {
    return G_Prg.getCookie('AGENTURL');
}