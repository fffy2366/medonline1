/********************************************************************************
资源加载库，在资源url追加版本参数防止缓存问题
*******************************************************************************/
var G_SoftVersion = null; //版本号(全局变量)

/********************************************************************************
函数名：G_LoadResource
功能：资源加载方法
输入参数: resourceArr 资源url链接(目前只支持js,css)
loadedCallback 加载完成后的回调函数fn
jsDirSrc js文件夹相对目录（默认是'../js/'）
返回值：无
创建信息：谢建沅（2014-08-08）
修改记录：无
审 查 人：无
*******************************************************************************/
function G_LoadResource(resourceArr, loadedCallback, jsDirSrc) {
    var failCount = 0; //查询加载状态失败次数
    var jsUnLoad = []; //标记待加载的js
    var jsLoaded = []; //已经加载完成的js
    var cssIdArr = [];
    //定义js文件夹，用来定位ver.js的路径
    jsDirSrc = jsDirSrc || './js/';
    //侦听window.onload事件，回调事件必须在onload之后再执行
    var pageLoaded = false;
    if (window.attachEvent) {
        window.attachEvent("onload", function () {
            pageLoaded = true;
        });
    } else {  //FireFox
        window.addEventListener("load", function () {
            pageLoaded = true;
        }, true);
    }
    //加载css方法
    function _loadCss(path, cssId) {
        cssTag = document.createElement('link');
        cssTag.id = cssId;
        cssTag.rel = 'stylesheet';
        cssTag.type = 'text/css';
        cssTag.href = path;
        document.getElementsByTagName("head")[0].appendChild(cssTag);
    }

    //加载js方法
    function _loadJs(path, jsCallback) {
        jsTag = document.createElement('script');
        jsTag.type = "text/javascript";
        jsTag.src = path;
        //生成的标签添加到页面中
        document.getElementsByTagName("head")[0].appendChild(jsTag);
        //加载侦听事件
        if (jsTag.addEventListener) {
            jsTag.addEventListener("load", function () {
                jsLoaded.push(path);
                if (jsCallback) {
                    jsCallback();
                }
            }, false);
        } else if (jsTag.attachEvent) {
            jsTag.attachEvent("onreadystatechange", function () {
                if (jsTag.readyState == 4
                    || jsTag.readyState == 'complete'
                    || jsTag.readyState == 'loaded') {
                    jsLoaded.push(path);
                    if (jsCallback) {
                        jsCallback();
                    }
                }
            });
        }
    }

    //如果sessionStorage没有版本信息从ver.js加载版本信息
    if (window.sessionStorage && sessionStorage.getItem('softVersion')) {
        G_SoftVersion = sessionStorage.getItem('softVersion');
        _loadResource();
    } else {
        _loadJs(jsDirSrc + 'ver.js?v=' + Math.random(), function () {
            sessionStorage.setItem('softVersion', G_SoftVersion);
            _loadResource();
        });
    }

    //加载资源并在url追加版本参数
    function _loadResource() {
        jsLoaded = [];
        for (var i = 0; i < resourceArr.length; i++) {
            //区分css和js，用不同的方式加载
            var startIndex = resourceArr[i].lastIndexOf('.');
            var extension = resourceArr[i].substring(startIndex, resourceArr[i].length);
            if (extension.toLowerCase() === '.js') {
                var path = resourceArr[i] += '?v=' + G_SoftVersion;
                jsUnLoad.push(path);
                _loadJs(path);
            }
            else {
                var path = resourceArr[i] += '?v=' + G_SoftVersion;
                var cssId = 'loaderCss' + i;
                cssIdArr.push(cssId);
                _loadCss(path, cssId);
            }
        }
        _waitForLoaded();
    }

    //检查css加载状态
    function _checkCss(isShow) {
        for (var i = 0; i < cssIdArr.length; i++) {
            if (!document.getElementById(cssIdArr[i]).sheet || (document.getElementById(cssIdArr[i]).sheet.cssRules.length === 0)) {
                if (isShow) {
                    alert('Load Fail:' + document.getElementById(cssIdArr[i]).href);
                    throw new Error('Load Fail:' + document.getElementById(cssIdArr[i]).href);
                }
                return false;
            }
        }
        return true;
    }

    //显示加载失败的js
    function _checkJs() {
        for (var i = 0; i < jsUnLoad.length; i++) {
            var flag = false;
            for (var j = 0; j < jsLoaded.length; j++) {
                if (jsUnLoad[i] === jsLoaded[j]) {
                    flag = true;
                    break
                }
            }
            if (!flag) {
                alert('Load Fail:' + jsUnLoad[i]);
                //                throw new Error('Load Fail:' + jsUnLoad[i]);
                location.reload(true);
            }
        }
    }

    //等待加载完毕执行回调函数
    function _waitForLoaded() {
        //判断失败次数是否超过，如果超过提示失败的文件
        if (failCount > 3000) {
            _checkCss(true);
            _checkJs();
            return;
        }
        //判断资源是否加载完
        if (pageLoaded && jsUnLoad.length === jsLoaded.length && _checkCss()) {
            if (loadedCallback) {
                loadedCallback();
            }
        } else {
            failCount++;
            setTimeout(function () {
                _waitForLoaded(); 
             }, 10);
        }

    }



}