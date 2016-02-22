/********************************************************************************
GET方式：
G_AjaxApi.get('/API/login/13111111111/111111',true,function(json){alert(json);});

POST方式：
G_AjaxApi.post('/API/queryUser',{Tel:'13111111111'},true,function(json){alert(json);});

JSONP方式:
G_AjaxCloud.jsonp('/VerificationCode/CreateGuid/',{Tel:'13111111111'},function(json){alert(json);});
*******************************************************************************/
var G_AjaxApi = new yingsoftAjax('http://115.29.210.3:8001');
var G_AjaxCloud = new yingsoftAjax('http://121.199.11.87:8118');
var G_AjaxUserAction = new yingsoftAjax('http://115.29.210.3:704');
var G_AjaxTestShare = new yingsoftAjax('http://218.244.148.206:702');
function yingsoftAjax(ip) {
    var autoLoginCount = 0;

    /********************************************************************************
    函数名：_formatParams
    功能：格式化参数并加入随机数防止缓存（私有函数）
    输入参数:params 需要格式化的参数，例：{name:'名称',age:20}
    返回值：string 格式化后的字符串
    创建信息：谢建沅（2014-06-24）
    修改信息：无
    修改记录：无
    *******************************************************************************/
    function _formatParams(params) {
        var arr = [];
        //对参数进行url编码
        for (var name in params) {
            arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
        }
        //生成随机数，防止浏览器缓存
        arr.push(('v=' + Math.random() + '').replace('.', ''));
        return arr.join('&');
    }

    function _addGetRandom(url) {
        if (url.indexOf('?') > -1) {
            return url + '&v=' + Math.random();
        } else {
            return url + '?v=' + Math.random();
        }
    }

    /********************************************************************************
    函数名：_removeCookie
    功能：删除cookie方法
    输入参数:cookieName cookie名称
    返回值：无
    创建信息：谢建沅（2014-06-24）
    修改信息：无
    修改记录：无
    *******************************************************************************/
    function _removeCookie(cookieName) {
        var date = new Date();
        date.setTime(date.getTime() - 10000);
        document.cookie = cookieName + "=;path=/;expires = " + date.toGMTString();
    }

    //为了降低耦合，使用自带的cookie操作方法
    function _setCookie(name, value, isSetTime) {
        if (isSetTime === undefined || isSetTime === true) {
            var day = 30; //默认cookie保存30天
            var date = new Date();
            date.setTime(date.getTime() + Number(day) * 24 * 60 * 60 * 1000);
            document.cookie = name + "=" + escape(value) + "; path=/;expires = " + date.toGMTString();
        }
        else {
            document.cookie = name + "=" + escape(value) + "; path=/";
        }
    }
    function _getCookie(cookieName) {
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
    函数名：_removeUserCookie
    功能：检测到用户登录状态失效时先清空相关cookie再要求用户重新登录
    输入参数:无
    返回值：无
    创建信息：谢建沅（2014-06-24）
    修改信息：无
    修改记录：无
    *******************************************************************************/
    function _removeUserCookie() {
        //_removeCookie('USERNAME');
        _removeCookie('USERID');
        _removeCookie('GUID');
    }

    function _ajaxAlert(msg, callBack) {
        try {
            G_Prg.alert(msg, callBack);
        }
        catch (err) {
            alert(msg);
            callBack();
        }
    }

    function _getPageName() {
        var urlArr = location.pathname.split('/');
        var pageName = urlArr[urlArr.length - 1];
        return pageName;
    }

    //session失效自动登录
    function _autoLogin(responseText, callback) {
        _removeUserCookie();
        var _loginFn = function () {
            if (_getCookie('USERNAME') && _getCookie('USERPWD')) {
                //自动登录
                var _success = function (json) {
                    if (json) {
                        var jsonData = JSON.parse(json);
                        if (jsonData.status === 200) {
                            G_Cookie.setUserID(jsonData.data.userID);
                            G_Cookie.setUserName(userName);
                            G_Cookie.setGuid(jsonData.data.guid);

                            console.log('自动登录成功！');
                            location.reload();
                        } else {
                            //cookie没有数据，跳转到登录页面
                            _setCookie('LOGINURL', location.href, false);
                            document.location.href = 'userLogin.html?fromUrl=default.html';
                        }
                    }
                }
                var userName = _getCookie('USERNAME');
                var userPwd = _getCookie('USERPWD').split(',')[0];
                var loginType = 1; //用户名登录
                if (G_Prg.checkEmail(userName)) {//邮箱登录
                    loginType = 2;
                }
                if (G_Prg.checkCellPhone(userName)) {//手机登录
                    loginType = 3;
                }
                _get('/api/user/login/' + userName + '/' + userPwd + '/' + loginType, false, _success);

            } else {
                //cookie没有数据，跳转到登录页面
                _setCookie('LOGINURL', location.href, false);
                document.location.href = 'userLogin.html?fromUrl=default.html';
            }
        }
        if (responseText && responseText === '登录状态失效，请重新登录。' && autoLoginCount <= 10) {
            _loginFn(); //不提示登录失效，后台自动登录
            autoLoginCount++;
        } else {
            _ajaxAlert(responseText, function () { _removeUserCookie();document.location.href = 'userLogin.html?fromUrl=default.html'; });  //弹出登录失效提示
        }
		
    }

    /********************************************************************************
    函数名：get
    功能：get方式请求数据
    输入参数:url 请求的地址
    async 是否异步执行(true：异步/false：同步)
    success 请求成功的回调函数fn(json,status,readyState){}
    error 请求失败的回调函数(可选参数)fn(status,readyState){}
    返回值：无
    创建信息：谢建沅（2014-06-24）
    修改信息：无
    修改记录：无
    *******************************************************************************/
    this.get = function (url, async, success, error) {
        _get(url, async, success, error);
    }
    //因为需要一个内部也能调用的get方法，所以重新包装一个对外暴露的方法
    function _get(url, async, success, error) {
        var oldUrl = url;
        //超时提示
        var isCancel = false;
        var setTimeoutTimer = null;
        if (_getPageName() === 'doExam.html' && (url.indexOf('getChapterTest') > -1 || url.indexOf('getSimulationTest') > -1)) {
            setTimeoutTimer = setTimeout(function () {
                isCancel = true;
                G_Prg.confirm('数据加载失败，是否重新回到首页？', function () {
                    document.location.href = 'default.html';
                });
            }, 10000);
        }
        var xhr;
        url = ip + url;
        //兼容IE
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) { //IE6及其以下版本浏览器
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }else {
            xhr = new XMLHttpRequest();
        }
        //连接 和 发送 - 第二步
        xhr.open('GET', _addGetRandom(url), async);
        //定义接收方法
            xhr.onreadystatechange = function () {
                var readyState = xhr.readyState;
                //请求完成判断状态
                if (readyState !== 4) {
                    return;
                }
                if (setTimeoutTimer) {
                    clearTimeout(setTimeoutTimer);
                }
                //如果有loading条，则隐藏
                var loadingDiv = document.getElementById('loadingDiv');
                if (loadingDiv) {
                    loadingDiv.style.display = 'none';
                }
                //判断接收状态
                if (xhr.status >= 200 && xhr.status < 300) {
                    var _retult = xhr.responseText || xhr.responseText === "" || xhr.responseText === '' || xhr.responseText === "''" ? xhr.responseText : null;
                    success && success(_retult, xhr.status, readyState); //如果回调函数存在则执行
                } else {
                    //有错误方法则调用，否则抛出异常
                    if (error) {
                        error(xhr.status, readyState);
                    } else {
                        //401 session超时
                        if (xhr.status === 401) {
                            var oldGuid = _getCookie('GUID')
                            _autoLogin(xhr.responseText, function (guid) {
                                //替换参数里面的guid
                                alert(guid);
                                var newURL = oldUrl.replace(oldGuid, guid);
                                alert(newURL);
                                _get(newURL, async, success, error);
                            });
                        } else if (xhr.status === 403) { //403 IP被封
                            _ajaxAlert(xhr.responseText);
                            throw ('ajax请求错误！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                        } else if (xhr.status === 0) {
                            alert('ajax请求无响应！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                            throw ('ajax请求无响应！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                        } else {
                            //抛出错误
                            alert('ajax请求错误！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                            throw ('ajax请求错误！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                        }
                    }
                }
            };
        xhr.send(null);
    };

    /********************************************************************************
    函数名：post
    功能：post方式请求数据
    输入参数:url 请求的地址
    params 请求发送的参数，例：{name:'名称',age:20}
    async 是否异步执行(true：异步/false：同步)
    success 请求成功的回调函数fn(json,status,readyState){}
    error 请求失败的回调函数(可选参数)fn(status){}
    返回值：无
    创建信息：谢建沅（2014-06-24）
    修改信息：无
    修改记录：无
    *******************************************************************************/
    this.post = function (url, params, async, success, error) {
        _post(url, params, async, success, error);
    }
    //因为需要一个内部也能调用的get方法，所以重新包装一个对外暴露的方法
    function _post(url, params, async, success, error) {
        var oldUrl = url;
        var isCancel = false;
        var setTimeoutTimer = null;
        if (_getPageName() === 'doExam.html' && (url.indexOf('getChapterTest') > -1 || url.indexOf('getSimulationTest') > -1)) {
            setTimeoutTimer = setTimeout(function () {
                isCancel = true;
                G_Prg.confirm('数据加载失败，是否重新回到首页？', function () {
                    document.location.href = 'default.html';
                });
            }, 10000);
        }
        url = ip + url;
        //若data未定义，初始化
        var _params = params || {};
        var ajaxParams = _formatParams(_params);
        //兼容IE
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) { //IE6及其以下版本浏览器
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }else {
            xhr = new XMLHttpRequest();
        }
        xhr.open('POST', url, async);
        //设置表单提交时的内容类型
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); //已urlencode编码方式提交form表单
        //定义接收方法
        xhr.onreadystatechange = function () {
            var readyState = xhr.readyState;
            //请求完成判断状态
            if (readyState !== 4) {
                return;
            }
            if (setTimeoutTimer) {
                clearTimeout(setTimeoutTimer);
            }
            //如果有loading条，则隐藏
            var loadingDiv = document.getElementById('loadingDiv');
            if (loadingDiv) {
                loadingDiv.style.display = 'none';
            }
            //判断接收状态
            if (xhr.status >= 200 && xhr.status < 300) {
                var _retult = xhr.responseText || xhr.responseText === "" || xhr.responseText === '' || xhr.responseText === "''" ? xhr.responseText : null;
                success && success(_retult, xhr.status, readyState); //如果回调函数存在则执行
            } else {
                //有错误方法则调用，否则抛出异常
                if (error) {
                    error(xhr.status, readyState);
                } else {
                    //401 session超时
                    if (xhr.status === 401) {
                        _autoLogin(xhr.responseText, function (guid) {
                            //更新参数里的guid
                            if (params.guid) {
                                params.guid = guid;
                            }
                            _post(oldUrl, params, async, success, error);
                        });
                    } else if (xhr.status === 403) { //403 IP被封
                        _ajaxAlert(xhr.responseText);
                        throw ('ajax请求错误！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                    } else if (xhr.status === 0) {
                        alert('ajax请求无响应！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                        throw ('ajax请求无响应！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                    } else {
                        //抛出错误
                        alert('ajax请求错误！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                        throw ('ajax请求错误！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
                    }
                }
            }
        };
        xhr.send(ajaxParams);
    };

    /********************************************************************************
    函数名：jsonp
    功能：jsonp跨域方式请求数据
    输入参数:url 请求的地址
    params 请求发送的参数，例：{name:'名称',age:20}
    success 请求成功的回调函数fn(json){}
    返回值：无
    创建信息：谢建沅（2014-06-24）
    修改信息：无
    修改记录：无
    *******************************************************************************/
    this.jsonp = function (url, params, success, error) {
        url = ip + url;
        //若data未定义，初始化
        var _params = params || {};
        //创建 script 标签并加入到页面中
        var callbackName = 'jsonp';
        var htmlHead = document.getElementsByTagName('head')[0];
        _params['callback'] = callbackName;
        var jsonpParams = _formatParams(_params);
        var htmlScript = document.createElement('script');
        htmlHead.appendChild(htmlScript);
        //创建jsonp回调函数
        window[callbackName] = function (json) {
            htmlHead.removeChild(htmlScript);
            clearTimeout(htmlScript.timer);
            window[callbackName] = null;
            success && success(json); //如果回调函数存在则执行
        };
        //设置URL
        if (url.indexOf('?') > -1) {
            htmlScript.src = url + '&' + jsonpParams;
        } else {
            htmlScript.src = url + '?' + jsonpParams;
        }
        //超时处理
        htmlScript.timer = setTimeout(function () {
            window[callbackName] = null;
            htmlHead.removeChild(htmlScript);
            //有错误方法则调用，否则抛出异常
            if (error) {
                error('jsonp请求超时', url);
            } else {
                //抛出错误
                alert('jsonp请求超时:' + url);
                throw ('jsonp请求超时:' + url);
            }
        }, 5000);
    };
    /********************************************************************************
    函数名：asyncPost
    功能：post异步请求数据（允许数据丢失）
    输入参数:url 请求的地址
    params 请求发送的参数，例：{name:'名称',age:20}
    success 请求成功的回调函数 
    error请求失败的回调函数 
    async 同步或异步（这个参数是没有意义的，不管这个参数的值是什么都是异步调用，可是鉴于之前的ajax调用都有这个参数，为了避免修改太多的地方，保留这个参数）
    返回值：无
    创建信息：韦友爱（2014-12-12）
    修改信息：无
    修改记录：无
    *******************************************************************************/
    this.asyncPost = function (url, params, async, success, error) {
    	_asyncPost(url, params, success, error);

     };
     /********************************************************************************
     函数名：_asyncPost
     功能：post异步请求数据的内部函数（允许数据丢失）
     输入参数:url 请求的地址
     params 请求发送的参数，例：{name:'名称',age:20}
     success 请求成功的回调函数 error请求失败的回调函数
     返回值：无
     创建信息：韦友爱（2014-12-12）
     修改信息：无
     修改记录：无
     *******************************************************************************/
    function _asyncPost(url, params, success, error) {
    	var oldUrl = url;
    	var isCancel = false;
    	var setTimeoutTimer = null;
    	if (_getPageName() === 'doExam.html' && (url.indexOf('getChapterTest') > -1 || url.indexOf('getSimulationTest') > -1)) {
    		setTimeoutTimer = setTimeout(function () {
    				isCancel = true;
    				G_Prg.confirm('数据加载失败，是否重新回到首页？', function () {
    					document.location.href = 'default.html';
    				});
    			}, 10000);
    	}
    	url = ip + url;
    	//若data未定义，初始化
    	var _params = params || {};
    	var ajaxParams = _formatParams(_params);
    	//兼容IE
    	var xhr;
    	if (window.XMLHttpRequest) {
    		xhr = new XMLHttpRequest();
    	} else if (window.ActiveXObject) { //IE6及其以下版本浏览器
    		xhr = new ActiveXObject('Microsoft.XMLHTTP');
    	} else {
    		xhr = new XMLHttpRequest();
    	}
    	xhr.open('POST', url, true); //异步请求
    	//设置表单提交时的内容类型
    	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); //已urlencode编码方式提交form表单
    	//定义接收方法
    	xhr.onreadystatechange = function () {
    		var readyState = xhr.readyState;
    		//请求完成判断状态
    		if (readyState !== 4) {
    			return;
    		}
    		if (setTimeoutTimer) {
    			clearTimeout(setTimeoutTimer);
    		}
    		//如果有loading条，则隐藏
    		var loadingDiv = document.getElementById('loadingDiv');
    		if (loadingDiv) {
    			loadingDiv.style.display = 'none';
    		}
    		//判断接收状态
    		if (xhr.status >= 200 && xhr.status < 300) {
    			var _retult = xhr.responseText || xhr.responseText === "" || xhr.responseText === '' || xhr.responseText === "''" ? xhr.responseText : null;
    			success && success(_retult, xhr.status, readyState); //如果回调函数存在则执行
    		} else {
    			//有错误方法则调用，否则抛出异常
    			if (error) {
    				error(xhre.status, readyState);
    			} else {
    				//401 session超时
    				if (xhr.status === 401) {
    					_autoLogin(xhr.responseText, function (guid) {
    						//更新参数里的guid
    						if (params.guid) {
    							params.guid = guid;
    						}
    						_asyncPost(oldUrl, params, success, error);
    					});
    				} else if (xhr.status === 403) { //403 IP被封
    					_ajaxAlert(xhr.responseText);
    					throw('ajax请求错误！url:' + url + ',status:' + xhr.status + ',readyState:' + readyState);
    				} else {
    					return;
    				}
    			}
    		}//end else
    	};//end onreadystatechange()
    	xhr.send(ajaxParams);
 };
 /********************************************************************************
 函数名：actionPost
 功能：actionpost方式请求数据
 输入参数:url 请求的地址
 params 请求发送的参数，例：{name:'名称',age:20}
 async 是否异步执行(true：异步/false：同步)
 success 请求成功的回调函数fn(json,status,readyState){}
 error 请求失败的回调函数(可选参数)fn(status){}
 返回值：无
 创建信息：易成（2015-04-14）
 修改信息：提交不返回的方法，去掉抛错代码
 修改记录：无
 *******************************************************************************/
 this.actionPost = function (url, params, async, success, error) {
     _actionPost(url, params, async, success, error);
 }
 //需要一个提交不返回的方法，所以重新封装一个
 function _actionPost(url, params, async, success, error) {
     url = ip + url;
     //若data未定义，初始化
     var _params = params || {};
     var ajaxParams = _formatParams(_params);
     //兼容IE
     var xhr;
     if (window.XMLHttpRequest) {
         xhr = new XMLHttpRequest();
     } else if (window.ActiveXObject) { //IE6及其以下版本浏览器
         xhr = new ActiveXObject('Microsoft.XMLHTTP');
     } else {
         xhr = new XMLHttpRequest();
     }
     xhr.open('POST', url, async);
     //设置提交时的内容类型
     xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); //已urlencode编码方式提交form表单
     //定义接收方法
     xhr.onreadystatechange = function () {
         var readyState = xhr.readyState;
         //请求完成判断状态
         if (readyState !== 4) {
             return;
         }
         //如果有loading条，则隐藏
         var loadingDiv = document.getElementById('loadingDiv');
         if (loadingDiv) {
             loadingDiv.style.display = 'none';
         }
         //判断接收状态
         if (xhr.status >= 200 && xhr.status < 300) {
             var _retult = xhr.responseText || xhr.responseText === "" || xhr.responseText === '' || xhr.responseText === "''" ? xhr.responseText : null;
             success && success(_retult, xhr.status, readyState); //如果回调函数存在则执行
         }
     };
     xhr.send(ajaxParams);
 };

}
