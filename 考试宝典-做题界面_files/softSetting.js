/********************************************************************************
*实现软件设置功能，将设置的相关参数保存到Cookie中
*******************************************************************************/
function initWindow() {
    G_UserAction.loadObject();
    getUserSetting();
    _initSoftSetting();
    var fontSize = G_Cookie.getFontSize() || '20px';
    document.body.style.fontSize = fontSize;
    /********************************************************************************
    函数名：_initSoftSetting
    功能：初始化软件设置选项
    输入参数:无
    返回值：无
    创建信息：韦友爱（2014-07-20）
    修改记录：无
    审查人：无
    ********************************************************************************/
    function _initSoftSetting() {
        if (G_Cookie.getNightMode()) {
            setBgColor('night');
        } else { 
            setBgColor('day');
        }
		if(G_Cookie.getOnMedia()){
			setMediaPlay('on');
		}else{
			setMediaPlay('off');
		}
        G_Prg.$('minusSize').onclick = function () {
            G_UserAction.addUserAction('setFontBtn2');
            minusSizeClick(); 
        };
        G_Prg.$('addSize').onclick = function () {
            G_UserAction.addUserAction('setFontBtn2');
            addSizeClick(); 
        };
        G_Prg.$('dayMode').onclick = function () {
            G_UserAction.addUserAction('setDayNightBtn2');
            setBgColor('day'); 
        }; //设置白天模式
        G_Prg.$('nightMode').onclick = function () {
            G_UserAction.addUserAction('setDayNightBtn2');
            setBgColor('night'); 
         }; //设置夜间模式
        G_Prg.$('back').onclick = function () {
            G_UserAction.addUserAction('backFromSettingBtn');
            _backClick(); 
         }; //设置返回按钮事件
		G_Prg.$('onMedia').onclick = function () {
			var mode = '';
			if (G_Cookie.getNightMode()) {
				mode='night';
			} else { 
				mode='day';
			}
			G_Prg.$('offMedia').style.background = '';
            G_Prg.$('onMedia').style.background = '#51A6EE';
			G_Cookie.setOnMedia('on');
			G_Cookie.removeOffMedia();
			setUserSetting(G_Cookie.getFontSize(),mode,1);
		}; //设置音效开模式
		G_Prg.$('offMedia').onclick = function () {
			var mode = '';
			if (G_Cookie.getNightMode()) {
				mode='night';
			} else { 
				mode='day';
			}
			G_Prg.$('onMedia').style.background = '';
            G_Prg.$('offMedia').style.background = '#51A6EE';
			G_Cookie.setOffMedia('off');
			G_Cookie.removeOnMedia();
			setUserSetting(G_Cookie.getFontSize(),mode,0);
		}; //设置音效关模式
    }
    /********************************************************************************
    函数名：_backClick
    功能：设置点击返回的图片按钮单击事件
    输入参数:无
    返回值：无
    创建信息：黎萍（2014-07-02）
    修改记录：谢建沅（2014-07-09）添加试题界面返回判断
    审查人：无
    ********************************************************************************/
    function _backClick() {
        window.location.href = 'default.html?fromUrl=softSettings.html';
    }
}
/********************************************************************************
函数名：minusSizeClick
功能：A-点击事件
输入参数:无
返回值：无
创建信息：韦友爱（2014-07-20）
修改记录：韦友爱（2014-07-24）将size判断该成用>=判读
审查人：无
********************************************************************************/
function minusSizeClick() {
    var fontSize = G_Cookie.getFontSize() || '20px';
    var size = Number(fontSize.replace('px', ''));
    var range = 3;
    if (size <= 14) {
        G_Prg.alert('已经是最小字体了！');
        return;
    }
    size = size - range;
    fontSize = size + 'px';
    G_Cookie.setFontSize(fontSize);
    document.body.style.fontSize = fontSize;
    var mode='';
    var bgColor='1';
    if (G_Cookie.getNightMode()) {
        mode='night';
    } else { 
        mode='day';
    }
	var media = 0;
	if (G_Cookie.getOnMedia()) {
		media = 1 ;
	}
    setUserSetting(fontSize,mode,media);
}
/********************************************************************************
函数名：addSizeClick
功能：A+点击事件
输入参数:无
返回值：无
创建信息：韦友爱（2014-07-20）
修改记录：韦友爱（2014-07-24）将size判断该成用>=判读
审查人：无
********************************************************************************/
function addSizeClick() {
    var fontSize = G_Cookie.getFontSize() || '20px';
    var size = Number(fontSize.replace('px', ''));
    var range = 3;
    if (size >= 35) {
        G_Prg.alert('已经是最大字体了！');
        return;
    }
    size = size + range;
    fontSize = size + 'px';
    G_Cookie.setFontSize(fontSize);
    document.body.style.fontSize = fontSize;
    var mode='';
    var bgColor='1';
    if (G_Cookie.getNightMode()) {
        mode='night';
    } else { 
        mode='day';
    }
	var media = 0;
	if (G_Cookie.getOnMedia()) {
		media = 1 ;
	}
    setUserSetting(fontSize,mode,media);
}
/********************************************************************************
函数名：setBgColor
功能：网站背景颜色的切换，即实现白天/夜间模式的切换
输入参数:flag 背景色的模式，取值有：白天、夜间
返回值：无
创建信息：黎萍（2014-07-02）
修改记录：韦友爱（2014-07-16）添加dayMode、nightMode背景颜色设置
审查人：无
********************************************************************************/
function setBgColor(flag) {
    if (!document.body) {
        return;
    }
	var media = 0;
	if (G_Cookie.getOnMedia()) {
		media = 1 ;
	}
    switch (flag) {
        case 'night':
            G_Prg.$('day').src = '../images/setting06.png';
            G_Prg.$('night').src = '../images/setting07.png';
            G_Prg.$('dayMode').style.background = '';
            G_Prg.$('nightMode').style.background = '#51A6EE';
            document.body.style.backgroundColor = '#152d35'; //夜间模式
            document.body.style.color = '#666';
            G_Cookie.setNightMode('#152d35');
            G_Cookie.setNFontColor('#666');
            G_Cookie.removeDayMode();
            G_Cookie.removeDFontColor();
            setUserSetting(G_Cookie.getFontSize(),flag,media);
            break;
        case 'day':
            G_Prg.$('day').src = '../images/setting04.png';
            G_Prg.$('night').src = '../images/setting05.png';
            G_Prg.$('nightMode').style.background = '';
            G_Prg.$('dayMode').style.background = '#51A6EE';
            document.body.style.backgroundColor = '#FFF'; //白天模式
            document.body.style.color = '#000';
            G_Cookie.setDayMode('#FFF');
            G_Cookie.setDFontColor('#000');
            G_Cookie.removeNightMode();
            G_Cookie.removeNFontColor();
            setUserSetting(G_Cookie.getFontSize(),flag,media);
            break;
        default:
            break;
    }
}
/********************************************************************************
函数名：setMediaPlay
功能：答题音效的开关设置
输入参数:flag 音效开关模式，取值有：开（on）、关（off）
返回值：无
创建信息：黎萍（2014-09-17）
修改记录：无
审查人：无
********************************************************************************/
function setMediaPlay(flag){
	switch(flag){
		case 'on':
			G_Prg.$('offMedia').style.background = '';
            G_Prg.$('onMedia').style.background = '#51A6EE';
		break;
		case 'off':
			G_Prg.$('onMedia').style.background = '';
            G_Prg.$('offMedia').style.background = '#51A6EE';
		break;
	}
}
/********************************************************************************
函数名：getUserSetting
功能：获取用户软件设置云数据
输入参数:无
返回值：无
创建信息：韦友爱（2014-09-16）
修改记录：无
审查人：无
********************************************************************************/
function getUserSetting() {
   /* var userID = G_Cookie.getUserID();
    if(!userID){ //游客用户，使用默认设置
        G_Cookie.setFontSize( '20px');			
		setBgColor('day');
        return;
    }
    var settingData = '';
    var _success = function (json) {
        var jsonData = JSON.parse(json);
        if (jsonData.status === 200) {
            settingData = JSON.parse(jsonData.data);
			if(!settingData){ //登录用户没有进行软件设置操作，使用默认
			    G_Cookie.setFontSize( '20px');			
	        	setBgColor('day');
				return;
			}
            G_Cookie.setFontSize(settingData.fontSize);
            if(settingData.mode==='night'){
                G_Cookie.setNightMode('#152d35');
                G_Cookie.setNFontColor('#666');
                G_Cookie.removeDayMode();
                G_Cookie.removeDFontColor();
            }else{
                G_Cookie.setDayMode('#FFF');
                G_Cookie.setDFontColor('#000');
                G_Cookie.removeNightMode();
                G_Cookie.removeNFontColor();
            }
			if(settingData.isOpenVoice === '1'){
				G_Cookie.setOnMedia('on');
				G_Cookie.removeOffMedia();
			}else{
				G_Cookie.setOffMedia('off');
				G_Cookie.removeOnMedia();
			}
        } else if (jsonData.status === 201) {
            return;
        } else if (jsonData.status === 300) {
            G_Prg.throw('softSetting.getUserSetting:数据库连接错误');
        } else if(jsonData.status === 400){
            G_Prg.throw('softSetting.getUserSetting:参数错误');
        } else {
            G_Prg.throw('不能处理softSetting.getUserSetting:status='+jsonData.status);
        }
    }
    var URL='/api/SoftSettingDataApi/getSoftSettingData/'+userID+'/'+G_Cookie.getGuid();
    G_AjaxApi.get(URL, false, _success);*/
}
/********************************************************************************
函数名：setUserSetting
功能：更新用户软件设置到服务器
输入参数:fontSize 字体大小,mode 模式名称（白天或黑夜）
返回值：无
创建信息：韦友爱（2014-09-16）
修改记录：无
审查人：无
********************************************************************************/
function setUserSetting(fontSize,mode,media) {
    /*var userID = G_Cookie.getUserID();
    if(!userID){
        return;
    }
    var _success = function (json) {
        var jsonData = JSON.parse(json);
        if (jsonData.status === 200) {
            return;
        } else if (jsonData.status === 201) {
            G_Prg.throw('添加软件设置失败');
        } else if (jsonData.status === 300) {
            G_Prg.throw('softSetting.setUserSetting:数据库连接错误');
        } else if(jsonData.status === 400){
            G_Prg.throw('softSetting.setUserSetting:参数错误');
        } else {
            G_Prg.throw('不能处理softSetting.setUserSetting:status='+jsonData.status);
        }
    }
    var URL='/api/SoftSettingDataApi/addSoftSettingData';
    var params={
        userID : userID,
		fontSize : fontSize,
        mode : mode,
		isOpenVoice:media,
//        userName:G_Cookie.getUserName(),
        guid:G_Cookie.getGuid()
    };
    G_AjaxApi.post(URL, params, true, _success);*/
}