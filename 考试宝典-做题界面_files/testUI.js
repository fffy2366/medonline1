/********************************************************************************
 *根据TestData分解的线性数据，解析展示在页面
 ********************************************************************************/
function onloadData() {
    if (!!document.all) {
        window.attachEvent('onresize', _winResize);
    } else {
        window.addEventListener('resize', _winResize, false);
    }
    function _winResize(){
        G_Prg.$('contentDiv').style.height = window.document.body.clientHeight + 'px';
        //dragContent层高度等于当前高度
        G_Prg.$('dragContent').style.height = window.document.body.clientHeight + "px";
    } 
    _winResize();
	getUserSetting();//获取软件设置云数据
	G_UserAction.loadObject();
    G_AllTest = new TestData();
    TestUI(G_AllTest);
}
window.onbeforeunload = function(event) {
    G_AllTest.addReplyJson();
    //(event || window.event).returnValue = "确定退出吗";
}
/********************************************************************************
 函数名：TestUI
 功能：接收试题各部分数据展示在页面上
 输入参数: allTest 函数TestData的对象
 返回值: 无
 创建信息：黎萍（2014-05-29）
 修改记录：无
 审查人：陈昊（2014-06-26）
 *******************************************************************************/
function TestUI(allTest) {
    var _IsShowTopic = true;    //是否显示题目
    var _IsShowItems = true;    //是否显示选项
    var _IsShowExplain = true;  //是否显示解析
    var _IsShowNote = true;     //是否显示笔记内容
    var _IsShowUserAnswer = true;   //是否显示用户答题信息
    var _IsShowRightAnswer = true;  //是否显示正确答案
    var _IsDisabled = true;       //是否可以作答
    var _IsShowRightAndWrong = true;	//显示用户所选答案是否正确
    var _IsShowOtherNote = true;    //是否显示其他人的笔记
    var _selected = 0;	//从模拟考场进入答题界面，用户选择答案后，标记该值为1，提交批阅后，修改状态为0；用于控制上下一题时选项的选中状态
    var _viewCount = 0;	//简答题、填空题已做过/浏览的试题数量
    var _replyStartTime = new Date();	//答题开始时间
    var _fromUrl = '';
    var _fontColor = 'defaultItem';
    var _htmlTemplate = ''; //保存的html模板
    var _title = '';	//界面上展示的标题
	var doTest = false;	//标记点击了答题按钮进行操作 
	var _blurFlag = '';	//标记简答题、填空题在失去焦点时，控制不显示笔记
    var _appEName = G_Cookie.getAppEName();

    if(G_Cookie.getNightMode()){
        _fontColor = 'nightItem';
    }
    var _curPage=G_Prg.getQueryString('page');
    if(!_curPage){
        _curPage=1;
    }
    var _curTestNO = '';	//当前试题编号
    var _replay = G_Prg.getQueryString('replay');
    var _testJson = '';
    
    var _gAllTest = allTest; //TestData 类对象

    if(_replay === '1'){
       var arrAllTest = _gAllTest.getArrAllTest();
       //还原现场：如果是批阅或者背题模式下，恢复现场只保留之前操作到的当前试题，之前的操作清空
       if(arrAllTest[0].state === 'marked' || arrAllTest[0].state === 'recite'){
           for(var i = 0; i < arrAllTest.length; i++){
                arrAllTest[i].userReply = '';
                arrAllTest[i].isRight = false;
                arrAllTest[i].lastState= '';
                arrAllTest[i].state= '';
            }
            _gAllTest.clearAction();
            _gAllTest.setState('uncommited',1);
       }
		_testJson = G_Storage.getLocalStorageValue(G_Cookie.getUserID()+'_'+_appEName+'_testJson');
        _curTestNO = _testJson.curTestNO;	//当前试题编号
        _fromUrl = _testJson.url;
    }else{
        allTestID = G_Prg.getQueryString('allTestID');	//当前试题编号
        if(allTestID){
            allTestID=parseInt(allTestID);
        }
        _curTestNO=allTest.getTestNO(allTestID);
        _fromUrl = G_Prg.getQueryString('fromUrl');
    }
    var _curTestIndex = parseInt(_curTestNO)-1;		//当前试题索引
    if(_curTestNO !== null){
        allTest.move(_curTestIndex);	//设置当前试题编号
    }
    var _gFlipsnap = {};	//滑动控件
    var _firstShow=[];//用来标记试题是否第一次显示的数组的
    var _addNote=[];
    if(_fromUrl === 'simulatedExam.html'){
        _setState('mock');
		_showConfigJsonInfos();
    }else{
        _setState('uncommited');
    }
    var _arrTypeExplain=_gAllTest.setExplain();
	
    _init(); //初始化试题
    _initFlipsnap(_gFlipsnap);	//初始化后滑动
	
    var dragIndexByTestIndex = _getDragIndexByTestIndex();//计算应该显示的索引，如果从错题、笔记、收藏进来会跳到试题对应的滑动层
    if(_gFlipsnap.currentPoint !== dragIndexByTestIndex){
        _gFlipsnap.moveToPoint(dragIndexByTestIndex,0);
        //刷新底部收藏和笔记图标
        _setFavTestInfos();
        _refreshNoteIcon();
    }
    _setCss();
    //正则替换，实现笔记换行
    var _regerBr=new RegExp('<br>','gm');
    var _regerN=new RegExp('\n','gm');

    var _cardHtml = G_Prg.$('cardDialog').innerHTML;
    var _pyHtml = G_Prg.$('content').innerHTML;
    var _setHtml = G_Prg.$('settingDialog').innerHTML;
	var _shareHtml = G_Prg.$('shareTest').innerHTML;
    //设置菜单setTimeout事件
    G_Prg.$('contentDiv').onclick=function(){
        G_Prg.$('testMenu').style.display = 'none';
    };

    /********************************************************************************
     函数名：_init
     功能：初始化试题
     输入参数:dragFlag 滑动标识(0：初始化，1：上一题，2：下一题)
     返回值: 无
     创建信息：黎萍（2014-06-04）
     修改记录：黎萍（2014-06-13）去掉滑动效果
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _init(dragFlag) {
        var firstLoad = false;
        //是不是第一次绑定
        if(dragFlag !== 'card'){
            firstLoad = dragFlag ? false : true;
            dragFlag = dragFlag || 0;
        }
        var curIndex = _gAllTest.getCurIndex();
        var allTestCount = _gAllTest.getTestCount();//当前试题总数
        var dragCount = allTestCount < 3 ? allTestCount : 3 ; //滑动层个数，如果试题数小于3题，则出现小于3题的滑动层
        if(firstLoad){
            _moveTestTemplet(allTestCount);	//在绑定之前把模板复制到目标DIV
        }
        var startIndex = 0;
        if(curIndex === 0 || dragCount < 3){
            startIndex = 0;
        } else if(curIndex === allTestCount-1){
            startIndex = curIndex-2;
        } else{
            startIndex = curIndex-1;
        }
		//curTest使用传参的方式，解决滑动时试题会闪屏的情况
        for(var i=0;i<dragCount;i++){
            var curTest = _gAllTest.getTest((startIndex+i));
            _showCurTest(curTest,i);
			//_setItemPosition(curTest,i,firstLoad);
            _setClickEvent(curTest,i); //设置页面单击事件
            _setTestEvent(curTest,i); //设置选项事件
            _controlBtn(curTest,i);	//浏览试题到最后一题时，将下一题按钮变成'批阅'
            _hiddenTestSelects(curTest,i);//背题模式下，隐藏其它非正确的选项
            _changeBtn(curTest,i);	//从背题模式切换到答题模式，控制查看答案、隐藏答案、答题等按钮
			

        }
        if(dragFlag === 'card'){	//从题卡点击题卡号进入指定试题页面
            //特殊情况跳转
            _showTestTypeIntro();
            if(curIndex === 0){
                _gFlipsnap.moveToPoint(0,0);	//滑动到指定的层
            } else if(curIndex === allTestCount-1){
                _gFlipsnap.moveToPoint(2,0);	//滑动到指定的层
            } else{
                _gFlipsnap.moveToPoint(1,0);	//滑动到指定的层
            }
        }
        
        
        _setShareTest();	//页面右上角分享试题按钮设置
        //刷新底部收藏和笔记图标
        _setFavTestInfos();
        _refreshNoteIcon();
        if(firstLoad){
            _showTestTypeIntro();
			if(_fromUrl === 'simulatedExam.html'){
				_showConfigJsonInfos();
			}
        }
        //修正bug:解答题和填空题点击别的地方不能移开焦点
        document.body.onclick = function() {
           //强制输入框失去焦点，防止滑动后输入焦点一直停留在输入框内
            var focusId = document.activeElement.id;
            if (focusId.indexOf('jd_textarea_') > -1) {
                G_Prg.$(focusId).blur();
            }
			if (focusId.indexOf('tk_itemsText_') > -1) {
                G_Prg.$(focusId).blur();
            }
        };
    }
    /********************************************************************************
     函数名：_showCurTest
     功能：显示试题
     输入参数: curTeset 当前试题;
     返回值: 无
     创建信息：黎萍（2014-06-04）
     修改记录：韦友爱（2014-07-14）修改笔记内容的判断及显示
     韦友爱（2014-08-06）添加试题题型说明的显示
     韦友爱（2014-08-13）添加试题是否第一次显示的判断
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _showCurTest(curTest,dragIndex) {
		if(_gAllTest.getLastAction(curTest.testNO-1) && (curTest.testType === 'JDTEST' || curTest.testType === 'TKTEST') && _gAllTest.getAction(curTest.testNO-1)=== 'addNote'){//此判断控制简答题在查看答案后，再添加笔记时能保持之前查看答案的状态
			_setState(_gAllTest.getState(curTest.testNO-1),_gAllTest.getLastAction(curTest.testNO-1));
		}else{
        	_setState(_gAllTest.getState(curTest.testNO-1),_gAllTest.getAction(curTest.testNO-1));
		}
        var title = G_Prg.$('chaptername'); //页面头部显示章节名称
		var simulated = G_Prg.getQueryString('simulated');
        if(_replay === '1'){
            title.innerHTML = _testJson.title;
            _title = _testJson.title;
        }else{
            switch (_fromUrl){
                default:
                    title.innerHTML = G_Prg.getQueryString('cptName',true);
                    _title = G_Prg.getQueryString('cptName',true);
                    break;
                case 'testList.html':
                    var type = G_Prg.getQueryString('type');
                    switch(type){
                        case 'userError':
                            title.innerHTML='错题重做';
                            _title = '错题重做';
                            break;
                        case 'findTest':
                            title.innerHTML='查找试题';
                            _title = '查找试题';
                            break;
                        case 'userFav':
                            title.innerHTML='我的收藏';
                            _title = '我的收藏';
                            break;
                        case 'userNote':
                            title.innerHTML='我的笔记';
                            _title = '我的笔记';
                            break;
                        case 'errorRank':
                            title.innerHTML='错题排行榜';
                            _title = '错题排行榜';
                            break;
                        case 'favRank':
                            title.innerHTML='收藏排行榜';
                            _title = '收藏排行榜';
                            break;
                        case 'noteRank':
                            title.innerHTML='大家的笔记';
                            _title = '大家的笔记';
                            break;
                    }
                    break;
                    case 'easyErrorTest.html':
						title.innerHTML = '易混易错';
						_title = '易混易错';
                    break;
                    case 'simulatedExam.html':
					if(simulated === '0'){
						title.innerHTML = '模拟考场';
						_title = '模拟考场';
					}else if(simulated === '1'){
						var configJson = JSON.parse(_gAllTest.getConfigJson());
						title.innerHTML = configJson.ConfigTitle;
						_title = configJson.ConfigTitle;
					}
                    break;
				case 'video.html':
					title.innerHTML = '易混易错';
					_title = '易混易错';
					break;
            }
        }
        _gAllTest.setTitle(_title);
        if(curTest === '' || curTest === undefined){
            return;
        }
        var testType = curTest.testType; //根据题型调用对应的展示数据的函数
        _hideTestTemplet(dragIndex);
        switch (testType) {
            case 'A3TEST':
                _showA3Test(curTest,dragIndex);
                break;
            case 'ATEST':
                _showATest(curTest,dragIndex);
                break;
            case 'BTEST':
                _showBTest(curTest,dragIndex);
                break;
            case 'XTEST':
                _showXTest(curTest,dragIndex);
                break;
            case 'PDTEST':
                _showPDTest(curTest,dragIndex);
                break;
            case 'JDTEST':
                _showJDTest(curTest,dragIndex);
                break;
            case 'TKTEST':
                _showTKTest(curTest,dragIndex);
                break;
            default:
                G_Prg.throw('程序运行错误，TestUI._showCurTest：testType = "' + testType + '"，无法解析题型');
                break;
        }
		if (_appEName === 'ZY_HS') {
			_showQuestAndVideoBtn(curTest, dragIndex);
		}
    }
    /********************************************************************************
     函数名：_hideTestTemplet
     功能：加载试题之前，将所有试题模板状态设置为隐藏
     输入参数：无
     返回值: 无
     创建信息：黎萍（2014-05-30）
     修改记录：黎萍（2014-07-25）根据题型判断，控制显示下一题按钮
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _hideTestTemplet(dragIndex) {
        G_Prg.$('radio_exam_'+dragIndex).style.display = 'none';
        G_Prg.$('checkbox_exam_'+dragIndex).style.display = 'none';
        G_Prg.$('pd_exam_'+dragIndex).style.display = 'none';
        G_Prg.$('jd_exam_'+dragIndex).style.display = 'none';
        G_Prg.$('tk_exam_'+dragIndex).style.display = 'none';
        G_Prg.$('A3_checkbox_exam_'+dragIndex).style.display = 'none';
        G_Prg.$('A3_radio_exam_'+dragIndex).style.display = 'none';
        G_Prg.$('B_checkbox_exam_'+dragIndex).style.display = 'none';
        G_Prg.$('B_radio_exam_'+dragIndex).style.display = 'none';
        G_Prg.$('markingDiv_'+dragIndex).style.display = 'none';
    }
	/********************************************************************************
     函数名：_setState
     功能：设置操作试题的状态
     输入参数：state 操作试题的状态；action 操作试题的动作
     返回值: 无
     创建信息：黎萍（2014-09-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _setState(state,action) {
        switch(state) {
            case 'uncommited'://未提交状态
                _IsShowTopic = true;
                _IsShowItems = true;
                _IsDisabled = true;
                _IsShowExplain = false;
                _IsShowRightAnswer = false;
                _IsShowUserAnswer = false;
                _IsShowNote = false;
                _IsShowOtherNote = false;
                _IsShowRightAndWrong = false;
                break;
            case 'commited'://已提交
                _IsShowTopic = true;
                _IsShowItems = true;
                _IsDisabled = true;
                _IsShowExplain = true;
                _IsShowRightAnswer = false;
                _IsShowUserAnswer = false;
                _IsShowNote = true;
                _IsShowOtherNote = true;
                _IsShowRightAndWrong = true;
                break;
            case 'recite'://背题状态
                _IsShowTopic = true;
                _IsShowItems = false;
                _IsDisabled = false;
                _IsShowExplain = false;
                _IsShowRightAnswer = false;
                _IsShowUserAnswer = false;
                _IsShowNote = false;
                _IsShowOtherNote = false;
                _IsShowRightAndWrong = false;
                break;
            case 'mock':	//模拟考场
                _IsShowTopic = true;
                _IsShowItems = true;
                _IsDisabled = true;
                _IsShowExplain = false;
                _IsShowRightAnswer = false;
                _IsShowUserAnswer = true;
                _IsShowNote = false;
                _IsShowOtherNote = false;
                _IsShowRightAndWrong = false;
                break;
            case 'marked'://批阅状态
                _IsShowTopic = true;
                _IsShowItems = true;
                _IsDisabled = false;
                _IsShowExplain = true;
                _IsShowRightAnswer = true;
                _IsShowUserAnswer = true;
                _IsShowNote = true;
                _IsShowOtherNote = true;
                _IsShowRightAndWrong = true;
                break;
        }
        switch (action){
            case 'addNote':
                _IsShowNote = true;
                _IsShowOtherNote = true;
                break;
            case 'reciteWithAnswer':
                _IsShowRightAnswer = true;
                _IsShowNote = true;
                _IsShowOtherNote = true;
                _IsShowExplain = true;
                break;
            case 'reciteNoAnswer':
                _IsShowRightAnswer = false;
                _IsShowNote = false;
                _IsShowOtherNote = false;
                _IsShowExplain = false;
                _IsShowUserAnswer = true;
                break;
            case 'lookAnswer':
                _IsShowNote = true;
                _IsShowOtherNote = true;
				_IsShowExplain = true;
                break;
			case 'lookNoAnswer':
				_IsShowNote = false;
                _IsShowOtherNote = false;
				_IsShowExplain = false;
				break;
        }
    }
    /********************************************************************************
     函数名：_setID
     功能：获取试题信息所在html标签的id，用来控制对应的事件信息
     输入参数:无
     返回值：idArr 存储试题信息层所在id的伪哈希表
     创建信息：黎萍（2014-08-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _setID(curTest){
        var idArr = new Object();	//存储试题信息层所在id的伪哈希表
        if(curTest === '' || curTest === undefined){
            return;
        }
        var testType = curTest.testType; //试题类型
        var subTestType = curTest.subTestType; //针对A3和B题型的小题的试题类型进行定义
        switch (testType) {
            case 'ATEST':
                //以下，题干信息ID
                idArr['styleExplain'] = 'radio_styleExplain_';
                idArr['curPageNum'] = 'radio_curPageNum_';
                idArr['totalPageNum'] = 'radio_totalPageNum_';
                idArr['testTitle'] = 'radio_testTitle_';
                idArr['testPoint'] = 'radio_testPoint_';
                //题干信息结束
                idArr['itemUiID'] = 'radio_Items_'
                idArr['itemID'] = 'radio_items_';
                idArr['itemNameID'] = 'radio_';
                idArr['itemTextID'] = 'radio_itemText_';
                idArr['resultID'] = 'radio_result';
                idArr['pageNumID']  = 'radio_pageNum';
                idArr['divBtnID'] = 'radio_moveNextDiv';
                idArr['noteCountDivID'] = 'radio_noteCount';
                idArr['myNoteID'] = 'radio_myNote';
                idArr['timeID'] = 'radio_time';
                idArr['operate'] = 'radio_operate';
                idArr['answerDiv'] = 'radio_answer';
                idArr['explainDiv'] = 'radio_explain';
                //他人笔记
                idArr['otherNoteCount']='radio_otherNoteCount';
                idArr['otherNoteList']='radio_otherNoteList';
                idArr['moreNote']='radio_moreNote';
                idArr['getOtherNote']='radio_getOtherNote';
                idArr['otherTxt']='radio_otherTxt';
                idArr['refresh']='radio_refresh';
                break;
            case 'XTEST':
                //以下，题干信息ID
                idArr['styleExplain'] = 'checkbox_styleExplain_';
                idArr['curPageNum'] = 'checkbox_curPageNum_';
                idArr['totalPageNum'] = 'checkbox_totalPageNum_';
                idArr['testTitle'] = 'checkbox_testTitle_';
                idArr['testPoint'] = 'checkbox_testPoint_';
                //题干信息结束
                idArr['itemUiID'] = 'checkbox_Items_'
                idArr['itemID'] = 'checkbox_items_';
                idArr['itemNameID'] = 'checkbox_';
                idArr['itemTextID'] = 'checkbox_itemText_';
                idArr['resultID'] = 'checkbox_result';
                idArr['buttonID'] = 'checkbox_btn';
                idArr['pageNumID']  = 'checkbox_pageNum';
                idArr['divBtnID'] = 'checkbox_moveNextDiv';
                idArr['noteCountDivID'] ='checkbox_noteCount';
                idArr['myNoteID'] ='checkbox_myNote';
                idArr['timeID'] ='checkbox_time';
                idArr['operate'] = 'checkbox_operate';
                idArr['answerDiv'] = 'checkbox_answer';
                idArr['explainDiv'] = 'checkbox_explain';
                //他人笔记
                idArr['otherNoteCount']='checkbox_otherNoteCount';
                idArr['otherNoteList']='checkbox_otherNoteList';
                idArr['moreNote']='checkbox_moreNote';
                idArr['getOtherNote']='checkbox_getOtherNote';
                idArr['otherTxt']='checkbox_otherTxt';
                idArr['refresh']='checkbox_refresh';
                break;
            case 'A3TEST':
                if (subTestType === '不定项' || subTestType === '多项') {
                    //以下，题干信息ID
                    idArr['styleExplain'] = 'A3_checkbox_styleExplain_';
                    idArr['curPageNum'] = 'A3_checkbox_curPageNum_';
                    idArr['totalPageNum'] = 'A3_checkbox_totalPageNum_';
                    idArr['frontTitle'] = 'A3_checkbox_testTitle_';//主标题
                    idArr['testTitle'] = 'A3_checkbox_a3test_';//小标题
                	idArr['testPoint'] = 'A3_checkbox_testPoint_';
                    //题干结束
                    idArr['itemUiID'] = 'A3_checkbox_Items_'
                    idArr['itemID'] = 'A3_checkbox_items_';
                    idArr['itemNameID'] = 'A3_checkbox_';
                    idArr['itemTextID'] = 'A3_checkbox_itemText_';
                    idArr['resultID'] = 'A3_checkbox_result';
                    idArr['buttonID'] = 'A3_checkbox_btn';
                    idArr['pageNumID']  = 'A3_checkbox_pageNum';
                    idArr['divBtnID'] = 'A3_checkbox_moveNextDiv';
                    idArr['noteCountDivID'] ='A3_checkbox_noteCount';
                    idArr['myNoteID'] ='A3_checkbox_myNote';
                    idArr['timeID'] ='A3_checkbox_time';
                    idArr['operate'] = 'A3_checkbox_operate';
                    idArr['answerDiv'] = 'A3_checkbox_answer';
                    idArr['explainDiv'] = 'A3_checkbox_explain';
                    //他人笔记
                    idArr['otherNoteCount']='A3_checkbox_otherNoteCount';
                    idArr['otherNoteList']='A3_checkbox_otherNoteList';
                    idArr['moreNote']='A3_checkbox_moreNote';
                    idArr['getOtherNote']='A3_checkbox_getOtherNote';
                    idArr['otherTxt']='A3_checkbox_otherTxt';
                    idArr['refresh']='A3_checkbox_refresh';
                } else if (subTestType === '单项') {
                    //以下，题干信息ID
                    idArr['styleExplain'] = 'A3_radio_styleExplain_';
                    idArr['curPageNum'] = 'A3_radio_curPageNum_';
                    idArr['totalPageNum'] = 'A3_radio_totalPageNum_';
                    idArr['frontTitle'] = 'A3_radio_testTitle_';//主标题
                    idArr['testTitle'] = 'A3_radio_a3test_';//小标题
                	idArr['testPoint'] = 'A3_radio_testPoint_';
                    //题干结束
                    idArr['itemUiID'] = 'A3_radio_Items_'
                    idArr['itemID'] = 'A3_radio_items_';
                    idArr['itemNameID'] = 'A3_radio_';
                    idArr['itemTextID'] = 'A3_radio_itemText_';
                    idArr['resultID'] = 'A3_radio_result';
                    idArr['pageNumID']  = 'A3_radio_pageNum';
                    idArr['divBtnID'] = 'A3_radio_moveNextDiv';
                    idArr['noteCountDivID'] ='A3_radio_noteCount';
                    idArr['myNoteID'] ='A3_radio_myNote';
                    idArr['timeID'] ='A3_radio_time';
                    idArr['operate'] = 'A3_radio_operate';
                    idArr['answerDiv'] = 'A3_radio_answer';
                    idArr['explainDiv'] = 'A3_radio_explain';
                    //他人笔记
                    idArr['otherNoteCount']='A3_radio_otherNoteCount';
                    idArr['otherNoteList']='A3_radio_otherNoteList';
                    idArr['moreNote']='A3_radio_moreNote';
                    idArr['getOtherNote']='A3_radio_getOtherNote';
                    idArr['otherTxt']='A3_radio_otherTxt';
                    idArr['refresh']='A3_radio_refresh';
                } else {
                    G_Prg.throw('程序运行错误，TestUI._setID： A3 subTestType = "' + subTestType + '",无法解析数据');
                }
                break;
            case 'BTEST':
                if (subTestType === '不定项' || subTestType === '多项') {
                    //以下，题干信息ID
                    idArr['styleExplain'] = 'B_checkbox_styleExplain_';
                    idArr['curPageNum'] = 'B_checkbox_curPageNum_';
                    idArr['totalPageNum'] = 'B_checkbox_totalPageNum_';
                    idArr['testTitle'] = 'B_checkbox_testTitle_';
                	idArr['testPoint'] = 'B_checkbox_testPoint_';
                    //题干信息结束
                    idArr['itemUiID'] = 'B_checkbox_Items_'
                    idArr['itemID'] = 'B_checkbox_items_';
                    idArr['itemNameID'] = 'B_checkbox_';
                    idArr['itemTextID'] = 'B_checkbox_itemText_';
                    idArr['resultID'] = 'B_checkbox_result';
                    idArr['buttonID'] = 'B_checkbox_btn';
                    idArr['pageNumID']  = 'B_checkbox_pageNum';
                    idArr['divBtnID'] = 'B_checkbox_moveNextDiv';
                    idArr['noteCountDivID'] ='B_checkbox_noteCount';
                    idArr['myNoteID'] ='B_checkbox_myNote';
                    idArr['timeID'] ='B_checkbox_time';
                    idArr['operate'] = 'B_checkbox_operate';
                    idArr['answerDiv'] = 'B_checkbox_answer';
                    idArr['explainDiv'] = 'B_checkbox_explain';
                    //他人笔记
                    idArr['otherNoteCount']='B_checkbox_otherNoteCount';
                    idArr['otherNoteList']='B_checkbox_otherNoteList';
                    idArr['moreNote']='B_checkbox_moreNote';
                    idArr['getOtherNote']='B_checkbox_getOtherNote';
                    idArr['otherTxt']='B_checkbox_otherTxt';
                    idArr['refresh']='B_checkbox_refresh';
                } else if (subTestType === '单项') {
                    //以下，题干信息ID
                    idArr['styleExplain'] = 'B_radio_styleExplain_';
                    idArr['curPageNum'] = 'B_radio_curPageNum_';
                    idArr['totalPageNum'] = 'B_radio_totalPageNum_';
                    idArr['testTitle'] = 'B_radio_testTitle_';
                	idArr['testPoint'] = 'B_radio_testPoint_';
                    //题干信息结束
                    idArr['itemUiID'] = 'B_radio_Items_'
                    idArr['itemID'] = 'B_radio_items_';
                    idArr['itemNameID'] = 'B_radio_';
                    idArr['itemTextID'] = 'B_radio_itemText_';
                    idArr['resultID'] = 'B_radio_result';
                    idArr['pageNumID']  = 'B_radio_pageNum';
                    idArr['divBtnID'] = 'B_radio_moveNextDiv';
                    idArr['noteCountDivID'] ='B_radio_noteCount';
                    idArr['myNoteID'] ='B_radio_myNote';
                    idArr['timeID'] ='B_radio_time';
                    idArr['operate'] = 'B_radio_operate';
                    idArr['answerDiv'] = 'B_radio_answer';
                    idArr['explainDiv'] = 'B_radio_explain';
                    //他人笔记
                    idArr['otherNoteCount']='B_radio_otherNoteCount';
                    idArr['otherNoteList']='B_radio_otherNoteList';
                    idArr['moreNote']='B_radio_moreNote';
                    idArr['getOtherNote']='B_radio_getOtherNote';
                    idArr['otherTxt']='B_radio_otherTxt';
                    idArr['refresh']='B_radio_refresh';
                } else {
                    G_Prg.throw('程序运行错误，TestUI._setID：B subTestType = "' + subTestType + '",无法解析数据');
                }
                break;
            case 'PDTEST':
                //以下，题干信息ID
                idArr['styleExplain'] = 'pd_styleExplain_';
                idArr['curPageNum'] = 'pd_curPageNum_';
                idArr['totalPageNum'] = 'pd_totalPageNum_';
                idArr['testTitle'] = 'pd_testTitle_';
                idArr['testPoint'] = 'pd_testPoint_';
                //题干信息结束
                idArr['itemUiID'] = 'pd_radio_Items_'
                idArr['itemID'] = 'pd_radio_items_';
                idArr['itemNameID'] = 'pd_radio_';
                idArr['itemTextID'] = 'pd_radio_itemText_';
                idArr['resultID'] = 'pd_result';
                idArr['pageNumID']  = 'pd_pageNum';
                idArr['divBtnID'] = 'pd_moveNextDiv';
                idArr['noteCountDivID'] ='pd_noteCount';
                idArr['myNoteID'] ='pd_myNote';
                idArr['timeID'] ='pd_time';
                idArr['operate'] = 'pd_operate';
                idArr['answerDiv'] = 'pd_answer';
                idArr['explainDiv'] = 'pd_explain';
                //他人笔记
                idArr['otherNoteCount']='pd_otherNoteCount';
                idArr['otherNoteList']='pd_otherNoteList';
                idArr['moreNote']='pd_moreNote';
                idArr['getOtherNote']='pd_getOtherNote';
                idArr['otherTxt']='pd_otherTxt';
                idArr['refresh']='pd_refresh';
                break;
            case 'JDTEST':
                //以下，题干信息ID
                idArr['styleExplain'] = 'jd_styleExplain_';
                idArr['curPageNum'] = 'jd_curPageNum_';
                idArr['totalPageNum'] = 'jd_totalPageNum_';
                idArr['testTitle'] = 'jd_testTitle_';
                idArr['testPoint'] = 'jd_testPoint_';
                //题干信息结束
                idArr['textarea'] = 'jd_textarea';
                idArr['resultID'] = 'jd_result';
                idArr['answerID'] = 'jd_answer'
                idArr['buttonID'] = 'jd_btn';
                idArr['pageNumID']  = 'jd_pageNum';
                idArr['divBtnID'] = 'jd_moveNextDiv';
                idArr['noteCountDivID'] ='jd_noteCount';
                idArr['myNoteID'] ='jd_myNote';
                idArr['timeID'] ='jd_time';
                idArr['operate'] = 'jd_operate';
                idArr['answerDiv'] = 'jd_answer';
                idArr['explainDiv'] = 'jd_explain';
                //他人笔记
                idArr['otherNoteCount']='jd_otherNoteCount';
                idArr['otherNoteList']='jd_otherNoteList';
                idArr['moreNote']='jd_moreNote';
                idArr['getOtherNote']='jd_getOtherNote';
                idArr['otherTxt']='jd_otherTxt';
                idArr['refresh']='jd_refresh';
                break;
            case 'TKTEST':
                //以下，题干信息ID
                idArr['styleExplain'] = 'tk_styleExplain_';
                idArr['curPageNum'] = 'tk_curPageNum_';
                idArr['totalPageNum'] = 'tk_totalPageNum_';
                idArr['testTitle'] = 'tk_testTitle_';
                idArr['testPoint'] = 'tk_testPoint_';
                //题干信息结束
				idArr['itemOlID'] = 'tk_Items_';
				idArr['itemTextID'] = 'tk_itemsText_';
				idArr['itemID'] = 'tk_items_';
                idArr['resultID'] = 'tk_result';
                idArr['answerID'] = 'tk_answer'
                idArr['buttonID'] = 'tk_btn';
                idArr['pageNumID']  = 'tk_pageNum';
                idArr['divBtnID'] = 'tk_moveNextDiv';
                idArr['noteCountDivID'] ='tk_noteCount';
                idArr['myNoteID'] ='tk_myNote';
                idArr['timeID'] ='tk_time';
                idArr['operate'] = 'tk_operate';
                idArr['answerDiv'] = 'tk_answer';
                idArr['explainDiv'] = 'tk_explain';
                //他人笔记
                idArr['otherNoteCount']='tk_otherNoteCount';
                idArr['otherNoteList']='tk_otherNoteList';
                idArr['moreNote']='tk_moreNote';
                idArr['getOtherNote']='tk_getOtherNote';
                idArr['otherTxt']='tk_otherTxt';
                idArr['refresh']='tk_refresh';
                break;
            default:
                G_Prg.throw('程序运行错误，TestUI._setID：testType = "' + testType + '",无法解析数据');
        }
        return idArr;
    }
    /********************************************************************************
     函数名：_showTopic
     功能：显示试题题干（标题）
     输入参数：curTest 当前试题；idArr 试题所在标签的id数组
     返回值: 无
     创建信息：黎萍（2014-09-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _showTopic(curTest, idArr,dragIndex) {
        if(_IsShowTopic){
            G_Prg.$(idArr['styleExplain']  + dragIndex).innerHTML = curTest.testStyle;//题型
            G_Prg.$(idArr['curPageNum']  + dragIndex).innerHTML = ((_curPage - 1) * 50 + curTest.testNO);	//当前试题编号
            G_Prg.$(idArr['totalPageNum']  + dragIndex).innerHTML = _gAllTest.getTestCount();	//试题总数
            if(idArr['frontTitle']){
                G_Prg.$(idArr['frontTitle'] + dragIndex).innerHTML = ((_curPage - 1) * 50 + curTest.testNO)  + '、' + curTest.frontTitle; //标题
                G_Prg.$(idArr['testTitle']  + dragIndex).innerHTML  = curTest.title; //小标题;
            }else{
                G_Prg.$(idArr['testTitle']  + dragIndex).innerHTML = ((_curPage - 1) * 50 + curTest.testNO)  + '、' + curTest.title ; //标题
            }
        }else{
            G_Prg.$(idArr['styleExplain']  + dragIndex).style.display = 'none';//题型
            G_Prg.$(idArr['curPageNum']  + dragIndex).style.display = 'none';	//当前试题编号
            G_Prg.$(idArr['totalPageNum']  + dragIndex).style.display = 'none';	//试题总数
            if(idArr['frontTitle']){
                G_Prg.$(idArr['frontTitle'] + dragIndex).style.display = 'none';
            }
            G_Prg.$(idArr['testTitle']  + dragIndex).style.display = 'none';
        }
    }
    /********************************************************************************
     函数名：_showItems
     功能：显示试题的选项
     输入参数：curTest 当前试题；idArr 试题所在标签的id数组
     返回值: 无
     创建信息：黎萍（2014-09-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _showItems(curTest, idArr,dragIndex) {
        var selectedItems = curTest.selectedItems;
        var testType = curTest.testType; //试题类型
        var subTestType = curTest.subTestType; //针对A3和B题型的小题的试题类型进行定义
        for (var i = 0; i < selectedItems.length; i++) {
            G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display = 'block';
            if(testType === 'XTEST' || subTestType === '不定项' || subTestType === '多项' ){
                G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).className = 'checkboxDefaultImg'; //指定选项前面图标类样式
            } else if (testType === 'ATEST' || testType === 'PDTEST' || subTestType === '单项') {
                G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).className = 'radioDefaultImg'; //指定选项前面图标类样式
            }
           // G_Prg.$(idArr['itemTextID'] + i + '_' + dragIndex).className = _fontColor; //默认选项文字颜色样式
            if(curTest.testType !=='PDTEST'){
                G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).lang = selectedItems[i].ItemName;
                G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).innerHTML = selectedItems[i].ItemName + '.' + selectedItems[i].Content.replace(/(^\s+)|(\s+$)/g,"");//去掉前后空格
                      
            }
        }
        var arrLen = G_Prg.$(idArr['itemUiID'] + dragIndex).getElementsByTagName('li').length;
        for (var i = selectedItems.length; i < arrLen; i++) {
            G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display = 'none'; //隐藏没有赋值到的选项
        }
        if (_IsShowItems) {
            for (var i = 0; i < selectedItems.length; i++) {
                G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display = 'block';
            }
        }else{
            for (var i = 0; i < selectedItems.length; i++) {
                G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display = 'none';
            }
            var arrLen = G_Prg.$(idArr['itemUiID'] + dragIndex).getElementsByTagName('li').length;
            for (var i = selectedItems.length; i < arrLen; i++) {
                G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display = 'none'; //隐藏没有赋值到的选项
            }
        }
    }
    /********************************************************************************
     函数名：_showResult
     功能：显示试题的正确答案和试题解析
     输入参数：curTest 当前试题；idArr 试题所在标签的id数组
     返回值: 无
     创建信息：黎萍（2014-09-04）
     修改记录：谢建沅 答案去掉滚动条控制（2014-09-26）
     审查人：无
     *******************************************************************************/
    function _showResult(curTest, idArr,dragIndex) {
//        if((curTest.explain).indexOf('<img') >= 0){
//            G_Prg.$(idArr['resultID'] + '_' +dragIndex).style.overflowX = 'auto';
//        }
        G_Prg.$(idArr['answerDiv'] + '_'+dragIndex).innerHTML = '答案：' + curTest.answer; //答案
        G_Prg.$(idArr['explainDiv'] + '_'+dragIndex).innerHTML = '解析：' + curTest.explain; //解析
        G_Prg.$(idArr['testPoint'] + dragIndex).innerHTML = '考点：' + curTest.testPoint; //考点
        if(curTest.explain === '无'){
            G_Prg.$(idArr['explainDiv']+ '_'+dragIndex).style.display = 'none'; //隐藏试题解析
        }else{
            G_Prg.$(idArr['explainDiv']+ '_'+dragIndex).style.display = 'block'; //隐藏试题解析
        }
		if(curTest.testPoint === '无'){
			G_Prg.$(idArr['testPoint']+ dragIndex).style.display = 'none';
        }else{
			G_Prg.$(idArr['testPoint']+ dragIndex).style.display = 'block';
        }
        if (_IsShowExplain) {
            G_Prg.$(idArr['resultID']+ '_' + dragIndex).style.display = 'block';
			/*if(curTest.explain === '无'){	//在解析为无时，上一句代码将其显示了，会显示出一掉边框线的，在此将线隐藏掉
				G_Prg.$(idArr['resultID']+ '_' + dragIndex).style.display = 'none';	
			}*/
			if (_appEName === 'ZY_HS' || _appEName === 'ZY_LC' || _appEName === 'ZY_LC_ZL') {
				G_Prg.$('moreBtn_'+dragIndex).style.marginBottom = '70px';
			}else{
				G_Prg.$('moreBtn_'+dragIndex).style.marginBottom = '0px';
			}
        }else{
            G_Prg.$(idArr['resultID']+ '_' + dragIndex).style.display = 'none';
        }
		if(_fromUrl === 'simulatedExam.html' && _selected === 1){
            G_Prg.$(idArr['resultID']+ '_' + dragIndex).style.display = 'none';
		}
		if(_gAllTest.getState(curTest.testNO-1) !== 'recite'){
            G_Prg.$(idArr['answerDiv'] + '_'+dragIndex).style.display = 'block';
        }
		G_Prg.$(idArr['resultID']+ '_' + dragIndex).style.marginBottom = '8px';
    }
    /********************************************************************************
     函数名：_showUserNote
     功能：显示试题的笔记
     输入参数：curTest 当前试题；idArr 试题所在标签的id数组
     返回值: 无
     创建信息：黎萍（2014-09-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _showUserNote(curTest, idArr,dragIndex) {
        var noteCountDivID=idArr['noteCountDivID']+'_'+dragIndex;
        if(!_IsShowNote || (_blurFlag === 'blur' && _gAllTest.getAction(curTest.testNO-1) !== 'addNote')){
            G_Prg.$(noteCountDivID).style.display = 'none';
            return;
        }
        var myNoteID=idArr['myNoteID']+'_'+dragIndex;
        var timeID=idArr['timeID']+'_'+dragIndex;
        var arrAllTest = _gAllTest.getArrAllTest();
        var userNote = _gAllTest.getUserNote(curTest.testNO-1);
        var time=_gAllTest.getTime(curTest.testNO-1);
        if(userNote===''){
            userNote=curTest.userNote;
            time=curTest.time;
        }
        if(userNote){
            G_Prg.$(myNoteID).innerHTML = userNote.replace(new RegExp('\\[br\\]','gm'),'<br>');
            G_Prg.$(timeID).innerHTML = time;
            G_Prg.$(noteCountDivID).style.display = 'block';
            return;
        }
        G_Prg.$(noteCountDivID).style.display = 'none';
        G_Prg.$(myNoteID).innerHTML ='';
    }
    /********************************************************************************
    函数名：_showOtherUserNote
    功能：显示他人笔记
    输入参数：curTest 当前试题, idArr 存储试题信息层所在id的伪哈希表 , curPage 当前页码，dragIndex 滑动层ID
    返回值：无
    创建信息：韦友爱（2014-09-18）
    修改记录：无
    审查人：无
    *******************************************************************************/
    function _showOtherUserNote(curTest, idArr, curPage,dragIndex){
        var getOtherNote=idArr['getOtherNote']+'_'+dragIndex;//点击查看他人笔记按钮
        var otherNoteDiv=idArr['otherNoteCount']+'_'+dragIndex;//他人笔记内容框
        if((!_IsShowOtherNote&&!curPage) || _gAllTest.getSelected(curTest.testNO-1) === 1){//当前状态不显示其他用户笔记
            G_Prg.$(otherNoteDiv).style.display = 'none';
            G_Prg.$(getOtherNote).style.display = 'none';
            return;
        }
		if(_fromUrl === 'simulatedExam.html' && (_selected === 1 || _gAllTest.getSelected(curTest.testNO-1) === 1)){
			if(_gAllTest.getAction(curTest.testNO-1) === 'addNote'){
				//如果用户先进行笔记添加，再答题，则控制笔记的显示
				return;
			}
            G_Prg.$(getOtherNote).style.display = 'none';
            G_Prg.$(otherNoteDiv).style.display = 'none';
            return;
		}
        //点击‘查看他人笔记’，控制最后一题批阅按钮与答题按钮的切换
		if(_gAllTest.getState(curTest.testNO-1) === 'recite'){//背题模式
			_hiddenTestSelects(curTest,dragIndex);
		}
		//在最后一题，单击‘查看他人笔记’控制显示批阅按钮
		if(_gAllTest.getState(curTest.testNO-1) !== 'recite'&&curTest.testNO === _gAllTest.getTestCount() && G_Cookie.getUserID() && _checkIsBuySoft()){
			_controlBtn(curTest,dragIndex);
		}
        if(!_gAllTest.isShowOtherNote(curTest.testNO-1)){
        //之前是否获取过当前题大家的笔记，未获取过，则显示“点击查看大家的笔记”按钮
            G_Prg.$(otherNoteDiv).style.display = 'none';
            G_Prg.$(getOtherNote).style.display = 'block';
            G_Prg.$(getOtherNote).onclick = function(){
               // G_Prg.$(getOtherNote).style.display = 'none';
                _getOtherNoteClick(curTest,this.id);
            };
            return;
        }
        G_Prg.$(getOtherNote).style.display = 'none';
        G_Prg.$(otherNoteDiv).style.display = 'block';
        var listID=idArr['otherNoteList']+'_'+dragIndex;//他人笔记列表
        var moreNoteID=idArr['moreNote']+'_'+dragIndex;//加载更多别人笔记按钮
        var otherTxt=idArr['otherTxt']+'_'+dragIndex;
        var refresh=idArr['refresh']+'_'+dragIndex;//刷新按钮
        if(G_Cookie.getNightMode()){
            G_Prg.$(refresh).style.color='#fff';
        }else{
            G_Prg.$(refresh).style.color='#000';
        }
        G_Prg.$(refresh).onclick=function(){
            _refreshClick(curTest);
        };
        G_Prg.$(refresh).className='refresh';//指定默认的class
        G_Prg.$(listID).className='otherNoteList';
        var otherUserNote=_gAllTest.getOtherUserNote(curTest,curTest.testNO-1,curPage);
        if(!otherUserNote||!otherUserNote.noteCount){//无其他用户笔记内容
            G_Prg.$(otherTxt).style.display='none';//无他人的笔记，隐藏‘别人的笔记：’提示
            G_Prg.$(listID).innerHTML='暂无他人笔记！';
			G_Prg.$(otherNoteDiv).style.marginTop = '18px'
			G_Prg.$(otherNoteDiv).style.marginBottom = '15px';
            G_Prg.$(listID).className='otherNoteList1';
            G_Prg.$(refresh).className='refresh1';
            G_Prg.$(moreNoteID).style.display = 'none';
            return;
        }
        G_Prg.$(otherTxt).style.display='block';
        var arrUserNote=otherUserNote.arrUserNote;
        var noteCount=otherUserNote.noteCount;
        if(arrUserNote.length<noteCount){//当前显示的笔记不是全部
            G_Prg.$(moreNoteID).style.display='block';
            G_Prg.$(moreNoteID).onclick=function(){
                _showOtherUserNote(curTest, idArr, curPage+1,dragIndex);
            };
        }else{
            G_Prg.$(moreNoteID).style.display='none';
        }
        _createOtherNoteList(arrUserNote,listID);//生成列表
		G_Prg.$(otherNoteDiv).style.marginBottom = '15px';
		G_Prg.$(otherNoteDiv).style.marginTop = '15px';
    }
    /********************************************************************************
    函数名：_refreshClick
    功能：刷新按钮点击事件
    输入参数：curTest 当前试题
    返回值: 无
    创建信息：韦友爱（2014-10-08）
    修改记录：无
    审查人：无
    *******************************************************************************/
    function _refreshClick(curTest){
        _gAllTest.setOtherNote(curTest.testNO-1);
        _gAllTest.getOtherUserNote(curTest,curTest.testNO-1,0);
        _showCurTest(curTest, _gFlipsnap.currentPoint);
		G_Prg.popMsg('刷新成功');
    }
    /********************************************************************************
    函数名：_getOtherNoteClick
    功能：查看大家的笔记按钮点击事件
    输入参数：curTest 当前试题
    返回值: 无
    创建信息：韦友爱（2014-10-08）
    修改记录：无
    审查人：无
    *******************************************************************************/
    function _getOtherNoteClick(curTest,id){
        if(!G_Cookie.getUserID()){
            var _yesCallback = function () {
                window.location.href = 'userLogin.html?fromUrl=doExam.html&cptName='+G_Prg.getQueryString('cptName',true);
            }
            G_Prg.confirm('该功能请登录后使用！', _yesCallback);
            return;
        }
         G_Prg.$(id).style.display = 'none';
        _gAllTest.getOtherUserNote(curTest,curTest.testNO-1,0);
        _showCurTest(curTest, _gFlipsnap.currentPoint);
    }
    /********************************************************************************
    函数名：_createOtherNoteList
    功能：动态生成大家的笔记列表
    输入参数：arrUserNote 大家的笔记数组,listID 列表ID
    返回值: 无
    创建信息：韦友爱（2014-10-08）
    修改记录：无
    审查人：无
    *******************************************************************************/
    function _createOtherNoteList(arrUserNote,listID){
        G_Prg.$(listID).innerHTML='';//清空列表
        for(var i=0;i<arrUserNote.length;i++){//生成列表
            var liTag=document.createElement('div');
            var noteDiv=document.createElement('div');
            noteDiv.className='otherNote';
			noteDiv.innerHTML=arrUserNote[i].userNote.replace(new RegExp('\\[br\\]','gm'),'<br>');
            var timeDiv=document.createElement('div');
            timeDiv.innerHTML=G_Prg.datetimeFormat(new Date(arrUserNote[i].noteTime), 'MM月dd日');
            timeDiv.className='noteTime';
			liTag.className = 'noteTxt';
            liTag.appendChild(noteDiv);
            liTag.appendChild(timeDiv);
            G_Prg.$(listID).appendChild(liTag);
        }
    }
    /********************************************************************************
     函数名：_showRadioTest
     功能：组合拼接单选试题（ATEST、PDTEST、单项）
     输入参数：curTest 当前试题
     返回值: 无
     创建信息：黎萍（2014-09-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _showRadioTest(curTest,dragIndex) {
        var idArr = _setID(curTest);
        _showTopic(curTest, idArr,dragIndex);
        _showItems(curTest, idArr,dragIndex);
        _showResult(curTest, idArr,dragIndex);
        _showUserNote(curTest, idArr,dragIndex);	//显示用户笔记
        _showOtherUserNote(curTest, idArr, 0,dragIndex);
        _mockRadioDone(curTest,idArr,dragIndex);
        _radioRightAnswer(curTest,idArr,dragIndex);	//批阅：未答试题显示正确答案
        _radioDone(curTest, idArr,dragIndex);	//答题：显示用户所答是否正确
    }
    /********************************************************************************
     函数名：_showCheckboxTest
     功能：组合拼接多选试题（XTEST、多项、不定项）
     输入参数：curTest 当前试题
     返回值: 无
     创建信息：黎萍（2014-09-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _showCheckboxTest(curTest,dragIndex) {
        var idArr = _setID(curTest);
        _showTopic(curTest, idArr,dragIndex);
        _showItems(curTest, idArr,dragIndex);
        _showResult(curTest, idArr,dragIndex);
        _showUserNote(curTest, idArr,dragIndex);	//显示用户笔记
        _showOtherUserNote(curTest, idArr, 0,dragIndex);
        _mockCheckboxDone(curTest,idArr,dragIndex);	//答题：用户仅选择了答案并未提交答案
        _checkboxRightAnswer(curTest,idArr,dragIndex);	//批阅：未答试题显示正确答案
        _checkboxDone(curTest, idArr,dragIndex);  //答题：显示用户所答是否正确
    }
    /********************************************************************************
     功能：组合拼接主观试题（简答题、填空题）
     输入参数：curTest 当前试题,dragIndex滑动层索引
     返回值: 无
     最后修改人：黎萍（2015-01-07）
     修改内容：无
     *******************************************************************************/
    function _subjectiveTest(curTest,dragIndex) {
        var idArr = _setID(curTest);
        _showTopic(curTest, idArr,dragIndex);
		//如果是填空题，则根据答案控制输入框的显示
		if(curTest.testType === 'TKTEST'){
			var answerArr = '';
			var answer = curTest.answer;
			if(answer.indexOf('<img') < 0){
				answerArr = curTest.answer.split('；');	
			}else{
				answerArr = [curTest.answer];	
			}
			var arrLen = G_Prg.$(idArr['itemOlID'] + dragIndex).getElementsByTagName('li').length;
			for(var i = 0;i < arrLen; i++){
				if(i < answerArr.length){
					G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display = '';
					G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).value = '';
				} else{
					G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display = 'none';
				}
			}
			_mockTkDone(curTest,idArr,dragIndex);
		}
        _showResult(curTest, idArr,dragIndex);
        _showUserNote(curTest, idArr,dragIndex);	//显示用户笔记
        _showOtherUserNote(curTest, idArr, 0,dragIndex);
        _textInputed(curTest, idArr,dragIndex);  //答题：显示用户所答是否正确
    }

    /********************************************************************************
     函数名：_showATest
     功能：ATEST题型的试题展示
     输入参数: curTeset 当前试题;
     返回值: 无
     创建信息：黎萍（2014-05-30）
     修改记录：黎萍（2014-09-04） 修改解析展示试题方式
     审查人：兰涛（2014-06-26）
     *******************************************************************************/
    function _showATest(curTest,dragIndex) {
        _showRadioTest(curTest,dragIndex);
        G_Prg.$('radio_exam_'+dragIndex).style.display = 'block';
    }
    /********************************************************************************
     函数名：_showXTest
     功能：XTEST题型的试题展示
     输入参数: curTeset 当前试题;
     返回值: 无
     创建信息：黎萍（2014-05-30）
     修改记录：黎萍（2014-09-04） 修改解析展示试题方式
     审查人：兰涛（2014-06-26）
     *******************************************************************************/
    function _showXTest(curTest,dragIndex) {
        _showCheckboxTest(curTest,dragIndex);
        G_Prg.$('checkbox_exam_'+dragIndex).style.display = 'block';
    }
    /********************************************************************************
     函数名：_showA3Test
     功能：A3TEST题型的试题展示
     输入参数: curTeset 当前试题;
     返回值: 无
     创建信息：黎萍（2014-05-30）
     修改记录：黎萍（2014-09-04） 修改解析展示试题方式
     审查人：兰涛（2014-06-26）
     *******************************************************************************/
    function _showA3Test(curTest,dragIndex) {
        var subTestType = curTest.subTestType;
        if (subTestType === '多项' || subTestType === '不定项') {
            _showCheckboxTest(curTest,dragIndex);
            G_Prg.$('A3_checkbox_exam_'+dragIndex).style.display = 'block';
        } else if (subTestType === '单项') {
            _showRadioTest(curTest,dragIndex);
            G_Prg.$('A3_radio_exam_'+dragIndex).style.display = 'block';
        } else {
            G_Prg.throw('程序运行错误，TestUI._showA3Test：subTestType = "' + subTestType + '"，无法解析题型');
        }
    }
    /********************************************************************************
     函数名：_showBTest
     功能：BTEST题型的试题展示
     输入参数: curTeset 当前试题;
     返回值: 无
     创建信息：黎萍（2014-05-30）
     修改记录：黎萍（2014-09-04） 修改解析展示试题方式
     审查人：兰涛（2014-06-26）
     *******************************************************************************/
    function _showBTest(curTest,dragIndex) {
        var subTestType = curTest.subTestType;
        if (subTestType === '多项' || subTestType === '不定项') {
            _showCheckboxTest(curTest,dragIndex);
            G_Prg.$('B_checkbox_exam_'+dragIndex).style.display = 'block';
        } else if (subTestType === '单项') {
            _showRadioTest(curTest,dragIndex);
            G_Prg.$('B_radio_exam_'+dragIndex).style.display = 'block';
        } else {
            G_Prg.throw('程序运行错误，TestUI._showBTest：subTestType = "' + subTestType + '"，无法解析题型');
        }
    }
    /********************************************************************************
     函数名：_showPDTest
     功能：PDTEST题型的试题展示
     输入参数: curTeset 当前试题;
     返回值: 无
     创建信息：黎萍（2014-05-30）
     修改记录：黎萍（2014-09-04） 修改解析展示试题方式
     审查人：兰涛（2014-06-26）
     *******************************************************************************/
    function _showPDTest(curTest,dragIndex) {
        _showRadioTest(curTest,dragIndex);
        G_Prg.$('pd_exam_'+dragIndex).style.display = 'block';
    }
    /********************************************************************************
     函数名：_showJDTest
     功能：JDTEST题型的试题展示
     输入参数: curTeset 当前试题;
     返回值: 无
     创建信息：黎萍（2014-05-30）
     修改记录：黎萍（2014-09-04） 修改解析展示试题方式
     审查人：兰涛（2014-06-26）
     *******************************************************************************/
    function _showJDTest(curTest,dragIndex) {
        G_Prg.$('jd_textarea_'+dragIndex).value = '';
        _subjectiveTest(curTest,dragIndex);
        G_Prg.$('jd_exam_'+dragIndex).style.display = 'block';
    }
    /********************************************************************************
     函数名：_showTKTest
     功能：TKTEST题型的试题展示
     输入参数: curTeset 当前试题;
     返回值: 无
     创建信息：黎萍（2014-05-30）
     修改记录：黎萍（2014-09-04） 修改解析展示试题方式
     审查人：兰涛（2014-06-26）
     *******************************************************************************/
    function _showTKTest(curTest,dragIndex) {
		var idArr = _setID(curTest);
		var arrLen = G_Prg.$(idArr['itemOlID'] + dragIndex).getElementsByTagName('li').length;
		for(var i = 0;i < arrLen; i++){
			G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).value = '';
		}
        _subjectiveTest(curTest,dragIndex);
        G_Prg.$('tk_exam_'+dragIndex).style.display = 'block';
    }
     
    /********************************************************************************
     函数名：_showExplain
     功能：显示试题题型解释
     输入参数: curTeset 当前试题，typeExplain 包含题型以及该题型结束题号的数组
     返回值: 无
     创建信息：韦友爱（2014-08-06）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _showExplain(curTest, isClick) {
        for (var i = 0; i < _arrTypeExplain.length; i++) {
            var startNO = _arrTypeExplain[i].startNO;
            var endNO = _arrTypeExplain[i].endNO;
            if (_arrTypeExplain[i].type === curTest.testType) {
                var explain=curTest.styleExplain;
				if(!explain){
				     break;	
				}
                var startSubstr=explain.indexOf('(');
                if(startSubstr!==-1){
                    var endSubstr=explain.indexOf(')');
                    explain='：' + explain.substr(startSubstr+1,endSubstr-startSubstr-1);
                }else{
                    var startSubstr=explain.indexOf('：');
                    if(startSubstr!==-1){
                        explain=explain.substr(startSubstr,explain.length);
                    }else{
                        explain='';
                    }
                    
                }
                if(isClick||(!isClick&&startNO === curTest.testNO)){
                    var eerorBox = document.getElementById('nrdvMsgBox');
                    if(eerorBox && eerorBox.style.display === 'block'){//判断是否有报错弹窗（被踢下线）
                        return;
                    } 
                    if(startNO===endNO){
                        G_Prg.popMsgDialog('<B>'+curTest.testStyle+'</B>' + explain);
                        return;
                    }
                    G_Prg.popMsgDialog('<B>'+curTest.testStyle+'</B>' + explain);
                    return;
                }
            }
        }
    }
	/********************************************************************************
     函数名：_showConfigJsonInfos
     功能：显示模拟考场配置信息
     输入参数:  无
     返回值: 无
     创建信息：黎萍（2014-10-22）
     修改记录：无
     审查人：无
     *******************************************************************************/
	function _showConfigJsonInfos(){
		if(_isEmpty(_gAllTest.getConfigJson())){
			return;	
		}
		var configJson = JSON.parse(_gAllTest.getConfigJson());
		var defaulted = G_Prg.getQueryString('defaulted');
		var name = configJson.ConfigTitle+'：';	//配置名称
		var testCount = 0;	//总题量
		var testScore = 0;	//总分数
		var testTotalInfos = '';
		var showInfos = '';
		var styleInfos = '';
		var arrStyles = new Object();
		
		if(defaulted === '1'){	//解析默认模拟考场配置
			var configItems = configJson.ConfigItems;
			for(var j = 0; j < configItems.length; j++){
				var styles = configItems[j].Styles;	
				for(var i = 0; i < styles.length; i++){
					if(Number(styles[i].TestNum) !== 0){
						testCount += Number(styles[i].TestNum);
						testScore += Number(styles[i].TestNum) * Number(styles[i].Score);
						var key = styles[i].Style.replace(/(^\s+)|(\s+$)/g,"");
						if(key in arrStyles){
							var value = arrStyles[key];
							arrStyles[key] = [value[0]+Number(styles[i].TestNum),Number(styles[i].Score)];	
						}else{
							arrStyles[key] = [Number(styles[i].TestNum),Number(styles[i].Score)];	
						}
					}
				}
			}
			for(var k in arrStyles){
				//styleInfos +=  k+ '：' + arrStyles[k][0] + '题 /'+ arrStyles[k][1] + '分<br/>';	
				styleInfos += '<div style="text-align:right; width:120px; float:left;">'+ k+ '：</div><div style="width:110px; float:left;">' + arrStyles[k][0] + '题 /'+ arrStyles[k][1] + '分</div>';	
			}
			//testTotalInfos += '总题量：'+ testCount+ '题 满分：'+ testScore + '分';
			testTotalInfos += '<div style="text-align:right; width:120px; float:left;">总题量：</div><div style="width:160px; float:left;">'+ testCount+ '题 满分：'+ testScore + '分</div>';
			G_Prg.popMsgDialog( testTotalInfos + styleInfos);
			G_Prg.$('popdvMsgBox').style.width = '280px';
		}/*else{	//解析用户自己的模拟考场配置
			var styles = configJson.ConfigItems[1].Styles;
			for(var i = 0; i < styles.length; i++){
				testCount += Number(styles[i].TestNum);
				testScore += (Number(styles[i].TestNum) * Number(styles[i].Score));
				styleInfos += styles[i].Style + '：' +styles[i].TestNum + '题 每题：'+ styles[i].Score + '分<br/>';
			}
		}*/
	}
	function _isEmpty(obj) { 
		for (var name in obj)  { 
			return false; 
		} 
		return true; 
	};
    /********************************************************************************
     函数名：_seClickEvent
     功能：设计做题页面中所有的按钮的单击事件
     输入参数:  无
     返回值: 无
     创建信息：黎萍（2014-05-29）
     修改记录：韦友爱（2014-07-02）添加收藏、取消收藏的单击事件
     修改记录：黎萍（2015-03-18）批阅之后禁止使用背题模式
               黎萍（2015-07-30）添加纠错单击事件
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _setClickEvent(curTest,dragIndex) {
        var sbjID = G_Prg.getQueryString('sbjID');
        var srcID = G_Prg.getQueryString('srcID');
        G_Prg.$('movePre').onclick = function () {
			G_UserAction.addUserAction('preBtn');
            _movePre();
        }; //Pre  上一题
        G_Prg.$('moveNext').onclick = function () {
			G_UserAction.addUserAction('nextBtn');
            _moveNext();
        }; //Next 下一题
		
		//点击背题模式，禁止再操作批阅，更改批阅按钮颜色
		if(_gAllTest.getState(curTest.testNO-1) === 'recite'){//背题模式
			G_Prg.$('markingImg').src = '../images/piyue_hui.PNG';
            G_Prg.$('marking').getElementsByTagName('span')[0].style.color = '#999';
		}else{
			G_Prg.$('marking').onclick = function () {
				G_UserAction.addUserAction('markBtn');
				G_Prg.$('testMenu').style.display = 'none';
				_markingClick();
			}; //批阅 单击事件设置
		}
		if(_gAllTest.getState(curTest.testNO-1) === 'recite'){//背题模式
			G_Prg.$('markingImg2').src = '../images/piyue_hui.PNG';
		}else{
			G_Prg.$('marking2').onclick = function () {
				G_UserAction.addUserAction('markBtn');
				G_Prg.$('testMenu').style.display = 'none';
				_markingClick();
			}; //批阅 单击事件设置
		}
        G_Prg.$('markingDiv_'+dragIndex).onclick = function () {
			G_UserAction.addUserAction('markDivBtn');
            _markingClick();
        }; //批阅 单击事件设置
        G_Prg.$('chaptername').onclick = function () {
			G_UserAction.addUserAction('exitExamBtn');
            _goBackDir('test',sbjID,srcID);
        }; //返回章节目录
        G_Prg.$('fav').onclick = function () {
			G_UserAction.addUserAction('addFavBtn');
            _addFav();
        }; //设置收藏按钮点击事件
        G_Prg.$('removeFav').onclick = function () {
			G_UserAction.addUserAction('removeFavBtn');
            _removeFav();
        }; //设置取消收藏按钮点击事件
        G_Prg.$('note').onclick = function () {
            _myNoteClick(dragIndex);
        }; //设置用户笔记按钮点击事件
        G_Prg.$('updateNote').onclick = function () {
            _updateNoteClick(dragIndex);
        }; //设置用户笔记按钮点击事件
        G_Prg.$('menuBar').onclick = function (event) {
			G_UserAction.addUserAction('moreActionBtn');
            _showTestMenuBar(dragIndex);
            //阻止冒泡
            event=event?event:window.event;
            event.stopPropagation();
            //用变量保存setTimeout事件，点击空白处时取消此事件
            /* _timeoutEvent = setTimeout(function () {
             //定时隐藏菜单栏
             if(G_Prg.$('testMenu').style.display === 'block'){
             G_Prg.$('testMenu').style.display = 'none';
             }
             },4000);*/
        };	//点击右上角图片，显示功能菜单栏
        G_Prg.$('titleCard').onclick = function () {
			G_UserAction.addUserAction('titleCardBtn');
            _showTitleCard(dragIndex);
        };	//显示题卡单击事件
        G_Prg.$('softSetting').onclick = function () {
			G_UserAction.addUserAction('settingBtn');
            G_Prg.$('testMenu').style.display = 'none';
            G_Prg.$('settingDialog').innerHTML = '';
            G_Prg.htmlContent('80%','250px','软件设置','',true);//弹出窗口，把html移动到弹出框，动态添加
            G_Prg.$('hcdialogBody').innerHTML = _setHtml;
            G_Prg.$('hcdvMsgBackBtn').style.display = 'none';
            G_Prg.$('hcdvMsgClose').style.display = 'block';
            G_Prg.$('hcShowBolightBox').onclick = function(){
				G_UserAction.addUserAction('backFromSetBtn');
				G_DialogContent.dispose();
			}	//软件设置，点击其它地方也能够消失
            _softSetting();
        }; //设置软件设置按钮点击事件
        G_Prg.$('testMenu').onclick = function (event) {
            event=event?event:window.event;
            event.stopPropagation();
        }; //点击设置菜单阻止事件冒泡
        G_Prg.$('retake').onclick = function () {
			G_UserAction.addUserAction('retakeBtn');
            _reloadTest(dragIndex);
        };	//重考单击事件
		G_Prg.$('retake2').onclick = function () {
			G_UserAction.addUserAction('retakeBtn');
            _reloadTest(dragIndex);
        };	//重考单击事件
        if(_fromUrl === 'simulatedExam.html' || !G_Cookie.getUserID() || _gAllTest.getState(curTest.testNO-1) === 'marked'){//模拟考场禁止使用背题模式
            G_Prg.$('reciteTest').onclick = function () {};	//背题单击事件
			G_Prg.$('reciteImg').src = '../images/beiti_hui.png';
            G_Prg.$('reciteTest').getElementsByTagName('span')[0].style.color = '#999';
        }else{
            G_Prg.$('reciteTest').onclick = function () {
				G_UserAction.addUserAction('reciteBtn');
                _reciteOrDoTest('recite');
            };	//背题单击事件
            G_Prg.$('doTest').onclick = function () {
				G_UserAction.addUserAction('doBtn');
                _reciteOrDoTest('do');
            };	//答题单击事件
        }

        var idArr=_setID(curTest);
        var styleExplain=idArr['styleExplain']+dragIndex;
        G_Prg.$(styleExplain).onclick=function(){
            _showExplain(curTest,1);
        };
    }
	/********************************************************************************
     _showQuestAndVideoBtn
     功能：背题模式和答题模式的功能设置
     输入参数:curTest 当前试题, dragIndex滑动拖动层索引
     返回值：无
     创建信息：黎萍（2015-05-12）
     修改记录：黎萍（2015-05-14）点击“章节视频”，如果是游客，提示游客去登录
                黎萍（2015-07-14）添加安卓封壳视频播放控制
     审查人：无
     *******************************************************************************/
	function _showQuestAndVideoBtn(curTest, dragIndex) {
		var videoBtn = G_Prg.$('videoBtn' + '_' + dragIndex);
		var simulated = G_Prg.getQueryString('simulated');
		var type = G_Prg.getQueryString('type');

        var version = G_Prg.getCookie('VERSION'); //获取版本号
		var clientType = G_Cookie.getClientType();
		if(version && clientType){
			version = version.replace('v','');
			version = parseFloat(version);
		}
		if (_gAllTest.getState(curTest.testNO - 1) === 'commited' || _gAllTest.getState(curTest.testNO - 1) === 'marked') {
			videoBtn.style.display = 'block';
			if (type === 'easyError'||_fromUrl === 'easyErrorTest.html' || (_fromUrl === 'simulatedExam.html' && simulated === '0')) {
				videoBtn.innerHTML = '视频讲解';
				videoBtn.onclick = function () {
                    if (version >= 5.65 && clientType === 'android') {
		                window.Video.VideoSrc('http://up.ksbao.com/jinyingjie/yhyc/'+curTest.allTestID+'.MP4');
                    }else{
					    window.location.href = 'video.html?fromUrl=doExam.html&type=easyError&videoName=' + curTest.allTestID + '&page=' + _curPage;
                    }
				};
			} else {
				videoBtn.onclick = function () {
					if (!G_Cookie.getUserID()) {
						var yesCallback = function () {
							window.location.href = 'userLogin.html';
						}
						G_Prg.confirm('该功能登录后才能使用！', yesCallback);
						return;
					}
					window.location.href = 'videoList.html?fromUrl=doExam.html&cptVideo=cptVideo&cptName=' + _title;
				};
			}
		} else {
			videoBtn.style.display = 'none';
			return;
		}
	}
    /********************************************************************************
     函数名：_reciteOrDoTest
     功能：背题模式和答题模式的功能设置
     输入参数:flag 标记是答题模式，还是背题模式
     返回值：无
     创建信息：黎萍（2015-03-18）
     修改记录：批阅之后禁止使用背题模式
     审查人：无
     *******************************************************************************/
    function _reciteOrDoTest(flag){
		/*//批阅之后禁止使用背题模式
		if(_gAllTest.getState(curTest.testNO-1) === 'marked'){//背题模式
			return;
		}*/
        if(flag === 'recite'){
			doTest = false;
            _gAllTest.setState('recite',1);
			_gAllTest.setAction('',1);
            G_Prg.$('testMenu').style.display = 'none';
            G_Prg.$('doTest').style.display = 'block';	//点击背题，显示答题按钮
            G_Prg.$('reciteTest').style.display = 'none';	//隐藏背题按钮
        }else if(flag === 'do'){
            _gAllTest.recoverState();
			doTest = true;
            G_Prg.$('testMenu').style.display = 'none';
            G_Prg.$('doTest').style.display = 'none';	//点击答题，显示背题按钮
            G_Prg.$('reciteTest').style.display = 'block';	//隐藏答题按钮
			G_Prg.$('markingImg').src = '../images/piyue-xiala.png';
			G_Prg.$('markingImg2').src = '../images/piyue-xiala.png';
            G_Prg.$('marking').getElementsByTagName('span')[0].style.color = '#fff';
            var arrAllTest = _gAllTest.getArrAllTest();
            //如果之前背题模式有点击了‘查看答案’，将其action清空
            for(var i = 0; i < arrAllTest.length; i++){
                //if(_gAllTest.getAction(i) === 'reciteWithAnswer'){
                    _gAllTest.setAction('',1);
					//_gAllTest.clearAction();
                //}
				if(_gAllTest.getState(i) === 'marked'){
					G_Prg.$('marking').style.display = 'none';
					G_Prg.$('retake').style.display = 'block';
				}else{
					G_Prg.$('marking').style.display = 'block';//显示批阅按钮	
				}
            }
        }
        _gAllTest.move(_gAllTest.getCurIndex());	//跳转到指定试题
        _init(0);
        _setCss();
        _gFlipsnap.moveToPoint(_getDragIndexByTestIndex(),0);	//滑动到指定的层
    }
    /********************************************************************************
     函数名：_setTestEvent
     功能：设置选项的单击事件
     输入参数:buttonID 提交答案的按钮ID；answerID 用户输入内容所在的文本框的id； itemNameID 选项所在的a标签的ID; itemTextID 选项的文本内容所在的span标签的ID; resultID 显示正确答案和解题思路的div层的ID;
     返回值：无
     创建信息：黎萍（2014-06-06）
     修改记录：无
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _setTestEvent(curTest,dragIndex) {
        var idArr = _setID(curTest);
        var itemNameID = idArr['itemID']; //选项所在的a标签的ID
        var resultID = idArr['resultID']+'_'+dragIndex; //显示正确答案和解题思路的div层的ID
        var buttonID = idArr['buttonID']+'_'+dragIndex; //提交答案的按钮
        var answerID = idArr['answerID']+'_'+dragIndex; //简答题、填空题，正确答案的div层ID
        var pageNumID  = idArr['pageNumID']+'_'+dragIndex;	//显示当前试题编号和试题总数的div层ID
        var divBtnID = idArr['divBtnID']+'_'+dragIndex;	//下一题所在div层按钮ID
        var textarea = idArr['textarea']+'_'+dragIndex;
        var testType = curTest.testType; //试题类型
        var subTestType = curTest.subTestType; //针对A3和B题型的小题的试题类型进行定义
        var itemLen = curTest.selectedItems.length;
        if (testType === 'ATEST' || testType === 'PDTEST' || subTestType === '单项') {
            //设置radio的onclick事件
            for (var i = 0; i < itemLen; i++) {
                G_Prg.$(itemNameID + i+'_'+dragIndex).onclick = function () {
					//_checkSetAudio();	//功能：检测用户浏览器是否支持audio标签，根据不同的浏览器设置其支持的音乐格式
					G_UserAction.addUserAction('selItem');
                    if(_fromUrl !== 'simulatedExam.html'){
                        _radioClick(curTest,this.lang,dragIndex);
                    }else{
                        _radioSelected(curTest,itemNameID, this.lang,dragIndex);//如果是从模拟考场进入做题界面，更改单选题的单击事件
                    }
                };
                if(!_IsDisabled){
                    G_Prg.$(itemNameID + i+'_'+dragIndex).onclick = function () {};
                }
            }
        } else if (testType === 'XTEST' || subTestType === '不定项' || subTestType === '多项') {
            //设置复选框选择时的onclick事件
            for (var i = 0; i < itemLen; i++) {
                G_Prg.$(itemNameID + i+'_'+dragIndex).onclick = function () {
					G_UserAction.addUserAction('selItem');
                    _checkboxSelected(curTest,itemNameID, this.lang,dragIndex);
                };
                if(!_IsDisabled){	//批阅后禁止答题
                    G_Prg.$(itemNameID + i+'_'+dragIndex).onclick = function () {};
                }
            }
            if(_fromUrl !== 'simulatedExam.html'){
                //设置checkbox中button的onclick事件
                function _checkClick(){
                    for (var i = 0; i < itemLen; i++){
						var className = G_Prg.$(itemNameID + i+'_'+dragIndex).className.split(' ')[0];
                        if(className === 'checkboxSelectedImg' || className === 'checkboxRightImg' || className === 'checkboxErrorImg'){
                            return true;
                        }
                    }
                    return false;
                }
                G_Prg.$(buttonID).onclick = function () {
					//_checkSetAudio();	//功能：检测用户浏览器是否支持audio标签，根据不同的浏览器设置其支持的音乐格式
					G_UserAction.addUserAction('commitBtn');
                    if(!_checkClick()){
                        G_Prg.alert('请您选择答案！');
                        return;
                    }
                    _submitCheckboxClick(curTest,itemNameID,dragIndex);
                };
                if(!_IsDisabled){	//批阅后禁止答题
                    G_Prg.$(buttonID).onclick = function () {};
                    G_Prg.$(buttonID).style.color = '#999';	//将按钮灰掉
                }
            }else{
                G_Prg.$(buttonID).style.display = 'none';	//模拟考场，多选题的提交答案按钮隐藏掉
                G_Prg.$(divBtnID).style.width = '99%';
            }
        } else if (testType === 'JDTEST') {
            if(_gAllTest.getAction(curTest.testNO-1) === 'lookAnswer'){	//隐藏按钮显示
                G_Prg.$(buttonID).innerHTML = '隐藏答案';
            }else{	//查看按钮显示
                G_Prg.$(buttonID).innerHTML = '查看答案';
            }
            G_Prg.$(buttonID).onclick = function () {
				_blurFlag = '';
				G_Prg.$(textarea).blur();
				
                if(G_Prg.$(buttonID).innerHTML === '查看答案'){
					G_UserAction.addUserAction('lookBtn');
                    _seeJDTestAnswer(curTest,textarea,'isLook');
                    _gAllTest.setAction('lookAnswer');
                    G_Prg.$(buttonID).innerHTML = '隐藏答案';
                }else{
					G_UserAction.addUserAction('lookNoBtn');
                    G_Prg.$(buttonID).innerHTML = '查看答案';
					_gAllTest.setAction('lookNoAnswer');
                }
				_showCurTest(curTest, dragIndex);
            };
			G_Prg.$(textarea).onblur = function () {
				_blurFlag = 'blur';
				_seeJDTestAnswer(curTest,textarea);
			};
			
            if(_fromUrl === 'simulatedExam.html'){
                G_Prg.$(buttonID).style.display = 'none';	//模拟考场，简答题、填空题的查看答案按钮隐藏掉
                G_Prg.$(divBtnID).style.width = '99%';
				/*G_Prg.$(textarea).onblur = function () {
					_blurFlag = 'blur';
					_seeJDTestAnswer(curTest,textarea);
				};*/
				
            }
            if(!_IsDisabled){	//批阅后禁止答题
                G_Prg.$(buttonID).onclick = function () {};
				G_Prg.$(textarea).onblur = function () {};
                G_Prg.$(buttonID).style.color = '#999';	//将按钮灰掉
                G_Prg.$(textarea).readonly = true;
            }
            //文本域点击阻止冒泡
			G_Prg.$(textarea).onclick = function (event) {
				//阻止冒泡
				event = event ? event : window.event;
				event.stopPropagation();
			};
			
        }else if (testType === 'TKTEST'){
			if(_gAllTest.getAction(curTest.testNO-1) === 'lookAnswer'){	//隐藏按钮显示
                G_Prg.$(buttonID).innerHTML = '隐藏答案';
            }else{	//查看按钮显示
                G_Prg.$(buttonID).innerHTML = '查看答案';
            }
            G_Prg.$(buttonID).onclick = function () {
				_blurFlag = '';
				var arrLen = G_Prg.$(idArr['itemOlID'] + dragIndex).getElementsByTagName('li').length;
				for(var i = 0;i < arrLen; i++){
					G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).blur();
				}
                if(G_Prg.$(buttonID).innerHTML === '查看答案'){
					G_UserAction.addUserAction('lookBtn');
                    _seeTKTestAnswer(curTest,dragIndex,'isLook');
                    _gAllTest.setAction('lookAnswer');
                    G_Prg.$(buttonID).innerHTML = '隐藏答案';
                }else{
					G_UserAction.addUserAction('lookNoBtn');
                    G_Prg.$(buttonID).innerHTML = '查看答案';
					_gAllTest.setAction('lookNoAnswer');
                }
				_showCurTest(curTest, dragIndex);
            };
			var answerArr = curTest.answer.split('；');	
			for(var i = 0;i < answerArr.length; i++){
				//输入框点击阻止冒泡
				G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).onclick = function (event) {
					//阻止冒泡
					event = event ? event : window.event;
					event.stopPropagation();
				};
			
				G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).onblur = function () {
					_blurFlag = 'blur';
					_seeTKTestAnswer(curTest,dragIndex);
				};
			}
            if(_fromUrl === 'simulatedExam.html'){
                G_Prg.$(buttonID).style.display = 'none';	//模拟考场，简答题、填空题的查看答案按钮隐藏掉
                G_Prg.$(divBtnID).style.width = '99%';
            }
            if(!_IsDisabled){	//批阅后禁止答题
                G_Prg.$(buttonID).onclick = function () {};
                G_Prg.$(buttonID).style.color = '#999';	//将按钮灰掉
            }
		}
        G_Prg.$(divBtnID).onclick = function () {
			if (testType === 'JDTEST'){
				G_Prg.$('jd_textarea_'+startIndex).blur();
			}else if (testType === 'TKTEST'){
				var arrLen = G_Prg.$(idArr['itemOlID'] + dragIndex).getElementsByTagName('li').length;
				for(var i = 0;i < arrLen; i++){
					G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).blur();
				}
			}
			G_UserAction.addUserAction('nextBtn1');
            _moveNext();
        }; //Next 下一题
        G_Prg.$(pageNumID).onclick = function(){
			G_UserAction.addUserAction('testCardBtn');
            _showTitleCard(dragIndex);
        };	//单击试题右上角的试题数量显示题卡
    }
    /********************************************************************************
     函数名：_setExamType
     功能：设置测试类型
     输入参数:无
     返回值：无
     创建信息：黎萍（2014-08-01）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _setExamType(){
        var examType = 0;
        switch (_fromUrl){
            case 'chapterMenu.html':
                examType = 1;	//章节练习
                break;
            case 'simulatedExam.html':
                examType = 2;	//模拟考场
                break;
            case 'testList.html':
                var type=G_Prg.getQueryString('type');;
                switch (type){
                    case 'userError':
                        examType = 3;	//错题重做
                        break;
                    case 'userFav':
                        examType = 4;	//我的收藏
                        break;
                    case 'userNote':
                        examType = 5;	//我的笔记
                        break;
                    case 'findTest':
                        examType = 6;	//查找试题
                        break;
                }
                break;
        }
        return examType;
    }
    /********************************************************************************
     函数名：_checkInfos
     功能：将数据添加到数据库之前对参数进行验证
     输入参数:flag 标记用户是游客还是已登录的用户：yes 为登录用户，no 为游客身份
     返回值：infosArr 参数数组
     创建信息：黎萍（2014-08-01）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _checkInfos(flag){
        var userID = G_Cookie.getUserID();
        if(flag === 'no'){
            //判断用户是否已登陆
            if (!userID) {
                return;
            }
        }else if(flag === 'yes'){
            //判断用户是否已登陆
            if (!userID) {
                var _yesCallback = function () {
                    window.location.href = 'userLogin.html?fromUrl=doExam.html&cptName='+G_Prg.getQueryString('cptName',true);
                }
                G_Prg.confirm('该功能请登录后使用！', _yesCallback);
                return;
            }
        }else{
            G_Prg.alert('抱歉，TestUI._checkInfos: flag = "'+flag+'" 传入的参数无效！');
        }
        var appID = G_Cookie.getAppID();
        if (!appID) {
            G_Prg.throw('程序运行错误，不能处理 testUI._checkInfos: appID=' + appID);
        }
        var userName = G_Cookie.getUserName();
        var guid = G_Cookie.getGuid();
        var infosArr = new Object();
        infosArr['appID'] = appID;
        infosArr['userID'] = userID;
        infosArr['userName'] = userName;
        infosArr['guid'] = guid;
        return infosArr;
    }
	/********************************************************************************
     以下为试题正确答案显示处理代码部分
     *******************************************************************************/
	/********************************************************************************
     函数名：_radioRightAnswer
     功能：（批阅后）显示单选题正确答案
     输入参数：curTest 当前试题；idArr 试题所在标签的id数组
     返回值: 无
     创建信息：黎萍（2014-09-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _radioRightAnswer(curTest,idArr,dragIndex){
        if(!_IsShowRightAnswer){
			return;	
		}
		var itemNameID = idArr['itemID']; //选项所在的a标签的ID
		var resultID = idArr['resultID']+'_'+dragIndex; //显示正确答案和解题思路的div层的ID
		var testType = curTest.testType; //试题类型
		var subTestType = curTest.subTestType; //针对A3和B题型的小题的试题类型进行定义
		var itemLen = curTest.selectedItems.length;
		for (var i = 0; i < itemLen; i++) {
			if (G_Prg.$(itemNameID + i +'_' + dragIndex).lang === curTest.answer) {
				G_Prg.$(itemNameID + i +'_' + dragIndex).className = 'radioDefaultImg rightAnswer'; //改变正确答案的字体样式
				G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display = 'block'
			}
		}  
    }
	/********************************************************************************
     函数名：_radioRightAnswer
     功能：（批阅后）显示多选题正确答案
     输入参数：curTest 当前试题；idArr 试题所在标签的id数组
     返回值: 无
     创建信息：黎萍（2014-09-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _checkboxRightAnswer(curTest,idArr,dragIndex) {
        if(!_IsShowRightAnswer){
			return;	
		}
		var itemNameID = idArr['itemID']; //选项所在的a标签的ID
		var resultID = idArr['resultID']+'_'+dragIndex; //显示正确答案和解题思路的div层的ID
		var testType = curTest.testType; //试题类型
		var subTestType = curTest.subTestType; //针对A3和B题型的小题的试题类型进行定义
		var itemLen = curTest.selectedItems.length;
		var selectedItems =  curTest.selectedItems;
		var answerIndex = ''; //正确答案的索引
		if(!answerIndex){
			for (var i = 0; i < itemLen; i++) {
				if (curTest.answer.indexOf(G_Prg.$(itemNameID + i +'_' + dragIndex).lang) >= 0) {
					answerIndex += i + ','; //取得正确答案的checkbox的索引
				}
			}
		}
		if(answerIndex){
			answerIndex = answerIndex.split(',');
		}
		if (answerIndex[answerIndex.length - 1] === '') {
			answerIndex.pop();
		}
		for (var a = 0; a < answerIndex.length; a++) {
			G_Prg.$(itemNameID + answerIndex[a] + '_' + dragIndex).style.display = 'block';
			G_Prg.$(itemNameID + answerIndex[a]  + '_' + dragIndex).lang = selectedItems[answerIndex[a]].ItemName;
			G_Prg.$(itemNameID + answerIndex[a] + '_' + dragIndex).innerHTML = selectedItems[answerIndex[a]].ItemName + '.' + selectedItems[answerIndex[a]].Content.replace(/(^\s+)|(\s+$)/g,"");//去掉前后空格
			G_Prg.$(itemNameID + answerIndex[a] +'_' + dragIndex).className = 'checkboxDefaultImg rightAnswer';
		}  
    }
	/********************************************************************************
     函数名：_checkSetAudio
     功能：检测用户浏览器是否支持audio标签，根据不同的浏览器设置其支持的音乐格式
     输入参数：playerID 音频ID
     返回值：无
     创建信息：黎萍（2014-09-15）
     修改记录：无
     审查人：无
     *******************************************************************************/
	function _checkSetAudio(){
		if(!(!!document.createElement('audio').canPlayType)){
			G_Prg.alert('抱歉，您的浏览器不支持 audio 标签。');
			return;
		}
		var browser = G_Prg.getBrowserVersion().split(' ');
		var rightMedia = G_Prg.$('rightMedia');
		var wrongMedia = G_Prg.$('wrongMedia');
		//不同浏览器支持不同的音乐格式
		if(browser[0] === 'firefox'){
			rightMedia.src = '../media/right_answer.ogg';
			wrongMedia.src = '../media/wrong_answer.ogg';
		}else if(browser[0] === 'opera'){
			rightMedia.src = '../media/right_answer.wav';
			wrongMedia.src = '../media/wrong_answer.wav';
		}else{
			rightMedia.src = '../media/right_answer.mp3';
			wrongMedia.src = '../media/wrong_answer.mp3';	
		}
		rightMedia.preload = 'preload';
		wrongMedia.preload = 'preload';
		rightMedia.load();
		wrongMedia.load();
	}
    /********************************************************************************
     函数名：_addReplyLog
     功能：添加答题明细记录到数据库中
     输入参数：isRight 标记用户的回答是否正确,userReply 用户的回答
     返回值：无
     创建信息：黎萍（2014-08-19）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _addReplyLog(curTest,isRight,userReply,flag){
        var isFlag = flag || 'no';
        var replyEndTime = new Date();
        var examType = _setExamType();
        var infosArr = _checkInfos(isFlag);
        if (!infosArr) {
            return;
        }
        //添加答题明细记录
        _gAllTest.addReplyLog(curTest,infosArr['appID'],infosArr['userID'],infosArr['userName'],infosArr['guid'],userReply,isRight,replyEndTime, _replyStartTime,examType);
    }
	/********************************************************************************
     函数名：_player
     功能：对用户回答错误与否播放提示音
     输入参数：playerID 音频ID
     返回值：无
     创建信息：黎萍（2014-09-15）
     修改记录：无
     审查人：无
     *******************************************************************************/
	function _player(playerID){
		var player = G_Prg.$(playerID);
		if(G_Cookie.getOffMedia() === 'off'){
			player.pause();
			return;	
		}
		//如果音频文件正在播放，则 paused 属性返回 false，并且调用 pause 方法来暂停播放。
		//player.addEventListener('canplay',function(){
			if(player.paused){
				player.play();
			}else{
				player.pause();
				player.play();
				//通过更改 currentTime 的值，你可以快进或快退或重新启动播放。
			}
		//});
		
	}
	/********************************************************************************
     以下为章节练习试题单击事件处理代码部分
     *******************************************************************************/
	/********************************************************************************
	功能：填空题‘查看答案’按钮单击事件设置
	输入参数：curTest 当前试题,dragIndex 滑动层索引,flag 标记是否点击了查看答案按钮，取值为isLook
	返回值：无
	最后修改人：黎萍（2015-01-05）
	修改记录：黎萍（2015-08-06）控制在点击“查看答案”或文本框失去焦点时，只提交一次答题记录
	*******************************************************************************/
	function _seeTKTestAnswer(curTest,dragIndex,flag){
		var idArr = _setID(curTest);
		var flagTemp = flag || 'noLook';
        _viewCount++;
        var inputAnswer = ''; //用户输入的答案
		var rightAnswers = curTest.answer.split('；');		//正确答案
		var trueCount = 0;	//计算用户输入的答案正确个数
		
		for (var i = 0; i < rightAnswers.length; i++) {
			if(G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display !== 'none'){
				inputAnswer	+= G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).value+'；';
				//用户输入的答案必须与正确答案的顺序一致
				/*if(G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).value === rightAnswers[i]){
					trueCount++;	
				}*/
			}
		}
		var answerType = curTest.answerType;
		var userReplys = inputAnswer.split('；');		//用户的答案数组
		//判断，如果数组的最后一个元素为空，则将其删除
		if (userReplys[userReplys.length - 1] === '') {
			userReplys.pop();
		}
		if(answerType === 0){
			//用户输入的答案必须与正确答案的顺序一致
			for (var i = 0; i < rightAnswers.length; i++) {
				if(userReplys[i] === rightAnswers[i]){
					trueCount++;	
				}
			}
		}else if(answerType === 1){
			//用户输入的答案与正确答案的顺序不用一致
			for (var i = 0; i < userReplys.length; i++) {
				for(var j = 0; j < rightAnswers.length; j++){
					if(userReplys[i] === rightAnswers[j]){
						trueCount++;
					}	
				}
			}
		}	
        var isRight = 1;  //标记用户的答案是否正确
        if(trueCount >= rightAnswers.length){
            isRight = 0;	//回答正确
        }
        if(flagTemp === 'isLook'){
            _gAllTest.setSelected(0);
        }else if(flagTemp === 'noLook'){
            _gAllTest.setSelected(1);//标记章节练习的简答题已输入内容未点击查看答案：1 已输入 0 已提交查看答案
        }
		if(_fromUrl === 'simulatedExam.html'){
            _selected = 1;
			_gAllTest.setState('mock');
        }
		_gAllTest.setState('commited');	
		
        //将得到的用户数据存放入结构体当中
        _gAllTest.setUserReply(inputAnswer);
        _gAllTest.setIsRight(isRight);
        if(_viewCount===1){
            _addReplyLog(curTest,isRight,inputAnswer);	//添加答题明细记录
        }
	}
    /********************************************************************************
     函数名：_seeJDTestAnswer
     功能：对简答题，填空题，点击提交答案，在试题下方显示正确答案及解题思路
     输入参数:answerID 正确答案所在div层ID;resultID 显示正确答案和解题思路的DIV层id
     返回值：无
     创建信息：黎萍（2014-05-21）
     修改记录：黎萍（2014-05-22）修改答题后展示的答题信息样式
     修改记录：黎萍（2014-06-09）修改正确答案展示样式
     修改记录：黎萍（2014-07-15）修改答题模式，更改为查看答案，不进行用户答案的正确与否判断
                黎萍（2014-08-01）抽取验证数据的部分封装成方法，使用返回参数数组的方式
                黎萍（2015-08-06）控制在点击“查看答案”或文本框失去焦点时，只提交一次答题记录
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _seeJDTestAnswer(curTest,textarea,flag) {
        var flagTemp = flag || 'noLook';
        _viewCount++;
        /*if(G_Prg.$(textarea).value === ''){
            return;
        }*/
        var inputAnswer = (G_Prg.$(textarea).value === '') ? null : G_Prg.$(textarea).value;//用户输入的答案
        var rightAnswer = curTest.answer;
        var isRight = 1;  //标记用户的答案是否正确
        if(inputAnswer === rightAnswer){
            isRight = 0;	//标记用户回答错误
        }
        if(flagTemp === 'isLook'){
            _gAllTest.setSelected(0);
        }else if(flagTemp === 'noLook'){
            _gAllTest.setSelected(1);//标记章节练习的简答题已输入内容未点击查看答案：1 已输入 0 已提交查看答案
        }
		if(_fromUrl === 'simulatedExam.html'){
            _selected = 1;
			_gAllTest.setState('mock');
        }
		_gAllTest.setState('commited');	
		
        //将得到的用户数据存放入结构体当中
        _gAllTest.setUserReply(inputAnswer);
        _gAllTest.setIsRight(isRight);
        if(_viewCount===1){
            _addReplyLog(curTest,isRight,inputAnswer);	//添加答题明细记录
        }
        
        //_showCurTest(curTest, _gFlipsnap.currentPoint);
    }
    /********************************************************************************
     函数名：_radioClick
     功能：单选按钮的单击事件，立即判断用户选择的答案是否正确
     输入参数: itemNameID 选项所在的a标签的ID; itemTextID 选项的文本内容所在的span标签的ID; resultID 显示正确答案和解题思路的div层的ID
     selectedAnswer 用户选中的答案 ;
     返回值：无
     创建信息：黎萍（2014-06-06）
     修改记录：黎萍（2014-06-09）修改判断题的答题功能
     黎萍（2014-08-01）抽取验证数据的部分封装成方法，使用返回参数数组的方式
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _radioClick(curTest,selectedAnswer,dragIndex) {
        //var curTest = _gAllTest.getCurTest(); //当前试题
        var isRight = 0; //标记用户的答案是否正确
        if (selectedAnswer === curTest.answer) {
            isRight = 0; //回答正确
			//_player('rightMedia');
        } else {
            isRight = 1; //回答错误
			//_player('wrongMedia');
        }
        //将得到的用户数据存放入结构体当中
		if(_gAllTest.getUserReply(curTest.testNO-1) !== selectedAnswer){//当用户多次点击一个选项时，控制不进行答题记录的提交
			_addReplyLog(curTest,isRight,selectedAnswer);	//添加答题明细记录	
		}
        _gAllTest.setUserReply(selectedAnswer);
        _gAllTest.setIsRight(isRight);
        _gAllTest.setState('commited');
        _showCurTest(curTest, dragIndex);
		if(curTest.testNO === _gAllTest.getTestCount() && G_Cookie.getUserID() && _checkIsBuySoft()){
			_controlBtn(curTest,dragIndex);
		} 
    }
    /********************************************************************************
     函数名：_submitCheckboxClick
     功能：提交答案的按钮的单击事件，提交多选题中选择的答案事件
     输入参数:itemNameID 选项所在的a标签的ID; itemTextID 选项的文本内容所在的span标签的ID;
     resultID 显示正确答案和解题思路的div层的ID;
     返回值：无
     创建信息：黎萍（2014-06-06）
     修改记录：黎萍（2014-06-10）修改多选答案的提交功能
     黎萍（2014-08-01）抽取验证数据的部分封装成方法，使用返回参数数组的方式
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _submitCheckboxClick(curTest,itemNameID,dragIndex) {
        _selected = 0;
        _gAllTest.setSelected(0);//标记章节练习的多选题已被选中，但是没有进行答案的提交；1 已选中 0 已提交
        var isRight = 0;
        var selectedAnswer = ''; //用户选择的答案
        var selectIndex = ''; //用户选择的选项索引
        var answerIndex = ''; //正确答案的索引
        var itemLen = curTest.selectedItems.length; //选项数组长度

        for (var i = 0; i < itemLen; i++) {
            if (G_Prg.$(itemNameID + i +'_' + dragIndex).className === 'checkboxSelectedImg' || G_Prg.$(itemNameID + i+'_'+dragIndex).className.split(' ')[0] === 'checkboxRightImg' || G_Prg.$(itemNameID + i+'_'+dragIndex).className.split(' ')[0] === 'checkboxErrorImg') {
                selectedAnswer += G_Prg.$(itemNameID + i +'_' + dragIndex).lang;
                selectIndex += i + ','; //取得当前选中的checkbox的索引
            }
            if (curTest.answer.indexOf(G_Prg.$(itemNameID + i +'_' + dragIndex).lang) >= 0) {
                answerIndex += i + ','; //取得正确答案的checkbox的索引
            }
        }
        var uIndex = selectIndex.split(','); //将用户选择的选项索引截取生成数组
        var aIndex = answerIndex.split(','); //将正确答案所在选项的索引截取生成数组
        //判断，如果数组的最后一个元素为空，则将其删除
        if (uIndex[uIndex.length - 1] === '') {
            uIndex.pop();
        }
        if (aIndex[aIndex.length - 1] === '') {
            aIndex.pop();
        }
        if (selectedAnswer === curTest.answer) {
            isRight = 0; //回答正确
			//_player('rightMedia');
        } else {
            isRight = 1; //回答错误
			//_player('wrongMedia');
        }
        //将得到的用户数据存放入结构体
		//if(_gAllTest.getUserReply(curTest.testNO-1) !== selectedAnswer){//当用户多次点击一个选项时，控制不进行答题记录的提交
			_addReplyLog(curTest,isRight,selectedAnswer);	//添加答题明细记录	
		//}
        _gAllTest.setUserReply(selectedAnswer);
        _gAllTest.setIsRight(isRight);
        _gAllTest.setState('commited');
        _showCurTest(curTest,dragIndex);
    }
	/********************************************************************************
     以下为模拟考场试题单击事件处理代码部分
     *******************************************************************************/
    /********************************************************************************
     函数名：_radioSelected
     功能：（模拟考场）单选题的单击事件，改变选项的图标，标记为已被选中
     输入参数:itemNameID 选项所在的a标签的ID;selectedValue 用户选中的答案
     返回值：无
     创建信息：黎萍（2014-07-23）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _radioSelected(curTest,itemNameID, selectedValue,dragIndex){
        var selectedAnswer = ''; //用户选择的答案
        var isRight = 1;
        var itemLen = curTest.selectedItems.length;
        for (var i = 0; i < itemLen; i++) {
            G_Prg.$(itemNameID + i +'_' + dragIndex).className = 'radioDefaultImg'; //选中之前先将其他的样式修改为默认的灰色，实现单击效果
            if (G_Prg.$(itemNameID + i +'_' + dragIndex).lang === selectedValue) {
                //使用三元运算符进行判断，如果选项的样式是默认的，则使用选中样式标记改选项为已选中；如果选项的样式已经是已选中的，则修改为默认的表示已经取消选择
                var className = (G_Prg.$(itemNameID + i +'_' + dragIndex).className === 'radioSelectedImg') ? 'radioDefaultImg' : 'radioSelectedImg';
                G_Prg.$(itemNameID + i +'_' + dragIndex).className = className;
            }
            if (G_Prg.$(itemNameID + i +'_' + dragIndex).className === 'radioSelectedImg') {
                selectedAnswer = G_Prg.$(itemNameID + i +'_' + dragIndex).lang;
            }
            if(selectedAnswer === curTest.answer){
                isRight = 0;
            }
        }
        _selected = 1;
        _gAllTest.setIsRight(isRight);
        _gAllTest.setUserReply(selectedAnswer);
        _gAllTest.setState('mock');
		if(curTest.testNO === _gAllTest.getTestCount() && G_Cookie.getUserID() && _checkIsBuySoft()){
			_controlBtn(curTest,dragIndex);
		}
    }
    /********************************************************************************
     函数名：_checkboxSelected
     功能：（模拟考场）复选框的单击事件，改变选项的图标，标记为已被选中
     输入参数:itemNameID 选项所在的a标签的ID;selectedValue 用户选中的答案
     返回值：无
     创建信息：黎萍（2014-06-06）
     修改记录：无
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _checkboxSelected(curTest,itemNameID, selectedValue,dragIndex) {
        var selectedAnswer = ''; //用户选择的答案
        var isRight = 1;
        var itemLen = curTest.selectedItems.length;
        for (var i = 0; i < itemLen; i++) {
            var optionID = G_Prg.$(itemNameID + i +'_' + dragIndex);
            if (optionID.lang === selectedValue) {
                //提交答案后，再答题，点击取消当前答案图标为默认图标
                if (optionID.className.split(' ')[0] === 'checkboxRightImg') {
                    optionID.className = 'checkboxDefaultImg rightAnswer';
                } else if (optionID.className.split(' ')[0] === 'checkboxErrorImg') {
                    optionID.className = 'checkboxDefaultImg errorAnswer';
                }else{
                    //使用三元运算符进行判断，如果选项的样式是默认的，则使用选中样式标记改选项为已选中；如果选项的样式已经是已选中的，则修改为默认的表示已经取消选择
                    var className1 = (optionID.className.split(' ')[0] === 'checkboxSelectedImg') ? 'checkboxDefaultImg' : 'checkboxSelectedImg';
					//var className2 = (optionID.className.split(' ')[1] === 'rightAnswer') ? 'rightAnswer' : _fontColor;
                    optionID.className = className1;// + ' '+className2;
                }
            }
            if (optionID.className === 'checkboxSelectedImg' || optionID.className.split(' ')[0] === 'checkboxRightImg' || optionID.className.split(' ')[0] === 'checkboxErrorImg') {
                selectedAnswer += optionID.lang;
            }
        }
        if (selectedAnswer === curTest.answer) {
            isRight = 0;
        }
        if(_fromUrl === 'simulatedExam.html'){
            _selected = 1;
            //_setState('mock');
        }else{
            _gAllTest.setSelected(1);//标记章节练习的多选题已被选中，但是没有进行答案的提交；1 已选中 0 已提交
        }
        _gAllTest.setIsRight(isRight);
        _gAllTest.setUserReply(selectedAnswer);
    }
	/********************************************************************************
     以下为模拟考场显示试题已答情况处理代码部分
     *******************************************************************************/
    /********************************************************************************
     函数名：_mockCheckboxDone
     功能：多选题已做题设置
     输入参数:itemNameID 选项所在的a标签的ID;
     返回值：无
     创建信息：黎萍（2014-07-23）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _mockCheckboxDone(curTest,idArr,dragIndex) {
        if (_IsShowUserAnswer || _gAllTest.getSelected(_gAllTest.getCurIndex()) === 1 || _fromUrl === 'simulatedExam.html') {
            var userReply = _gAllTest.getUserReply(curTest.testNO-1); //获取用户的答案
            var itemLen = curTest.selectedItems.length; //选项数组长度
            var itemNameID = idArr['itemID'];
            for (var i = 0; i < itemLen; i++) {
                for(var j = 0; j < userReply.length; j++){
                    if (G_Prg.$(itemNameID + i +'_' + dragIndex).lang === userReply.substr(j,1)) {
                        G_Prg.$(itemNameID + i +'_' + dragIndex).className = 'checkboxSelectedImg';
                    }
                }
            }
        }
    }
    /********************************************************************************
     函数名：_mockRadioDone
     功能：单选题已做题设置
     输入参数: curTest 当前试题,idArr 页面标签id哈希表,dragIndex 滑动层索引
     返回值：无
     创建信息：黎萍（2014-07-23）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _mockRadioDone(curTest,idArr,dragIndex) {
        if (_IsShowUserAnswer) {
            var userReply = _gAllTest.getUserReply(curTest.testNO-1); //获取用户的答案
            var itemLen = curTest.selectedItems.length; //选项数组长度
            var itemNameID = idArr['itemID'];
            for (var i = 0; i < itemLen; i++) {
                if (G_Prg.$(itemNameID + i +'_' + dragIndex).lang === userReply) {
                    G_Prg.$(itemNameID + i +'_' + dragIndex).className = 'radioSelectedImg';
                }
            }
        }
    }
	/********************************************************************************
	功能：模拟考场设置显示填空题已做题信息
	输入参数：curTest 当前试题,idArr 页面标签id哈希表,dragIndex 滑动层索引
	返回值：无
	最后修改人：黎萍（2015-01-07）
	修改记录：无
	*******************************************************************************/
	function _mockTkDone(curTest,idArr,dragIndex){
		if(_IsShowUserAnswer){
			var userReply = _gAllTest.getUserReply(curTest.testNO-1); //获取用户的答案
			var userReplys = userReply.split('；');		//正确答案
			//判断，如果数组的最后一个元素为空，则将其删除
			if (userReplys[userReplys.length - 1] === '') {
				userReplys.pop();
			}
			for (var i = 0; i < userReplys.length; i++) {
				G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).value = userReplys[i];
			}
		}	
	}
    /********************************************************************************
     函数名：_checkboxDone
     功能：多选题已做题设置
     输入参数:itemNameID 选项所在的a标签的ID; itemTextID 选项的文本内容所在的span标签的ID;
     resultID 显示正确答案和解题思路的div层的ID ;
     返回值：无
     创建信息：黎萍（2014-06-11）
     修改记录：无
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _checkboxDone(curTest, idArr,dragIndex){
        if(!_IsShowRightAndWrong){
            return;
        }
        var itemNameID = idArr['itemID']; //选项所在的a标签的ID

        var userReply = _gAllTest.getUserReply(curTest.testNO-1); //获取用户的答案
        var isRight = _gAllTest.getIsRight(curTest.testNO-1); //获取标记用户的回答是否正确
        var selectIndex = ''; //用户选择的选项索引
        var answerIndex = ''; //正确答案的索引
        var itemLen = curTest.selectedItems.length; //选项数组长度
        var uIndex = []; //将用户选择的选项索引截取生成数组
        var aIndex = []; //将正确答案所在选项的索引截取生成数组
        //用户已经进行了做题操作
        if (userReply !== '') {
            for (var i = 0; i < itemLen; i++) {
                if (userReply.indexOf(G_Prg.$(itemNameID + i +'_' + dragIndex).lang) >= 0) {
                    selectIndex += i + ','; //取得当前选中的checkbox的索引
                }
                if (curTest.answer.indexOf(G_Prg.$(itemNameID + i +'_' + dragIndex).lang) >= 0) {
                    answerIndex += i + ','; //取得正确答案的checkbox的索引
                }
            }
            uIndex = selectIndex.split(',');
            aIndex = answerIndex.split(',');
            //判断，如果数组的最后一个元素为空，则将其删除
            if (uIndex[uIndex.length - 1] === '') {
                uIndex.pop();
            }
            if (aIndex[aIndex.length - 1] === '') {
                aIndex.pop();
            }
            //初始将所有正确答案的字体颜色变为绿色
            for (var a = 0; a < aIndex.length; a++) {
                G_Prg.$(itemNameID + aIndex[a] +'_' + dragIndex).className = 'checkboxDefaultImg rightAnswer';
            }
            for (var u = 0; u < uIndex.length; u++) {
                if (curTest.answer.indexOf(G_Prg.$(itemNameID + uIndex[u] +'_' + dragIndex).lang) >= 0) { //用户答案中包含了正确的答案
                    G_Prg.$(itemNameID + uIndex[u] +'_' + dragIndex).className = 'checkboxRightImg rightAnswer';
                } else {
                    G_Prg.$(itemNameID + uIndex[u] +'_' + dragIndex).className = 'checkboxErrorImg errorAnswer';
                }
            }
        }
    }
    /********************************************************************************
     函数名：_radioDone
     功能：单选题已做题设置
     输入参数: itemNameID 选项所在的a标签的ID; itemTextID 选项的文本内容所在的span标签的ID;
     resultID 显示正确答案和解题思路的div层的ID ;
     返回值：无
     创建信息：黎萍（2014-06-11）
     修改记录：黎萍（2014-07-23）修改当以模拟考场进入做题界面时，单选题以选中样式展示
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _radioDone(curTest, idArr,dragIndex) {
        if (!_IsShowRightAndWrong) {//_IsShowRightAnswer
            return;
        }
        var itemNameID = idArr['itemID'];
        var userReply = _gAllTest.getUserReply(curTest.testNO-1); //获取用户的答案
        var isRight = _gAllTest.getIsRight(curTest.testNO-1); //获取标记用户的回答是否正确
        var itemLen = curTest.selectedItems.length; //选项数组长度
        if (userReply !== '') {
            if (isRight === 0) { //用户回答正确
                for (var i = 0; i < itemLen; i++) {
                    if (G_Prg.$(itemNameID + i +'_' + dragIndex).lang === userReply) {
                        G_Prg.$(itemNameID + i +'_' + dragIndex).className = 'radioRightImg rightAnswer'; //指定类样式
                    }
                }
            } else { //回答错误
                for (var i = 0; i < itemLen; i++) {
                    if (G_Prg.$(itemNameID + i +'_' + dragIndex).lang === userReply) {
                        G_Prg.$(itemNameID + i +'_' + dragIndex).className = 'radioErrorImg errorAnswer'; //显示当前被判定为错的图片
                    }
                    if (G_Prg.$(itemNameID + i +'_' + dragIndex).lang === curTest.answer) {
                        G_Prg.$(itemNameID + i +'_' + dragIndex).className = 'radioDefaultImg rightAnswer'; //改变正确答案的字体样式
                    }
                }
            }
        }
    }
    /********************************************************************************
     函数名：_textInputed
     功能：简答题和填空题的已做题显示设置
     输入参数: itemTextID 用户输入的文本内容所在的textarea标签的ID;answerID 正确答案所在div层的id；
     resultID 显示正确答案和解题思路的div层的ID;allTest TestData函数对象
     返回值：无
     创建信息：黎萍（2014-06-11）
     修改记录：无
     *******************************************************************************/
    function _textInputed(curTest,idArr,dragIndex){
        if (!_IsShowRightAndWrong) {
            return;
        }
        var userReply = _gAllTest.getUserReply(curTest.testNO-1);	//获取用户的答案
        //var isRight = _gAllTest.getIsRight(_gAllTest.getCurIndex());	//获取标记用户的回答是否正确
        var textarea = idArr['textarea'] +'_' + dragIndex;
        var resultID = idArr['resultID']+'_'+dragIndex; //显示正确答案和解题思路的div层的ID
		if (curTest.testType === 'JDTEST') {
        	G_Prg.$(textarea).value = "";
			if(userReply !== ""){
				G_Prg.$(textarea).value = userReply;	//用户输入的答案
				if(_selected === 1  || _gAllTest.getSelected(_gAllTest.getCurIndex()) === 1 || _gAllTest.getAction(curTest.testNO-1) === 'lookNoAnswer'){
					G_Prg.$(resultID).style.display = "none";
				}else{
					G_Prg.$(resultID).style.display = "block"; //显示正确答案和试题解析
				}
			}
		}else if(curTest.testType === 'TKTEST'){
			var arrLen = G_Prg.$(idArr['itemOlID'] + dragIndex).getElementsByTagName('li').length;
			for (var i = 0; i < arrLen; i++) {
				G_Prg.$(idArr['itemTextID'] + i + '_' + dragIndex).value = ''; 
			}
			if(userReply !== ""){
				var answers = userReply.split('；');		//正确答案
				//判断，如果数组的最后一个元素为空，则将其删除
				if (answers[answers.length - 1] === '') {
					answers.pop();
				}
				for (var i = 0; i < answers.length; i++) {
					G_Prg.$(idArr['itemTextID'] + i + '_' +dragIndex).value = answers[i];
				}
				
				if(_selected === 1  || _gAllTest.getSelected(_gAllTest.getCurIndex()) === 1 || _gAllTest.getAction(curTest.testNO-1) === 'lookNoAnswer'){
					G_Prg.$(resultID).style.display = "none";
				}else{
					G_Prg.$(resultID).style.display = "block"; //显示正确答案和试题解析
				}
			}
		}

        
    }
    /********************************************************************************
     函数名：_hiddenTestSelects
     功能：背题模式下，隐藏其它非正确的选项
     输入参数:curTest 当前试题,dragIndex 拖拽层的索引
     返回值：无
     创建信息：黎萍（2014-08-20）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _hiddenTestSelects(curTest,dragIndex) {
        if(_gAllTest.getState(curTest.testNO-1) !== 'recite'){
            return;
        }
        var idArr = _setID(curTest);
        var itemID = idArr['itemID'];
        var resultID = idArr['resultID']+'_'+dragIndex; //显示正确答案和解题思路的div层的ID
        var operate = idArr['operate']+'_'+dragIndex;	//隐藏答案按钮的div层ID
        var nextBtnDiv = idArr['divBtnID']+'_'+dragIndex;	//页面中的下一题按钮的div层ID
        var buttonID = idArr['buttonID']+'_'+dragIndex;	//页面中的多选题提交答案按钮的div层ID
        var answerDiv = idArr['answerDiv']+'_'+dragIndex;	//正确答案所在的div层ID
        var explainDiv = idArr['explainDiv']+'_'+dragIndex;	//解析所在的div层ID
        var testType = curTest.testType; //试题类型
        var subTestType = curTest.subTestType; //针对A3和B题型的小题的试题类型进行定义
        var answer = curTest.answer;
        var itemLen = curTest.selectedItems.length;
        if (testType === 'ATEST' || testType === 'PDTEST' || subTestType === '单项') {
            G_Prg.$('markingDiv_'+dragIndex).style.display = 'none';
            G_Prg.$(nextBtnDiv).className = 'next_button_1';	//修改下一题按钮样式
            if(curTest.testNO === _gAllTest.getTestCount()){
                G_Prg.$(nextBtnDiv).style.display = 'block';
                G_Prg.$(nextBtnDiv).innerHTML = '答题';
                G_Prg.$(nextBtnDiv).style.backgroundColor= '#ff9900';
                G_Prg.$(nextBtnDiv).style.color= '#FFF';
                G_Prg.$(nextBtnDiv).onclick = function () {
					G_UserAction.addUserAction('doDivBtn'); 
					_reciteOrDoTest('do');
				};
            }else{
                G_Prg.$(nextBtnDiv).style.backgroundColor= '#FFF';
                G_Prg.$(nextBtnDiv).style.color= '#000';
                G_Prg.$(nextBtnDiv).innerHTML = '下一题';
				G_Prg.$(nextBtnDiv).style.width = '47%';
            }
        } else if (testType === 'XTEST' || subTestType === '不定项' || subTestType === '多项') {
            if(G_Prg.$(nextBtnDiv).innerHTML === '批阅'){
                G_Prg.$(nextBtnDiv).innerHTML = '答题';
                G_Prg.$(nextBtnDiv).onclick = function () {
					G_UserAction.addUserAction('doDivBtn'); 
					_reciteOrDoTest('do');
				};
            }
            G_Prg.$(buttonID).style.display = 'none';	//隐藏提交答案按钮
            //模拟考场，控制下一题按钮长度
            if(_fromUrl === 'simulatedExam.html'){
                G_Prg.$(nextBtnDiv).style.width = '47%';	//修改下一题按钮样式
            }
        } else if (testType === 'JDTEST' || testType === 'TKTEST') {
			if(testType === 'JDTEST'){
            	G_Prg.$(idArr['textarea'] +'_' + dragIndex).style.display = 'none';	//隐藏文本框
			}else if(testType === 'TKTEST'){
				var arrLen = G_Prg.$(idArr['itemOlID'] + dragIndex).getElementsByTagName('li').length;
				for(var i = 0;i < arrLen; i++){
					G_Prg.$(idArr['itemID'] + i + '_' + dragIndex).style.display = 'none';
				}
			}
            G_Prg.$(buttonID).style.display = 'none';	//隐藏查看答案按钮
            //模拟考场，控制下一题按钮长度
            if(_fromUrl === 'simulatedExam.html'){
                G_Prg.$(nextBtnDiv).style.width = '47%';	//修改下一题按钮样式
            }
            if(G_Prg.$(nextBtnDiv).innerHTML === '批阅'){
                G_Prg.$(nextBtnDiv).innerHTML = '答题';
                G_Prg.$(nextBtnDiv).onclick = function () { 
					G_UserAction.addUserAction('doDivBtn'); 
					_reciteOrDoTest('do');
				};
            }
        }
        G_Prg.$(operate).style.display = 'block';	//显示隐藏答案按钮
		
		if(_gAllTest.getAction(curTest.testNO-1) === 'reciteWithAnswer'){	//隐藏按钮显示
			G_Prg.$(operate).innerHTML = '隐藏答案';
		}else{	//查看按钮显示
			G_Prg.$(operate).innerHTML = '查看答案';
		}
		G_Prg.$(operate).onclick = function () {
			if(G_Prg.$(operate).innerHTML === '查看答案'){
				G_UserAction.addUserAction('reciteWithBtn'); 
				_gAllTest.setAction('reciteWithAnswer');
				G_Prg.$(operate).innerHTML = '隐藏答案';
			}else{
				G_UserAction.addUserAction('reciteNoBtn'); 
				_gAllTest.setAction('reciteNoAnswer');
				G_Prg.$(operate).innerHTML = '查看答案';
			}
			_init(0);
		};
        if(curTest.testType === 'TKTEST' ||　curTest.testType === 'JDTEST'){
            G_Prg.$(answerDiv).style.display = 'block';	//隐藏正确答案所在的div层
            G_Prg.$(answerDiv).className = 'rightAnswer';
        }else{
            G_Prg.$(answerDiv).style.display = 'none';	//隐藏正确答案所在的div层
        }
        _setCss();
    }
    /********************************************************************************
     函数名：_changeBtn
     功能：点击答题模式后，将隐藏按钮隐藏掉
     输入参数:curTest 当前试题
     返回值：无
     创建信息：黎萍（2014-08-21）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _changeBtn(curTest,dragIndex){
		if(!doTest){
			return;
		}
        var idArr = _setID(curTest);
        var operate = idArr['operate']+'_'+dragIndex;	//隐藏答案按钮的div层ID
        var nextBtnDiv = idArr['divBtnID']+'_'+dragIndex;	//页面中的下一题按钮的div层ID
        var buttonID = idArr['buttonID']+'_'+dragIndex;	//页面中的多选题提交答案按钮的div层ID
        var itemID = idArr['itemID'];
        var testType = curTest.testType; //试题类型
        var subTestType = curTest.subTestType; //针对A3和B题型的小题的试题类型进行定义
        var itemLen = curTest.selectedItems.length;
        G_Prg.$(operate).style.display = 'none';	//显示隐藏答案按钮
        if (testType === 'ATEST' || testType === 'PDTEST' || subTestType === '单项') {
            G_Prg.$(nextBtnDiv).className = 'next_button_3';	//修改下一题按钮样式
            G_Prg.$('markingDiv_'+dragIndex).innerHTML = '批阅'
            G_Prg.$('markingDiv_'+dragIndex).onclick = function () {
				G_UserAction.addUserAction('markDivBtn');
				_markingClick();
			};
			//批阅后，显示重考按钮
			if(!_IsDisabled && _gAllTest.getState(curTest.testNO-1) === 'marked'){
				G_Prg.$('markingDiv_'+dragIndex).innerHTML = '重考';
				G_Prg.$('markingDiv_'+dragIndex).onclick = function (){
					G_UserAction.addUserAction('retakeDivBtn');
					_reloadTest(dragIndex);
				};
			}
            G_Prg.$(operate).onclick = function () {};
        }else if (testType === 'XTEST' || subTestType === '不定项' || subTestType === '多项' || testType === 'JDTEST' || testType === 'TKTEST') {
            if (testType === 'JDTEST') {
                G_Prg.$(idArr['textarea'] +'_' +dragIndex).style.display = 'block';
                G_Prg.$(idArr['answerDiv'] + '_'+dragIndex).style.color = '#666';
            }if (testType === 'TKTEST') {
                G_Prg.$(idArr['answerDiv'] + '_'+dragIndex).style.color = '#666';
            }
            if(G_Prg.$(nextBtnDiv).innerHTML === '答题'){
                G_Prg.$(nextBtnDiv).innerHTML = '批阅'
                G_Prg.$(nextBtnDiv).onclick = function () {
					G_UserAction.addUserAction('markDivBtn');
					_markingClick();
				};
            }
            //模拟考场，控制下一题按钮长度
            if(_fromUrl === 'simulatedExam.html'){
                G_Prg.$(buttonID).style.display = 'none';	//隐藏按钮
            }else{
                G_Prg.$(buttonID).style.display = 'block';
                G_Prg.$(buttonID).style.color = '#000';
            }
            G_Prg.$(operate).onclick = function () {};
        }
        
    }
	/********************************************************************************
     函数名：_controlBtn
     功能：模拟考场、章节练习的最后一题按钮改成'批阅'按钮的控制
     输入参数：无
     返回值：无
     创建信息：黎萍（2014-07-28）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _controlBtn(curTest,dragIndex){
        //var curTest = _gAllTest.getCurTest(); //当前试题
        var testTotal = _gAllTest.getTestCount();	//试题总数
        var userID = G_Cookie.getUserID();
        var testType = curTest.testType; //试题类型
        var subTestType = curTest.subTestType; //针对A3和B题型的小题的试题类型进行定义
        var idArr = _setID(curTest);
        var divBtnID = idArr['divBtnID']+'_'+dragIndex;
        if(curTest.testNO === testTotal && userID && _checkIsBuySoft()){
            if(testType === 'XTEST' || testType === 'TKTEST' || testType === 'JDTEST' || subTestType === '不定项' || subTestType === '多项'){
                G_Prg.$('markingDiv_'+dragIndex).style.display = 'none';
                G_Prg.$(divBtnID).innerHTML = '批阅';
                G_Prg.$(divBtnID).className = 'marking_button_2';
                G_Prg.$(divBtnID).style.backgroundColor='#ff9900';//样式控制 韦友爱（2014-08-14）
                G_Prg.$(divBtnID).style.color='#fff';
                G_Prg.$(divBtnID).onclick = function () {
					G_UserAction.addUserAction('markDivBtn');
                    _markingClick();
                }; //批阅 单击事件设置
                //批阅后，不可再答题和批阅
                if(!_IsDisabled && _gAllTest.getState(curTest.testNO-1) === 'marked'){
                    G_Prg.$(divBtnID).innerHTML = '重考';
                    G_Prg.$(divBtnID).onclick = function (){
						G_UserAction.addUserAction('retakeDivBtn');
						_reloadTest(dragIndex);
					};
                }
            }else{
                G_Prg.$(divBtnID).style.display = 'none';
                G_Prg.$('markingDiv_'+dragIndex).style.display = 'block';
                //批阅后，不可再答题和批阅
                if(!_IsDisabled && _gAllTest.getState(curTest.testNO-1) === 'marked'){
                    G_Prg.$('markingDiv_'+dragIndex).innerHTML = '重考';
                    G_Prg.$('markingDiv_'+dragIndex).onclick = function (){
						G_UserAction.addUserAction('retakeDivBtn');
						_reloadTest(dragIndex);
					};
                }
            }
        }else{
            if(testType === 'XTEST' || testType === 'TKTEST' || testType === 'JDTEST' || subTestType === '不定项' || subTestType === '多项'){
                G_Prg.$(divBtnID).className = 'next_button_1';
                if(G_Cookie.getNightMode()){
                    G_Prg.$(divBtnID).style.backgroundColor='#4093DA';//样式控制 韦友爱（2014-08-19）
                    G_Prg.$(divBtnID).style.color='#fff';
                }else{
                    G_Prg.$(divBtnID).style.backgroundColor='#fff';//样式控制 韦友爱（2014-08-19）
                    G_Prg.$(divBtnID).style.color='#000';

                }
                G_Prg.$(divBtnID).innerHTML = '下一题';
                G_Prg.$(divBtnID).onclick = function () {
					G_UserAction.addUserAction('nextBtn1');
                    _moveNext();
                };
            }
            G_Prg.$('markingDiv_'+dragIndex).style.display = 'none';
            G_Prg.$(divBtnID).style.display = 'block';
        }
    }
    /********************************************************************************
     函数名：_showTitleCard
     功能：显示题卡
     输入参数: 无
     返回值：无
     创建信息：黎萍（2014-07-24）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _showTitleCard(dragIndex){
        G_Prg.$('cardDialog').innerHTML = '';
        G_Prg.htmlContent('100%','100%','','',true);//弹出窗口，把html移动到弹出框，动态添加
        G_Prg.$('hcdialogBody').innerHTML = _cardHtml;
        G_Prg.$('hcdvMsgBackBtn').style.display = 'block';
		G_Prg.$('hcdvMsgBackText').innerHTML = '题卡';
        G_Prg.$('hcdvMsgClose').style.display = 'none';
        _createTitleCard();	//创建题卡
        G_Prg.$('testMenu').style.display = 'none';
        if (G_Cookie.getNightMode()) {
            G_Prg.$('hcdvMsgBox').style.background='#152d35';
        }
		var curTest = _gAllTest.getCurTest();
        if(!_IsDisabled && _gAllTest.getState(curTest.testNO-1) === 'marked'){
            G_Prg.$('cardPY').innerHTML = '重考';
            G_Prg.$('cardPY').onclick = function (){
				G_UserAction.addUserAction('cardRetakeBtn');
				_reloadTest(dragIndex);
			};
        }
		if(_gAllTest.getState(curTest.testNO-1) === 'recite'){
			G_Prg.$('cardPY').innerHTML = '答题';
			G_Prg.$('cardPY').onclick = function (){ 
				G_DialogContent.dispose();	//关闭弹出层
				G_UserAction.addUserAction('cardDoBtn');
				_reciteOrDoTest('do');
			};
		}
    }
    /********************************************************************************
     函数名：_createTitleCard
     功能：创建题卡
     输入参数: 无
     返回值：无
     创建信息：黎萍（2014-07-09）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _createTitleCard(){
        G_Prg.$('cardContent').innerHTML = '';	//生成题卡之前，先将展示题卡的面板清空，防止题卡追加
        var arrAllTest = _gAllTest.getArrAllTest();
        //根据试题数量循环生成题卡
        for(var i = 0; i < arrAllTest.length; i++){
            var ulTag = document.createElement('ul');
            if(G_Prg.$('ID_'+arrAllTest[i].style) === null){
                var titleType = document.createElement('div');
                titleType.id = 'ID_' + arrAllTest[i].style;
                titleType.className = 'carType';
                titleType.innerHTML = arrAllTest[i].style;
                G_Prg.$('cardContent').appendChild(titleType);
            }
            var userReply = arrAllTest[i].userReply; //用户的答案
            var isRight = arrAllTest[i].isRight; //是否回答正确
            var selected = arrAllTest[i].selected;	//记录当前试题选项是否已被选中，但是没有进行答案的提交
            var liTag = document.createElement('li');
            //用户的答案不为空，说明用户进行了选择，则修改题卡的样式为被选中的样式
            if(userReply !== ''){
                if(isRight === false || _selected === 1 || selected === 1){
                    liTag.className = 'card_Answered';	 //用户选择了答案，并未提交答案
                }else if(isRight === 0){
                    liTag.className = 'card_Right';	//回答正确，则调用正确的样式
                }else if(isRight === 1){
                    liTag.className = 'card_Error';	//回答错误，则调用错误的样式
                }
            }else{
                liTag.className = 'card_NoAnswer';
            }
            var curTest = _gAllTest.getCurTest(); //当前试题
            if(arrAllTest[i].testNO === curTest.testNO){
                liTag.style.border = '1px solid #4093DA';
            }
			if(_fromUrl === 'simulatedExam.html' && _gAllTest.getState(curTest.testNO-1) !== 'marked'){
				G_Prg.$('carAnswered1').style.display = 'block';
				G_Prg.$('carAnswered2').style.display = 'block';
				
				
				G_Prg.$('cardRight1').style.display = 'none';
				G_Prg.$('cardRight2').style.display = 'none';
				G_Prg.$('cardWrong1').style.display = 'none';
				G_Prg.$('cardWrong2').style.display = 'none';
			}else if(_fromUrl === 'simulatedExam.html' && _gAllTest.getState(curTest.testNO-1) === 'marked'){
				G_Prg.$('carAnswered1').style.display = 'none';
				G_Prg.$('carAnswered2').style.display = 'none';
				
				
				G_Prg.$('cardRight1').style.display = 'block';
				G_Prg.$('cardRight2').style.display = 'block';
				G_Prg.$('cardWrong1').style.display = 'block';
				G_Prg.$('cardWrong2').style.display = 'block';
			}
            liTag.id = arrAllTest[i].testNO;	//将试题编号设置为li标签的ID
            liTag.onclick = function () {
                document.body.style.overflow = 'auto';
                G_DialogContent.dispose();
                _testNOClick(this.id);
            };
            liTag.innerHTML = ((_curPage - 1) * 50 + arrAllTest[i].testNO);	//将试题编号
            ulTag.appendChild(liTag);
            G_Prg.$('ID_'+arrAllTest[i].style).appendChild(ulTag);
        }

        var cardSpace = document.createElement('div');
        cardSpace.id = 'cardSpace';
        cardSpace.style.width = '95%';
        cardSpace.style.height = '50px';
        cardSpace.style.float = 'left';
        G_Prg.$('cardContent').appendChild(cardSpace);

        var cardPYBg = document.createElement('div');
        cardPYBg.id = 'cardPYBg';
        cardPYBg.className = 'cardPYBg';
        G_Prg.$('cardContent').appendChild(cardPYBg);

        var cardPY =  document.createElement('div');
        cardPY.innerHTML = '提交批阅';
        cardPY.onclick = function () {
            //G_DialogContent.dispose();
			G_UserAction.addUserAction('cardMarkBtn');
            _markingClick();
        };
        cardPY.id = 'cardPY';
        cardPY.className = 'cardPY';
        G_Prg.$('cardContent').appendChild(cardPY);
        /********************************************************************************
         函数名：_testNOClick
         功能：设置题卡的单击事件
         输入参数: 无
         返回值：无
         创建信息：黎萍（2014-07-09）
         修改记录：无
         审查人：无
         *******************************************************************************/
        function _testNOClick(curTestNO){
            G_Prg.$('cardDialog').style.display = 'none';
            _gAllTest.move(curTestNO-1);	//设置当前试题编号
            _init('card');
        }
    }
    /********************************************************************************
     函数名：_showTestMenuBar
     功能：点击做题界面右上角的图片，显示做题界面的菜单栏
     输入参数：无
     返回值：无
     创建信息：黎萍（2014-07-08）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _showTestMenuBar(dragIndex){
        var menu = G_Prg.$('testMenu');
        if(menu.style.display === 'none'){
            menu.style.display = 'block';
        }else{
            menu.style.display = 'none';
        }
		var curTest = _gAllTest.getCurTest();
		//背题模式，禁用批阅按钮
		if(_gAllTest.getState(curTest.testNO-1) === 'recite'){
			//G_Prg.$('marking').getElementsByTagName('span')[0].style.color = '#999';	//将按钮灰掉 
			G_Prg.$('marking').onclick = function () {};
			//G_Prg.$('retake').getElementsByTagName('span')[0].style.color = '#999';	//将按钮灰掉 
			G_Prg.$('retake').onclick = function () {};
		}else{
			//G_Prg.$('marking').getElementsByTagName('span')[0].style.color = '#fff';
			G_Prg.$('marking').onclick = function () {
				G_Prg.$('testMenu').style.display = 'none';
				G_UserAction.addUserAction('markBtn');
				_markingClick();	
			};
			//G_Prg.$('retake').getElementsByTagName('span')[0].style.color = '#fff';	
			G_Prg.$('retake').onclick = function () {
				G_UserAction.addUserAction('retakeBtn');
				_reloadTest(dragIndex);//重考单击事件	
			};	
		}
		
    }
    /********************************************************************************
     函数名：_setShareTest
     功能：设置做题界面右上角的登录按钮、返回首页按钮的切换功能
     输入参数:无
     返回值：无
     创建信息：黎萍（2014-08-20）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _setShareTest(){
        var btnShare = G_Prg.$('btnShare');	//分享按钮
        var userID = G_Cookie.getUserID();
        //判断用户是否已登陆，如果用户没有登录，则提示用户去登录
		btnShare.onclick = function () {
			G_UserAction.addUserAction('btnShare');
			if (!userID) {
				G_Prg.confirm('该功能登录后使用！', function (){
					window.location.href = 'userLogin.html?fromUrl=doExam.html&cptName='+G_Prg.getQueryString('cptName',true);	
				});
			}else{
				_gAllTest.setShareTest(G_Cookie.getAppName(),JSON.stringify(_gAllTest.getCurTest()));
				G_Prg.$('shareTest').innerHTML = '';
				G_Prg.htmlContent('85%','250px','分享试题','',true);//弹出窗口，把html移动到弹出框，动态添加
				G_Prg.$('hcdialogBody').innerHTML = _shareHtml;
				G_Prg.$('txtHtmlUrl').value = _gAllTest.getShareUrl();
				G_Prg.$('hcdvMsgBackBtn').style.display = 'none';
				G_Prg.$('hcdvMsgClose').style.display = 'block';
				G_Prg.$('hcShowBolightBox').onclick = function(){
					G_DialogContent.dispose();
				};
				var shareUrl = G_Prg.$('txtHtmlUrl');
				G_Prg.$('share_txwb').onclick = function(){
					G_Share.txwb(shareUrl.value,'我正在使用【考试宝典】，发现一道很好的试题分享给大家！');
					G_DialogContent.dispose();
				};
				G_Prg.$('share_xlwb').onclick = function(){
					G_Share.xlwb(shareUrl.value,'我正在使用【考试宝典】，发现一道很好的试题分享给大家！');
					G_DialogContent.dispose();
				};
				G_Prg.$('share_qzone').onclick = function(){
					G_Share.qzone(shareUrl.value,'我正在使用【考试宝典】，发现一道很好的试题分享给大家！');
					G_DialogContent.dispose();
				};
			}
		};
    }
    /********************************************************************************
     函数名：_goBackDir
     功能：返回章节目录界面
     输入参数：flag 标记是哪个界面调用改函数
     返回值：无
     创建信息：黎萍（2014-06-12）
     修改记录：黎萍（2014-06-16）增加评分界面退出功能
     修改记录：黎萍（2014-07-04）增加页面跳转参数sbjID 科目id,srcID 来源id
     韦友爱（2014-07-24）删除页面跳转参数sbjID 科目id,srcID 来源id
     删除输入参数sbjID 科目id,srcID 来源id
	 黎萍（2015-05-12）增加对视频返回做题页面后的路径处理
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _goBackDir(flag) {
        var curTest = _gAllTest.getCurTest(); //当前试题
        if(_replay === '1'){
            var msg = '确定要退出答题界面？';
			if(_fromUrl === 'simulatedExam.html'){
				msg = '确定要退出模拟考场？';
			}
            G_Prg.confirm(msg, function () {
                _gAllTest.addReplyJson();
                window.location.href = 'default.html?fromUrl=doExam.html';
            });
            return;
        }
        if(!_fromUrl){
            var msg = '确定要退出答题界面吗？';
			if(_fromUrl === 'simulatedExam.html'){
				msg = '确定要退出模拟考场？';
			}
            G_Prg.confirm(msg, function () {
                _gAllTest.addReplyJson();
                window.location.href = 'chapterMenu.html?fromUrl=doExam.html';
            });
            return;
        }
        if (flag === 'test') {
            var msg = '确定要退出答题界面吗？';
			if(_fromUrl === 'simulatedExam.html'){
				msg = '确定要退出模拟考场？';
			}
            var url = '';
            var type=G_Prg.getQueryString('type');
            if(_fromUrl === 'testList.html'){
                if(type==='findTest'){
                    var keyWord = G_Prg.getQueryString('keyWord',true);
                    url = _fromUrl + '?fromUrl=doExam.html&page='+_curPage+'&keyWord='+keyWord+'&type='+type;
                }else if(type==='noteRank'){
                    var time = G_Prg.getQueryString('time',true);
                    url = _fromUrl + '?fromUrl=doExam.html&page='+_curPage+'&time='+time+'&type='+type;
                }else{
                    url = _fromUrl + '?fromUrl=doExam.html&page='+_curPage+'&type='+type;
                }
            } else if (_fromUrl === 'video.html' || _fromUrl === 'easyErrorTest.html') {
				url = 'easyErrorTest.html?fromUrl=doExam.html&page=' + _curPage;
			} else{
				url = _fromUrl + '?fromUrl=doExam.html';
			}
            G_Prg.confirm(msg, function () {
                _gAllTest.addReplyJson();
				G_Storage.removeSessionStorageValue('ConfigJSON');
                window.location.href = url;
            });
        } else if (flag === 'score') {
            window.location.href = _fromUrl + '?fromUrl=doExam.html&page='+_curPage;
        }
		
    }
	/********************************************************************************
	功能：点击批阅按钮，弹出提示：是否交卷评分，实现批阅功能
	输入参数：无
	返回值：无
	最后修改人：黎萍（2014-12-23）
	修改记录：点击背题模式，禁止再操作批阅
	*******************************************************************************/
    function _markingClick() {
        var curTest = _gAllTest.getCurTest(); //当前试题
		//点击背题模式，禁止再操作批阅
		if(_gAllTest.getState(curTest.testNO-1) === 'recite'){//背题模式
			return;
		}
        var scoresjson = _gAllTest.calculateScores(); //接收分数的json数据
        var msg = '';
        if ( scoresjson.doneNum === 0) {
            msg = '请您先答题，再批阅！';
            //G_Prg.alert(msg,function(){G_DialogContent.dispose();});
            G_Prg.alert(msg);
        } else {
            msg = '确定批阅试题？';
            G_Prg.confirm(msg, function () {
                _selected = 0;
				_blurFlag = '';
                var arrAllTest = _gAllTest.getArrAllTest();
                //章节练习的多选题已被选中，但是没有进行答案的提交,在批阅后添加答题明细记录
                for(var i = 0; i < arrAllTest.length; i++){
                    if(arrAllTest[i].selected === 1){
                        if(arrAllTest[i].isRight === 1 || arrAllTest[i].isRight === 0 ){
                            _addReplyLog(_gAllTest.getTest(i),arrAllTest[i].isRight, arrAllTest[i].userReply);
                        }
                    }
                }
                for(var i = 0; i < arrAllTest.length; i++){
                    if(arrAllTest[i].selected === 1){
                        arrAllTest[i].selected = 0;//标记章节练习的多选题已被选中，但是没有进行答案的提交；1 已选中 0 已提交
                    }
                }
                G_DialogContent.dispose();
                G_Prg.htmlContent('100%', '100%', '', _showScoreLayer(), true);
				G_Prg.$('hcdvMsgBackText').innerHTML = '学习总结';
                G_Prg.$('hcdvMsgClose').style.display = 'none';
                G_Prg.$('hcdvMsgBackBtn').style.display = 'block';
                G_Prg.$('hcdvMsgBackBtn').onclick = function () {
                    document.body.style.overflow = 'auto';
                    _showDoneTest();	//设置返回按钮点击事
					G_UserAction.addUserAction('markBackBtn');
                };
                if(_fromUrl === 'simulatedExam.html'){	//模拟考场在提交批阅时，统一将所有错题记录提交到数据库
                    //根据试题数量循环将错题信息插入到数据库中
                    for(var i = 0; i < arrAllTest.length; i++){
                        if(arrAllTest[i].isRight === 1 || arrAllTest[i].isRight === 0 ){
                            _addReplyLog(_gAllTest.getTest(i),arrAllTest[i].isRight, arrAllTest[i].userReply,'yes');
                        }
                    }
                }
                _setCss();
                if (G_Cookie.getNightMode()) {
                    G_Prg.$('hcdvMsgBox').style.background = '#152d35';
                }
                var pyHtml = G_Prg.$('content').innerHTML;
                G_Prg.$('hcdialogBody').innerHTML = pyHtml.replace('searchDoneTest', 'searchDoneTest2');
                G_Prg.$('searchDoneTest2').onclick = function () {
                    document.body.style.overflow = 'auto';
                    _showDoneTest();
					G_UserAction.addUserAction('markTestBackBtn');
                }; //设置查看答题情况按钮点击事
            }); //确定交卷评分，显示评分弹出层
        }
    }
    /********************************************************************************
     函数名：_showDoneTest
     功能：批阅界面，点击查看答题情况，返回到做题界面，显示已经做过的试题
     输入参数：无
     返回值：无
     创建信息：黎萍（2014-06-12）
     修改记录：无
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _showDoneTest() {
        G_Prg.$('retake').style.display = 'block';
        G_Prg.$('marking').style.display = 'none';
		G_Prg.$('retake2').style.display = 'block';
        G_Prg.$('marking2').style.display = 'none';
        _gAllTest.setState('marked',1);
        G_DialogContent.dispose();
        _gAllTest.move(0);	//设置当前试题编号
        _init(0);
        _setCss();
        _gFlipsnap.moveToPoint(0,0);	//滑动到指定的层
    }
    /********************************************************************************
     函数名：_tipsBuySoft
     功能：对未充值用户试用完试题后，提示进行充值获取更多试题
     输入参数：无
     返回值：无
     创建信息：黎萍（2014-06-19）
     修改记录：无
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _tipsBuySoft() {
        var msg = '请充值购买，使用更多试题！';
        G_Prg.confirm(msg, function () {
            var userID = G_Cookie.getUserID();
            if(userID){
                var isiphone=G_Prg.getCookie('CLIENTTYPE');
                if(isiphone&&isiphone.toString().toLowerCase()==='iphone'){
                    window.location="ios://iOSiap";
                }else{
                    window.location.href = '../html/selectPrice.html?fromUrl=doExam.html&cptName='+G_Prg.getQueryString('cptName',true);
                }
            } else{
                //window.location.href = '../html/userLogin.html?fromUrl=doExam.html';
                window.location.href = '../html/userLogin.html?fromUrl=doExam.html&cptName='+G_Prg.getQueryString('cptName',true)+'&toUrl=selectPrice.html';
            }
        });
    }
    /********************************************************************************
     函数名：_checkIsBuy
     功能：判断用户当前浏览的科目是否在已购买的数组里面，否则提示用户进行购买
     输入参数：无
     返回值：无
     创建信息：黎萍（2014-06-19）
     修改记录：无
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _checkIsBuySoft() {
        var isVip = _gAllTest.getIsVip();	//标记是否是VIP用户
        return isVip;
    }
    /********************************************************************************
     函数名：_checkUserTest
     功能：如果是从我的收藏、我的笔记、错题重做进入答题界面的，当点击到最后一题时，提示已到最后一题
     输入参数：无
     返回值：true 表示是从我的收藏、我的笔记、错题重做进入答题界面的
     创建信息：黎萍（2014-07-08）
     修改记录：韦友爱（2014-07-28）添加从章节最终列表也的我的收藏、我的笔记、错题重做按钮进入答题界面的判断
     审查人：无
     *******************************************************************************/
    function _checkUserTest(){
        if(_fromUrl === 'testList.html'){
            return true;
        }
        if(_fromUrl === 'chapterMenu.html' && G_Prg.getQueryString('type')){
            return true;
        }
    }
    /********************************************************************************
     函数名：_moveNext
     功能：点击下一题，再从json中读取数据展示在界面
     输入参数：无
     返回值：无
     创建信息：黎萍（2014-05-19）
     修改记录：黎萍（2014-05-22）将试题编号作为参数传入
     韦友爱（2014-07-15）点击下一题时，将笔记内容清空，然后再init
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _moveNext() {
        var testCount = _gAllTest.getTestCount();	//总试题数
        var curIndex = _gAllTest.getCurIndex();	//当前试题索引
        if(_gAllTest.moveNext()){
            if(curIndex === 0){
                _gFlipsnap.moveToPoint(1,0);	//滑动到指定的层
            }else if(curIndex === (testCount-2)){
                _gFlipsnap.moveToPoint(2,0);	//滑动到指定的层
            }else{
                _init(2);
                _reflashDragControl(1);	//刷新拖拽控件
            }
            _setFavTestInfos();
            _refreshNoteIcon();
            _showTestTypeIntro();
        }else{
            if (_checkIsBuySoft() || _checkUserTest()) {
                G_Prg.alert('已经是最后一题了！');
            } else {
                _tipsBuySoft();
            }
        }
    }
    /********************************************************************************
     函数名：_movePre
     功能：点击上一题，再从json中读取数据展示在界面
     输入参数：无
     返回值：无
     创建信息：黎萍（2014-05-19）
     修改记录：黎萍（2014-05-22）将试题编号作为参数传入
     韦友爱（2014-07-15）点击上一题时，将笔记内容清空，然后再init
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _movePre() {
        var testCount = _gAllTest.getTestCount();//总试题数
        var curIndex = _gAllTest.getCurIndex();//当前试题索引
        if(_gAllTest.movePre()){
            if(curIndex === 1){
                _gFlipsnap.moveToPoint(0,0);	//滑动到指定的层
            }else if(curIndex === (testCount-1)){
                _gFlipsnap.moveToPoint(1,0);	//滑动到指定的层
            }else{
                _init(1);
                _reflashDragControl(1);	//刷新拖拽控件
            }
            _setFavTestInfos();
            _refreshNoteIcon();
            _showTestTypeIntro();
        }else{
            G_Prg.alert("已经是第一题了！");
        }
    }
    /********************************************************************************
     函数名：_reloadTest
     功能：重考，清空用户答题记录
     输入参数：无
     返回值：无
     创建信息：黎萍（2014-07-31）
     修改记录：韦友爱（2014-08-13）添加_firstShow数组的清空
	 修改记录：黎萍（2015-03-18）点击重考按钮，恢复背题模式功能操作
     审查人：无
     *******************************************************************************/
    function _reloadTest(dragIndex){
        G_Prg.$('testMenu').style.display = 'none';
        G_Prg.$('retake').style.display = 'none';	//重考按钮隐藏
        G_Prg.$('marking').style.display = 'block';	//批阅按钮再次出现
		 G_Prg.$('retake2').style.display = 'none';	//重考按钮隐藏
        G_Prg.$('marking2').style.display = 'block';	//批阅按钮再次出现
        G_Prg.$('markingDiv_'+dragIndex).innerHTML = '批阅';
        G_Prg.$('markingDiv_'+dragIndex).style.display = 'block';
		G_Prg.$('reciteImg').src = '../images/beiti.png';
        G_Prg.$('reciteTest').getElementsByTagName('span')[0].style.color = '#fff';
        G_DialogContent.dispose();	//关闭弹出层
        //先清空结构体数组中用户的回答信息：隐藏正确答案与解析：恢复选项默认颜色：恢复选项的单击事件
        var arrAllTest = _gAllTest.getArrAllTest();
        for(var i = 0; i < arrAllTest.length; i++){
            arrAllTest[i].userReply = '';
            arrAllTest[i].isRight = false;
        }
        _gAllTest.clearAction();
        _gAllTest.setState('uncommited',1);
        _firstShow=[];//清空是否第一次显示的标记
        _addNote=[];
        _gAllTest.move(0);	//跳转到第一题
        _init(0);
		_setCss();
		if(_fromUrl === 'simulatedExam.html'){//模拟考场禁止使用背题模式
			_showConfigJsonInfos();
		}
        _gFlipsnap.moveToPoint(0,0);	//滑动到指定的层
    }
    /********************************************************************************
     函数名：_showScoreLayer
     功能：显示评分的提示遮罩层
     输入参数：无
     返回值：无
     创建信息：黎萍（2014-06-16）
     修改记录：黎萍（2014-06-26）修改对成绩评定的判断
     		黎萍（2014-08-01）抽取验证数据的部分封装成方法，使用返回参数数组的方式
			黎萍（2014-12-08）控制及格率保留2位小数
     审查人：陈昊（2014-06-26）
     *******************************************************************************/
    function _showScoreLayer() {
        var scoresjson = _gAllTest.calculateScores(); //接收分数的json数据
        var correctRate = Number(scoresjson.correctRate)*100; //及格率
        var scoreText = ''; //成绩评定：不及格、及格、优秀
        //根据正确率设置成绩描述
        if (correctRate < 60) {
            scoreText = '不及格';
        } else if (correctRate < 90) {
            scoreText = '及格';
        } else {
            scoreText = '优秀';
        }
        var totalNum = scoresjson.testCount;
        var testNum = scoresjson.doneNum;
        var rightTestNum = scoresjson.rightNum;
		var allScore = scoresjson.allScore
		var userScore = scoresjson.userScore
        G_Prg.$('doneNum').innerHTML = testNum+'/'+totalNum; //已做试题数
        G_Prg.$('rightNum').innerHTML = rightTestNum; //答对试题数
        G_Prg.$('correctRate').innerHTML = correctRate.toFixed(2) + '%'; //正确率
        G_Prg.$('scoreText').innerHTML = scoreText; //成绩评定
        //G_Prg.$('testCount').innerHTML = totalNum; //试题总数
		G_Prg.$('allScore').innerHTML = allScore; //满分
        G_Prg.$('userScore').innerHTML = userScore; //得分
        if(_fromUrl === 'simulatedExam.html'){
			/*模拟考场批阅后，由于多了两项，使得在ipod中无法将批阅结果完全显示*/
			var divSpace = document.createElement('div');
			divSpace.id = 'divSpace';
			divSpace.style.width = '95%';
			divSpace.style.height = '50px';
			divSpace.style.float = 'left';
			G_Prg.$('showExam').appendChild(divSpace);
			
			G_Prg.$('allScoreText').style.display = 'block'; 
        	G_Prg.$('userScoreTxt').style.display = 'block'; 
			G_Prg.$('allScoreText2').style.display = 'block'; 
        	G_Prg.$('userScoreTxt2').style.display = 'block'; 
        }
        var infosArr = _checkInfos('no');
        if (!infosArr) {
            return;
        }
        var cptName = G_Prg.$('chaptername').innerHTML;	//章节名称
        var curTest = _gAllTest.getCurTest(); //当前试题
        var examType = _setExamType();
        _gAllTest.updateChapterHistory(curTest,infosArr['appID'],infosArr['userID'],cptName,totalNum, testNum, rightTestNum, _replyStartTime,examType,_viewCount,allScore,userScore);	//添加批阅数据到数据库中
		var cptID=G_Cookie.getCptID();
		if(!cptID){
			//G_Prg.throw('程序运行错误，TestUI._showScoreLayer : cptID = "'+cptID+'",获取数据出现异常'); 
			return;
		}
		var infos = _gAllTest.getCorrectRate(infosArr['appID'],cptID,correctRate,totalNum);
		G_Prg.$('practiceCount').innerHTML = '本章学习人数'+infos.totalUserNum+'人，您击败了'+ Number(infos.overCorrectRate.toFixed(2))*100 + '%的考生';
        //G_Prg.$('beatRate').innerHTML = '您击败了'+ Number(infos.overCorrectRate)*100 + '%的考生';
    }
    /********************************************************************************
     函数名：_addFav
     功能：添加收藏
     输入参数:无
     返回值：无
     创建信息：韦友爱（2014-07-02）
     修改记录：黎萍（2014-07-04）修改提示信息
     黎萍（2014-08-01）抽取验证数据的部分封装成方法，使用返回参数数组的方式
     审查人：无
     *******************************************************************************/
    function _addFav() {
        var infosArr = _checkInfos('yes');
        if (!infosArr) {
            return;
        }
        var curTest = _gAllTest.getCurTest(); //当前试题
        _gAllTest.addFav(curTest,infosArr['appID'],infosArr['userID'],infosArr['userName'],infosArr['guid']);
        G_Prg.popMsg('已收藏');
        _gAllTest.setFav(1);
        _setFavTestInfos();
    }
    /********************************************************************************
     函数名：_removeFav
     功能：取消收藏
     输入参数: 无
     返回值：无
     创建信息：韦友爱（2014-07-02）
     修改记录：黎萍（2014-07-04）修改提示信息
     黎萍（2014-08-01）抽取验证数据的部分封装成方法，使用返回参数数组的方式
     审查人：无
     *******************************************************************************/
    function _removeFav(){
        var infosArr = _checkInfos('yes');
        if (!infosArr) {
            return;
        }
        var curTest = _gAllTest.getCurTest(); //当前试题
        _gAllTest.removeFav(curTest,infosArr['appID'],infosArr['userID'],infosArr['userName'],infosArr['guid']);
        G_Prg.popMsg('已取消收藏');
        _gAllTest.setFav(0);
        _setFavTestInfos();
    }
    /********************************************************************************
     函数名：_setFavTestInfos
     功能：控制取消收藏按钮的显示与隐藏
     输入参数: 无
     返回值：无
     创建信息：黎萍（2014-07-04）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _setFavTestInfos(){
        var fav = _gAllTest.getFav(_gAllTest.getCurIndex());
        var curTest = _gAllTest.getCurTest(); //当前试题
        var curFav=0;
        if(fav===false){
            curFav=curTest.isFav;
        }else{
            curFav=fav;
        }
        if(curFav === 1){
            G_Prg.$('removeFav').style.display='block';
            G_Prg.$('fav').style.display='none';
        }else{
            G_Prg.$('removeFav').style.display='none';
            G_Prg.$('fav').style.display='block';
        }
    }

    /********************************************************************************
     函数名：_refreshNoteIcon
     功能：刷新底部笔记图标
     输入参数：无
     返回值：无
     创建信息：谢建沅（2014-08-19）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _refreshNoteIcon(){
        var curTest = _gAllTest.getCurTest(); //当前试题
        var userNote = _gAllTest.getUserNote(_gAllTest.getCurIndex());
        if(userNote===''){
            userNote=curTest.userNote;
        }
        if(userNote){
            G_Prg.$('updateNote').style.display='block';
            G_Prg.$('note').style.display='none';
        } else{
            G_Prg.$('updateNote').style.display='none';
            G_Prg.$('note').style.display='block';
        }
    }

    /********************************************************************************
     函数名：_myNoteClick
     功能：用户尚未添加有笔记时，笔记按钮的点击事件
     输入参数:无
     返回值：无
     创建信息：韦友爱（2014-07-02）
     修改记录：黎萍（2014-07-06）修改函数名
     韦友爱（2014-07-16）调用封装的笔记编辑框
     廖黎（2014-07-29） 将数据处理部分放入testData中
     黎萍（2014-08-01）抽取验证数据的部分封装成方法，使用返回参数数组的方式
     审查人：无
     *******************************************************************************/
    function _myNoteClick(dragIndex){
        var infosArr = _checkInfos('yes');
        if (!infosArr) {
            return;
        }
        var curTest = _gAllTest.getCurTest(); //当前试题
        var yesCallback=function (note){
			G_UserAction.addUserAction('addNoteBtn');
            if(note){
                _setMyNote(curTest, note.replace(_regerN,'[br]'),infosArr['appID'],infosArr['userID'],infosArr['userName'],infosArr['guid'],dragIndex);
            }else{
                setTimeout(function(){window.scrollTo(0,0);},0);
            }
        };
        var noCallback=function(){
			G_UserAction.addUserAction('cancleNoteBtn');
            setTimeout(function(){window.scrollTo(0,0);},0);
        };
        G_Prg.textarea('',yesCallback,noCallback);
        //document.body.style.overflow = 'hidden';
		G_Prg.$('tbdvMsgTitle').innerHTML = '添加笔记';
    }
    /********************************************************************************
     函数名：_updateNoteClick()
     功能：用户添加笔记之后，笔记按钮的点击事件
     输入参数:无
     返回值：无
     创建信息：韦友爱（2014-07-16）
     修改记录：廖黎（2014-07-29） 将数据处理部分放入testData中
     黎萍（2014-08-01）抽取验证数据的部分封装成方法，使用返回参数数组的方式
     审查人：无
     *******************************************************************************/
    function _updateNoteClick(dragIndex){
        var infosArr = _checkInfos('yes');
        if (!infosArr) {
            return;
        }
        var userNote = _gAllTest.getUserNote(_gAllTest.getCurIndex());
        var curTest = _gAllTest.getCurTest(); //当前试题
        if(userNote===''){
            userNote= curTest.userNote;
        }
        var yesCallback=function (note){
			G_UserAction.addUserAction('confirmNoteBtn');
            if(note){
                _setMyNote(curTest, note.replace(_regerN,'[br]'),infosArr['appID'],infosArr['userID'],infosArr['userName'],infosArr['guid'],dragIndex);
            }else{
                setTimeout(function(){window.scrollTo(0,0);},0);
                G_Prg.confirm('确认要删除该笔记信息？', function(){
					G_UserAction.addUserAction('deleteNoteBtn');
                    _deleteNote(curTest,infosArr['appID'],infosArr['userID'],infosArr['userName'],infosArr['guid'],dragIndex);
                });
            }
        };
        var noCallback=function(){
			G_UserAction.addUserAction('cancleNoteBtn');
            setTimeout(function(){window.scrollTo(0,0);},0);
        };
        G_Prg.textarea(userNote.replace(new RegExp('\\[br\\]','gm'),'\n'),yesCallback,noCallback);
        //document.body.style.overflow = 'hidden';
		G_Prg.$('dialogTxtArea').onclick = function(){G_UserAction.addUserAction('inputNoteTxt');};
    }
    /********************************************************************************
     函数名：_deleteNote
     功能：连接到deleteUserNote接口，删除当前试题的笔记内容
     输入参数: appID 软件ID
     userID 用户ID
     curTest 当前试题
     返回值：无
     创建信息：韦友爱（2014-07-14）
     修改记录：韦友爱（2014-07-16）添加调用_setNoteTestInfos()
     廖黎（2014-07-29） 将数据处理部分放入testData中，页面部分作为数据处理后的回调函数执行
     韦友爱（2014-09-18）调换添加笔记和显示他人笔记的执行顺序
     审查人：无
     *******************************************************************************/
    function _deleteNote(curTest,appID,userID,userName,guid,dragIndex) {
        G_Prg.popMsg('删除成功');
        _gAllTest.setUserNote(null);
        
        _refreshNoteIcon();
        _showCurTest(curTest, _gFlipsnap.currentPoint);
        _gAllTest.setMyNote(curTest, '',appID,userID,userName,guid);
    }
    /********************************************************************************
     函数名：_setMyNote
     功能：连接到setUserNote接口，设置当前试题的笔记内容
     输入参数: appID 软件ID
     userID 用户ID
     curTest 当前试题
     note 笔记内容
     返回值：无
     创建信息：韦友爱（2014-07-15）
     修改记录：韦友爱（2014-07-16）添加调用_setNoteTestInfos()
     廖黎（2014-07-29） 将数据处理部分放入testData中，页面部分作为数据处理后的回调函数执行
     韦友爱（2014-09-18）调换添加笔记和显示他人笔记的执行顺序
     审查人：无
     *******************************************************************************/
    function _setMyNote(curTest, note,appID,userID,userName,guid,dragIndex) {
        _addNote[curTest.testNO-1]=1;
        G_Prg.popMsg('保存成功');
        window.scrollTo(0, document.body.scrollHeight + 40);

        if(note&&note.length>100){
            note=note.substr(0,100);
        }
        _gAllTest.setUserNote(note);
        _gAllTest.setTime('今天');
        _refreshNoteIcon();
        setTimeout(function(){window.scrollTo(0,0);},0);
        _gAllTest.setAction('addNote');
        _showCurTest(curTest, _gFlipsnap.currentPoint);
        _gAllTest.setMyNote(curTest, note,appID,userID,userName,guid);
    }
    /********************************************************************************
     函数名：_setCss
     功能：设置自定义样式
     输入参数: 无
     返回值: 无
     创建信息：谢建沅（2014-07-06）
     修改记录：无errorAnswer  rightAnswer
     韦友爱（2014-07-21）添加笔记、答案字体控制
     韦友爱（2014-08-04）添加字体行高控制
     审查人：无
     *******************************************************************************/
    function _setCss(){
        //设置自定义样式
        if(G_Cookie.getNightMode()){
            _fontColor = 'nightItem';
        }else{
            _fontColor = 'defaultItem';
        }
        var fontSize = G_Cookie.getFontSize()|| '20px';
        var bgColor = G_Cookie.getDayMode() || G_Cookie.getNightMode() || '#FFF';
        var fontColor = G_Cookie.getDFontColor() || G_Cookie.getNFontColor() || '#000';
        document.body.style.fontSize = fontSize;
        document.body.style.backgroundColor = bgColor;
        document.body.style.color = fontColor;
        var newNumber=Number(fontSize.substring(0,fontSize.length-2));
        if(newNumber>23){//行间距控制
            document.body.style.lineHeight='35px';
        }else{
            document.body.style.lineHeight='25px';
        }
        var tishu=document.getElementsByClassName('tishu');
        for(var i=0;i<tishu.length;i++){
            tishu[i].style.color = fontColor;
        }
        var titleArr = document.getElementsByClassName('title');
        var newFontSize = (newNumber+2)+'px';
        for(var i=0;i<titleArr.length;i++){
            if(newNumber>23){
                titleArr[i].style.lineHeight='40px';
            }else{
                titleArr[i].style.lineHeight='30px';
            }
            titleArr[i].style.fontSize = newFontSize;
        }
        var btnArr1 = document.getElementsByClassName('next_button_1');
        for(var i=0;i<btnArr1.length;i++){
            if(G_Cookie.getNightMode()){
                btnArr1[i].style.backgroundColor = '#4093DA';
                btnArr1[i].style.color='#fff';
            }else{
                btnArr1[i].style.backgroundColor = '#fff';
                btnArr1[i].style.color='#000';
            }
        }
        var btnArr3 = document.getElementsByClassName('next_button_3');
        for(var i=0;i<btnArr3.length;i++){
            if(G_Cookie.getNightMode()){
                btnArr3[i].style.backgroundColor = '#4093DA';
                btnArr3[i].style.color='#fff';
            }else{
                btnArr3[i].style.backgroundColor = '#fff';
                btnArr3[i].style.color='#000';
            }
        }
        var btnArr = document.getElementsByClassName('btn');
        for(var i=0;i<btnArr.length;i++){
            if(G_Cookie.getNightMode()){
                btnArr[i].style.backgroundColor = '#4093DA';
                btnArr[i].style.color='#fff';
            }else{
                btnArr[i].style.backgroundColor = '#fff';
                btnArr[i].style.color='#000';
            }
        }
        var refreshArr = document.getElementsByClassName('refresh');//刷新按钮
        for(var i=0;i<refreshArr.length;i++){
            if(G_Cookie.getNightMode()){
                //refreshArr[i].style.backgroundColor = '#4093DA';
                refreshArr[i].style.color='#fff';
            }else{
                //refreshArr[i].style.backgroundColor = '#fff';
                refreshArr[i].style.color='#000';
            }
        }
        var refreshArr1 = document.getElementsByClassName('refresh1');//刷新按钮
        for(var i=0;i<refreshArr1.length;i++){
            if(G_Cookie.getNightMode()){
                //refreshArr[i].style.backgroundColor = '#4093DA';
                refreshArr1[i].style.color='#fff';
            }else{
                //refreshArr[i].style.backgroundColor = '#fff';
                refreshArr1[i].style.color='#000';
            }
        }
		//如果是游客，手动设置默认是禁止使用播放音频的
		if(!G_Cookie.getUserID() && !G_Cookie.getOnMedia()){
			G_Cookie.setOffMedia('off');
		}
    }
    /********************************************************************************
     函数名：_softSetting
     功能：软件设置初始化
     输入参数:无
     返回值：无
     创建信息：韦友爱（2014-07-17）
     修改记录：无
     审查人：无
     ********************************************************************************/
    function _softSetting() {
    	if(G_Cookie.getOnMedia()){
			_setMediaPlayer('on');
		}else{
			_setMediaPlayer('off');
			G_Cookie.setOffMedia('off');
			G_Cookie.removeOnMedia();
		}
        if (G_Cookie.getNightMode()) {
            setBgColor('night');
			G_Prg.$('on').src = '../images/on_night.png';
			G_Prg.$('off').src = '../images/off_night.png';
            G_Prg.$('hcdvMsgBox').style.background = '#152d35';
        }else{
            setBgColor('day');
			G_Prg.$('on').src = '../images/on_day.png';
			G_Prg.$('off').src = '../images/off_day.png';
            G_Prg.$('hcdvMsgBox').style.background = '';
        }
		if(G_Cookie.getOnMedia()){
			_setMediaPlayer('on');
		}else{
			_setMediaPlayer('off');
		}
        var fontSize = G_Cookie.getFontSize() || '20px';
        document.body.style.fontSize = fontSize;
        G_Prg.$('minusSize').onclick = function () {
			G_UserAction.addUserAction('setFontBtn1');
            minusSizeClick();
            _setCss();
           // _setItemPosition();
            
        };
        G_Prg.$('addSize').onclick = function () {
			G_UserAction.addUserAction('setFontBtn1');
            addSizeClick();
            _setCss();
            //_setItemPosition();
            
        };
        G_Prg.$('dayMode').onclick = function () {
			G_UserAction.addUserAction('setDayNightBtn1');
            setBgColor('day');
			G_Prg.$('on').src = '../images/on_day.png';
			G_Prg.$('off').src = '../images/off_day.png';
            G_Prg.$('hcdvMsgBox').style.background = '';
            var itemArr = document.getElementsByClassName('nightItem');
            for(var i=0;i<itemArr.length;i){//将元素的className改了之后，该元素就不在数组itemArr中了，所以i不++
                itemArr[i].className  = 'defaultItem';
            }
            _setCss();
        }; //设置白天模式
        G_Prg.$('nightMode').onclick = function () {
			G_UserAction.addUserAction('setDayNightBtn1');
            setBgColor('night');
			G_Prg.$('on').src = '../images/on_night.png';
			G_Prg.$('off').src = '../images/off_night.png';
            G_Prg.$('hcdvMsgBox').style.background = '#152d35';
            var itemArr = document.getElementsByClassName('defaultItem');
            for(var i=0;i<itemArr.length;i){
                itemArr[i].className  = 'nightItem';
            }
            _setCss();
        }; //设置夜间模式
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
			G_UserAction.addUserAction('setMediaOnBtn');
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
			G_UserAction.addUserAction('setMediaOffBtn');
		}; //设置音效关模式
    }
	/********************************************************************************
	函数名：_setMediaPlayer
	功能：答题音效的开关设置
	输入参数:flag 音效开关模式，取值有：开（on）、关（off）
	返回值：无
	创建信息：黎萍（2014-09-17）
	修改记录：无
	审查人：无
	********************************************************************************/
	function _setMediaPlayer(flag){
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
     以下为滑动效果代码部分
     *******************************************************************************/
    /********************************************************************************
     函数名：_initFlipsnap
     功能：初始化滑动控件
     输入参数： flipsnap 滑动控件对象
     返回值：无
     创建信息：黎萍（2014-06-04）
     修改记录：无
     *******************************************************************************/
    function _initFlipsnap(flipsnap){
        _gFlipsnap = flipsnap;
        _gFlipsnap = Flipsnap('.inner');
        //窗体尺寸变更事件，滑动控件重新自适应大小
        window.addEventListener("resize",function(){
            /*当横竖屏切换时，宽高度自适应屏幕*/
            var fliwidth=document.querySelector('body').offsetWidth;
            _gFlipsnap.distance=fliwidth;
            _gFlipsnap.refresh();
            _reflashDragControl(-1);
        },false);
        //滑动控件完成事件，重新绑定题目和更改当前题目索引
        _gFlipsnap.element.addEventListener('fstouchend', function(ev){
         _gFlipsnap.disableTouch = true;
            //初始滑动页面索引，用来判断是否滑动切换成功
            var startIndex = _gFlipsnap.currentPoint;
            setTimeout(function(){
                var dragFlag = 0;	//滑动状态标识
                var testCount = _gAllTest.getTestCount();  //试题总数
                //如果相等说明滑动前和滑动后索引相同，不做处理，返回
                var dragIndexByTestIndex = _getDragIndexByTestIndex();
                if(startIndex === _gFlipsnap.currentPoint || _gFlipsnap.currentPoint === dragIndexByTestIndex){
                _gFlipsnap.disableTouch = false;
                    return;
                }

                //强制输入框失去焦点，防止滑动后输入焦点一直停留在输入框内
                try{
                    G_Prg.$('jd_textarea_'+startIndex).blur();
                } catch(err){}
				var focusId = document.activeElement.id;
				if (focusId.indexOf('tk_itemsText_') > -1) {
					G_Prg.$(focusId).blur();
				}

				var flipFlag = '';	//用户行为统计标记
                //从第一页翻到第二页，直接索引加1
                if(_gFlipsnap.currentPoint === 1 && _gAllTest.getCurIndex() === 0){
                    _gAllTest.moveNext();
					//下一题
					flipFlag = 'right';
                }else if(_gFlipsnap.currentPoint === 1 && _gAllTest.getCurIndex() === (testCount-1)){//最后一页向前翻一页，直接索引减1
                    _gAllTest.movePre();
					flipFlag = 'left';
                }else{
                    //如果滑动释放的时候索引不是1，则需要重新更新3个滑动页面的HTML
                    if(_gFlipsnap.currentPoint !== 1){
                        //上一题
                        if(_gFlipsnap.currentPoint === 0){
                            //如果是第二题，则不需要重新绑定，直接切换到滑动页面0，否则需要重新绑定题目
                            if(_gAllTest.getCurIndex() !== 1)
                            {
                                if(_gAllTest.movePre()){
                                    _init(1);
                                }
                                _gFlipsnap.moveToPoint(1,0);//滑动到指定的层
                                dragFlag = 1;
								
                            }else{
                                _gAllTest.movePre();
                                //背题模式下，隐藏其它非正确的选项
								var curTest = _gAllTest.getCurTest();
                                if(_gAllTest.getState(curTest.testNO-1)=== 'recite'){
                                    _hiddenTestSelects(curTest,0);
                                }
                            }
							flipFlag = 'left';
                        }
                        //下一题
                        if(_gFlipsnap.currentPoint === 2){
                            //如果是倒数第二题，则不需要重新绑定，直接切换到滑动页面2，否则需要重新绑定题目
                            if(_gAllTest.getCurIndex() !== testCount-2){
                                if(_gAllTest.moveNext()){
                                    _init(2);
                                }
                                _gFlipsnap.moveToPoint(1,0);	//滑动到指定的层
                                dragFlag = 2;
                            }else{
                                _gAllTest.moveNext();
                                //背题模式下，隐藏其它非正确的选项
								var curTest = _gAllTest.getCurTest();
                                if(_gAllTest.getState(curTest.testNO-1)=== 'recite'){
                                    _hiddenTestSelects(curTest,2);
                                }
                            }
							flipFlag = 'right';
                        }
                    }
                }
				if(flipFlag === 'left'){
					G_UserAction.addUserAction('flipPre');
				}else if(flipFlag === 'right'){
					G_UserAction.addUserAction('flipNext');
				}
                _showTestTypeIntro();

                //刷新底部收藏和笔记图标
                _setFavTestInfos();
                _refreshNoteIcon();

                //滚动到试题顶部
                for(var i=1;i<4;i++){
                    if(G_Prg.$('flipTest'+i)){
                        G_Prg.$('flipTest'+i).scrollTop = 0;
                    }
                }
                _gFlipsnap.disableTouch = false;
            },350);	//setTimeout end
        }, false);
        _reflashDragControl(-1);	//刷新拖拽控件
    }
    /********************************************************************************
     函数名：_reflashDragControl
     功能：有滚动条出现的情况下修正滑动控件的滑动距离
     输入参数：index 当前展示的滑动层的索引
     返回值：无
     创建信息：谢建沅（2014-05-29）
     审查人：无
     *******************************************************************************/
    function _reflashDragControl(index){
        var indexTemp = index;
        _gFlipsnap.distance = document.body.offsetWidth;
        if(indexTemp > -1){
            _gFlipsnap.moveToPoint(indexTemp,0);	//滑动到指定的层
        }
        _gFlipsnap.refresh();
    }
    /********************************************************************************
     函数名：_moveTestTemplet
     功能：移动试题模板
     输入参数：
     返回值：无
     创建信息：谢建沅（2014-05-29）
     修改记录：黎萍（2014-06-06）增加函数注释
     审查人：无
     *******************************************************************************/
    function _moveTestTemplet(allTestCount){
        var html = '';
        if(_htmlTemplate.length > 0){
            html = _htmlTemplate;
        } else{
            html = G_Prg.$("exambt").innerHTML;
            G_Prg.$("exambt").innerHTML = "";
            _htmlTemplate = html;
        }
        var htmlArr = _replaceTempletId(html);
		//如果之前有残留，先清除
        for(var i=1;i<4;i++){
            var _tempId = G_Prg.$('flipTest'+i);
            if(_tempId){
                G_Prg.$('innerdiv').removeChild(_tempId);
            } 
        }
        var testCount = allTestCount < 3 ? allTestCount : 3;
        for(var i=1;i<=testCount;i++){
            var testDiv = document.createElement('div');
            testDiv.id = 'flipTest'+i;
            G_Prg.$('innerdiv').appendChild(testDiv);
            //if(i!=2){
                var hightDiv = document.createElement('div');
                hightDiv.className = 'flipDiv';
                G_Prg.$('flipTest'+i).appendChild(hightDiv);
            //}

            var contentDiv = document.createElement('flipContent'+i);
            contentDiv.id = 'flipContent'+i;
            contentDiv.className = 'flipContentDiv';
            contentDiv.innerHTML =htmlArr[(i-1)];
            G_Prg.$('flipTest'+i).appendChild(contentDiv);

            G_Prg.$('flipTest'+i).appendChild(hightDiv);
        }
    }
    /********************************************************************************
     函数名：_replaceTempletId
     功能：把试题模板的html标签的id替换掉
     输入参数：htmlTemplet 模板页面html；index 滑动模板div层的id
     返回值：新生成的临时变量html，起到中转层的作用
     创建信息：谢建沅（2014-05-29）
     修改记录：黎萍（2014-06-06）增加函数注释
     审查人：无
     *******************************************************************************/
    function _replaceTempletId(htmlTemplet){
        var indexArr = [];	//id索引数组
        var currIndex = 0;		//当前试题索引
        //查找所有id的索引
        while(htmlTemplet.length > currIndex && htmlTemplet.indexOf("id=",currIndex) > -1){
            var index =  htmlTemplet.indexOf("id=",currIndex);
            indexArr.push(index+4); //加一个引号的长度
            if(index<htmlTemplet.length){
                currIndex = index+1;
            }else{
                break;
            }
            if(htmlTemplet.indexOf("id=",currIndex) <= 0){
                currIndex = htmlTemplet.length;
            }
        }
        var htmlArr = [];
        //生成3个滑动层的Html代码
        for(var k=0;k<3;k++){
            var newHtml;
            //循环处理ID
            for(var i=indexArr.length-1;i>=0;i--){
                var end = htmlTemplet.indexOf("\"",indexArr[i]);
                //拼接最后一个ID的HTML
                if(i === indexArr.length-1){
                    newHtml  = htmlTemplet.substring(indexArr[i],end) + "_" + k + htmlTemplet.substring(indexArr[i] + (end-indexArr[i]),htmlTemplet.length);
                }else if(i === 0){//拼接第一个ID的HTML
                    newHtml = htmlTemplet.substring(0,indexArr[i]) + htmlTemplet.substring(indexArr[i],end) + "_" + k + htmlTemplet.substring(end,indexArr[i+1]) + newHtml;
                }else{//拼接其他ID的HTML
                    newHtml = htmlTemplet.substring(indexArr[i],end) + "_" + k + htmlTemplet.substring(end,indexArr[i+1]) + newHtml;
                }
            }
            htmlArr.push(newHtml);
        }
        return htmlArr;
    }
    /********************************************************************************
     函数名：_showTestTypeIntro
     功能：显示题型说明
     输入参数：无
     返回值：无
     创建信息：韦友爱（2014-08-18）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _showTestTypeIntro(){
        var curTest = _gAllTest.getCurTest();
        //if((!_fromUrl||_fromUrl === 'simulatedExam.html'||_fromUrl === 'chapterMenu.html') && _mockFlag !== 'recite'){//模拟考场或者章节练习
		 if(_gAllTest.getState(curTest.testNO-1) !== 'recite'){
            if (_IsDisabled && !_firstShow[_gAllTest.getCurIndex()]) {//显示题型说明
                _showExplain(curTest, 0);
            }
            _firstShow[_gAllTest.getCurIndex()]=1;//当前题已经显示过，则将其对应的_firstShow数组中的标记设置为1
        }
    }
    /********************************************************************************
     函数名：_getDragIndexByTestIndex
     功能：获取当前滑动层的索引
     输入参数：无
     返回值：无
     创建信息：谢建沅（2014-08-21）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function _getDragIndexByTestIndex(){
        var curTestIndex = _gAllTest.getCurIndex();
        var allTestCount = _gAllTest.getTestCount();
        var dragCount = allTestCount < 3 ? allTestCount : 3;
        if(curTestIndex === 0){
            return 0;
        } else if(curTestIndex === allTestCount-1){
            return dragCount-1;
        } else{
            return 1;
        }
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