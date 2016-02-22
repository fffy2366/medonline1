/********************************************************************************
功能：首页软件名称显示，检查用户是否已登陆、已选择科目，各图标点击事件绑定
********************************************************************************/
function init() {
//    if (!!document.all){
//        window.attachEvent('onresize', _winResize);
//    } else{
//        window.addEventListener('resize', _winResize, false);
//    }
//    function _winResize(){
//        document.getElementById('contentDiv').style.height = window.document.body.clientHeight + 'px';
//    }
//    _winResize();
    G_UserAction.loadObject();
    G_AgentInfo.loadIcon();
    
    defaultPage();
}
function defaultPage(){ 
    _checkAppName();
    /*var noticeJson=G_SoftNotice;
    var notice=JSON.parse(noticeJson).Data;
    if(notice){
        var noticeDate=G_Cookie.getNoticeDate();
        if(!noticeDate||noticeDate!==notice[0].Date){
            var date=notice[0].Date;
            G_Prg.showNotice(notice[0].Content,function(){
                G_Cookie.setNoticeDate(date);
                _alertContinueStudy();
            });
        }else{
            _alertContinueStudy();
        }
    }else{
        _alertContinueStudy();
    }*/
    _alertContinueStudy();
    //考试时间的显示
    var _userID=G_Cookie.getUserID();
    var _appID=G_Cookie.getAppID();
    var _examTime=new Date();
    var _time = 0;
    if(_userID&&G_Prg.checkVipApp()){
        _examTime=G_Prg.getExamTime(_userID,_appID);
    }else{
        G_Prg.$('examTime').style.color='#999';
    }
    if(_examTime){
        var _time=Math.ceil((new Date(_examTime).valueOf() - new Date().valueOf()) / (24 * 60 * 60 * 1000));
        if(_time<0){
            _time=0;
        }
    }
    var height='383px';
    G_Prg.$('changeEdition').style.display='none';
    if(G_AgentInfo.getAgentCode()==='100000-1'){
        height='293px';
        G_Prg.$('examInfo').style.display = 'none';
        G_Prg.$('ideaBack').style.display = 'none';
    }
    var width='175px';
    if(_time<10){
        width = '150px';
    }else if(_time<100){
        width = '160px';
    }else if(_time<1000){
        width = '170px'
    }
    G_Prg.$('indexMenu').style.height=height;
    G_Prg.$('indexMenu').style.backgroundSize = width+' '+height;
    G_Prg.$('indexMenu').style.width = width;
    G_Prg.$('examTime').innerHTML = '距考试'+_time+'天';

	_checkLogined();
    _setClickEvent();
    selectUserOpen();

    /********************************************************************************
    函数名：_alertContinueStudy
    功能：弹出继续上次学习的弹窗
    输入参数：无
    返回值：无
    最后修改人（时间）：韦友爱（2015-01-09）
    修改内容：创建
    *******************************************************************************/
    function _alertContinueStudy(){
        //恢复现场判断
        G_Prg.$('continue').style.color='#999';
        if(G_Storage.checkLocalStorageSupport()&&G_Storage.checkSessionStorageSupport()){
            if(G_Storage.getLocalStorageValue(G_Cookie.getUserID()+'_'+G_Cookie.getAppEName()+'_testJson')){
                G_Prg.$('continue').style.color='#fff';
                if(!G_Prg.getQueryString('fromUrl')&&G_Storage.checkSessionStorageSupport&&!G_Storage.getSessionStorageValue('firstLoad')){
                    _continueStudyClick();
                }
            }
            G_Storage.setSessionStorageValue('firstLoad',1);
        }
    }
    /********************************************************************************
    函数名：_continueStudyClick
    功能：继续上次学习单击事件
    输入参数：无
    返回值：无
    创建信息：韦友爱（2014-08-28）
    修改记录：无
    审查人：无
    *******************************************************************************/
    function _continueStudyClick(){
        if(!G_Storage.checkLocalStorageSupport()){
            alert('抱歉，您的手机不支持localStorage，无法使用该功能！');
            return;
        }
        var testJson = G_Storage.getLocalStorageValue(G_Cookie.getUserID()+'_'+G_Cookie.getAppEName()+'_testJson');
        if(testJson){
//          G_Prg.$('continue').style.color='#fff';
            G_Prg.confirm('您上次学习“'+testJson.title+'”到第'+testJson.curTestNO+'题，是否继续学习？',function(){
                    location.href = 'doExam.html?replay=1';
            });
        }
    }
    /********************************************************************************
    函数名：_setClickEvent
    功能：绑定单击事件
    输入参数：无
    返回值：无
    创建信息：韦友爱（2014-08-28）
    修改记录：韦友爱（2015-01-06）添加通知信息的点击事件
              韦友爱（2015-01-09）添加公告点击事件
    审查人：无
    *******************************************************************************/
    function _setClickEvent(){
	    document.body.onclick = function () {
		    G_Prg.$('indexMenu').style.display = 'none';
            var bg = document.getElementById('indexMenuBg');
            if(bg){
                document.body.removeChild(bg);
            }
	    }//点击页面的其他地方也能够将弹出层隐藏
        G_Prg.$('liChapterMenu').onclick = function () {
            G_UserAction.addUserAction('cptPracticeBtn');
		    location.href = 'chapterMenu.html?fromURL=default.html';
	    };//设置章节练习图片单击事件
	    G_Prg.$('liSimulation').onclick = function () {
            G_UserAction.addUserAction('simExamBtn');
		    _mockExamClick();
	    };//设置模拟考场图片单击事件
	    G_Prg.$('liHelpHome').onclick = function () {
            G_UserAction.addUserAction('softSettingBtn');
		    location.href = 'softSetting.html?fromURL=default.html';
	    };//设置软件设置图片单击事件
	    G_Prg.$('liUserHome').onclick = function (event) {
            G_UserAction.addUserAction('lgRchBtn');
            event = event ? event : window.event;
		    event.stopPropagation();
		    if (G_Cookie.getUserID()) {
			    location.href = 'userHome.html?fromUrl=default.html';
		    } else {
			    location.href = 'userLogin.html?fromUrl=default.html';
		    }
	    };//设置登录注册图片单击事件
	    G_Prg.$('liStatistics').onclick = function () {
            G_UserAction.addUserAction('staAnalysisBtn');
		    _analysisClick();
	    };//设置统计分析图片单击事件
	    G_Prg.$('myNote').onclick = function () {
            G_UserAction.addUserAction('myNoteBtn'); 
		    _myNoteClick();
	    }; //设置我的笔记图片单击事件
	    G_Prg.$('myFav').onclick = function () {
            G_UserAction.addUserAction('myFavBtn'); 
		    _myFavClick();
	    }; //设置我的收藏图片单击事件
	    G_Prg.$('myError').onclick = function () {
            G_UserAction.addUserAction('erroRedoBtn');
		    _myErrorClick();
	    }; //设置错题重做图片单击事件
	    G_Prg.$('liTestInfoMenu').onclick = function () {
            G_UserAction.addUserAction('examGuidBtn');
		    _myTestInfoClick();
	    }; //设置考试指南图片单击事件
	    G_Prg.$('appCName').onclick = function () {
            G_UserAction.addUserAction('appInfoBtn');
		    window.location.href = 'elasticFrame.html?fromUrl=default.html';
	    };//设置页面头部软件名称单击事件
	    G_Prg.$('menuBar').onclick = function (event) {
            G_UserAction.addUserAction('getMoreBtn');
		    _showIndexMenuBar();
		    //阻止冒泡
		    event = event ? event : window.event;
		    event.stopPropagation();
	    }; //点击右上角图片，显示功能菜单栏
	    //选择科目
	    G_Prg.$('selectedSoft').onclick = function (event) {
            G_UserAction.addUserAction('chAppFroMoreBtn');
		    event = event ? event : window.event;
		    event.stopPropagation();
		    window.location.href = 'softMenu.html?fromUrl=default.html';
	    }
	    //关于软件
	    G_Prg.$('aboutSoft').onclick = function (event) {
        G_UserAction.addUserAction('aboutSoftBtn');
		    event = event ? event : window.event;
		    event.stopPropagation();
		    window.location.href = 'aboutSoft.html?fromUrl=default.html';
	    }
	    //考试资讯
	    G_Prg.$('examInfo').onclick = function (event) {
        G_UserAction.addUserAction('examInfoBtn');
		    event = event ? event : window.event;
		    event.stopPropagation();
		    window.location.href = 'examInformation.html?fromUrl=default.html';
//            window.location.href = '../../../'+G_AgentInfo.getNewsLink();
            //window.location.href=G_AgentInfo.getNewsLink()+'?fromUrl=default.html';

	    }
//	    //联系我们
//	    G_Prg.$('contactUs').onclick = function (event) {
//            G_UserAction.addUserAction('contactUsBtn');
//		    event = event ? event : window.event;
//		    event.stopPropagation();
//		    window.location.href = 'contactUs.html?fromUrl=default.html';
//	    }
	    //意见反馈
	    G_Prg.$('ideaBack').onclick = function (event) {
            G_UserAction.addUserAction('feedbackBtn');
		    event = event ? event : window.event;
		    event.stopPropagation();
		    window.location.href = 'feedback.html?fromUrl=default.html';
	    }
        //查找试题
	    G_Prg.$('findTest').onclick = function (event) {
            G_UserAction.addUserAction('searchTestFroMoreBtn');
		    event = event ? event : window.event;
		    event.stopPropagation();
            _findTestClick();
	    }
        //继续上次学习
        G_Prg.$('continueStudy').onclick=function(event){
            G_UserAction.addUserAction('continueStudyBtn');
            event = event ? event : window.event;
		    event.stopPropagation();
            _continueStudyClick();
        }
        //考试时间
        G_Prg.$('examTimeLi').onclick=function(event){
            event = event ? event : window.event;
		    event.stopPropagation();
            if(_userID&&G_Prg.checkVipApp()){
                window.location.href ='setExamTime.html?fromUrl=default.html';
            }
        }
        //切换版本
        G_Prg.$('changeEdition').onclick=function(event){
            event = event ? event : window.event;
		    event.stopPropagation();
            G_Prg.confirm('新旧版本答题数据不互通，您确定要切换？', function () {
                window.demo.clickonAndroid('true');
            });
        }
        //信息通知
        G_Prg.$('notice').onclick=function(event){
            event = event ? event : window.event;
		    event.stopPropagation();
            window.location.href ='notice.html?fromUrl=default.html';
        }
    }
    /********************************************************************************
    函数名：_findTestClick
    功能：查找试题单击事件
    输入参数：无
    返回值：无
    创建信息：韦友爱（2014-08-28）
    修改记录：无
    审查人：无
    *******************************************************************************/
    function _findTestClick(){
        if (!G_Cookie.getUserID()) {
            var yesCallback = function () {
			    window.location.href = 'userLogin.html?fromUrl=default.html&toUrl=default.html';
		    }
		    G_Prg.confirm('该功能登录后才能使用！', yesCallback);
            return;
 	    }
        if(!G_Prg.checkVipApp()){
            var eerorBox = document.getElementById('nrdvMsgBox');
            if(eerorBox && eerorBox.style.display === 'block'){//判断是否有报错弹窗（被踢下线）
                return;
            } 
            G_Prg.confirm('该功能充值后才能使用！', function(){
                var isiphone=G_Prg.getCookie('CLIENTTYPE');
                if(isiphone&&isiphone.toString().toLowerCase()==='iphone'){
                    window.location="ios://iOSiap";
                }else{
                    window.location.href = 'selectPrice.html?fromUrl=default.html';
                }
            });
            return;
        }
	    window.location.href = 'testList.html?fromUrl=default.html&type=findTest';
    }

    /********************************************************************************
    函数名：_showIndexMenuBar
    功能：点击做题界面右上角的图片，显示菜单
    输入参数：无
    返回值：无
    创建信息：黎萍（2014-07-08）
    修改记录：无
    审查人：无
    *******************************************************************************/
    function _showIndexMenuBar() {
	    var menu = G_Prg.$('indexMenu');
	    if (menu.style.display === 'none') {
            //背景层
            var bg = document.createElement('div');
            bg.id = 'indexMenuBg';
            bg.style.display = 'block';
            bg.style.opacity = 0;
            bg.style.width = '100%';
            bg.style.height = '100%';
            bg.style.backgroundColor = '#000000';
            bg.style.position = 'absolute';
            bg.style.left = '0px';
            bg.style.top = '0px';
            bg.onclick = function(event){
                //阻止冒泡
                event = event ? event : window.event;
                event.stopPropagation();
                menu.style.display = 'none';
                var bg = document.getElementById('indexMenuBg');
                if(bg){
                    document.body.removeChild(bg);
                }
            }
            document.body.appendChild(bg);

		    menu.style.display = 'block';
	    } else {
		    menu.style.display = 'none';
            var bg = document.getElementById('indexMenuBg');
            if(bg){
                document.body.removeChild(bg);
            }
	    }
    }
    /********************************************************************************
    函数名：_mockExamClick
    功能：设置模拟考场单击事件
    输入参数:无
    返回值：无
    创建信息：黎萍（2014-07-23）
    修改记录：无
    审查人：无
    ********************************************************************************/
    function _mockExamClick() {
	    var userID = G_Cookie.getUserID();
	    if (!userID) {
		    var yesCallback = function () {
			    window.location.href = 'userLogin.html?fromUrl=default.html';
		    }
		    G_Prg.confirm('该功能登录后才能使用！', yesCallback);
		    return;
	    }
        if(!G_Prg.checkVipApp()){
            var eerorBox = document.getElementById('nrdvMsgBox');
            if(eerorBox && eerorBox.style.display === 'block'){//判断是否有报错弹窗（被踢下线）
                return;
            } 
            G_Prg.confirm('该功能充值后才能使用！', function(){
                var isiphone=G_Prg.getCookie('CLIENTTYPE');
                if(isiphone&&isiphone.toString().toLowerCase()==='iphone'){
                    window.location="ios://iOSiap";
                }else{
                    window.location.href = 'selectPrice.html?fromUrl=default.html';
                }
            });
            return;
        }
	    //window.location.href = 'doExam.html?fromUrl=default.html';
		window.location.href = 'simulatedExam.html?fromUrl=default.html';
    }
    /********************************************************************************
    函数名：_analysisClick
    功能：设置统计分析单击事件
    输入参数:无
    返回值：无
    创建信息：黎萍（2014-07-18）
    修改记录：无
    审查人：无
    ********************************************************************************/
    function _analysisClick() {
	    var userID = G_Cookie.getUserID();
	    if (!userID) {
		    var yesCallback = function () {
                window.location.href = 'userLogin.html?fromUrl=default.html';
		    }
		    G_Prg.confirm('该功能请登录后使用！', yesCallback);
		    return;
	    }
	    window.location.href = 'analysis.html?fromUrl=default.html';
    }
    /********************************************************************************
    函数名：_myNoteClick
    功能：设置我的笔记图片单击事件
    输入参数:无
    返回值：无
    创建信息：韦友爱（2014-07-03）
    修改记录：韦友爱（2014-07-10）将noCallback去掉
    审查人：欧聪（2014-07-08）
    ********************************************************************************/
    function _myNoteClick() {
	    var userID = G_Cookie.getUserID();
	    if (!userID) {
		    var yesCallback = function () {
                 window.location.href = 'userLogin.html?fromUrl=default.html';
		    }
		    G_Prg.confirm('该功能请登录后使用！', yesCallback);
		    return;
	    }
//	    var data = _getNumber(userID);
//	    var noteNum = 0;
//	    if (data) {
//		    noteNum = data.noteNum;
//	    }
//	    if (noteNum > 0) {
		    window.location.href = 'testList.html?fromUrl=default.html&type=userNote';
//	    } else {
//		    G_Prg.alert('无笔记记录');
//	    }
    }
    /********************************************************************************
    函数名：_myFavClick
    功能：设置我的收藏图片单击事件
    输入参数:无
    返回值：无
    创建信息：韦友爱（2014-07-03）
    修改记录：韦友爱（2014-07-10）将noCallback去掉
    审查人：欧聪（2014-07-08）
    ********************************************************************************/
    function _myFavClick() {
	    var userID = G_Cookie.getUserID();
	    if (!userID) {
		    var yesCallback = function () {
                 window.location.href = 'userLogin.html?fromUrl=default.html';
		    }
		    G_Prg.confirm('该功能请登录后使用！', yesCallback);
		    return;
	    }
//	    var data = _getNumber(userID);
//	    var favNum = 0;
//	    if (data) {
//		    favNum = data.favNum;
//	    }
//	    if (favNum > 0) {
		    window.location.href = 'testList.html?fromUrl=default.html&type=userFav';
//	    } else {
//		    G_Prg.alert('无收藏记录');
//	    }
    }
    /********************************************************************************
    函数名：_myErrorClick
    功能：设置错题重做图片单击事件
    输入参数:无
    返回值：无
    创建信息：黎萍（2014-07-04）
    修改记录：韦友爱（2014-07-10）将noCallback去掉
    审查人：欧聪（2014-07-08）
    ********************************************************************************/
    function _myErrorClick() {
	    var userID = G_Cookie.getUserID();
	    if (!userID) {
		    var yesCallback = function () {
                 window.location.href = 'userLogin.html?fromUrl=default.html';
		    }
		    G_Prg.confirm('该功能请登录后使用！', yesCallback);
		    return;
	    }
//	    var data = _getNumber(userID);
//	    var errorNum = 0;
//	    if (data) {
//		    errorNum = data.wrongTestNum;
//	    }
//	    if (errorNum > 0) {
		    window.location.href = 'testList.html?fromUrl=default.html&type=userError';
//	    } else {
//		    G_Prg.alert('无错题记录');
//	    }
    }
    /********************************************************************************
    函数名：_myTestInfoClick
    功能：设置考试指南图片单击事件
    输入参数:无
    返回值：无
    创建信息：何允俭（2014-08-11）
    修改记录：无
    审查人：无
    ********************************************************************************/
    function _myTestInfoClick(){
	    var appEName = G_Cookie.getAppEName();
	    if(!appEName){
		    G_Prg.throw('程序运行错误，_myTestInfoClick ,不能处理appEName=' + appEName);
	    }
	    var URL = '/api/testInfoMenu/getTestInfoMenu/' + appEName;
	    var _success = function (json){
		    var jsonData = JSON.parse(json);
		    if(jsonData.status === 200){
			    window.location.href = '../html/testInfoMenu.html?fromUrl=default.html';
		    }else if(jsonData.status === 201){
			    G_Prg.alert('此科目暂无备考资料');
		    }else{
			    G_Prg.alert(jsonData.msg + jsonData.status);
		    }	
	    };
	    G_AjaxApi.get(URL, false, _success);
    }
    /********************************************************************************
    函数名：_checkLogined
    功能：判断是否已登陆
    输入参数:无
    返回值： 无
    创建信息: 何允俭（2014-06-13）
    修改信息：韦友爱（2014-06-26）将函数名改成_checkLogined
    韦友爱（2014-06-26）变量命名采用采用驼峰方式
    韦友爱（2014-06-27）将if else用防御式编程
    韦友爱（2014-06-28）取消防御式编程
    审查人：欧聪
    审查人：黎萍（2014-06-24） 函数命名规则采用驼峰方式，不允许使用下划线
    欧聪（2014-07-08）
    ********************************************************************************/
    function _checkLogined() {
        var userID = G_Cookie.getUserID();
	    //var userName = G_Cookie.getUserName();
	    //var userHome = G_Prg.$('Userhome');
	    //var imgLogin = G_Prg.$('imgLogin');
	    var loginSpan = G_Prg.$('loginSpan');
	    // 判断cookie是否为空
	    if (userID) {
		    // cookie不为空，跳转到个人中心
		    loginSpan.innerHTML = '个人中心';
		    //imgLogin.src = '../images/user.png';
	    } else {
		    // cookie非空，跳转到登录
		    loginSpan.innerHTML = '登录充值';
		    //imgLogin.src = '../images/canon_activation_up.png';
	    }
    }
    /********************************************************************************
    函数名：_checkAppName
    功能：判断是否已选择科目
    输入参数：无
    返回值：无
    创建信息: 韦友爱（2014-06-09）
    修改信息：韦友爱（2014-06-12）获取cookie，并判断是否为空
    韦友爱 （2014-06-23）将变量名name改成appname
    将==改成===
    谢建沅 （2014-06-23）添加启动界面
    何允俭 （2014-6-26） 改为防御式编程形式，
    将document.getElementById() 改为引用G_Prg
    韦友爱（2014-06-26）将函数名改成checkAppName
    改用G_Cookie.getAppName()获取cookie里的appName
    将appCName === null改成!appCName
    将firstLoad === null改成!firstLoad
    审查人：黎萍   （2014-06-24） 函数命名规则采用驼峰方式，不允许使用下划线；if else 的花括号写在一行，不能另起一行写
    欧聪（2014-07-08）
    ********************************************************************************/
    function _checkAppName() {
	    //获取cookie中的数据
	    var appCName = G_Cookie.getAppName();
	    //判断cookie是否为空,
	    if (!appCName) {
		    window.location.href = 'softMenu.html?fromUrl=default.html'; //转到SoftMenu页选择科目
		    return;
	    }
	    //cookie非空情况
	    G_Prg.$('appCName').innerHTML = appCName; //将软件名称显示首页
    }
    /********************************************************************************
    函数名：_getNumber
    功能：获取当前章节的收藏、错题、笔记的数据
    输入参数:userID 用户ID,cptID 章节ID
    返回值：data 包含有收藏、错题、笔记数量的数据包
    创建信息：韦友爱（2014-07-24）
    修改记录：韦友爱（2014-07-25）删除输入参数appID 软件ID,userName 用户名
    审查人：无
    ********************************************************************************/
    function _getNumber(userID) {
	    var appID = G_Cookie.getAppID();
	    if (!appID) {
		    G_Prg.throw('程序运行错误，defaultPage._getNumber ,不能处理appID=' + appID);
	    }
	    var userName = G_Cookie.getUserName();
	    if (!userName) {
		    G_Prg.throw('程序运行错误，defaultPage._getNumber ,不能处理userName=' + userName);
	    }
	    var data = '';
	    var URL = '/api/analysis/getUserTestNumApi/' + appID + '/' + userID + '/-1/' + userName;
	    var success = function (json) {
		    var jsonData = JSON.parse(json);
		    if (jsonData.status === 200) {
			    data = jsonData.data;
		    } else if (jsonData.status === 201) {
			    data = '';
		    } else if (300) {
			    G_Prg.throw('程序运行错误，defaultPage._getNumber :数据库获取数据异常');
		    } else {
			    G_Prg.throw('程序运行错误，defaultPage._getNumber ：status=' + jsonData.status);
		    }
	    };
	    G_AjaxApi.get(URL, false, success);
	    return data;
    }
    
}
    
/********************************************************************************
函数名：iOSreturn
功能：苹果商店功能
输入参数: 无
返回值：无
创建信息：罗天敏（2014-10-27）
修改记录：无
审查人：无
*******************************************************************************/
function iOSreturn(){
    var username=G_Cookie.getUserID();
    var softname=G_Cookie.getAppEName();

    var answer=username+"/"+softname;
    return answer;
}
/********************************************************************************
函数名：selectUserOpen
功能：查询用户购买
输入参数: 无
返回值：无
创建信息：罗天敏（2015-11-20）
修改记录：无
审查人：无
*******************************************************************************/
function selectUserOpen(){
    
    var userID=G_Cookie.getUserID();
    var userName=G_Cookie.getUserName();
    var appName=G_Cookie.getAppName();
    var appEName=G_Cookie.getAppEName();
    if (!appName||!appEName) {

        return;
    }

    var url='/api/experience/select';
    var success=function(json){
        
        var jsonData = JSON.parse(json);
        if(jsonData.status===200){
            G_Prg.confirm('<div style="text-align:left">&nbsp;&nbsp;&nbsp;&nbsp;即日起至<span style="color:red">12月31日</span>，未购买开通考试宝典的用户可以免费领取执业医师系列任一科目<span style="color:red">7天</span>体验，每个账号只能领取<span style="color:red">一次</span>。</div>',function(){
                G_Prg.confirm('<div style="text-align:left">&nbsp;&nbsp;&nbsp;&nbsp;请确认您领取的科目是否正确，一旦确认将无法更改！</br>通行账号：<span style="color:red">'+userName+'</span></br>开通科目：<span style="color:red">'+appName+'</span></div>',function(){
                    var url_open='/api/experience/open';
                    
                    var success_open=function(r){
                        var jsonData_open=JSON.parse(r);
                        if(jsonData_open.status===200){
                            G_Prg.alert('恭喜，您已领取成功！请重新登录使用。</br><div style="text-align:left">通行账号：<span style="color:red">'+userName+'</span></br>开通科目：<span style="color:red">'+appName+'</span></br>有效期：'+jsonData_open.data.beginTime+'—'+jsonData_open.data.endTime+'</div>',function(){
                            window.location.href='userLogin.html';
                            });
                            
                            return;
                        }
                        G_Prg.alert(jsonData_open.msg);
                    }
                    G_AjaxApi.post(url_open,{userName:userName,appEName:appEName}, false, success_open);
                },function(){
                    G_Prg.$('imgLogin').src='../images/user_l.png';
                });
            },function(){
                G_Prg.$('imgLogin').src='../images/user_l.png';
            });

            return;
        }
        if(jsonData.status===201){
            return;
        }
        if(jsonData.status===202){
        G_Prg.confirm('<div style="text-align:left">&nbsp;&nbsp;&nbsp;&nbsp;即日起至<span style="color:red">12月31日</span>，未购买开通考试宝典的用户可以免费领取执业医师系列任一科目<span style="color:red">7天</span>体验，每个账号只能领取<span style="color:red">一次</span>。</div>',function(){
            G_Prg.confirm('<div style="text-align:left">&nbsp;&nbsp;&nbsp;&nbsp;您尚<span style="color:red">未登录</span>，请重新登录后再领取<span style="color:red">7天</span>体验！</div>',function(){
                window.location.href='userLogin.html';
            },function(){
                G_Prg.$('imgLogin').src='../images/user_l.png';
            });
        },function(){
            G_Prg.$('imgLogin').src='../images/user_l.png';
        });
            return;
        }
         G_Prg.alert(jsonData.msg);
    }
    G_AjaxApi.post(url,{userID:userID,userName:userName,appEName:appEName}, false, success);
}