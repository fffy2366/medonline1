//匿名函数返回一个对象(这种封装方法不会暴露未实例化的function)
var G_UserAction = (function () {

    //定义函数 =========================================================================================================
    var yingsoftUserAction = function () {
        //        localStorage.removeItem('UserAction');
        var actionObj; //行为存储对象
        var curPage = _getPageName();
        var startTime = new Date();
        var curPageActionCount = 0;

        //获取actionObj
        this.getActionObj = function () {
            return actionObj;
        }
        //        //设置actionObj
        //        this.setActionObj = function(obj){
        //            actionObj = obj;
        //        }
        //检测浏览器是否支持localstorage
        function checkLocalstorage() {
            var isSupport = !!window.localStorage;
            if (!isSupport) { alert('您的浏览器不支持localstorage!'); }
            return isSupport;
        }
        //从localstorage读取对象
        this.loadObject = function () {
            //判断是否支持localstorage
            if (checkLocalstorage() === false) {
                return;
            }
            var obj = JSON.parse(localStorage.getItem('UserAction'));
            if (obj) {
                actionObj = obj;
                actionObj.newGUIDFlag = 0;
            } else {
                this.createActionObj();
            }
        }
        //        //保存对象到localstorage
        //        this.saveObject = function(){
        //            //判断是否支持localstorage
        //            if(checkLocalstorage() === false){
        //                return;
        //            }
        //            localStorage.setItem('UserAction', JSON.stringify(actionObj));
        //        }
        //如果actionObj不存在的话初始化actionObj(估计会很长)
        this.createActionObj = function () {
            actionObj = {
                //公共信息
                createTime: '',
                lastActionTime: '',
                flag_10: 0,
                flag_20: 0,
                flag_30: 0,
                userClinetGUID: '', //设备GUID
                newGUIDFlag: 1,
                softVersion: '', //软件版本号
                screenWidth: 0, //屏幕宽度
                screenHight: 0, //屏幕高度
                browser: '', //浏览器版本
                userClientType: '',
                userName: '',
                //用户操作统计
                userAction: {},
                //页面访问统计
                pageHistory: {},
                //单次使用时长
                operateDuration: {
                    actionBatchNumber: '', //操作批次号
                    actionCount: 0, //一个操作批次内点击总次数
                    actionBeginTime: '', //第一次操作时间
                    actionEndTime: '', //最后一次操作时间
                    lastPage: ''//最后访问的页面
                }
            }
            //进行初始化操作
            var curDate = new Date();
            actionObj.createTime = curDate;
            actionObj.lastActionTime = curDate;
            actionObj.userClinetGUID = _getGUID() + '_' + curDate.getTime();
            actionObj.softVersion = '11.11.11';
            actionObj.screenWidth = window.screen.width;
            actionObj.screenHight = window.screen.height;
            actionObj.browser = _getBrowserVersion();
            actionObj.userClientType = _getClientType();
            var cookieUserName = G_Cookie.getUserID() ? G_Cookie.getUserName() : 'Guest';
            actionObj.userName = cookieUserName;

            actionObj.operateDuration.actionBatchNumber = _getGUID() + '_' + curDate.getTime();
            actionObj.operateDuration.actionCount = 0;
            actionObj.operateDuration.actionBeginTime = _datetimeFormat(curDate, 'yyyy-MM-dd hh:mm:ss');
            actionObj.operateDuration.actionEndTime = _datetimeFormat(curDate, 'yyyy-MM-dd hh:mm:ss');
            actionObj.operateDuration.lastPage = curPage;
        }

        //追加用户行为
        this.addUserAction = function (actionName) {
            var curDate = new Date();
            //判断是否超过30分钟，超过则发送
            //console.log(curDate.getTime() - new Date(actionObj.lastActionTime).getTime());
            //十分钟
            var spendTime = curDate.getTime() - new Date(actionObj.lastActionTime).getTime();
//            var createSpendTime = curDate.getTime() - new Date(actionObj.createTime).getTime();
//            if (createSpendTime >= 600000 && createSpendTime < 1200000) {
//                if (actionObj && actionObj.flag_10 === 0) {
//                    actionObj.flag_10 === 1;
//                    //存入localstorage
//                    localStorage.setItem('UserAction_10', JSON.stringify(actionObj));
//                    console.log('存入10分钟json');
//                }
//            }
//            //二十分钟
//            else if (createSpendTime >= 1200000 && createSpendTime < 1600000) {
//                if (actionObj && actionObj.flag_20 === 0) {
//                    actionObj.flag_20 === 1;
//                    //存入localstorage
//                    localStorage.setItem('UserAction_20', JSON.stringify(actionObj));
//                    console.log('存入20分钟json');
//                }
//            }
//            // 三十分钟
//            else if (createSpendTime >= 1800000) {
//                if (actionObj && actionObj.flag_30 === 0) {
//                    actionObj.flag_30 === 1;
//                    //存入localstorage
//                    localStorage.setItem('UserAction_30', JSON.stringify(actionObj));
//                    console.log('存入30分钟json');
//                }
//            }
            if (spendTime >= 1800000) { //30分钟=1800000毫秒
                //回发服务器
				_send();
                //保存原来的 设备GUID
                var clientGUID = actionObj.userClinetGUID;
                //删除localStorage
                sessionStorage.removeItem('UserAction');
                //重新初始化用户行为对象
                this.createActionObj();
                actionObj.userClinetGUID = clientGUID;
                curPageActionCount = 0;
                startTime = new Date();
            }

            //更新公共信息==============================================================================================
            
            //            actionObj.newGUIDFlag = 0;
            var cookieUserName = G_Cookie.getUserID() ? G_Cookie.getUserName() : 'Guest';
            actionObj.userName = cookieUserName;
            actionObj.operateDuration.actionCount++;
            actionObj.operateDuration.actionEndTime = _datetimeFormat(curDate, 'yyyy-MM-dd hh:mm:ss');
            actionObj.operateDuration.lastPage = curPage;
            //更新页面历史==============================================================================================
            curPageActionCount++;
            //更新用户操作统计==========================================================================================
            if (curPage in actionObj.userAction) { //如果也存在此页面的信息
                var actionNode = {};
                if (actionName in actionObj.userAction[curPage]) { //如果已存在此行为的信息
                    actionNode = actionObj.userAction[curPage][actionName];
                    actionNode.actionCount++;
                } else {
                    actionNode.actionCount = 1;
                }
                actionNode.actionTime = _datetimeFormat(curDate, 'yyyy-MM-dd hh:mm:ss');
                actionObj.userAction[curPage][actionName] = actionNode;
            } else {
                var actionNode = {};
                actionNode.actionCount = 1;
                actionNode.actionTime = _datetimeFormat(curDate, 'yyyy-MM-dd hh:mm:ss');
                //                actionObj.userAction[curPage][actionName] = actionNode;
                var actionNode = {};
                actionNode[actionName] = { actionCount: 1, actionTime: _datetimeFormat(curDate, 'yyyy-MM-dd hh:mm:ss') };
                actionObj.userAction[curPage] = actionNode;
            }

        }
        //离开页面时保存到localstorage
        this.leavePage = function () {
            if (curPage in actionObj.pageHistory) {
                actionObj.pageHistory[curPage].push({ actionCount: curPageActionCount, startTime: _datetimeFormat(startTime, 'yyyy-MM-dd hh:mm:ss'), endTime: _datetimeFormat(new Date(), 'yyyy-MM-dd hh:mm:ss') });
            } else {
                actionObj.pageHistory[curPage] = [{ actionCount: curPageActionCount, startTime: _datetimeFormat(startTime, 'yyyy-MM-dd hh:mm:ss'), endTime: _datetimeFormat(new Date(), 'yyyy-MM-dd hh:mm:ss')}];
            }
            //存入localstorage
            localStorage.setItem('UserAction', JSON.stringify(actionObj));

        }
        //发送方法
        function _send() {
            if (actionObj) {
                var json = JSON.stringify(actionObj);
                //                console.log('发送用户统计json : ' + json);
                G_AjaxUserAction.actionPost('/api/userActionAnalysis/userActionAnalysisApi', { userActionObject: json }, true, function (str) {
                    //console.log(str) 
                });
            }
        }
        //============================================================================================================= 私有方法
        //生成GUID
        function _getGUID() {
            var randomSeed = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            var seedLen = randomSeed.length - 1;
            var ranStr = '';
            for (var i = 0; i < 32; i++) {
                var idx = Math.ceil(Math.random() * seedLen);
                ranStr += randomSeed[idx];
            }
            return ranStr;
        }
        //获取当前页面的名称
        function _getPageName() {
            var urlArr = location.pathname.split('/');
            var pageName = urlArr[urlArr.length - 1];
            return pageName.split('.')[0];
        }
        //获取浏览器版本
        function _getBrowserVersion() {
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
            if (adIndex > -1 && browser.safari) {
                var adEndIndex = userAgent.indexOf(';', adIndex);
                version = userAgent.substring(adIndex, adEndIndex);
            }
            return version;
        }
        //获取设备标识 web_android/web_iphone/web_pc/web_winphone
        function _getClientType() {
            if (navigator.userAgent.indexOf("Windows Phone") != -1) {
                return 'web_winphone';
            } else if (navigator.userAgent.indexOf("iPhone") != -1) {
                return 'web_iphone';
            } else if (navigator.userAgent.indexOf("Android") != -1) {
                return 'web_android';
            } else {
                return 'web_pc';
            }
        }

        function _datetimeFormat(datetime, format) {
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

    };
    //定义函数 end =============================================================

    //返回一个实例化的对象
    return new yingsoftUserAction();
})();