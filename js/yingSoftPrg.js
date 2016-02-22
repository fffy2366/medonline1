/********************************************************************************
 公共方法库
 *******************************************************************************/
var G_Prg = new yingSoftPre();

function yingSoftPre() {
}

/********************************************************************************
 函数名：alert(必须引用dialog.css和dialog.js)
 功能：自定义弹出框
 输入参数: msg 提示信息
 callback 点击后执行的函数(可选参数)
 返回值：无
 创建信息：黎萍（2014-05-20）
 修改记录：谢建沅（2014-06-13）封装弹出窗口
 修改记录：谢建沅（2014-06-18）添加回调函数
 修改记录：韦友爱（2014-10-23）添加是否有报错弹窗的判断
			韦友爱（2015-07-13）有回调时，改调用G_DialogBox.alert
 审查人：韦友爱（2010-05-26）
 审查人：黎萍（2014-06-24）
 *******************************************************************************/
yingSoftPre.prototype.alert = function (msg, callback) {
    try {
        var eerorBox = document.getElementById('nrdvMsgBox');
        if(eerorBox && eerorBox.style.display === 'block'){//判断是否有报错弹窗（被踢下线）
            return;
        }
        if (callback) {
			/*G_DialogBox.alert(msg,function(btn){
				if (btn === 'yes') {
                    callback();
                }
			});*/
            G_DialogBox.show({ buttons: { yes: '确认' }, width: '300px', msg: msg, title: '温馨提示', fn: function (btn) {
                if (btn === 'yes') {
                    callback();
                }
            } });
        } else {
            G_DialogBox.alert(msg);
        }
    } catch (err) {
        alert(err);
        throw new Error(err);
    }
}

/********************************************************************************
 函数名：confirm(必须引用dialog.css和dialog.js)
 功能：自定义确认框
 输入参数: msg 提示信息
 callback 确认后的回调函数
 返回值：无
 创建信息：谢建沅（2014-06-13）封装确认框
 修改记录：韦友爱（2014-10-23）添加是否有报错弹窗的判断
 审查人：黎萍（2014-06-24）
 *******************************************************************************/
yingSoftPre.prototype.confirm = function (msg, yesCallback, noCallback) {
    try {
        var eerorBox = document.getElementById('nrdvMsgBox');
        if(eerorBox && eerorBox.style.display === 'block'){//判断是否有报错弹窗（被踢下线）
            return;
        }
        G_DialogBox.confirm(msg, function (btn) {
            if (btn === 'yes') {
                if(yesCallback){
                    yesCallback();
                }
            } else {
                if (noCallback) {
                    noCallback();
                }
            }
        });
    } catch (err) {
        alert(err);
        throw new Error(err);
    }
}

/********************************************************************************
 函数名：textarea(必须引用dialog.css和dialog.js)
 功能：笔记编辑框
 输入参数: msg 显示时绑定的文本
 callback 确认后的回调函数
 返回值：无
 创建信息：谢建沅（2014-06-13）封装确认框
 审查人：黎萍（2014-06-24）
 *******************************************************************************/
yingSoftPre.prototype.textarea = function (msg, yesCallback, noCallback) {
    try {
        G_DialogTextarea.textarea(msg, function (btn, text) {
            if (text) {
                text = text.replace(/[\ud83c-\udfff]/g, '');
            }
            if (btn === 'yes') {
                if(yesCallback){
                    yesCallback(text);
                }
            } else {
                if (noCallback) {
                    noCallback();
                }
            }
        });
    } catch (err) {
        alert(err);
        throw new Error(err);
    }
}

yingSoftPre.prototype.pwdTextBox = function (msg, yesCallback, noCallback) {
    try {
        G_DialogTextarea.pwdTextBox(msg, function (btn, text) {
            if (btn === 'yes') {
                if(yesCallback){
                    yesCallback(text);
                }
            } else {
                if (noCallback) {
                    noCallback();
                }
            }
        });
    } catch (err) {
        alert(err);
        throw new Error(err);
    }
}

/********************************************************************************
 函数名：htmlContent(必须引用dialog.css和dialog.js)
 功能：显示html的弹出框
 输入参数: width 弹出框宽度 '300px'或'90%'
 height 弹出框高度 '300px'或'90%'
 title  标题
 html   显示的html代码
 isInnerHtml true:使用innerHTML方式，false:使用appendChild方式
 closeCallback  关闭回调函数
 返回值：无
 创建信息：谢建沅（2014-06-13）
 审查人：黎萍（2014-06-24）
 *******************************************************************************/
yingSoftPre.prototype.htmlContent = function (width, height, title, html, isInnerHtml, closeCallback) {
    try {
        //隐藏背景滚动条
        document.body.style.overflow = 'hidden';
        G_DialogContent.htmlContent(width, height, title, html, isInnerHtml, function () {
            if (closeCallback) {
                closeCallback();
            }
        });
    } catch (err) {
        alert(err);
        throw new Error(err);
    }
}

/********************************************************************************
 函数名：popMsg
 功能：弹出提示文本
 输入参数: msg 显示的文本
 返回值：无
 创建信息：谢建沅（2014-07-28）
 审查人：
 *******************************************************************************/
yingSoftPre.prototype.popMsgTimer = null;//setTimeout定时器
yingSoftPre.prototype.popMsg = function (msg,showTime,isCenter) {
    showTime = showTime || 1000;
    if(this.popMsgTimer){
        clearTimeout(this.popMsgTimer);
    }
    var oldPopdialog = document.getElementById('popMsgDiv');
    if(oldPopdialog){
        document.body.removeChild(oldPopdialog);
    }
    var popDiv = document.createElement("div");
    popDiv.id = 'popMsgDiv';
    popDiv.style.position = 'fixed';
    popDiv.style.width = '180px';
    popDiv.style.backgroundColor = '#000';
    if(isCenter){
        popDiv.style.top = '50%';
        //popDiv.style.marginTop = '0px';
    } else{
        popDiv.style.bottom = '50px';
    }
    //popDiv.style.filter = 'alpha(opacity=80)';
    popDiv.style.opacity = 0.8;
    popDiv.style.color = '#FFF';
    popDiv.style.fontSize = '16px';
    popDiv.style.borderRadius = '5px';
    popDiv.style.left = '50%';
    popDiv.style.zIndex = 9999;
    popDiv.style.marginLeft = '-100px';
    popDiv.style.padding = '5px 10px 5px 10px';
    popDiv.style.textAlign = 'center';

    popDiv.innerHTML=msg;

    document.body.appendChild(popDiv);

    this.popMsgTimer = setTimeout(function(){
        var popdialog = document.getElementById('popMsgDiv');
        if(popdialog){
            document.body.removeChild(popdialog);
        }
    },showTime);

}

/********************************************************************************
 函数名：popMsgDialog
 功能：弹出居中提示文本框
 输入参数: msg 显示的文本
 返回值：无
 创建信息：谢建沅（2014-07-28）
 审查人：
 *******************************************************************************/
yingSoftPre.prototype.popMsgDialog = function (msg) {
    try {
        G_DialogPop.popMsg(msg);
    } catch (err) {
        alert(err);
        throw new Error(err);
    }
}

/********************************************************************************
 函数名：throw
 功能：抛出异常
 输入参数: msg 异常信息
 返回值：无
 创建信息：黎萍（2014-05-20）
 修改记录：无
 审查人：韦友爱（2010-05-26）
 *******************************************************************************/
yingSoftPre.prototype.throw = function (msg, callback) {
    this.alert(msg, function(){
		if(callback){
			callback();
		} else{
			document.location.href = '../html/default.html';	
		}
		});
    throw new Error(msg);
}
/********************************************************************************
 函数名：$
 功能：JS封装document.getElementById(id)
 输入参数: 元素ID
 返回值：标签对象
 创建信息：黎萍（2014-05-30）
 修改记录：无
 *******************************************************************************/
yingSoftPre.prototype.$ = function (id) {
    return document.getElementById(id);
}

/********************************************************************************
 函数名：getQueryString
 功能：获取参数值
 输入参数: name 参数名
 isURLEncode 是否用了URL字符编码
 返回值：string 参数值
 创建信息：谢建沅(2014-5-30)
 修改记录：无
 审查人：黎萍（2014-06-24）
 *******************************************************************************/
yingSoftPre.prototype.getQueryString = function (name, isURLEncode) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var value = window.location.search.substr(1).match(reg);
    if (!value) {
        return null;
    }
    if (isURLEncode) {
        return decodeURI(value[2]);
    } else {
        return unescape(value[2]);
    }

}
//将URL中的UTF-8字符串转成中文字符串
/********************************************************************************
 函数名：getCharFromUtf8
 功能：将URL中的UTF-8字符串转成中文字符串
 输入参数: str 参数名称
 返回值：str 中文字符串
 创建信息：欧聪（2014-11-21）
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.getCharFromUtf8=function (str) {
    var cstr = "";
    var nOffset = 0;
    if (str == "")
        return "";
    str = str.toLowerCase();
    nOffset = str.indexOf("%e");
    if (nOffset == -1)
        return str;
    while (nOffset != -1) {
        cstr += str.substr(0, nOffset);
        str = str.substr(nOffset, str.length - nOffset);
        if (str == "" || str.length < 9)
            return cstr;
        cstr += yingSoftPre.prototype.utf8ToChar(str.substr(0, 9));
        str = str.substr(9, str.length - 9);
        nOffset = str.indexOf("%e");
    }
    return cstr + str;
}

//将编码转换成字符
/********************************************************************************
 函数名：utf8ToChar
 功能：将编码转换成字符
 输入参数: str 参数名称
 返回值：str 字符
 创建信息：欧聪（2014-11-21）
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.utf8ToChar=function (str) {
    var iCode, iCode1, iCode2;
    iCode = parseInt("0x" + str.substr(1, 2));
    iCode1 = parseInt("0x" + str.substr(4, 2));
    iCode2 = parseInt("0x" + str.substr(7, 2));
    return String.fromCharCode(((iCode & 0x0F) << 12) | ((iCode1 & 0x3F) << 6) | (iCode2 & 0x3F));
}
/********************************************************************************
 函数名：checkParamName
 功能：检查参数名称是否存在
 输入参数: paramName 参数名称
 返回值：bool 是或否
 创建信息：谢建沅(2014-06-13)
 修改记录：黎萍（2014-06-13）修改函数名称和变量名称
 审查人：黎萍（2014-06-24）
 *******************************************************************************/
yingSoftPre.prototype.checkParamName = function (paramName) {
    var paramStr = window.location.search.substr(1);
    var paramArr = paramStr.split('&');
    for (var i = 0; i < paramArr.length; i++) {
        if (paramName === paramArr[i].split('=')[0]) {
            return true;
        }
    }
    return false;
}
/********************************************************************************
 函数名：getBrowserVersion
 功能：获取浏览器类型和版本号
 输入参数: 无
 返回值：string 浏览器名称和版本（空格分隔开）
 创建信息：谢建沅(2014-5-30)
 修改记录：无
 审查人：谭健康（2014-06-01）
 *******************************************************************************/
yingSoftPre.prototype.getBrowserVersion = function () {
            var browser = {};
            var userAgent = navigator.userAgent.toLowerCase();
            var verString;
            (verString = userAgent.match(/msie ([\d.]+)/))
                ? browser.ie = verString[1]
                : (verString = userAgent.match(/firefox\/([\d.]+)/))
                ? browser.firefox = verString[1]
                : (verString = userAgent.match(/chrome\/([\d.]+)/))
                ? browser.chrome = verString[1]
                : (verString = userAgent.match(/ucbrowser.([\d.]+)/))
                ? browser.uc = verString[1]
                : (verString = userAgent.match(/baidubrowser.([\d.]+)/))
                ? browser.baidu = verString[1]
                : (verString = userAgent.match(/opera.([\d.]+)/))
                ? browser.opera = verString[1]
                : (verString = userAgent
                .match(/version\/([\d.]+).*safari/))
                ? browser.safari = verString[1]
                : 0;

            var version = '';
            if (browser.ie) {
                version = 'msie ' + browser.ie;
            } else if (browser.firefox) {
                version = 'firefox ' + browser.firefox;
            } else if (browser.chrome) {
                version = 'chrome ' + browser.chrome;
            } else if (browser.uc) {
                version = 'uc ' + browser.uc;
            } else if (browser.baidu) {
                version = 'baidu ' + browser.baidu;
            } else if (browser.opera) {
                version = 'opera ' + browser.opera;
            } else if (browser.safari) {
                version = 'safari ' + browser.safari;
            } else {
                version = 'unknown';
            }
            //处理android自带浏览器
            var adIndex = userAgent.indexOf('android');
            if(adIndex > -1 && browser.safari){
                var adEndIndex = userAgent.indexOf(';',adIndex);
                version = userAgent.substring(adIndex,adEndIndex);
            }
            return version;
}
/********************************************************************************
 函数名：checkEmail
 功能：验证Email格式
 输入参数: emailStr 待验证字符串
 返回值：true 验证通过 false验证不通过
 创建信息：谢建沅(2014-5-30)
 修改记录：黎萍（2014-06-24）修改变量名称
 审查人：谭健康reg.test(str)正则检查短字符串没问题（2014-06-01）
 *******************************************************************************/
yingSoftPre.prototype.checkEmail = function (emailStr) {
    if (emailStr.length !== 0) {
        var emailReg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return emailReg.test(emailStr);
    }
}
/********************************************************************************
 函数名：checkZip
 功能：验证邮编格式
 输入参数: 待验证字符串
 返回值：true 验证通过 false验证不通过
 创建信息：谢建沅(2014-5-30)
 修改记录：黎萍（2014-06-24）修改变量名称
 审查人：谭健康（2014-06-01）
 *******************************************************************************/
yingSoftPre.prototype.checkZip = function (zipStr) {
    if (zipStr.length !== 0) {
        var zipReg = /^\d{6}$/;
        return zipReg.test(zipStr);
    }
}
/********************************************************************************
 函数名：checkUserName
 功能：验证是否为用户名a-z,A-Z,0-9
 输入参数: userName 待验证字符串
 返回值：true 验证通过 false验证不通过
 创建信息：谢建沅(2014-5-30)
 修改记录：黎萍（2014-06-24）修改变量名称
 审查人：谭健康（2014-06-01）
 *******************************************************************************/
yingSoftPre.prototype.checkUserName = function (userName) {
    if (userName.length !== 0) {
        var userNameReg = /^[a-zA-Z0-9_]+$/;
        return userNameReg.test(userName);
    }
}
/********************************************************************************
 函数名：checkNumber
 功能：验证是否为用户名0-9
 输入参数: num 待验证字符串
 返回值：true 验证通过 false验证不通过
 创建信息：谢建沅(2014-9-30)
 修改记录：
 审查人：
 *******************************************************************************/
yingSoftPre.prototype.checkNumber = function (num) {
    if (num.length !== 0) {
        var userNumReg = /^[0-9]+$/;
        return userNumReg.test(num);
    }
}
yingSoftPre.prototype.checkNumber2 = function (num) {
    if (num.length !== 0) {
//        var userNumReg = /^\d+(\d|(\.[0-9]{1,2}))$/;
//        return userNumReg.test(num);
        var result = Number(num);
        if(!isNaN(result)){
            //判断是正数并且小于20
//            if(result>=0 && result <= 20){
//                return true;
//            } else{
//                return false;
//            }
              return true;
        } else{
            return false;
        }
    }
}

/********************************************************************************
 函数名：checkCellPhone
 功能：验证是否为手机号码
 输入参数: 待验证字符串
 返回值：true 验证通过 false验证不通过
 创建信息：谢建沅(2014-06-03)
 修改记录：黎萍（2014-06-24）修改变量名称
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.checkCellPhone = function (phoneStr) {
    if (phoneStr.length !== 0) {
        //var phoneReg=/^((13[0-9])|(14[0-9])|(15[0-35-9])|(18[0,2,3,5-9]))\d{8}$/;
        var phoneReg = /^((13[0-9])|(14[0-9])|(15[0-9])|(17[0-9])|(18[0-9]))\d{8}$/;
        return phoneReg.test(phoneStr);
    }
}

/********************************************************************************
 函数名：getClientHeight
 功能：获取网页当前显示高度
 输入参数:无
 返回值：int 高度值
 创建信息：谢建沅(2014-06-03)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.getClientHeight = function () {
    return parseInt(window.document.body.clientHeight);
}

/********************************************************************************
 函数名：getClientWidth
 功能：获取网页当前显示宽度
 输入参数:无
 返回值：int 宽度值
 创建信息：谢建沅(2014-06-03)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.getClientWidth = function () {
    return parseInt(window.document.body.clientWidth);
}

/********************************************************************************
 函数名：checkCookieSupport
 功能：检查Cookie是否可用
 输入参数:无
 返回值：bool true可用，false不可用
 创建信息：谢建沅(2014-06-03)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.checkCookieSupport = function () {
    var isSupport = false;
    if (navigator.cookieEnabled) {
        isSupport = true;
    } else {
        document.cookie = 'test';
        isSupport = document.cookie === 'test';
        document.cookie = '';
    }
    return isSupport;
}

/********************************************************************************
 函数名：getCookie
 功能：获取Cookie的值
 输入参数: cookieName Cookie名称
 返回值：string Cookie值
 创建信息：谢建沅(2014-06-03)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.getCookie = function (cookieName) {
    var value = null;
    var arr;
    var reg = new RegExp("(^| )" + cookieName + "=([^;]*)(;|$)");
    arr = document.cookie.match(reg);
    if (arr) {
        value = unescape(arr[2]);
    }
    return (value) ? value : null;
}

/********************************************************************************
 函数名：setCookie
 功能：设置Cookie的值
 输入参数: name Cookie名称
 value Cookie值
 isSetTime 是否设置有效时间(可选参数),false为关闭浏览器自动删除此cookie
 返回值：无
 创建信息：谢建沅(2014-06-03)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.setCookie = function (name, value, isSetTime) {
    if (isSetTime === undefined || isSetTime === true) {
        var day = 30;//默认cookie保存30天
        var date = new Date();
        date.setTime(date.getTime() + Number(day) * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + "; path=/;expires = " + date.toGMTString();
    }
    else {
        document.cookie = name + "=" + escape(value) + "; path=/";
    }
}

/********************************************************************************
 函数名：removeCookie
 功能：删除Cookie
 输入参数: cookieName Cookie名称
 返回值：无
 创建信息：谢建沅(2014-06-03)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.removeCookie = function (cookieName) {
    var date = new Date();
    date.setTime(date.getTime() - 10000);
    document.cookie = cookieName + "=;path=/;expires = " + date.toGMTString();
}

/********************************************************************************
 函数名：cleanCookie
 功能：清除所有Cookie
 输入参数: 无
 返回值：无
 创建信息：谢建沅(2014-06-03)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.cleanCookie = function () {
    var strCookie = document.cookie;
    var arrCookie = strCookie.split('; '); // 将多cookie切割为多个名/值对
    for (var i = 0; i < arrCookie.length; i++) { // 遍历cookie数组，处理每个cookie对
        var arr = arrCookie[i].split("=");
        if (arr.length > 0) {
            this.removeCookie(arr[0]);
        }
    }
}

/********************************************************************************
 函数名：datetimeFormat
 功能：格式化时间
 输入参数: datetime 时间
 format 格式化字符串 (yyyy/MM/dd hh:mm:ss)
 返回值：string 格式化后的字符串
 创建信息：谢建沅(2014-06-19)
 修改记录：黎萍（2014-06-25）修改变量名称；修改花括号的格式
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.datetimeFormat = function (datetime, format) {
    var date = {
        "M+": datetime.getMonth() + 1, //月份
        "d+": datetime.getDate(), //日
        "h+": datetime.getHours(), //小时
        "m+": datetime.getMinutes(), //分
        "s+": datetime.getSeconds(), //秒
        "q+": Math.floor((datetime.getMonth() + 3) / 3), //季度
        "S": datetime.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (datetime.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (date[k]) : (('00' + date[k]).substr(('' + date[k]).length)));
        }
    }
    return format;
}

/********************************************************************************
 函数名：replaceHTML
 功能：剔除文本中的html代码
 输入参数: str 要处理的文本
 返回值：剔除后的字符串
 创建信息：谢建沅(2014-08-11)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.replaceHTML = function (str) {
    return str.replace(/<[^>].*?>/g,'');
}

/********************************************************************************
 函数名：checkVipApp
 功能：验证用户所选的科目是否购买
 输入参数: fn(isBuy) 回调函数 isBuy 是否购买
 返回值：无
 创建信息：谢建沅(2014-09-18)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.checkVipApp = function () {
    var userName = G_Cookie.getUserName();
    var appEName = G_Cookie.getAppEName();
    var guid = G_Cookie.getGuid();
    var isBuy = false;
    var userID = G_Cookie.getUserID();
    if(!userID){
        return false;
    }
    var URL = '/api/user/getVipMsg/'+userID+'/'+appEName+'/'+guid;
    G_AjaxApi.get(URL, false, function (json) {//json格式为：{ "data": { "userAppJson": userAppJson }, "msg": "找不到产品", "status": 201 } ;
        if (!json) {
            G_Prg.throw('程序运行错误:G_Prg._checkVipApp  请求服务器[/api/user/getVipMsg]接口无返回！');
        }
        var jsonData = JSON.parse(json);
        if (jsonData.status === 400 || jsonData.status === 300) {
            G_Prg.throw('程序运行错误:G_Prg._checkVipApp  服务器异常：status=' + jsonData.status + '，异常信息:' + jsonData.msg);
        }
        if (jsonData.status === 200) {
            isBuy = true;
        } else if (jsonData.status === 201) {
        } else {
            G_Prg.throw('程序运行错误:G_Prg._checkVipApp  未知返回值：' + JSON.stringify(jsonData));
        }
    });

    return isBuy;
}
/********************************************************************************
 函数名：getExamTime
 功能：获取当前用户当前科目的考试时间
 输入参数: userID 用户ID,appID 科目ID
 返回值：examTime 考试时间
 创建信息：韦友爱(2014-09-22)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.getExamTime = function (userID,appID) {
    var URL = '/api/examTimeApi/getExamTimeData/' + userID + '/' + appID + '/' + G_Cookie.getGuid()+'/'+G_Cookie.getUserName();
    var examTime = '';
    G_AjaxApi.get(URL, false, function (json) {
        var jsonData = JSON.parse(json);
        if (jsonData.status === 200) {
            examTime = jsonData.data;
        } else if (jsonData.status === 201) {
            examTime = '';
        } else if (jsonData.status === 300) {
            G_Prg.throw('程序运行错误:G_Prg.getExamTime,数据库连接错误');
        } else if (jsonData.status === 400) {
            G_Prg.throw('程序运行错误:G_Prg.getExamTime,参数错误');
        } else {
            G_Prg.throw('程序运行错误:G_Prg.getExamTime  未知返回值：' + JSON.stringify(jsonData));
        }
    });
    return examTime;
}
/********************************************************************************
 函数名：checkUserName
 功能：验证用户名格式
 输入参数: element 输入控件对象,isImmediately （可无）是否立即验证
 返回值：如果验证通过返回控制，否则返回对应的提示语
 创建信息：韦友爱(2014-10-15)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.checkUserName = function (element,isImmediately){
    var userName=element.value;
    if (!userName) {
        return '*请输入通行证';
    } 
    var reg = /[^0-9]/g;
    if(userName.match(reg)){
        var index=this.getCursortPosition(element)-1;//获取光标位置
        element.value=userName.replace(reg, '');//将不合法字符过滤
        this.setCaretPosition(element, index);//指定光标位置
        return '';
        //return '*输入内容必须是数字';
    }
    if(!isImmediately){//非即时判断 
        if(userName.length<11){
            return '*输入通行证为11位数';
        }
        if(!this.checkCellPhone(userName)){
            return '*通行证必须是手机号码';
        }
    }
    //即时判断
    if(userName.length===2){
        var phoneReg = /^(1[3,4,5,7,8])$/;
        if(!phoneReg.test(userName)){
            return '*通行证必须是手机号码';
        }
    }
    if(userName.length > 2){
        var name=userName[0]+userName[1];
        var phoneReg = /^(1[3,4,5,7,8])$/;
        if(!phoneReg.test(name)){
            return '*通行证必须是手机号码';
        }
    }
    if(userName.length > 10&&!this.checkCellPhone(userName)){
       return '*通行证必须是手机号码';
    }
    return '';
}
/********************************************************************************
 函数名：checkPsw
 功能：验证密码格式
 输入参数: element 输入控件对象,isImmediately （可无）是否立即验证
 返回值：如果验证通过返回控制，否则返回对应的提示语
 创建信息：韦友爱(2014-10-15)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.checkPsw = function (element,isImmediately){
    var psw=element.value;
    if (!psw) {
        return '*请输入密码';
    }
    var markWord='*密码必须是6-20个字符';
    var reg = /[^0-9a-zA-Z`~!@#$%^&*()_+<>?:{\},.\/;[\]\\\|\'\"-=]/g;
    if(psw.match(reg)) {
        var index=this.getCursortPosition(element)-1;//获取光标位置
        element.value=psw.replace(reg, '');
        this.setCaretPosition(element, index);//光标定位
        return '';
//        return markWord;
    }
    if(!isImmediately){
        if(psw.length<6||psw.length>20){
            return markWord;
        }
    }
    if(psw.length>20){
        return markWord;
    }
    return '';
}
/********************************************************************************
 函数名：getCursortPosition
 功能：获取光标位置索引
 输入参数: element 输入控件对象
 返回值：CaretPos 光标位置索引
 创建信息：韦友爱(2014-10-15)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.getCursortPosition = function(element) {
    var CaretPos = 0
    var length = 0;
    if(window.getSelection){
        length=window.getSelection().toString().length;
    }else if(document.selection&&document.selection.createRange){
        length=document.selection.createRange().text.length;
    }
    if (document.selection) {
        element.focus ();
        var Sel = document.selection.createRange ();
        Sel.moveStart ('character', - element.value.length);
        CaretPos = Sel.text.length;
    }else if (element.selectionStart || element.selectionStart == '0'){
        CaretPos = element.selectionStart;
    }   
    return (CaretPos+length);
    
}
/********************************************************************************
 函数名：setCaretPosition
 功能：指定光标位置
 输入参数: element 输入控件对象，position 光标位置索引
 返回值：无
 创建信息：韦友爱(2014-10-15)
 修改记录：无
 审查人：无
 *******************************************************************************/
yingSoftPre.prototype.setCaretPosition = function(element, position){
    if(element.setSelectionRange){
        element.focus();
        element.setSelectionRange(position,position);
    }else if (element.createTextRange) {
        var range = element.createTextRange();
        range.collapse(true);
        range.moveEnd('character', position);
        range.moveStart('character', position);
        range.select();
    }
}
/********************************************************************************
 函数名：alert(必须引用dialog.css和dialog.js)
 功能：自定义弹出框
 输入参数: msg 提示信息
 callback 点击后执行的函数(可选参数)
 返回值：无
 创建信息：黎萍（2014-05-20）
 修改记录：谢建沅（2014-06-13）封装弹出窗口
 修改记录：谢建沅（2014-06-18）添加回调函数
 修改记录：韦友爱（2014-10-23）添加是否有报错弹窗的判断
 审查人：韦友爱（2010-05-26）
 审查人：黎萍（2014-06-24）
 *******************************************************************************/
yingSoftPre.prototype.showNotice = function (msg, callback,titleMsg,btnMsg) {
    try {
        var eerorBox = document.getElementById('nrdvMsgBox');
        if(eerorBox && eerorBox.style.display === 'block'){//判断是否有报错弹窗（被踢下线）
            return;
        }
        var btn = '知道了';
        var title = '公告';
        if(btnMsg){
            btn=btnMsg;
        }
        G_DialogBox.showNotice(msg, callback,titleMsg,btnMsg);
        /*
        if (callback) {
            G_DialogBox.show({ buttons: { yes: '知道了' }, width: '300px', msg: '<div style="text-align:left;text-indent:2em;">'+msg+'</div>', title: '考试宝典平台维护公告', fn: function (btn) {
                if (btn === 'yes') {
                    callback();
                }
            } });
            /*G_Prg.$('nrdvMsgCT').style.textAlign='left';
            G_Prg.$('nrdvMsgCT').style.textIndent='2em';*/
       /* } else {
            G_DialogBox.showNotice(msg);
        }*/
    } catch (err) {
        alert(err);
        throw new Error(err);
    }
}
yingSoftPre.prototype.showLast = function (msg, yesCallback, noCallback) {
    try {
        var eerorBox = document.getElementById('nrdvMsgBox');
        if(eerorBox && eerorBox.style.display === 'block'){//判断是否有报错弹窗（被踢下线）
            return;
        }
         G_DialogBox.showLast(msg, function (btn) {
            if (btn === 'yes') {
                if(yesCallback){
                    yesCallback();
                }
            } else {
                if (noCallback) {
                    noCallback();
                }
            }
        });
    } catch (err) {
        alert(err);
        throw new Error(err);
    }
}
/********************************************************************************
功能：检测用户购买的功能权限模块是
输入参数: 功能权限模块名称，参数顺序不可乱：purviewName1 精品课程, purviewName2 易混易错, purviewName3 考前预测,purviewName4 实践技能
返回值：buyType 用户购买的功能权限模块代码，1-3表示用户购买了单个的功能权限模块，
		4表示用户购买了组合套餐
最后修改人：黎萍（2015-05-12）
修改记录：黎萍（2015-07-02）对组合价类型类似"易混易错+考前预测"进行分割处理
          黎萍（2015-07-30）增加课程实践技能访问权限控制
********************************************************************************/
yingSoftPre.prototype.checkApiPurview = function (purviewName1, purviewName2, purviewName3,purviewName4) {
	var data = G_Storage.getSessionStorageValue('ApiPurview');
	if (_isEmpty(data)) {
		return;
	}
	var buyType = 0;
	var arrLen = 0;
	var tempLen = 0;
    
	if(G_Cookie.getAppEName() === 'ZY_ZYAO' || G_Cookie.getAppEName() === 'ZY_XY'){
		buyType = 3;
		return buyType;
	}
	for(var i = 0; i < data.length; i++){
		tempLen = data[i].BuyType.split('+').length;//data.length;
		if(tempLen > arrLen){
			arrLen = tempLen;
		}
	}
	if(data.length >= arrLen){
		arrLen = data.length;
	}
	if (arrLen === 1) {
		if (data[0].BuyType === purviewName1) {
			buyType = 1;
		}
		if (data[0].BuyType === purviewName2) {
			buyType = 2;
		}
		if (data[0].BuyType === purviewName3) {
			buyType = 3;
		}
        if (data[0].BuyType === purviewName4) {
			buyType = 5;
		}
	} else {
		for (var i = 0; i < arrLen; i++) {
			if (data[i].BuyType === purviewName1 || data[i].BuyType === purviewName2 || data[i].BuyType === purviewName3) {
				buyType = 4;
			}
		}
	}
	return buyType;
	function _isEmpty(obj) { 
		for (var name in obj)  { 
			return false; 
		} 
		return true; 
	};
}

/********************************************************************************
函数名：iOSfn
功能：苹果商店功能
输入参数: 无
返回值：包含用户名、软件英文名、软件中文名的字符串
创建信息：韦友爱（2015-07-16）
修改记录：无
审查人：无
*******************************************************************************/
function iOSfn(){
	var username=G_Cookie.getUserID();
    var softname=G_Cookie.getAppEName();
	var appName=G_Cookie.getAppName();
	
    var answer=username+"/"+softname+"/"+appName;
    return answer;
}