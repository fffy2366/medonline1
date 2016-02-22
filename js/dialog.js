var G_DialogBox = new yingsoftDialog('nr', 0);
var G_DialogTextarea = new yingsoftDialog('tb', 1);
var G_DialogContent = new yingsoftDialog('hc', 2);
var G_DialogPop = new yingsoftDialog('pop', 3);

function yingsoftDialog(name, type) {
    var name = name || '';
    var type = type || 0; //0:alert 1:textarea 2:htmlContent
    //是否为ie浏览器
    var IsIE = !!document.all;
    //ie浏览器版本
    var IEVersion = (function () { if (!IsIE) return -1; try { return parseFloat(/msie ([\d\.]+)/i.exec(navigator.userAgent)[1]); } catch (e) { return -1; } })();
    //按id获取对象
    var $ = function (Id, isFrame) { var o; if ("string" == typeof (Id)) o = document.getElementById(Id); else if ("object" == typeof (Id)) o = Id; else return null; return isFrame ? (IsIE ? frames[Id] : o.contentWindow) : o; }
    //按标签名称获取对象
    //页面的高和宽******************************
    var isStrict = document.compatMode == "CSS1Compat";
    var BodyScale = { x: 0, y: 0, tx: 0, ty: 0 }; //（x，y）：当前的浏览器容器大小  （tx，ty）：总的页面滚动宽度和高度
    var getClientHeight = function () { /*if(IsIE)*/return isStrict ? document.documentElement.clientHeight : document.body.clientHeight; /*else return self.innerHeight;*/ }
    var getScrollHeight = function () { var h = !isStrict ? document.body.scrollHeight : document.documentElement.scrollHeight; return Math.max(h, getClientHeight()); }
    var getHeight = function (full) { return full ? getScrollHeight() : getClientHeight(); }
    var getClientWidth = function () { /*if(IsIE)*/return isStrict ? document.documentElement.clientWidth : document.body.clientWidth; /*else return self.innerWidth;*/ }
    var getScrollWidth = function () { var w = !isStrict ? document.body.scrollWidth : document.documentElement.scrollWidth; return Math.max(w, getClientWidth()); }
    var getWidth = function (full) { return full ? getScrollWidth() : getClientWidth(); }
    var initBodyScale = function () { BodyScale.x = getWidth(false); BodyScale.y = getHeight(false); BodyScale.tx = getWidth(true); BodyScale.ty = getHeight(true); }
    //页面的高和宽******************************
    // Msg ======================================================================================================================================
    var INFO = 'info';
    var ERROR = 'error';
    var WARNING = 'warning';
    var IsInit = false;
    var timer = null;
    var dvTitle = null;
    var dvCT = null;
    var dvBottom = null;
    var dvBtns = null;
    var lightBox = null;
    var dvMsgBox = null;
    var defaultWidth = '300px';
    var moveProcessbar = function () {
        var o = $(name + 'dvProcessbar'), w = o.style.width;
        if (w == '') w = 20;
        else {
            w = parseInt(w) + 20;
            if (w > 100) w = 0;
        }
        o.style.width = w + '%';
    }
    var InitMsg = function (width) {
        //ie下不按照添加事件的循序来执行，所以要注意在调用alert等方法时要检测是否已经初始化IsInit=true
        var ifStr = '<iframe src="javascript:false" mce_src="javascript:false" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%; z-index:-1;'
                + 'filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';"></iframe>',
            html = '<div class="dialogTop"><div class="dialogRight"><div class="dialogTitle" id="' + name + 'dvMsgTitle"></div></div></div>' +
                '<div class="dialogBody"><div class="dialogRight"><div class="dialogCt" id="' + name + 'dvMsgCT"></div></div></div>' +
                '<div class="dialogBottom" id="' + name + 'dvMsgBottom"><div class="dialogRight"><div class="dvMsgBtns" id="' + name + 'dvMsgBtns"></div></div></div>';
        dvMsgBox = document.createElement("div");
        dvMsgBox.id = name + "dvMsgBox";
        dvMsgBox.className = 'dvMsgBox';
        dvMsgBox.innerHTML += html;
        document.body.appendChild(dvMsgBox);
        lightBox = document.createElement("div");
        lightBox.id = name + "ShowBolightBox";
        lightBox.className = 'ShowBolightBox';
        document.body.appendChild(lightBox);
        if (IsIE && IEVersion < 7) {//加iframe层修正ie6下无法遮盖住select的问题
            lightBox.innerHTML += ifStr;
            dvMsgBox.innerHTML += ifStr;
        }
        dvBottom = $(name + 'dvMsgBottom');
        dvBtns = $(name + 'dvMsgBtns');
        dvCT = $(name + 'dvMsgCT');
        dvTitle = $(name + 'dvMsgTitle');
        IsInit = true;
    }

    var InitPop = function (width) {
        //ie下不按照添加事件的循序来执行，所以要注意在调用alert等方法时要检测是否已经初始化IsInit=true
        var ifStr = '<iframe src="javascript:false" mce_src="javascript:false" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%; z-index:-1;'
                + 'filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';"></iframe>',
        dvMsgBox = document.createElement("div");
        dvMsgBox.id = name + "dvMsgBox";
        dvMsgBox.className = 'dvMsgBoxPop';
        //        dvMsgBox.innerHTML += html;
        document.body.appendChild(dvMsgBox);
        lightBox = document.createElement("div");
        lightBox.id = name + "ShowBolightBox";
        lightBox.className = 'ShowBolightBox';
        document.body.appendChild(lightBox);
        if (IsIE && IEVersion < 7) {//加iframe层修正ie6下无法遮盖住select的问题
            lightBox.innerHTML += ifStr;
            dvMsgBox.innerHTML += ifStr;
        }
        IsInit = true;
    }

    var InitHtmlContent = function (width) {
        //ie下不按照添加事件的循序来执行，所以要注意在调用alert等方法时要检测是否已经初始化IsInit=true
        var ifStr = '<iframe src="javascript:false" mce_src="javascript:false" style="position:absolute; visibility:inherit; top:0px;left:0px;width:100%; height:100%; z-index:-1;'
                + 'filter=\'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)\';"></iframe>',

            html = '<div id="' + name + 'dvMsgBackBtn" style="position:absolute;top:0px;left:0px;font-size:18px;color:#FFF;cursor:pointer;display:none;"><img style="margin-top: 4px;" src="../images/back.png" height="30px" width="30px"><div id="' + name + 'dvMsgBackText" style="float:right;margin-top:7px;line-height:25px;">返回</div></div>' +
                '<div id="' + name + 'dvMsgClose" style="position:absolute;top:0px;right:0px;font-size:14px;color:#FFF;padding-top:9px;padding-right:9px;cursor:pointer;" ><img src="../images/closePage.png" width="16px" height="16px"/></div>' +
                '<div class="dialogTop"><div class="dialogRight"><div class="dialogTitle2" id="' + name + 'dvMsgTitle"></div></div></div>' +
                '<div id="' + name + 'dialogBody" style="margin-top:30px;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;padding-bottom:10px;"></div>';

        dvMsgBox = document.createElement("div");
        dvMsgBox.id = name + "dvMsgBox";
        dvMsgBox.className = 'dvMsgBox';
        dvMsgBox.innerHTML += html;
        document.body.appendChild(dvMsgBox);
        lightBox = document.createElement("div");
        lightBox.id = name + "ShowBolightBox";
        lightBox.className = 'ShowBolightBox';
        document.body.appendChild(lightBox);
        if (IsIE && IEVersion < 7) {//加iframe层修正ie6下无法遮盖住select的问题
            lightBox.innerHTML += ifStr;
            dvMsgBox.innerHTML += ifStr;
        }
        dvBottom = $(name + 'dvMsgBottom');
        dvBtns = $(name + 'dvMsgBtns');
        dvCT = $(name + 'dvMsgCT');
        dvTitle = $(name + 'dvMsgTitle');
        IsInit = true;
    }
    var checkDOMLast = function () {//此方法非常关键，要不无法显示弹出窗口。两个对象dvMsgBox和lightBox必须处在body的最后两个节点内
        if (document.body.lastChild != lightBox) {
            document.body.appendChild(dvMsgBox);
            document.body.appendChild(lightBox);
        }
    }
    var createBtn = function (p, v, fn) {
        var btn = document.createElement("input");
        btn.type = "button";
        btn.className = 'btnDialog';
        btn.value = v;
        btn.onmouseover = function () { btn.className = 'btnDialogFocus'; }
        btn.onmouseout = function () { btn.className = 'btnDialog'; }
        btn.onclick = function () {
            hide();
            removeHtmlContentCover();
            if (fn) {
                if (type == 1) {
                    //var kk='   '; var _regerBr=new RegExp(' ','gm'); console.log(kk.replace(_regerBr,'').length);
                    var _txt = document.getElementById('dialogTxtArea').value;
                    var _regerSp = new RegExp(' ', 'gm');
                    var resTxt = _txt.replace(_regerSp, '');
                    if (resTxt.length === 0) {
                        _txt = '';
                    }
                    fn(p, _txt.replace(/<[^>].*?>/g, ''));
                } else {
                    fn(p);
                }
            }
        }
        return btn;
    }
    this.alert = function (msg) {
        checkHtmlContent();
        this.show({ buttons: { yes: '确认' }, width: '300px', msg: msg, title: '温馨提示' });
    }
    this.showNotice = function (msg) {
        checkHtmlContent();
        this.show({ buttons: { yes: '知道了' }, width: '300px', msg: '<div style="text-align:left;text-indent:2em;">' + msg + '</div>', title: '增加切换通道通知' });
    }
    this.confirm = function (msg, fn) {
        checkHtmlContent();
        //fn为回调函数，参数和show方法的一致
        this.show({ buttons: { yes: '确认', no: '取消' }, width: '300px', msg: msg, title: '温馨提示', fn: fn });
    }
    //弹出带文本域的窗口
    this.textarea = function (msg, fn) {
        checkHtmlContent();
        this.show({ buttons: { yes: '保存', no: '取消' }, isTextarea: true, width: '94%', text: msg,
            msg: '<textarea id="dialogTxtArea" style="border-radius:0px;width:99%;height:100px;font-size:20px;resize: none; border:1px solid #4093DA;padding-left:5px;" rows="5" maxlength="100"></textarea>',
            title: '编辑笔记', fn: fn
        });
    }
    //弹出密码修改框
    this.pwdTextBox = function (msg, fn) {
        checkHtmlContent();
        this.show({ buttons: { yes: '修改', no: '取消' }, isTextarea: true, width: '300px', text: msg,
            //msg: '<textarea id="dialogTxtArea" style="border-radius:0px;width:99%;height:100px;font-size:20px;resize: none; border:1px solid #4093DA;" rows="5"></textarea>',
            msg: '<input id="dialogTxtArea" style="border-radius:0px;width:99%;height:30px;font-size:20px;resize: none; border:1px solid #4093DA;" />',
            title: '修改密码', fn: fn
        });
    }
    //可以内嵌html的容器
    this.htmlContent = function (width, height, title, html, isInnerHtml, fn) {
        this.show({ isHtmlContent: true, msg: html, width: width, height: height, title: title, fn: fn, isInnerHtml: isInnerHtml });
        document.getElementById(name + 'dvMsgBackText').innerHTML = '返回';
    }

    //气泡弹出框
    this.popMsg = function (msg, isShowExamTime, editFn, closeFn) {
        checkHtmlContent();
        this.popShow({ width: '260px', msg: msg, isShowExamTime: isShowExamTime, editFn: editFn, closeFn: closeFn });
    }

    this.dispose = function () {
        var _ShowBolightBox = document.getElementById(name + 'ShowBolightBox');
        var _dvMsgBox = document.getElementById(name + 'dvMsgBox');
        if (_ShowBolightBox) {
            document.body.removeChild(_ShowBolightBox);
        }
        if (_dvMsgBox) {
            document.body.removeChild(_dvMsgBox);
        }
        if (timer) { clearInterval(timer); timer = null; }
        if (IsIE) window.detachEvent('onresize', onResize);
        else window.removeEventListener('resize', onResize, false);
    }
    var prompt = function (labelWord, defaultValue, txtId, fn) {
        if (!labelWord) labelWord = '请输入：';
        if (!defaultValue) defaultValue = "";
        if (!txtId) txtId = "msg_txtInput";
        this.show({ title: '输入提示', msg: labelWord + '<input type="text" id="' + name + txtId + '" style="width:200px" value="' + defaultValue + '"/>', buttons: { yes: '确认', no: '取消' }, fn: fn });
    }
    var wait = function (msg, title) {
        if (!msg) msg = '正在处理..';
        this.show({ title: title, msg: msg, wait: true });
    }

    var popTimer = null;
    this.popShow = function (cfg) {
        //如果之前没移除，先移除
        if (popTimer) {
            clearTimeout(popTimer);
        }
        var _beforeDvMsgBox = document.getElementById(name + 'dvMsgBox');
        var _beforeLightBox = document.getElementById(name + 'ShowBolightBox');
        if (_beforeLightBox) {
            document.body.removeChild(_beforeLightBox);
        }
        if (_beforeDvMsgBox) {
            document.body.removeChild(_beforeDvMsgBox);
        }
        //cfg:{title:'',msg:'',wait:true,icon:'默认为信息',buttons:{yes:'',no:''},fn:function(btn){回调函数,btn为点击的按钮，可以为yes，no},width:显示层的宽}
        //如果是等待则wait后面的配置不需要了。。
        if (!cfg) throw ("没有指定配置文件！");
        //添加窗体大小改变监听
        if (IsIE) window.attachEvent("onresize", onResize);
        else window.addEventListener("resize", onResize, false);
        //单独处理htmlContent
        if (!IsInit) {
            InitPop(); //初始化dom对象
        } else {
            checkDOMLast(); //检查是否在最后
        }
        //dvMsgBox.id = name + "dvMsgBox";
        dvMsgBox = document.getElementById(name + 'dvMsgBox');
        if (cfg.isShowExamTime) {
            dvMsgBox.innerHTML = '<div id="popMsgContent" style="width: 100%;font-size: 16px;text-align: center;margin-top: 10px;margin-bottom: 10px;">' + cfg.msg + '</div><div style="width: 100%; text-align:center;"><input id="popDialogBtn" type="button" value="修改时间" class="popDialogBtn" /><div>'
        } else {
            
            dvMsgBox.innerHTML = '<div style="width:100%;background-color:#fff;"><div id="popMsgContent" style="width: 100%; overflow:auto;">' + cfg.msg + '</div><div style="width: 100%; text-align:center;"><input id="popDialogBtn" type="button" value="开始答题" class="popDialogBtn" /><div></div>'
            
        }

        //检查是否要指定宽，默认为300
        if (cfg.width) {
            dvMsgBox.style.width = cfg.width;
        } else {
            dvMsgBox.style.width = defaultWidth;
        }
        //高
        if (cfg.height) {
            dvMsgBox.style.height = cfg.height;
        }
        //可以直接使用show方法停止为进度条的窗口
        if (timer) { clearInterval(timer); timer = null; }

        initBodyScale();
        //绑定背景层点击事件
        lightBox.onclick = function () {
            popDispose();
            clearTimeout(popTimer);
            if (cfg.editFn) {
                cfg.closeFn();
            }
        }

        dvMsgBox.onclick = function () {
            popDispose();
            clearTimeout(popTimer);
            if (cfg.editFn) {
                cfg.closeFn();
            }
        }

        document.getElementById('popDialogBtn').onclick = function (event) {
            if (cfg.editFn) {
                //阻止冒泡
                event = event ? event : window.event;
                event.stopPropagation();
                popDispose();
                cfg.editFn();
            }
        }

        dvMsgBox.style.display = 'block';
        lightBox.style.display = 'block';
        onResize(false);
        popTimer = setTimeout(function () {
            popDispose();
            if (cfg.editFn) {
                cfg.closeFn();
            }
        }, 30000);

        function popDispose() {
            var _ShowBolightBox = document.getElementById(name + 'ShowBolightBox');
            var _dvMsgBox = document.getElementById(name + 'dvMsgBox');
            if (_ShowBolightBox) {
                document.body.removeChild(_ShowBolightBox);
            }
            if (_dvMsgBox) {
                document.body.removeChild(_dvMsgBox);
            }
            if (timer) { clearInterval(timer); timer = null; }
            if (IsIE) window.detachEvent('onresize', onResize);
            else window.removeEventListener('resize', onResize, false);
        }

        //检测高度是否超过浏览器 document.getElementById('popdvMsgBox').clientHeight
        if (dvMsgBox.clientHeight > window.document.body.clientHeight) {
            console.log(dvMsgBox.clientHeight + '>' + window.document.body.clientHeight);
            //dvMsgBox.style.height = (window.document.body.clientHeight-50)+'px';
            var popContent_ = document.getElementById('popMsgContent');
            popContent_.style.height = (window.document.body.clientHeight - 85) + 'px';
            popContent_.style.overflow = 'auto';
        }

    }

    this.show = function (cfg) {
        //cfg:{title:'',msg:'',wait:true,icon:'默认为信息',buttons:{yes:'',no:''},fn:function(btn){回调函数,btn为点击的按钮，可以为yes，no},width:显示层的宽}
        //如果是等待则wait后面的配置不需要了。。
        if (!cfg) throw ("没有指定配置文件！");
        //添加窗体大小改变监听
        if (IsIE) window.attachEvent("onresize", onResize);
        else window.addEventListener("resize", onResize, false);

        //单独处理htmlContent
        if (!IsInit && cfg.isHtmlContent) {
            InitHtmlContent();
        } else if (!IsInit && !cfg.isHtmlContent) {
            InitMsg(); //初始化dom对象
        } else {
            checkDOMLast(); //检查是否在最后
        }

        //检查是否要指定宽，默认为300
        if (cfg.width) {
            dvMsgBox.style.width = cfg.width;
        } else {
            dvMsgBox.style.width = defaultWidth;
        }

        //高
        if (cfg.height) {
            dvMsgBox.style.height = cfg.height;
        }
        //可以直接使用show方法停止为进度条的窗口
        if (timer) { clearInterval(timer); timer = null; }
        dvTitle.innerHTML = '';
        if (cfg.title) dvTitle.innerHTML = cfg.title;

        if (cfg.isHtmlContent) {
            document.getElementById(name + 'dialogBody').innerHTML = '';
            if (cfg.isInnerHtml) {
                document.getElementById(name + 'dialogBody').innerHTML = cfg.msg;
            } else {
                document.getElementById(name + 'dialogBody').appendChild(cfg.msg);
            }

        } else {
            dvCT.innerHTML = '';
            if (cfg.wait) {
                if (cfg.msg) dvCT.innerHTML = cfg.msg;
                dvCT.innerHTML += '<div class="pro"><div class="bg" id="' + name + 'dvProcessbar"></div></div>';
                dvBtns.innerHTML = '';
                dvBottom.style.height = '10px';
                timer = setInterval(function () { moveProcessbar(); }, 1000);
            }
            else {
                //if(!cfg.icon)cfg.icon=Msg.INFO;
                if (!cfg.isHtmlContent) {
                    if (!cfg.buttons || (!cfg.buttons.yes && !cfg.buttons.no)) {
                        cfg.buttons = { yes: '确定' };
                    }
                }
                if (cfg.icon) dvCT.innerHTML = '<div class="dialogIcon' + cfg.icon + '"></div>';
                if (cfg.msg) dvCT.innerHTML += cfg.msg + '<div class="dialogClear"></div>';
                dvBottom.style.height = '80px';
                dvBtns.innerHTML = '<div class="dialogHeight"></div>';
                if (cfg.buttons && cfg.buttons.yes) {
                    dvBtns.appendChild(createBtn('yes', cfg.buttons.yes, cfg.fn));
                    if (cfg.buttons.no) dvBtns.appendChild(document.createTextNode('　'));
                }
                if (cfg.buttons && cfg.buttons.no) dvBtns.appendChild(createBtn('no', cfg.buttons.no, cfg.fn));
            }
        }

        initBodyScale();
        if (cfg.isTextarea) {
            document.getElementById('dialogTxtArea').value = cfg.text;
        }
        if (cfg.isHtmlContent) {
            var _close = document.getElementById(name + 'dvMsgClose');
            var _back = document.getElementById(name + 'dvMsgBackBtn');
            _close.onclick = function () { _closeDialog(); }
            _back.onclick = function () { _closeDialog(); }

            function _closeDialog() {
                document.body.removeChild(dvMsgBox);
                document.body.removeChild(lightBox);
                if (timer) { clearInterval(timer); timer = null; }
                if (IsIE) window.detachEvent('onresize', onResize);
                else window.removeEventListener('resize', onResize, false);
                IsInit = false;
                if (cfg.fn) { cfg.fn(); }
                document.body.style.overflow = 'auto';
                removeHtmlContentCover();
            }
        }

        dvMsgBox.style.display = 'block';
        lightBox.style.display = 'block';

        if (type === 2) {
            setTimeout(function () {
                var cardPY = document.getElementById('cardPY');
                if (cardPY) {
                    document.getElementById(name + 'dialogBody').style.height = (document.getElementById(name + 'dvMsgBox').clientHeight - 15 - cardPY.clientHeight + 5) + 'px';
                } else {
                    document.getElementById(name + 'dialogBody').style.height = (document.getElementById(name + 'dvMsgBox').clientHeight - 15) + 'px';
                }
            }, 0);
        }

        document.getElementById(name + "dvMsgBox").onclick = function (event) {
            event = event ? event : window.event;
            event.stopPropagation();
        }

        onResize(false);
    }
    var hide = function () {
        dvMsgBox.style.display = 'none';
        lightBox.style.display = 'none';
        if (timer) { clearInterval(timer); timer = null; }
        if (IsIE) window.detachEvent('onresize', onResize);
        else window.removeEventListener('resize', onResize, false);
    }

    var lightBoxClick = function (event) {
        event = event ? event : window.event;
        event.stopPropagation();
    }

    var checkHtmlContent = function () {
        var htmlContentDIV = document.getElementById('hcdvMsgBox');
        if (htmlContentDIV) {
            //遮罩
            var hcCover = document.createElement('div');
            hcCover.id = 'tempHtmlContentCover';
            hcCover.style.position = 'fixed';
            hcCover.style.top = htmlContentDIV.style.top;
            hcCover.style.left = htmlContentDIV.style.left;
            hcCover.style.width = (htmlContentDIV.clientWidth + 2) + 'px';
            hcCover.style.height = (htmlContentDIV.clientHeight + 2) + 'px';
            hcCover.style.backgroundColor = '#000000';
            hcCover.style.opacity = 0.4;
            htmlContentDIV.appendChild(hcCover);
        }
    }

    var removeHtmlContentCover = function () {
        //var htmlContentDIV = document.getElementById('hcdvMsgBox');
        var htmlContentCover = document.getElementById('tempHtmlContentCover');
        if (htmlContentCover) {
            var father = htmlContentCover.parentNode;
            father.removeChild(htmlContentCover);
        }
    }

    var onResize = function (isResize) {
        if (isResize) initBodyScale();
        lightBox.style.width = BodyScale.tx + 'px';
        lightBox.style.height = BodyScale.ty + 'px';
        var mathTop = Math.floor((BodyScale.y - dvMsgBox.offsetHeight) / 2);
        var mathLeft = Math.floor((BodyScale.x - dvMsgBox.offsetWidth) / 2);

        dvMsgBox.style.top = mathTop >= 0 ? mathTop + 'px' : '0px';
        dvMsgBox.style.left = mathLeft >= 0 ? mathLeft + 'px' : '0px';
        if (type === 2) {
            var cardPY = document.getElementById('cardPY');
            if (cardPY) {
                document.getElementById(name + 'dialogBody').style.height = (document.getElementById(name + 'dvMsgBox').clientHeight - 15 - cardPY.clientHeight + 5) + 'px';
            } else {
                document.getElementById(name + 'dialogBody').style.height = (document.getElementById(name + 'dvMsgBox').clientHeight - 15) + 'px';
            }
        }
    }
}
