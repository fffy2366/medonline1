/********************************************************************************
*解析所有试题json数据，将树形结构的数据分解成线性数据
********************************************************************************/
var G_AllTest; // = new TestData(jsonAllTest); 
/********************************************************************************
函数名：OneTest
功能：一道试题的数据结构
输入参数: 无
返回值：无
创建信息：黎萍（2014-05-19）
修改记录：兰涛（2014-05-22）
审查人：韦友爱（2014-05-26）
审查人：兰涛（2014-06-26）
 *******************************************************************************/
function OneTest() {
	this.testNO = 0;	//试题编号
	this.style = '';	//试题类型
	this.type = '';		//试题所属题型
	this.score = 0;	//每题分数

	//以下三个索引用于定位json中的对应数据
	this.styleItemIndex = 0;	// 题型ID,json数据中的StyleID
	this.testItemIndex = 0;	// 大标题ID,json数据中各种题型的ID
	this.subTestItemIndex = -1;	//小题ID,针对A3题型的A3TestItemIndex和B题型的BTestItemIndex; testNO 试题的编号

	//下面4个字段值用于记录用户在做题过程中的答题信息
	this.userReply = ''; //用户的答案
	this.isRight = false; //是否回答正确
	this.fav = false; //收藏
	this.userNote = ''; //用户笔记
	this.selected = 0;	//标记章节练习的多选题已被选中，但是没有进行答案的提交；1 已选中 0 已提交
	this.state = 'uncommited';	//标记当前试题是否提交了答案：uncommited 未答，commited 已答
	this.lastState='';	//用户上一次操作试题的状态
	this.action = '';	//记录试题的当前操作
	this.lastAction = '';	//用户上一次操作试题的动作
}

/********************************************************************************
函数名：OneTestShow
功能：一道试题显示时的数据结构
输入参数：无
返回值：无
创建信息：兰涛（2014-05-28）
修改记录：黎萍（2014-05-28） 增加注释及函数体中属性的操作
修改记录：黎萍（2014-06-24） 增加输入参数AllTestID,StyleID 并增加注释
修改记录：黎萍（2014-07-03） 增加输入参数cptID,sbjID,srcID,subTestID 并增加注释
修改记录：黎萍（2014-07-04） 增加输入参数score并增加注释
审查人：兰涛（2014-06-26）
 *******************************************************************************/
function OneTestShow() {
	this.cptID = 0; //章节ID
    this.sbjID = 0; //科目ID
    this.srcID = 0;	//来源ID
	this.allTestID = 0;	//试题的AllTestID
	this.styleID = 0;	//试题类型ID
	this.testNO = 0;	//试题编号
	this.testType = '';	//试题所属题型
	this.subTestType = '';	//小题所属题型
	this.testStyle = '';	//试题类型
	this.styleExplain = '';	//试题类型说明
	this.frontTitle = '';	//共用题干，针对A3Test
	this.title = '';	//试题标题
	this.selectedItems = '';	//试题选项
	this.answer = '';	//试题答案
	this.testPoint = '';	//考试重点
	this.explain = '';	//解题思路
	this.isFav = 0;	//是否收藏
	this.userNote = '';	//用户笔记
	this.subTestID = -1;	//小题id（针对A3题型、B题型）
	this.score = 0;	//每题分数
	this.time='';//时间
	this.answerType = 0;	//标记填空题答案是否按照顺序进行答案比对
}

/********************************************************************************
函数名：TestData
功能：试题数据
输入参数:无
返回值：无
创建信息：兰涛（2014-05-28）
修改记录：黎萍（2014-05-28） 增加函数注释
审查人：兰涛（2014-06-26）
 *******************************************************************************/
function TestData() {
	//私有变量
	var _index = 0; //试题数组索引
	var _jsonAllTest = {}; //试题json数据
	var _arrAllTest = []; //试题数组:数组元素为OneTest结构体：通过TestNO找到StyleItemIndex,TestItemIndex,SubTestItemIndex，然后再定位到_jsonAllTest中的对应数据
	var _isVip = 0;	//标记是否是VIP用户
	var _examHistoryID = '';	//答题历史ID
	var _title = '';	//界面上展示的标题
	var _shareUrl = '';	//共享生成的url
	var _replay = G_Prg.getQueryString('replay');
	var _testJson = '';
	var _fromUrl = G_Prg.getQueryString('fromUrl');
	if(_replay === '1'){
		_testJson = G_Storage.getLocalStorageValue(G_Cookie.getUserID()+'_'+G_Cookie.getAppEName()+'_testJson');
		_isVip = _testJson.isVip;
		_examHistoryID = _testJson.examHistoryID;
		_fromUrl = _testJson.url;
	}
    var _time='';
	var _arrContrast=[];
    var _arrOtherNote=[];
	var _configJson = {};	//模拟考场配置json
	_init(); //初始化数据
	
	//私有函数
	/********************************************************************************
	函数名：_init
	功能：初始化试题数据
	输入参数:无
	返回值：无
	创建信息：黎萍（2014-05-28）
	修改记录：黎萍（2014-06-13） 添加函数注释
	修改记录：黎萍（2014-06-13） 去掉参数jsonAllTest
              韦友爱（2014-07-23）添加callback回调函数，添加从章节最终列表页跳转传来的type参数的判断
			  黎萍（2015-05-12）增加对执业护士的易混易错试题数据的获取控制
              黎萍（2015-06-23）修改对执业护士、临床执业医师、临床执业助理医师的易混易错取题方式，避免重复取题
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	function _init() {
		var appID = G_Cookie.getAppID();
 		if (!appID) {
 			G_Prg.throw('程序运行错误，TestData._init : appID = "'+appID+'",获取数据出现异常'); 
 		}
        var appEName = G_Cookie.getAppEName();
		if (!appEName) {
 			G_Prg.throw('程序运行错误，TestData._init : appEName = "'+appEName+'",获取数据出现异常'); 
 		}
		var curPage=G_Prg.getQueryString('page');
		if(!curPage){
			curPage=1;
		}
		var fromUrl = G_Prg.getQueryString('fromUrl'); 
        var callback=function(){
            window.location.href = fromUrl+'?fromUrl=doExam.html';
        }
		if(_replay === '1'){
			_jsonAllTest = _testJson.jsonAllTest;	//试题数据
			_arrAllTest = _testJson.arrAllTest;	//试题数据结构体数组
			//还原现场：如果是批阅或者背题模式下，恢复现场只保留之前操作到的当前试题，之前的操作清空
			//for(var i = 0; i < _arrAllTest.length; i++){
//				if(_arrAllTest[0].state === 'marked' || _arrAllTest[0].state === 'recite'){
////					_arrAllTest = [];
////					_initArrAllTest();	//初始化结构体数组
//				}
			//}
			G_Prg.$('loadingDiv').style.display = 'none';	
		}else{
		switch (fromUrl){
//			default:
//				_jsonAllTest = _getAllTestJSON(appID);	//获取试题json数据
//			break;
            default:
                var cptID=G_Cookie.getCptID();
                if(!cptID){
                    G_Prg.throw('程序运行错误，TestData._init : cptID = "'+cptID+'",获取数据出现异常'); 
                }
                var type = G_Prg.getQueryString('type');
                var testNum = G_Prg.getQueryString('testNum');
                switch(type){
                    case 'myError':
						_isVip = 1;
                        _jsonAllTest = _getErrorTestJson(appID,appEName,curPage,cptID,testNum,callback);	//获取用户做错的试题
                    break;
                    case 'myNote':
						_isVip = 1;
                        _jsonAllTest = _getTestNoteJson(appID,appEName,curPage,cptID,testNum,callback);	//获取有用户笔记的试题
                    break;
                    case 'myFav':
						_isVip = 1;
                        _jsonAllTest = _getFavTestJson(appID,appEName,curPage,cptID,testNum,callback);	//获取用户收藏的试题数据
                    break;
                    case 'myNotDone':
						_isVip = 1;
                        _jsonAllTest = _getNotDoneJson(appID,cptID,callback);	//获取用户未做的试题数据
                    break;
                    
                    default:
                        _jsonAllTest = _getAllTestJSON(cptID,appID,callback);//获取试题json数据
                    break;
                }
            break;
			case 'testList.html':
                var type = G_Prg.getQueryString('type');
                switch(type){
                    case 'userError':
						_isVip = 1;
                        _jsonAllTest = _getErrorTestJson(appID,appEName,curPage,-1,50,callback);	//获取用户做错的试题
                    break;
                    case 'errorRank':
						_isVip = 1;
                        _jsonAllTest = _getErrorRankJson(appID,appEName,curPage,50,callback);	//获取用户做错的试题
                    break;
                    case 'findTest':
						_isVip = 1;
                        _jsonAllTest = _getSearchExamJson(appEName,curPage,callback);	//获取有用户笔记的试题
                    break;
                    case 'userFav':
						_isVip = 1;
                        _jsonAllTest = _getFavTestJson(appID,appEName,curPage,-1,50,callback);	//获取用户收藏的试题数据
                    break;
                    case 'favRank':
						_isVip = 1;
                        _jsonAllTest = _getFavRankJson(appID,appEName,curPage,50,callback);	//获取用户收藏的试题数据
                    break;
                    case 'userNote':
				        _isVip = 1;
				        _jsonAllTest = _getTestNoteJson(appID,appEName,curPage,-1,50,callback);	//获取有用户笔记的试题
			        break;
                    case 'noteRank':
				        _isVip = 1;
				        _jsonAllTest = _getNoteRankJson(appID,appEName,curPage,50,callback);	//获取有用户笔记的试题
			        break;
                }
			break;
			//case 'default.html':
			case 'simulatedExam.html':
				_jsonAllTest = _getMockExamJson(appID,appEName);	//获取模拟考场的随机试题
				_isVip = 1;
			break;
			case 'easyErrorTest.html':
				var testData = [];
				if (G_Prg.checkApiPurview('', '易混易错', '') === 2 || G_Prg.checkApiPurview('', '易混易错', '') === 4) {
					_isVip = 1;
					testData = _getEasyErrorJson(curPage);
				} else {
					_isVip = 0;
					testData = _getEasyErrorJson(1);
				}
				easyErrorData = G_SetTestInfo.replaceImgURL(easyErrorData); //设置图片路径
				_jsonAllTest = easyErrorData;
				var dataLen = _jsonAllTest.StyleItems.length;
				for (var i = 0; i < dataLen; i++) {
					_jsonAllTest.StyleItems = testData;
				}
				G_Prg.$('loadingDiv').style.display = 'none';
				break;
			case 'video.html':
				var testData = [];
				if (G_Prg.checkApiPurview('', '易混易错', '') === 2 || G_Prg.checkApiPurview('', '易混易错', '') === 4) {
					_isVip = 1;
					testData = _getEasyErrorJson(curPage);
				} else {
					_isVip = 0;
					testData = _getEasyErrorJson(1);
				}
				easyErrorData = G_SetTestInfo.replaceImgURL(easyErrorData);	//设置图片路径
				_jsonAllTest = easyErrorData;
				var dataLen = _jsonAllTest.StyleItems.length;
				for (var i = 0; i < dataLen; i++) {
					_jsonAllTest.StyleItems = testData;
				}
				G_Prg.$('loadingDiv').style.display = 'none';
				break;
			case 'videoList.html':
				var cptID = G_Cookie.getCptID();
				if (!cptID) {
					G_Prg.throw('程序运行错误，TestData._init : cptID = "' + cptID + '",获取数据出现异常');
				}
				_jsonAllTest = _getAllTestJSON(cptID, appID, callback, 'forecast');
				break;
		}
		_initArrAllTest();	//初始化结构体数组
		}
	}
	/********************************************************************************
	函数名：_initArrAllTest
	功能：初始化试题结构体数组
	输入参数: 无
	返回值：无
	创建信息：黎萍（2014-08-18）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	function _initArrAllTest(){
		if(_jsonAllTest === '' || !_jsonAllTest){
			return;
		}
		var index = 0; //数组Numbers的索引
		//题型数据获取异常
		var styleItems = _jsonAllTest.StyleItems;
		if(styleItems.length === 0){
			G_Prg.throw('程序运行错误，TestData._initArrAllTest ：styleItems = "' + styleItems + '"，无法解析试题数据包！'); 	
		}
		for (var i = 0; i < styleItems.length; i++) {
			var testType = styleItems[i].Type; //题型
			var testItems = styleItems[i].TestItems;
			/*if(!testItems.length){
                G_Prg.throw('程序运行错误，TestData._initArrAllTest ：试题数据为空'); 	
            }*/
			for (var j = 0; j < testItems.length; j++) {
				/*
				判断试题所属题型，调用对应的读取数据的函数
				对结构体的属性进行赋值，同时生成数组的值
				 */
				if (testType === 'A3TEST') {
					var a3items = testItems[j].A3TestItems;
					/*if(!a3items.length){
						G_Prg.throw('程序运行错误，TestData._initArrAllTest ：试题数据为空'); 	
					}*/
					for (var k = 0; k < a3items.length; k++) {
						//_arrAllTest[index] = new OneTest(i, j, k, index + 1);
						_arrAllTest[index] = new OneTest();
						_arrAllTest[index].styleItemIndex = i;
						_arrAllTest[index].testItemIndex = j;
						_arrAllTest[index].subTestItemIndex = k;
						_arrAllTest[index].testNO = index + 1;
						_arrAllTest[index].style = styleItems[i].Style;
						_arrAllTest[index].type = testType;
						_arrAllTest[index].score = styleItems[i].Score;
                        _arrContrast[index]=parseInt(testItems[j].AllTestID+''+a3items[k].A3TestItemID);
						index++;
					}
				} else if (testType === 'BTEST') {
					var bitems = testItems[j].BTestItems;
					/*if(!bitems.length){
						G_Prg.throw('程序运行错误，TestData._initArrAllTest ：试题数据为空'); 	
					}*/
					for (var k = 0; k < bitems.length; k++) {
						//_arrAllTest[index] = new OneTest(i, j, k, index + 1);
						_arrAllTest[index] = new OneTest();
						_arrAllTest[index].styleItemIndex = i;
						_arrAllTest[index].testItemIndex = j;
						_arrAllTest[index].subTestItemIndex = k;
						_arrAllTest[index].testNO = index + 1;
						_arrAllTest[index].style = styleItems[i].Style;
						_arrAllTest[index].type = testType;
						_arrAllTest[index].score = styleItems[i].Score;
                        _arrContrast[index]=parseInt(testItems[j].AllTestID+''+bitems[k].BTestItemID);
						index++;
					}
				} else if (testType === 'ATEST' || testType === 'JDTEST' || testType === 'PDTEST' || testType === 'TKTEST' || testType === 'XTEST') {
					//_arrAllTest[index] = new OneTest(i, j, -1, index + 1);
					_arrAllTest[index] = new OneTest();
					_arrAllTest[index].styleItemIndex = i;
					_arrAllTest[index].testItemIndex = j;
					_arrAllTest[index].testNO = index + 1;
					_arrAllTest[index].style = styleItems[i].Style;
					_arrAllTest[index].type = testType;
					_arrAllTest[index].score = styleItems[i].Score;
                    _arrContrast[index]=testItems[j].AllTestID;
					index++;
				} else {
					G_Prg.throw('程序运行错误，TestData._initArrAllTest ：testType = "' + testType + '"，无法解析题型'); 
				}
			} //end for testItems
		} //end for styleItem	
	}
	/********************************************************************************
	函数名：_getEasyErrorJson
	功能：获取执业护士易混易错的试题数据
	输入参数: curPage 当前页码
	返回值：处理后的试题数组
	创建信息：黎萍（2015-05-12）
	修改记录：黎萍（2015-06-23）修改函数只返回截取后的试题数据
	 *******************************************************************************/
	function _getEasyErrorJson(curPage) {
		var testJson = {};
		var testData = [];
		var dataLen = easyErrorData.StyleItems.length;
		for (var i = 0; i < dataLen; i++) {
			if (!G_Cookie.getTestCount()) {
				_testCount = easyErrorData.StyleItems[i].TestItems.length;
				G_Cookie.setTestCount(_testCount);
			} else {
				_testCount = G_Cookie.getTestCount();
			}
			testData = easyErrorData.StyleItems.slice((curPage - 1) * 50, curPage * 50);//[i].TestItems.slice((curPage - 1) * 50, curPage * 50);
			//easyErrorData.StyleItems[i].TestItems = testData;
		}
		//testJson = easyErrorData;
		//testJson = G_SetTestInfo.replaceImgURL(testJson);	//设置图片路径
		return testData;
	}
	/********************************************************************************
	函数名：_getAllTestJSON
	功能：通过ajax获取指定章节试题json数据
	输入参数: appID 软件ID；
             callback 抛出异常后执行的回调函数
			 flag 标记是不是执业护士的考前预测取题
	返回值：章节试题json数据
	创建信息：黎萍（2014-06-18）
	修改记录：黎萍（2014-06-25）软件名称和章节ID进行判断，如果为空抛出异常，同时跳出方法
	修改记录：黎萍（2014-06-26）将函数修改为TestData的私有函数
	修改记录：黎萍（2014-07-03） 增加接收数据arrUserTest ；修改status 判断
	修改记录：黎萍（2014-07-07）增加输入参数appID
             韦友爱（2014-07-23）添加参数callback
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	function _getAllTestJSON(cptID,appID,callback,flag) {
//         var userID = G_Cookie.getUserID() ? G_Cookie.getUserID() : -1;
// 		var userName = G_Cookie.getUserName();
// 		var guid = G_Cookie.getGuid();	//检验码
//             console.log(++count);
//             var URL='/api/exam/getChapterTest';
//             var _success=function(json){
//             console.log('_success');
//                 var jsonObj = JSON.parse(json);
// 				if (jsonObj.status === 200) {	//200 获取数据成功
// 					//字符串转json对象
// 					jsonData = JSON.parse(jsonObj.data.test);
// 					arrUserTest = jsonObj.data.info;	
// 					_isVip = jsonObj.data.isVip;
// 					_examHistoryID = jsonObj.data.examHistoryID;
// 				}else if (jsonObj.status === 300) {	//300 连接数据库失败
// 					G_Prg.throw('程序运行错误，TestData._getAllTestJSON,数据库获取数据异常', callback);
// 				}else if (jsonObj.status === 201) {	//201 没有数据；
// 					G_Prg.throw('程序运行错误，没有您要查找的试题数据！', callback);
// 				}else{	
// 					G_Prg.throw('程序运行错误，不能处理，TestData._getAllTestJSON : getChapterTest: status = "'+jsonObj.status+'"！',callback);
// 				}
//             }
//               var params={
//                 appID : appID,
// 				cptID : cptID,
// 				userID : userID,
//                 userName : userName,
//                 guid : guid
//             };
//         console.log('ready to post');
//         G_AjaxApi.post(URL,params,false,_success);
//         console.log('posted');
//         setTimeout(function(){
//             _getAllTestJSON(cptID,appID,callback, count);
//         },3000);
		var userID = G_Cookie.getUserID() ? G_Cookie.getUserID() : -1;
		var userName = G_Cookie.getUserName();
		var guid = G_Cookie.getGuid();	//检验码
        var params={
            appID : appID,
			cptID : cptID,
			userID : userID,
            userName : userName,
            guid : guid
        };
		var jsonData = ''; 	//试题json数据
		var arrUserTest =  '';	//存储用户收藏、用户笔记的数组
        //先尝试从缓存中读取数据
        if (flag !== 'forecast') {
			getTestFromCache(cptID, appID, callback);
		}
        if (!jsonData) {
            getTestFromServer(cptID, appID, callback);
            jsonData = G_SetTestInfo.replaceImgURL(jsonData);	//设置图片路径
        }
        jsonData = G_SetTestInfo.setFavAndNoteTest(jsonData,arrUserTest);	//添加用户笔记、收藏标记
		return jsonData;
       function getTestFromCache(cptID,appID,callback){
            var cacheData = G_CptTestCache.getCache(userID, appID, cptID);
            if(cacheData&&cacheData.data.jsonAllTest){//试题存在，则取info包
                jsonData=cacheData.data.jsonAllTest;
                if(userID===-1){
                    var loadingDiv = G_Prg.$('loadingDiv');//隐藏加载框
                    if (loadingDiv) {
                        loadingDiv.style.display = 'none';
                    }
                    return;//游客，不取数据包
                }
                var URL='/api/exam/getChapterTestInfo';
                var success=function(json){
                    var jsonObj = JSON.parse(json);
				    if (jsonObj.status === 200) {	//200 获取数据成功
					    //字符串转json对象
					    //jsonData = JSON.parse(jsonObj.data.test);
                          _isVip = jsonObj.data.isVip;
                          if (_isVip !== cacheData.isVip) {
                            jsonData = '';
                            return;
                          }
					    arrUserTest = jsonObj.data.info;	
					    _examHistoryID = jsonObj.data.examHistoryID;
				    }else if (jsonObj.status === 300) {	//300 连接数据库失败
					    G_Prg.throw('程序运行错误，TestData._getAllTestJSON:getChapterTestInfo,数据库获取数据异常', callback);
				    }else{	
					    G_Prg.throw('程序运行错误，不能处理，TestData._getAllTestJSON : getChapterTestInfo : status = "'+jsonObj.status+'"！',callback);
				    }
                }; 
                G_AjaxApi.post(URL,params,false,success);
            }
        } 
        function getTestFromServer(cptID,appID,callback){
            var URL='/api/exam/getChapterTest';
            var success=function(json){
                var jsonObj = JSON.parse(json);
			    if (jsonObj.status === 200) {	//200 获取数据成功
				    //字符串转json对象
				    jsonData = JSON.parse(jsonObj.data.test);
				    arrUserTest = jsonObj.data.info;	
					_isVip = jsonObj.data.isVip;
                    _examHistoryID = jsonObj.data.examHistoryID;
			    }else if (jsonObj.status === 300) {	//300 连接数据库失败
				    G_Prg.throw('程序运行错误，TestData._getAllTestJSON,数据库获取数据异常', callback);
			    }else if (jsonObj.status === 201) {	//201 没有数据；
				    G_Prg.throw('程序运行错误，没有您要查找的试题数据！', callback);
			    }else{	
				    G_Prg.throw('程序运行错误，不能处理，TestData._getAllTestJSON : getChapterTest: status = "'+jsonObj.status+'"！',callback);
			    }
            };  
            G_AjaxApi.post(URL,params,false,success);     
        }
	}
    

	/********************************************************************************
	函数名：_getMockExamJson
	功能：获取模拟考场的随机的试题数据
	输入参数:appEName 软件英文名称
	返回值：jsonData 随机生成的试题数据
	创建信息：黎萍（2014-07-23）
	修改记录：无
	审查人：无
	*******************************************************************************/
	function _getMockExamJson(appID,appEName){
		var guid = G_Cookie.getGuid();	//检验码
		var userID = G_Cookie.getUserID();
        if(!userID){
            G_Prg.throw('程序运行错误，testData._getMockExamJson：userID='+userID);
        }
		var userName = G_Cookie.getUserName();
		var configID = G_Prg.getQueryString('configID');
		var simulated = G_Prg.getQueryString('simulated');
		var defaulted = G_Prg.getQueryString('defaulted');
		_configJson = G_Storage.getSessionStorageValue('ConfigJSON');
		var jsonData = ''; 	//试题json数据
		var success = function (json) {
			var jsonObj = JSON.parse(json);
			if (jsonObj.status === 200) {	//200 获取数据成功
				//字符串转json对象
				if(simulated === '0'){
					jsonData = JSON.parse(jsonObj.data.test);	
				}else if(simulated === '1'){
					jsonData = jsonObj.data.test;
				}
				_examHistoryID = jsonObj.data.examHistoryID;
			}else if (jsonObj.status === 202) {	
				G_Prg.throw('该功能充值后才能使用！', function () {
					window.location.href = 'default.html';
				}); 
			}else if (jsonObj.status === 300) {	//300 连接数据库失败
				G_Prg.throw('程序运行错误，TestData._getMockExamJson,数据库获取数据异常', function () {
					window.location.href = 'default.html';
				}); 
			}else{	
				G_Prg.throw('程序运行错误，不能处理，TestData._getMockExamJson : status = "'+jsonObj.status+'"！', function () {
					window.location.href = 'default.html';
				});
			}
		};
		if(simulated === '0'){	//用户没有配置过
			G_AjaxApi.get('/api/exam/getSimulationTest/'+appEName +'/'+userID+'/'+ userName +'/'+ guid,false,success);
		}else if(simulated === '1'){
			//从SessionStorage中无法拿到配置JSON时，需要从数据库中获取
			if(!_configJson){
				if(!configID){
					return;	
				}
				if(defaulted === '1'){
					G_AjaxApi.get('/api/exam/getConfigJson/'+ configID,false,function (json) {
						var jsonObj = JSON.parse(json);
						if (jsonObj.status === 200) {	//200 获取数据成功
							_configJson = jsonObj.data.configJson;
						}else if (jsonObj.status === 300) {	//300 连接数据库失败
							G_Prg.throw('程序运行错误，TestData._getMockExamJson,数据库获取数据异常', function () {
								window.location.href = 'default.html';
							}); 
						}else{	
							G_Prg.throw('程序运行错误，不能处理，TestData._getMockExamJson : status = "'+jsonObj.status+'"！', function () {
								window.location.href = 'default.html';
							});
						}
					});	
				}else{
					G_AjaxApi.get('/api/exam/getConfigJson/'+ configID +'/'+ appEName +'/'+ userID +'/'+ guid,false,function (json) {
						var jsonObj = JSON.parse(json);
						if (jsonObj.status === 200) {	//200 获取数据成功
							_configJson = jsonObj.data.configJson;
						}else if (jsonObj.status === 300) {	//300 连接数据库失败
							G_Prg.throw('程序运行错误，TestData._getMockExamJson,数据库获取数据异常', function () {
								window.location.href = 'default.html';
							}); 
						}else{	
							G_Prg.throw('程序运行错误，不能处理，TestData._getMockExamJson : status = "'+jsonObj.status+'"！', function () {
								window.location.href = 'default.html';
							});
						}
					});	
				}//end if defaulted
			}//end if _configJson
			var params = {
				simulationExamJson : _configJson,
				appID : appID,
				userID : userID,
				userName : userName,
				guid : guid
				};	
			if(defaulted === '1'){
				G_AjaxApi.post('/api/exam/getDefaultSimulationTest/',params,false,success);
			}else{
				G_AjaxApi.post('/api/exam/getSimulationTest/',params,false,success);
			}	
		}//end if simulated
		jsonData = G_SetTestInfo.replaceImgURL(jsonData);	//设置图片路径
		return jsonData;
	}
	/********************************************************************************
	函数名：_getSearchExamJson
	功能：获取被查找的试题数据
	输入参数:appEName 软件英文名称;curPage 当前页码
             callback 抛出异常后执行的回调函数
	返回值：jsonData 查找到的试题数据
	创建信息：黎萍（2014-08-7）
	修改记录：无
	审查人：无
	*******************************************************************************/
	function _getSearchExamJson(appEName,curPage,callback){
		var userName = G_Cookie.getUserName();
        var userID = G_Cookie.getUserID();
        if (!userID) {
 			G_Prg.throw('程序运行错误，TestData._getSearchExamJson : userID = "'+userID+'",获取数据出现异常');
 		}
		var guid = G_Cookie.getGuid();	//检验码
		var keyWord = G_Prg.getQueryString('keyWord',true);
		var testJsonData = ''; 	//试题json数据
        var URL = '/api/searchTest/getTestByTestKeyApi';
        var params={
            appEName:appEName,
            keyWord:keyWord,
            curPage:curPage-1,
            userID:userID,
            userName:userName,
            guid:guid
        };
 		var _success = function (json) {
 			if (!json) {
 				G_Prg.throw('程序运行错误，TestData._getSearchExamJson请求服务器无返回');
 			}
 			var jsonData = JSON.parse(json);
 			if (jsonData.status === 200) {
 				testJsonData = jsonData.data.test;
				_examHistoryID = jsonData.data.examHistoryID;
 			} else if (jsonData.status === 201) { //用户尚未有收藏题目，查询不到数据
 				G_Prg.throw('没有所要查找的试题', callback);
 			} else if (jsonData.status === 300) { //数据库错误
 				G_Prg.throw('程序运行错误，TestData._getSearchExamJson,数据库获取数据异常');
 			} else { //400 参数有误；其它.......
 				G_Prg.throw('抱歉，TestData._getSearchExamJson不能处理 status = "' + jsonData.status + '"！');
 			}
 		} 
 		G_AjaxApi.post(URL,params, false, _success);
 		testJsonData = G_SetTestInfo.replaceImgURL(testJsonData); //设置图片路径
 		return testJsonData;
	}
    /********************************************************************************
	函数名：_getNotDoneJson
	功能：获取用户未做的试题数据
	输入参数:appID 软件ID, cptID 章节ID,
             callback 抛出异常后执行的回调函数
	返回值：jsonData 未做的试题数据
	创建信息：韦友爱（2014-08-25）
	修改记录：无
	审查人：无
	*******************************************************************************/
    function _getNotDoneJson(appID, cptID, callback){
        var userID = G_Cookie.getUserID();
        if (!userID) {
 			G_Prg.throw('程序运行错误，TestData._getNotDoneJson : userID = "'+userID+'",获取数据出现异常');
 		}
        var userName = G_Cookie.getUserName();
        if (!userName) {
 			G_Prg.throw('程序运行错误，TestData._getNotDoneJson : userName = "'+userName+'",获取数据出现异常');
 		}
        var guid = G_Cookie.getGuid();
        if (!guid) {
 			G_Prg.throw('程序运行错误，TestData._getNotDoneJson : guid = "'+guid+'",获取数据出现异常');
 		}
		var jsonData = ''; 	//试题json数据
		var arrUserTest =  '';	//存储用户收藏、用户笔记的数组
        var URL='/api/analysistApi/getNotDoTests/'+appID+'/'+userID+'/'+cptID+'/'+userName+'/'+guid;
        var _success=function (json) {
				var jsonObj = JSON.parse(json);
				if (jsonObj.status === 200) {	//200 获取数据成功
					//字符串转json对象
					jsonData = JSON.parse(jsonObj.data.test);
					arrUserTest = jsonObj.data.info;	
					_isVip = jsonObj.data.isVip;
					_examHistoryID = jsonObj.data.examHistoryID;
				}else if (jsonObj.status === 300) {	//300 连接数据库失败
					G_Prg.throw('程序运行错误，TestData._getNotDoneJson,数据库获取数据异常', callback);
				}else if (jsonObj.status === 201) {	//201 没有数据；
					G_Prg.throw('程序运行错误，没有您未做的试题数据！', callback);
				}else{	
					G_Prg.throw('程序运行错误，不能处理，TestData._getNotDoneJson : status = "'+jsonObj.status+'"！',callback);
				}
			};
        G_AjaxApi.get(URL,false,_success);
		jsonData = G_SetTestInfo.setFavAndNoteTest(jsonData,arrUserTest);	//添加用户笔记、收藏标记
		jsonData = G_SetTestInfo.replaceImgURL(jsonData);	//设置图片路径
		return jsonData;
    }
	/********************************************************************************
	函数名：_getFavTestJson
	功能：获取用户收藏的试题数据
	输入参数:appID 软件ID,appEName 软件英文名称,curPage 当前页码
             callback 抛出异常后执行的回调函数           
	返回值：favTestJson 被收藏的试题数据
	创建信息：黎萍（2014-07-04）
	修改记录：黎萍（2014-07-07）增加输入参数appID,appEName
	修改记录：黎萍（2014-07-14）增加输入参数curPage 当前页码
              韦友爱（2014-07-23）添加参数callback
	审查人：无
	*******************************************************************************/
	function _getFavTestJson(appID,appEName,curPage,cptID,testNum,callback) {
		var userID = G_Cookie.getUserID();
		if (!userID) {
 			G_Prg.throw('程序运行错误，TestData._getFavTestJson : userID = "'+userID+'",获取数据出现异常');
 		}
		var favTestJson = {};
		var arrUserTest =  '';	//存储用户收藏、用户笔记的数组
 		var _success = function (json) {
 			var jsonData = JSON.parse(json);
 			if (jsonData.status === 200) {
 				//接收数据
 				favTestJson = jsonData.data.test;
				arrUserTest = jsonData.data.info;	
				_examHistoryID = jsonData.data.examHistoryID;
 			}else if (jsonData.status === 201) {
				G_Prg.throw('无收藏记录！');
 			} else if (jsonData.status === 202) { //部分试题查询不到
 				favTestJson = jsonData.data.test;
 				if (favTestJson.StyleItems.length===0) {
 					G_Prg.throw('程序运行错误，testData._getFavTestJson:status ='+jsonData.status+' 没有查询到收藏试题数据！');
 				}
                G_Prg.alert('部分试题获取失败');
 				arrUserTest = jsonData.data.info;
                _examHistoryID = jsonData.data.examHistoryID;
			}else if (jsonData.status === 300) { //数据库错误
 				G_Prg.throw('程序运行错误，TestData._getFavTestJson,数据库获取数据异常');
 			}else{
				G_Prg.throw('不能处理，TestData._getFavTestJson:status='+jsonData.status);
			}
 		}
        var URL = '/api/exam/getUserFav';
        var params={
            appID:appID,
            userID:userID,
            appEName:appEName,
            curPage:curPage-1,
            userName:G_Cookie.getUserName(),
            guid:G_Cookie.getGuid(),
            cptID:cptID,
            eachPageNum:testNum
        };
		G_AjaxApi.post(URL, params, false, _success);
        
		favTestJson = G_SetTestInfo.setFavAndNoteTest(favTestJson,arrUserTest);	//添加用户笔记、收藏标记
		favTestJson = G_SetTestInfo.replaceImgURL(favTestJson);	//设置图片路径
        favTestJson = G_SetTestInfo.sortingTest(favTestJson);//按题型重组json
 		return favTestJson;
 	}
    /********************************************************************************
	函数名：_getFavRankJson
	功能：获取收藏排行的试题数据
	输入参数:appID 软件ID,appEName 软件英文名称,curPage 当前页码，userName 用户名，userID 用户ID        
	返回值：favRankJson 收藏排行的试题数据
	创建信息：韦友爱（2014-08-20）
	审查人：无
	*******************************************************************************/
	function _getFavRankJson(appID, appEName, curPage, testNum, callback) {
        var userID = G_Cookie.getUserID();
		if (!userID) {
 			G_Prg.throw('程序运行错误，TestData._getFavRankJson : userID = "'+userID+'",获取数据出现异常'); 
 		}
        var userName = G_Cookie.getUserName();
		if (!userName) {
 			G_Prg.throw('程序运行错误，TestData._getFavRankJson : userName = "'+userName+'",获取数据出现异常');
 		}
		var favRankJson = {};
		var arrUserTest = ''; //存储用户收藏、用户笔记的数组
		var _success = function (json) {
			var jsonData = JSON.parse(json);
			if (jsonData.status === 200) {
				//接收数据
				favRankJson = jsonData.data.test;
				arrUserTest = jsonData.data.info;
				_examHistoryID = jsonData.data.examHistoryID;
			} else if (jsonData.status === 201) {
				G_Prg.throw('无收藏排行榜数据！');
			} else if (jsonData.status === 202) { //部分试题查询不到
				favRankJson = jsonData.data.test;
				if (favTestJson.StyleItems.length === 0) {
					G_Prg.throw('程序运行错误，TestData._getFavRankJson:status =' + jsonData.status + ' 没有查询到收藏排行榜试题数据！');
				}
				G_Prg.alert('部分试题获取失败');
				arrUserTest = jsonData.data.info;
				_examHistoryID = jsonData.data.examHistoryID;
			} else if (jsonData.status === 300) { //数据库错误
				G_Prg.throw('程序运行错误，TestData._getFavRankJson,数据库获取数据异常');
			} else {
				G_Prg.throw('不能处理，TestData._getFavRankJson:status=' + jsonData.status);
			}
		}
		var URL = '/api/testRank/getFavRankTest';
        var params={
            appID:appID,
            userID:userID,
            appEName:appEName,
            curPage:curPage-1,
            userName:userName,
            guid:G_Cookie.getGuid(),
            cptID:-1,
            eachPageNum:testNum
        };
		G_AjaxApi.post(URL, params, false, _success);
        favRankJson = G_SetTestInfo.setFavAndNoteTest(favRankJson,arrUserTest);	//添加用户笔记、收藏标记
		favRankJson = G_SetTestInfo.replaceImgURL(favRankJson); //设置图片路径
        favRankJson = G_SetTestInfo.sortingTest(favRankJson);//按题型重组json
		return favRankJson;
	}
	/********************************************************************************
	函数名：_getErrorTestJson
	功能：获取用户做错的试题数据
	输入参数:appID 软件ID,appEName 软件英文名称,curPage 当前页码
            callback 抛出异常后执行的回调函数
	返回值：errorTestJson 被做错的试题数据
	创建信息：黎萍（2014-07-04）
	修改记录：黎萍（2014-07-07）增加输入参数appID,appEName
	修改记录：黎萍（2014-07-14）增加输入参数curPage 当前页码
             韦友爱（2014-07-23）添加参数callback
	审查人：无
	*******************************************************************************/
	function _getErrorTestJson(appID,appEName,curPage,cptID,testNum,callback) {
		var userID = G_Cookie.getUserID();
		if (!userID) {
 			G_Prg.throw('程序运行错误，TestData._getErrorTestJson : userID = "'+userID+'",获取数据出现异常'); 
 		}
		var errorTestJson = {};
		var arrUserTest =  '';	//存储用户收藏、用户笔记的数组
 		var _success = function (json) {
 			var jsonData = JSON.parse(json);
 			if (jsonData.status === 200) {
 				//接收数据
 				errorTestJson = jsonData.data.test;
				arrUserTest = jsonData.data.info;
				_examHistoryID = jsonData.data.examHistoryID;
 			}else if (jsonData.status === 201) {
				G_Prg.throw('无错题记录！');
 			} else if (jsonData.status === 202) { //部分试题查询不到
 				errorTestJson = jsonData.data.test;
 				if (errorTestJson.StyleItems.length===0) {
 					G_Prg.throw('程序运行错误，testData._getErrorTestJson:status= '+jsonData.status+' 没有查找到做错的试题数据！');
 				}
                G_Prg.alert('部分试题获取失败');
 				arrUserTest = jsonData.data.info;
                _examHistoryID = jsonData.data.examHistoryID;
 			} else if (jsonData.status === 300) { //数据库错误
 				G_Prg.throw('程序运行错误，TestData._getErrorTestJson,数据库获取数据异常');
 			}else{
				G_Prg.throw('不能处理，TestData._getErrorTestJson:status='+jsonData.status);
			}
 		}
        var URL = '/api/exam/getErrorTest';
        var params={
            appID:appID,
            userID:userID,
            appEName:appEName,
            curPage:curPage-1,
            userName:G_Cookie.getUserName(),
            guid:G_Cookie.getGuid(),
            cptID:cptID,
            eachPageNum:testNum
        };
    	G_AjaxApi.post(URL, params, false, _success);
        
		errorTestJson = G_SetTestInfo.setFavAndNoteTest(errorTestJson,arrUserTest);	//添加用户笔记、收藏标记
		errorTestJson = G_SetTestInfo.replaceImgURL(errorTestJson);	//设置图片路径
        errorTestJson = G_SetTestInfo.sortingTest(errorTestJson);//按题型重组json
 		return errorTestJson;
 	}
    /********************************************************************************
	函数名：_getErrorRankJson
	功能：获取错题排行榜的试题数据
	输入参数:appID 软件ID, appEName 软件英文名, curPage 当前页码，userName 用户名，userID 用户ID
	返回值：errorRankJson 错题排行榜的试题数据
	创建信息：韦友爱（2014-09-16）
	修改记录：无
	审查人：无
	*******************************************************************************/
    function _getErrorRankJson(appID, appEName, curPage, testNum,callback) {
        var userID = G_Cookie.getUserID();
		if (!userID) {
 			G_Prg.throw('程序运行错误，TestData._getErrorRankJson : userID = "'+userID+'",获取数据出现异常'); 
 		}
        var userName = G_Cookie.getUserName();
		if (!userName) {
 			G_Prg.throw('程序运行错误，TestData._getErrorRankJson : userName = "'+userName+'",获取数据出现异常');
 		}
    	var errorRankJson = {};
    	var arrRankTest = ''; //存储用户收藏、用户笔记的数组
    	var _success = function (json) {
    		var jsonData = JSON.parse(json);
    		if (jsonData.status === 200) {
    			//接收数据
    			errorRankJson = jsonData.data.test;
    			arrRankTest = jsonData.data.info;
                _examHistoryID = jsonData.data.examHistoryID;
    		} else if (jsonData.status === 201) {
    			G_Prg.throw('无错题排行榜记录！');
    		} else if (jsonData.status === 202) { //部分试题查询不到
    			errorRankJson = jsonData.data.test;
    			if (errorRankJson.StyleItems.length === 0) {
    				G_Prg.throw('程序运行错误，TestData._getErrorRankJson:status= ' + jsonData.status + ' 没有查找到错题排行榜的试题数据！');
    			}
    			G_Prg.alert('部分试题获取失败');
    			arrRankTest = jsonData.data.info;
    			_examHistoryID = jsonData.data.examHistoryID;
    		} else if (jsonData.status === 300) { //数据库错误
    			G_Prg.throw('程序运行错误，TestData._getErrorRankJson,数据库获取数据异常');
    		} else {
    			G_Prg.throw('不能处理，TestData._getErrorRankJson:status=' + jsonData.status);
    		}
    	}
    	var URL = '/api/testRank/getErrorRankTest';
        var params={
            appID:appID,
            userID:userID,
            appEName:appEName,
            curPage:curPage-1,
            userName:userName,
            guid:G_Cookie.getGuid(),
            eachPageNum:testNum
        };
    	G_AjaxApi.post(URL, params, false, _success);
    	errorRankJson = G_SetTestInfo.setFavAndNoteTest(errorRankJson, arrRankTest); //添加用户笔记、收藏标记
    	errorRankJson = G_SetTestInfo.replaceImgURL(errorRankJson); //设置图片路径
        errorRankJson = G_SetTestInfo.sortingTest(errorRankJson);       
    	return errorRankJson;
    }
	/********************************************************************************
	函数名：_getTestNoteJson
	功能：获取用户笔记的试题数据
	输入参数:appID 软件ID,appEName 软件英文名称,curPage 当前页码
            callback 抛出异常后执行的回调函数
	返回值：noteTestJson 用户笔记的试题数据
	创建信息：黎萍（2014-07-06）
	修改记录：黎萍（2014-07-07）增加输入参数appID,appEName
	修改记录：黎萍（2014-07-14）增加输入参数curPage 当前页码
             韦友爱（2014-07-23）添加参数callback
	审查人：无
	*******************************************************************************/
	function _getTestNoteJson(appID,appEName,curPage,cptID,testNum,callback) {
		var userID = G_Cookie.getUserID();
		if (!userID) {
 			G_Prg.throw('程序运行错误，TestData._getTestNoteJson : userID = "'+userID+'",获取数据出现异常'); 
 		}
 		var noteTestJson = {};
		var arrUserTest =  '';	//存储用户收藏、用户笔记的数组
 		var _success = function (json) {
 			var jsonData = JSON.parse(json);
 			if (jsonData.status === 200) {
 				//接收数据
 				noteTestJson = jsonData.data.test;
				arrUserTest = jsonData.data.info;
				_examHistoryID = jsonData.data.examHistoryID;
 			}else if (jsonData.status === 201) {
				G_Prg.throw('无笔记记录！');
 			} else if (jsonData.status === 202) { //部分试题查询不到
 				noteTestJson = jsonData.data.test;
 				if (noteTestJson.StyleItems.length===0) {
 					G_Prg.throw('程序运行错误，testData._getTestNoteJson:status= '+jsonData.status+' 未查询到笔记试题数据！');
 				}
                G_Prg.alert('部分试题获取失败');
 				arrUserTest = jsonData.data.info;
                _examHistoryID = jsonData.data.examHistoryID;
 			} else if (jsonData.status === 300) { //数据库错误
 				G_Prg.throw('程序运行错误，TestData._getTestNoteJson,数据库获取数据异常');
 			}else{
				G_Prg.throw('不能处理，TestData._getTestNoteJson:status='+jsonData.status);
			}
 		}
        var URL = '/api/exam/getUserNoteTest';
        var params={
            appID:appID,
            userID:userID,
            appEName:appEName,
            curPage:curPage-1,
            userName:G_Cookie.getUserName(),
            guid:G_Cookie.getGuid(),
            cptID:cptID,
            eachPageNum:testNum
        };
 		G_AjaxApi.post(URL, params, false, _success);

		noteTestJson = G_SetTestInfo.setFavAndNoteTest(noteTestJson,arrUserTest);	//添加用户笔记、收藏标记
		noteTestJson = G_SetTestInfo.replaceImgURL(noteTestJson);	//设置图片路径
        noteTestJson = G_SetTestInfo.sortingTest(noteTestJson);//按题型重组json
 		return noteTestJson;
 	}
    /********************************************************************************
	函数名：_getNoteRankJson
	功能：获取用户笔记的试题数据
	输入参数:appID 软件ID,appEName 软件英文名称,curPage 当前页码
            callback 抛出异常后执行的回调函数
	返回值：noteTestJson 用户笔记的试题数据
	创建信息：韦友爱（2014-09-24）
	修改记录：无
	审查人：无
	*******************************************************************************/
    function _getNoteRankJson(appID,appEName,curPage,testNum,callback){
        var noteTestJson = {};
		var arrUserTest =  '';	//存储用户收藏、用户笔记的数组
 		var _success = function (json) {
 			var jsonData = JSON.parse(json);
 			if (jsonData.status === 200) {
                //接收数据
 				noteTestJson = jsonData.data.test;
				arrUserTest = jsonData.data.info;
				_examHistoryID = jsonData.data.examHistoryID;
 			}else if (jsonData.status === 201) {
				G_Prg.throw('无大家的笔记记录！');
 			} else if (jsonData.status === 202) { //部分试题查询不到
 				noteTestJson = jsonData.data.test;
 				if (noteTestJson.StyleItems.length===0) {
 					G_Prg.throw('程序运行错误，testData._getTestNoteJson:status= '+jsonData.status+' 未查询到笔记试题数据！');
 				}
                G_Prg.alert('部分试题获取失败');
 				arrUserTest = jsonData.data.info;
                _examHistoryID = jsonData.data.examHistoryID;
 			} else if (jsonData.status === 300) { //数据库错误
 				G_Prg.throw('程序运行错误，TestData._getTestNoteJson,数据库获取数据异常');
 			}else{
				G_Prg.throw('不能处理，TestData._getTestNoteJson:status='+jsonData.status);
			}
 		}
 		var URL = '/api/latestNotes/getLatestNotes';
        var params={
            appID:appID,
            appEName:appEName,
            curPage:curPage-1,
            userName:G_Cookie.getUserName(),
            userID:G_Cookie.getUserID(),
            guid:G_Cookie.getGuid(),
            eachPageNum:testNum,
            latestTime:G_Prg.getQueryString('time')
        };
 		G_AjaxApi.post(URL, params, false, _success);
        noteTestJson = G_SetTestInfo.setFavAndNoteTest(noteTestJson,arrUserTest);	//添加用户笔记、收藏标记
		noteTestJson = G_SetTestInfo.replaceImgURL(noteTestJson);	//设置图片路径
        noteTestJson = G_SetTestInfo.sortingTest(noteTestJson);//按题型重组json
 		return noteTestJson;
    }
	/********************************************************************************
	函数名：_getAtest
	功能：获取Atest型题试题信息
	输入参数:curTest 当前试题数组
	返回值：单题试题对象
	创建信息：黎萍（2014-05-28）
	修改记录：黎萍（2014-06-24） 增加试题信息：AllTestID,StyleID
	修改记录：黎萍（2014-07-03） 增加试题信息：cptID,sbjID,srcID,subTestID
	修改记录：黎萍（2014-07-04） 增加试题信息：score
	修改记录：黎萍（2014-07-09）将获取每种题型的参数index修改成传参数curTest
	修改记录：黎萍（2014-07-09）修改将试题信息赋值到结构体的方式
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	function _getAtest(curTest) {
		var oneTestShow =  new OneTestShow();
		var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
		var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的ATestID
		oneTestShow.testNO = curTest.testNO;
		if(_jsonAllTest === '' || _jsonAllTest === undefined){
			return;
		}
		var styleItems = _jsonAllTest.StyleItems;
		var testItems = styleItems[styleItemIndex].TestItems;
		
		oneTestShow.score = styleItems[styleItemIndex].Score;	//分数
		oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
		oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
		oneTestShow.styleID = styleItems[styleItemIndex].StyleID;
		oneTestShow.styleExplain = styleItems[styleItemIndex].Explain; //题型说明
		oneTestShow.cptID = testItems[testItemIndex].CptID; //章节ID
    	oneTestShow.sbjID = testItems[testItemIndex].SbjID; //科目ID
    	oneTestShow.srcID = testItems[testItemIndex].SrcID;	//来源ID
		oneTestShow.allTestID = testItems[testItemIndex].AllTestID;
		oneTestShow.title = testItems[testItemIndex].Title; //标题
		var explain = testItems[testItemIndex].Explain; //解题思路
		oneTestShow.explain = explain === '' ? '无' : explain; //没有解析，设置默认值
		var testPoint = testItems[testItemIndex].TestPoint; //考试重点
		oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
		oneTestShow.answer = testItems[testItemIndex].Answer; //答案
		oneTestShow.isFav = testItems[testItemIndex].IsFav; //是否收藏
		oneTestShow.userNote = testItems[testItemIndex].UserNoteContent; //用户笔记
		oneTestShow.selectedItems = testItems[testItemIndex].SelectedItems; //选项
		oneTestShow.time=G_Prg.datetimeFormat(new Date(testItems[testItemIndex].NoteTime), 'MM月dd日');//时间
		return oneTestShow;
	}
	/********************************************************************************
	函数名：_getA3test
	功能：获取A3test型题试题信息
	输入参数:curTest 当前试题数组
	返回值：单题试题对象
	创建信息：黎萍（2014-05-28）
	修改记录：黎萍（2014-06-24） 增加试题信息：AllTestID,StyleID
	修改记录：黎萍（2014-07-03） 增加试题信息：cptID,sbjID,srcID,subTestID
	修改记录：黎萍（2014-07-04） 增加试题信息：score
	修改记录：黎萍（2014-07-09）将获取每种题型的参数index修改成传参数curTest
	修改记录：黎萍（2014-07-09）修改将试题信息赋值到结构体的方式
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	function _getA3test(curTest) {
		var oneTestShow =  new OneTestShow();
		var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
		var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的A3TestID
		var subTestItemIndex = curTest.subTestItemIndex; //小题ID,针对A3题型的A3TestItemIndex
		oneTestShow.testNO = curTest.testNO;
		if(_jsonAllTest === '' || _jsonAllTest === undefined){
			return;
		}
		var styleItems = _jsonAllTest.StyleItems;
		var testItems = styleItems[styleItemIndex].TestItems;
		var A3TestItems = testItems[testItemIndex].A3TestItems;
		
		oneTestShow.score = styleItems[styleItemIndex].Score;	//分数
		oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
		oneTestShow.subTestType = styleItems[styleItemIndex].SubType === undefined ? '单项' : styleItems[styleItemIndex].SubType; //选项类型，值有：空，单项，多项，不定项
		oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
		oneTestShow.styleID = styleItems[styleItemIndex].StyleID;
		oneTestShow.styleExplain = styleItems[styleItemIndex].Explain; //题型说明
		oneTestShow.cptID = testItems[testItemIndex].CptID; //章节ID
    	oneTestShow.sbjID = testItems[testItemIndex].SbjID; //科目ID
    	oneTestShow.srcID = testItems[testItemIndex].SrcID;	//来源ID
		oneTestShow.allTestID = testItems[testItemIndex].AllTestID;
		oneTestShow.frontTitle = testItems[testItemIndex].FrontTitle; //共用主标题
		oneTestShow.isFav = A3TestItems[subTestItemIndex].IsFav; //是否收藏
		oneTestShow.userNote = A3TestItems[subTestItemIndex].UserNoteContent; //是否收藏
		oneTestShow.subTestID = A3TestItems[subTestItemIndex].A3TestItemID;
		oneTestShow.answer = A3TestItems[subTestItemIndex].Answer; //答案
		oneTestShow.title = A3TestItems[subTestItemIndex].Title; //小标题
		var explain = A3TestItems[subTestItemIndex].Explain; //解题思路
		oneTestShow.explain = explain === '' ? '无' : explain; //没有解析，设置默认值
		var testPoint = A3TestItems[subTestItemIndex].TestPoint; //考试重点
		oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
		oneTestShow.selectedItems = A3TestItems[subTestItemIndex].SelectedItems; //选项
		oneTestShow.time=G_Prg.datetimeFormat(new Date(A3TestItems[subTestItemIndex].NoteTime), 'MM月dd日');//时间

		return oneTestShow;
	}
	/********************************************************************************
	函数名：_getBtest
	功能：获取Btest型题试题信息
	输入参数:curTest 当前试题数组
	返回值：单题试题对象
	创建信息：黎萍（2014-05-28）
	修改记录：黎萍（2014-06-24） 增加试题信息：AllTestID,StyleID
	修改记录：黎萍（2014-07-03） 增加试题信息：cptID,sbjID,srcID,subTestID
	修改记录：黎萍（2014-07-04） 增加试题信息：score
	修改记录：黎萍（2014-07-09）将获取每种题型的参数index修改成传参数curTest
	修改记录：黎萍（2014-07-09）修改将试题信息赋值到结构体的方式
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	function _getBtest(curTest) {
		var oneTestShow =  new OneTestShow();
		var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
		var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的BTestID
		var subTestItemIndex = curTest.subTestItemIndex; //小题ID,针对B题型的BTestItemIndex
		oneTestShow.testNO = curTest.testNO;
		if(_jsonAllTest === '' || _jsonAllTest === undefined){
			return;
		}
		var styleItems = _jsonAllTest.StyleItems;
		var testItems = styleItems[styleItemIndex].TestItems;
		var BTestItems = testItems[testItemIndex].BTestItems;

		oneTestShow.score = styleItems[styleItemIndex].Score;	//分数
		oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
		oneTestShow.subTestType = styleItems[styleItemIndex].SubType === undefined ? '单项' : styleItems[styleItemIndex].SubType; //选项类型，值有：空，单项，多项，不定项
		oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型定项
		oneTestShow.styleID = styleItems[styleItemIndex].StyleID;
		oneTestShow.styleExplain = styleItems[styleItemIndex].Explain; //题型说明
		oneTestShow.cptID = testItems[testItemIndex].CptID; //章节ID
    	oneTestShow.sbjID = testItems[testItemIndex].SbjID; //科目ID
    	oneTestShow.srcID = testItems[testItemIndex].SrcID;	//来源ID
		oneTestShow.allTestID = testItems[testItemIndex].AllTestID;
		oneTestShow.selectedItems = testItems[testItemIndex].SelectedItems; //共用选项
		oneTestShow.isFav = BTestItems[subTestItemIndex].IsFav; //是否收藏
		oneTestShow.userNote = BTestItems[subTestItemIndex].UserNoteContent; //用户笔记
		oneTestShow.subTestID = BTestItems[subTestItemIndex].BTestItemID;
		oneTestShow.answer = BTestItems[subTestItemIndex].Answer; //答案
		oneTestShow.title = BTestItems[subTestItemIndex].Title; //小标题
		var explain = testItems[testItemIndex].Explain; //解题思路
		oneTestShow.explain = explain === '' ? '无' : explain; //没有解析，设置默认值
		//var explain = BTestItems[subTestItemIndex].Explain; //解题思路
		//oneTestShow.explain = explain === '' ? '无' : explain; //没有解析，设置默认值
		var testPoint = BTestItems[subTestItemIndex].TestPoint; //考试重点
		oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
		oneTestShow.time=G_Prg.datetimeFormat(new Date(BTestItems[subTestItemIndex].NoteTime), 'MM月dd日');//时间

		return oneTestShow;
	}
	/********************************************************************************
	函数名：_getJDtest
	功能：获取JDtest型题试题信息
	输入参数:curTest 当前试题数组
	返回值：单题试题对象
	创建信息：黎萍（2014-05-28）
	修改记录：黎萍（2014-06-24） 增加试题信息：AllTestID,StyleID
	修改记录：黎萍（2014-07-03） 增加试题信息：cptID,sbjID,srcID,subTestID
	修改记录：黎萍（2014-07-04） 增加试题信息：score
	修改记录：黎萍（2014-07-09）将获取每种题型的参数index修改成传参数curTest
	修改记录：黎萍（2014-07-09）修改将试题信息赋值到结构体的方式
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	function _getJDtest(curTest) {
		var oneTestShow =  new OneTestShow();
		var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
		var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的JDTestID
		oneTestShow.testNO = curTest.testNO;
		if(_jsonAllTest === '' || _jsonAllTest === undefined){
			return;
		}
		var styleItems = _jsonAllTest.StyleItems;
		var testItems = styleItems[styleItemIndex].TestItems;
	
		oneTestShow.score = styleItems[styleItemIndex].Score;	//分数
		oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
		oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
		oneTestShow.styleID = styleItems[styleItemIndex].StyleID;
		oneTestShow.styleExplain = styleItems[styleItemIndex].Explain; //题型说明
		oneTestShow.cptID = testItems[testItemIndex].CptID; //章节ID
    	oneTestShow.sbjID = testItems[testItemIndex].SbjID; //科目ID
    	oneTestShow.srcID = testItems[testItemIndex].SrcID;	//来源ID
		oneTestShow.allTestID = testItems[testItemIndex].AllTestID;
		oneTestShow.title = testItems[testItemIndex].Title; //标题
		oneTestShow.isFav = testItems[testItemIndex].IsFav; //是否收藏
		oneTestShow.userNote = testItems[testItemIndex].UserNoteContent; //用户笔记
		var explain = testItems[testItemIndex].Explain; //解题思路
		oneTestShow.explain = explain === '' ? '无' : explain; //没有解析，设置默认值
		var testPoint = testItems[testItemIndex].TestPoint; //考试重点
		oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
		oneTestShow.answer = testItems[testItemIndex].Answer; //答案
		oneTestShow.time=G_Prg.datetimeFormat(new Date(testItems[testItemIndex].NoteTime), 'MM月dd日');//时间

		return oneTestShow;
	}
	/********************************************************************************
	函数名：_getPDtest
	功能：获取PDtest型题试题信息
	输入参数:curTest 当前试题数组
	返回值：单题试题对象
	创建信息：黎萍（2014-05-28）
	修改记录：黎萍（2014-06-24） 增加试题信息：AllTestID,StyleID
	修改记录：黎萍（2014-07-03） 增加试题信息：cptID,sbjID,srcID,subTestID
	修改记录：黎萍（2014-07-04） 增加试题信息：score
	修改记录：黎萍（2014-07-09）将获取每种题型的参数index修改成传参数curTest
	修改记录：黎萍（2014-07-09）修改将试题信息赋值到结构体的方式
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	function _getPDtest(curTest) {
		var oneTestShow =  new OneTestShow();
		var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
		var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的PDTestID
		oneTestShow.testNO = curTest.testNO;
		if(_jsonAllTest === '' || _jsonAllTest === undefined){
			return;
		}
		var styleItems = _jsonAllTest.StyleItems;
		var testItems = styleItems[styleItemIndex].TestItems;
	
		oneTestShow.score = styleItems[styleItemIndex].Score;	//分数
		oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
		oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
		oneTestShow.styleID = styleItems[styleItemIndex].StyleID;
		oneTestShow.styleExplain = styleItems[styleItemIndex].Explain; //题型说明
		oneTestShow.cptID = testItems[testItemIndex].CptID; //章节ID
    	oneTestShow.sbjID = testItems[testItemIndex].SbjID; //科目ID
    	oneTestShow.srcID = testItems[testItemIndex].SrcID;	//来源ID
		oneTestShow.allTestID = testItems[testItemIndex].AllTestID;
		oneTestShow.title = testItems[testItemIndex].Title; //标题
		oneTestShow.isFav = testItems[testItemIndex].IsFav; //是否收藏
		oneTestShow.userNote = testItems[testItemIndex].UserNoteContent; //用户笔记
		var explain = testItems[testItemIndex].Explain; //解题思路
		oneTestShow.explain = explain === '' ? '无' : explain; //没有解析，设置默认值
		var testPoint = testItems[testItemIndex].TestPoint; //考试重点
		oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
		oneTestShow.answer = testItems[testItemIndex].Answer; //答案
		oneTestShow.time=G_Prg.datetimeFormat(new Date(testItems[testItemIndex].NoteTime), 'MM月dd日');//时间
		selectedItems = [{Content: "对",ItemName: "A"},{Content: "错",ItemName: "B"}];
		oneTestShow.selectedItems = selectedItems; //选项

		return oneTestShow;
	}
	/********************************************************************************
	函数名：_getTKtest
	功能：获取TKtest型题试题信息
	输入参数:curTest 当前试题数组
	返回值：单题试题对象
	创建信息：黎萍（2014-05-28）
	修改记录：黎萍（2014-06-24） 增加试题信息：AllTestID,StyleID
	修改记录：黎萍（2014-07-03） 增加试题信息：cptID,sbjID,srcID,subTestID
	修改记录：黎萍（2014-07-04） 增加试题信息：score
	修改记录：黎萍（2014-07-09）将获取每种题型的参数index修改成传参数curTest
	修改记录：黎萍（2014-07-09）修改将试题信息赋值到结构体的方式
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	function _getTKtest(curTest) {
		var oneTestShow =  new OneTestShow();
		var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
		var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的TKTestID
		oneTestShow.testNO = curTest.testNO;
		if(_jsonAllTest === '' || _jsonAllTest === undefined){
			return;
		}
		var styleItems = _jsonAllTest.StyleItems;
		var testItems = styleItems[styleItemIndex].TestItems;
		
		oneTestShow.score = styleItems[styleItemIndex].Score;	//分数
		oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
		oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
		oneTestShow.styleID = styleItems[styleItemIndex].StyleID;
		oneTestShow.styleExplain = styleItems[styleItemIndex].Explain; //题型说明
		oneTestShow.cptID = testItems[testItemIndex].CptID; //章节ID
    	oneTestShow.sbjID = testItems[testItemIndex].SbjID; //科目ID
    	oneTestShow.srcID = testItems[testItemIndex].SrcID;	//来源ID
		oneTestShow.allTestID = testItems[testItemIndex].AllTestID;
		oneTestShow.title = testItems[testItemIndex].Title; //标题
		oneTestShow.isFav = testItems[testItemIndex].IsFav; //是否收藏
		oneTestShow.userNote = testItems[testItemIndex].UserNoteContent; //用户笔记
		var explain = testItems[testItemIndex].Explain; //解题思路
		oneTestShow.explain = explain === '' ? '无' : explain; //没有解析，设置默认值
		var testPoint = testItems[testItemIndex].TestPoint; //考试重点
		oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
		var answer = testItems[testItemIndex].Answer; //答案
		oneTestShow.answer = G_SetTestInfo.splitTKTestAnswer(answer); //先进行选项分隔
		oneTestShow.answerType = testItems[testItemIndex].AnswerType;	//答案比较顺序
		oneTestShow.time=G_Prg.datetimeFormat(new Date(testItems[testItemIndex].NoteTime), 'MM月dd日');//时间

		return oneTestShow;
	}
	/********************************************************************************
	函数名：_getXtest
	功能：获取Xtest型题试题信息
	输入参数:curTest 当前试题数组
	返回值：单题试题对象
	创建信息：黎萍（2014-05-28）
	修改记录：黎萍（2014-06-24） 增加试题信息：AllTestID,StyleID
	修改记录：黎萍（2014-07-03） 增加试题信息：cptID,sbjID,srcID,subTestID
	修改记录：黎萍（2014-07-04） 增加试题信息：score
	修改记录：黎萍（2014-07-09）将获取每种题型的参数index修改成传参数curTest
	修改记录：黎萍（2014-07-09）修改将试题信息赋值到结构体的方式
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	function _getXtest(curTest) {
		var oneTestShow =  new OneTestShow();
		var styleItemIndex = curTest.styleItemIndex; //题型ID,json数据中的StyleID
		var testItemIndex = curTest.testItemIndex; //大标题ID,json数据中题型的XTestID
		oneTestShow.testNO = curTest.testNO;
		if(_jsonAllTest === '' || _jsonAllTest === undefined){
			return;
		}
		var styleItems = _jsonAllTest.StyleItems;
		var testItems = styleItems[styleItemIndex].TestItems;
		
		oneTestShow.score = styleItems[styleItemIndex].Score;	//分数
		oneTestShow.testType = styleItems[styleItemIndex].Type; //题型
		oneTestShow.testStyle = styleItems[styleItemIndex].Style; //题型
		oneTestShow.styleID = styleItems[styleItemIndex].StyleID;
		oneTestShow.styleExplain = styleItems[styleItemIndex].Explain; //题型说明
		oneTestShow.cptID = testItems[testItemIndex].CptID; //章节ID
    	oneTestShow.sbjID = testItems[testItemIndex].SbjID; //科目ID
    	oneTestShow.srcID = testItems[testItemIndex].SrcID;	//来源ID
		oneTestShow.allTestID = testItems[testItemIndex].AllTestID;
		oneTestShow.title = testItems[testItemIndex].Title; //标题
		oneTestShow.isFav = testItems[testItemIndex].IsFav; //是否收藏
		oneTestShow.userNote = testItems[testItemIndex].UserNoteContent; //用户笔记
		var explain = testItems[testItemIndex].Explain; //解题思路
		oneTestShow.explain = explain === '' ? '无' : explain; //没有解析，设置默认值
		var testPoint = testItems[testItemIndex].TestPoint; //考试重点
		oneTestShow.testPoint = testPoint === '' ? '无' : testPoint; //没有解析，设置默认值
		oneTestShow.answer = testItems[testItemIndex].Answer; //答案
		oneTestShow.selectedItems = testItems[testItemIndex].SelectedItems; //选项
		oneTestShow.time=G_Prg.datetimeFormat(new Date(testItems[testItemIndex].NoteTime), 'MM月dd日');//时间

		return oneTestShow;
	}

   

	/********************************************************************************
	以下为公共变量、公共函数
	 *******************************************************************************/
	
	/********************************************************************************
	函数名：getIsVip
	功能：获取标记是否是VIP用户的
	输入参数:无
	返回值：无
	创建信息：黎萍（2014-07-09）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getExamHistoryID = function () {
		return _examHistoryID;
	};
	/********************************************************************************
	函数名：getIsVip
	功能：获取标记是否是VIP用户的
	输入参数:无
	返回值：无
	创建信息：黎萍（2014-07-09）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getIsVip = function () {
		return _isVip;
	};
	/********************************************************************************
	函数名：getConfigJson
	功能：获取模拟考场配置json
	输入参数:无
	返回值：_configJson 模拟考场配置json
	创建信息：黎萍（2014-10-22）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getConfigJson = function () {
		return _configJson;
	};
	/********************************************************************************
	函数名：getArrAllTest
	功能：获取试题结构体数组
	输入参数:无
	返回值：无
	创建信息：黎萍（2014-07-09）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getArrAllTest = function () {
		return _arrAllTest;
	};
	/********************************************************************************
	函数名：getJsonAllTest
	功能：获取试题
	输入参数:无
	返回值：无
	创建信息：黎萍（2014-08-26）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getJsonAllTest = function () {
		return _jsonAllTest;
	};
	/********************************************************************************
	函数名：getCurIndex
	功能：获取当前试题的索引
	输入参数:无
	返回值：_index 当前试题的索引
	创建信息：兰涛（2014-05-28）
	修改记录：黎萍（2014-05-28） 增加函数注释
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.getCurIndex = function () {
		return _index; //试题的当前索引，从0开始
	};
	/********************************************************************************
	函数名：getTestCount
	功能：获取试题数量
	输入参数:无
	返回值： 试题数量
	创建信息：兰涛（2014-05-28）
	修改记录：黎萍（2014-05-28） 增加函数注释
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.getTestCount = function () {
        if(!_arrAllTest.length){
            G_Prg.throw('试题数组为空，请联系客服QQ:4007278800！');
        }
		return _arrAllTest.length; //试题数量
	};
	/********************************************************************************
	函数名：movePre
	功能：移动到上一题
	输入参数:无
	返回值：成功返回true，如果已经是第一题则返回false，操作页面对返回值进行判断，进行提示“已经是第一题”
	创建信息：兰涛（2014-05-28）
	修改记录：黎萍（2014-05-28） 增加函数注释
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.movePre = function () {
		if (_index <= 0) {
			return false;
		} else {
			_index--;
			return true;
		}
	};
	/********************************************************************************
	函数名：moveNext
	功能：移动到下一题
	输入参数:无
	返回值：成功返回true，如果已经是第一题则返回false，操作页面对返回值进行判断，进行提示"已经是最后一题"
	创建信息：兰涛（2014-05-28）
	修改记录：黎萍（2014-05-28） 增加函数注释
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.moveNext = function () {
		if (_index >= (_arrAllTest.length - 1)) {
			return false;
		} else {
			_index++;
			return true;
		}
	};
	/********************************************************************************
	函数名：move
	功能：移动到指定的答题卡上题号
	输入参数:index 试题数组索引
	返回值：成功返回true，如果已经是第一题则返回false
	创建信息：兰涛（2014-05-28）
	修改记录：黎萍（2014-05-28） 增加函数注释
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.move = function (index) {
		if ((index < 0) || (index >= _arrAllTest.length)) {
			return false;
		} else {
			_index = index;
			return true;
		}
	};
	/********************************************************************************
	函数名：setUserReply
	功能：设置用户的答案
	输入参数:	userReply 用户输入的答案
	返回值：无
	创建信息：兰涛（2014-05-28）
	修改记录：黎萍（2014-05-28） 增加函数注释
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.setUserReply = function (userReply) {
		_arrAllTest[_index].userReply = userReply;
	};
	/********************************************************************************
	函数名：getUserReply
	功能：获取用户的答案
	输入参数:	index 试题数组索引
	返回值：用户的答案
	创建信息：黎萍（2014-06-10）
	修改记录：无
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.getUserReply = function (index) {
		return _arrAllTest[index].userReply;
	};
	/********************************************************************************
	函数名：setIsRight
	功能：设置用户答题是否正确
	输入参数:	isRight 标记用户回答是否正确
	返回值：无
	创建信息：兰涛（2014-05-28）
	修改记录：黎萍（2014-05-28） 增加函数注释
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.setIsRight = function (isRight) {
		_arrAllTest[_index].isRight = isRight;
	};
	/********************************************************************************
	函数名：getIsRight
	功能：获取用户答题是否正确
	输入参数:	index 试题数组索引
	返回值：用户的答案
	创建信息：黎萍（2014-06-10）
	修改记录：无
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.getIsRight = function (index) {
		return _arrAllTest[index].isRight;
	};
	/********************************************************************************
	函数名：setSelected
	功能：设置标记章节练习的多选题已被选中，但是没有进行答案的提交；1 已选中 0 已提交
	输入参数:	selected 标记值
	返回值：无
	创建信息：黎萍（2014-08-06）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.setSelected = function (selected) {
		_arrAllTest[_index].selected = selected;
	};
	/********************************************************************************
	函数名：getSelected
	功能：获取标记章节练习的多选题已被选中，但是没有进行答案的提交；1 已选中 0 已提交
	输入参数:	index 试题数组索引
	返回值：标记值
	创建信息：黎萍（2014-08-06）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getSelected = function (index) {
		return _arrAllTest[index].selected;
	};
	/********************************************************************************
	函数名：setState
	功能：设置用户操作试题的状态
	输入参数:	state 标记值
	返回值：无
	创建信息：黎萍（2014-09-01）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.setState = function (state,flag) {
		if(!flag){
			_arrAllTest[_index].lastState = _arrAllTest[_index].state ;
			_arrAllTest[_index].state = state;
		}else{
			for(var i = 0; i < _arrAllTest.length; i++){
				_arrAllTest[i].lastState = _arrAllTest[i].state ;
				_arrAllTest[i].state = state;
			}
		}
	};
	/********************************************************************************
	函数名：getState
	功能：获取标记当前试题是否提交了答案
	输入参数:	index 试题数组索引
	返回值：标记值
	创建信息：黎萍（2014-09-01）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getState = function (index) {
		return _arrAllTest[index].state;
	};
	/********************************************************************************
	函数名：setAction
	功能：设置用户操作试题的动作
	输入参数:	actionName 操作试题的动作,flag 标记是否将所有试题都标记为此动作
	返回值：无
	创建信息：黎萍（2014-09-04）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.setAction = function(actionName,flag){
		if(!flag){
			_arrAllTest[_index].lastAction = _arrAllTest[_index].action;			
			_arrAllTest[_index].action = actionName;
		}else{
			for(var i = 0; i < _arrAllTest.length; i++){
				_arrAllTest[i].lastAction = _arrAllTest[i].action;	
				_arrAllTest[i].action = actionName;
			}
		}
    };
	/********************************************************************************
	函数名：recoverState
	功能：恢复用户之前操作试题的状态
	输入参数:	无
	返回值：无
	创建信息：黎萍（2014-09-04）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.recoverState = function(){
		for(var i = 0; i < _arrAllTest.length; i++){
			_arrAllTest[i].state = _arrAllTest[i].lastState ;
		}
	};
	/********************************************************************************
	函数名：getLastState
	功能：获取用户上一个操作状态
	输入参数:	index 当前试题索引
	返回值：无
	创建信息：黎萍（2014-09-04）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getLastState = function(index){
		return _arrAllTest[index].lastState;
	};
    /********************************************************************************
	函数名：getLastState
	功能：获取用户上一个操作状态
	输入参数:	index 当前试题索引
	返回值：无
	创建信息：黎萍（2014-09-04）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getLastAction = function(index){
		return _arrAllTest[index].lastAction;
	};
	/********************************************************************************
	函数名：recoverAction
	功能：恢复用户之前的操作动作
	输入参数:	无
	返回值：无
	创建信息：黎萍（2014-09-04）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.recoverAction = function(){
		for(var i = 0; i < _arrAllTest.length; i++){
			_arrAllTest[i].action = _arrAllTest[i].lastAction ;
		}
	};
    /********************************************************************************
	函数名：clearAction
	功能：清空用户之前的操作动作
	输入参数:	无
	返回值：无
	创建信息：黎萍（2014-09-04）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.clearAction = function(){
		for(var i = 0; i < _arrAllTest.length; i++){
			_arrAllTest[i].action = '';
            _arrAllTest[i].lastAction = '';
		}
	};
	/********************************************************************************
	函数名：getAction
	功能：获取用户当前试题的操作动作
	输入参数:	index 当前试题索引
	返回值：无
	创建信息：黎萍（2014-09-04）
	修改记录：无
	审查人：无
	 *******************************************************************************/
    this.getAction = function(index){
        return _arrAllTest[index].action;
    };
	/********************************************************************************
	函数名：setFav
	功能：设置用户是否收藏试题
	输入参数:	fav 收藏状态
	返回值：无
	创建信息：黎萍（2014-07-04）
	修改记录：无
	审查人：无
	*******************************************************************************/
	this.setFav = function (fav) {
		_arrAllTest[_index].fav = fav;
	};
	/********************************************************************************
	函数名：getFav
	功能：获取用户是否收藏试题
	输入参数:	index 试题数组索引
	返回值：试题收藏状态
	创建信息：黎萍（2014-07-04）
	修改记录：无
	审查人：无
	*******************************************************************************/
	this.getFav = function (index) {
		return _arrAllTest[index].fav;
	};
	/********************************************************************************
	函数名：setUserNote
	功能：设置用户是否对试题做了笔记
	输入参数:	userNote 用户笔记
	返回值：无
	创建信息：黎萍（2014-07-04）
	修改记录：无
	审查人：无
	*******************************************************************************/
	this.setUserNote = function (userNote) {
		_arrAllTest[_index].userNote = userNote;
	};
	/********************************************************************************
	函数名：getUserNote
	功能：获取用户是否对试题做了笔记
	输入参数:	index 试题数组索引
	返回值：用户笔记
	创建信息：黎萍（2014-07-04）
	修改记录：无
	审查人：无
	*******************************************************************************/
	this.getUserNote = function (index) {
		return _arrAllTest[index].userNote;
	};
    /********************************************************************************
	函数名：setTime
	功能：设置笔记时间
	输入参数:time  笔记时间
	返回值：无
	创建信息：韦友爱（2014-07-14）
	修改记录：无
	审查人：无
	*******************************************************************************/
    this.setTime = function (time) {
		_arrAllTest[_index].time = time;
	};
    /********************************************************************************
	函数名：getTime
	功能：设置笔记时间
	输入参数:index  试题数组索引
	返回值：添加试题笔记时间
	创建信息：韦友爱（2014-07-14）
	修改记录：无
	审查人：无
	*******************************************************************************/
    this.getTime = function (index) {
		return _arrAllTest[index].time;
	};
	/********************************************************************************
	函数名：calculateScores
	功能：计算分数
	输入参数：无
	返回值：返回考试结果，考试结果有：未做试题数，试题总数、已做试题数、答对试题数、正确率、成绩评定
	创建信息：黎萍（2014-05-23）
	修改记录：兰涛（2014-05-27）修改函数名称
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.calculateScores = function () {
		var testCount = _arrAllTest.length; //试题总数
		var doneNum = 0; //已做试题数
		var rightNum = 0; //答对试题数
		var notDoNum = 0; //未做试题数
		var correctRate = 0; //正确率
		//计算用户的总得分和试题满分
		var allScore = 0;
		var userScore = 0;
		for (var i = 0; i < testCount; i++) {
			if (_arrAllTest[i].userReply !== '' && _arrAllTest[i].isRight !== false) {
				doneNum++; //获取已做总数
			}
			if (_arrAllTest[i].isRight === 0) { //答对
				rightNum++; //获取答对总数
			}
			allScore += Number(_arrAllTest[i].score);
			if (_arrAllTest[i].isRight === 0) { 
				userScore += Number(_arrAllTest[i].score);	//用户的得分
			}
		}
		notDoNum = testCount - doneNum; //计算未做总数
		if (doneNum > 0) {
			correctRate = rightNum / testCount;
			correctRate = correctRate.toFixed(2); //保留两位小数
		}		
			
		var scoreJSON = {doneNum:doneNum,rightNum:rightNum,correctRate:correctRate,testCount:testCount,notDoNum:notDoNum,allScore:allScore,userScore:userScore};
		return scoreJSON;
	};
	/********************************************************************************
	函数名：getTest
	功能：获取指定索引试题
	输入参数:	index 试题编号索引
	返回值：curTestShow 返回包含试题所有信息的结构体
	创建信息：黎萍（2014-05-28）
	修改记录：黎萍（2014-07-09）将获取每种题型的参数index修改成传参数curTest
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.getTest = function (index) {
		var curTest = _arrAllTest[index];
		if(_jsonAllTest === '' || _jsonAllTest === undefined){
			return;
		}
        //如果超过了题目的索引返回null
        if(!curTest){
            return null;
        }
		var testType = _jsonAllTest.StyleItems[curTest.styleItemIndex].Type; //根据试题编号获取试题所属题型
		var curTestShow = {};

		switch (testType) {
		case 'ATEST':
			curTestShow = _getAtest(curTest);
			break;
		case 'A3TEST':
			curTestShow = _getA3test(curTest);
			break;
		case 'BTEST':
			curTestShow = _getBtest(curTest);
			break;
		case 'JDTEST':
			curTestShow = _getJDtest(curTest);
			break;
		case 'PDTEST':
			curTestShow = _getPDtest(curTest);
			break;
		case 'TKTEST':
			curTestShow = _getTKtest(curTest);
			break;
		case 'XTEST':
			curTestShow = _getXtest(curTest);
			break;
		default:
			G_Prg.throw('程序运行错误，TestData.getTest：testType = "' + testType + '",无法解析数据');
		}
		return curTestShow;
	};
	/********************************************************************************
	函数名：getCurTest
	功能：获取当前试题
	输入参数:无
	返回值：curTestShow当前试题
	创建信息：兰涛（2014-05-28）
	修改记录：黎萍（2014-05-28） 增加注释，根据题型解析试题
	修改记录：黎萍（2014-06-26） 修改注释
	审查人：兰涛（2014-06-26）
	 *******************************************************************************/
	this.getCurTest = function () {
		return this.getTest(_index);
	};
	/********************************************************************************
     函数名：setTitle
     功能：设置做题界面的导航标题
     输入参数:
     返回值：无
     创建信息：黎萍（2014-08-26）
     修改记录：无
     审查人：无
     *******************************************************************************/
	this.setTitle = function (title){
		_title = title;
	}
	/********************************************************************************
	函数名：getShareUrl
	功能：获取共享试题的地址
	输入参数:无
	返回值：无
	创建信息：黎萍（2014-09-23）
	修改记录：无
	审查人：无
	 *******************************************************************************/
	this.getShareUrl = function () {
		return _shareUrl;
	};
    /********************************************************************************
     函数名 addCache
     功能：缓存试题
     输入参数
     返回值：无
     创建信息：廖黎（2014-09-22）
     修改记录：无
     审查人：无
     *******************************************************************************/
    function addCache(){
        var fromUrl = G_Prg.getQueryString('fromUrl'); //只有章节练习才需要缓存试题
        if(fromUrl !== 'chapterMenu.html'){
            return;
        }
        if(G_Prg.getQueryString('type')){//错题、笔记、收藏、未做，不缓存
            return;
        }
        var data = {};
        data.jsonAllTest = _jsonAllTest;
        var userID = G_Cookie.getUserID() ? G_Cookie.getUserID() : -1;
        G_CptTestCache.addCache(userID, G_Cookie.getAppID(), G_Cookie.getCptID(), _isVip, data);
    }
	/********************************************************************************
     函数名_addReplyJson
     功能：缓存试题并保存现场 
     输入参数:
     返回值：无
     创建信息：黎萍（2014-08-26）
     修改记录：无
     审查人：无
     *******************************************************************************/
	 this.addReplyJson = function (){
        addCache();
		/*if(!G_Storage.checkLocalStorageSupport()){
			G_Prg.alert('抱歉，您的浏览器不支持LocalStorage！');	
			return;
		}*/
		var userID = G_Cookie.getUserID();
		if (!userID) {
			return;
		}
		//var fromUrl = G_Prg.getQueryString('fromUrl'); 
		var url = '';
		//if(fromUrl === 'default.html'){
		if(_fromUrl === 'simulatedExam.html'){
			url = _fromUrl;	
		}
		var doneTest = this.calculateScores();
		//未做试题数量为0，说明试题已经做完了，不需要进行现场的恢复
		if(doneTest.notDoNum === 0){
			G_Storage.removeLocalStorageValue(userID+'_'+G_Cookie.getAppEName()+'_testJson');
			return;	
		}
		var testNO = this.getCurTest().testNO;
		var testJson = {'title' : _title,'curTestNO' : testNO,'isVip' : _isVip,'examHistoryID' : this.getExamHistoryID(),'url' : url,'jsonAllTest' : _jsonAllTest,'arrAllTest' :_arrAllTest};
		G_Storage.setLocalStorageValue(userID+'_'+G_Cookie.getAppEName()+'_testJson',testJson);
	}
    /********************************************************************************
    函数名：setMyNote
    功能：连接到setUserNote接口，设置当前试题的笔记内容
    输入参数: appID 软件ID； userID 用户ID
             curTest 当前试题； note 笔记内容；cb 回调函数，用于处理页面
    返回值：无
    创建信息：韦友爱（2014-07-15）
    修改记录：韦友爱（2014-07-16）添加调用_setNoteTestInfos()
    审查人：无
     *******************************************************************************/
    this.setMyNote = function(curTest, note,appID,userID,userName,guid) {
    	var childTableID = curTest.subTestID;
    	var childTableName = curTest.testType;
    	var allTestID = curTest.allTestID; //题目ID
    	var styleID = curTest.styleID; //题型ID
    	var cptID = curTest.cptID;
    	var srcID = curTest.srcID;
    	var sbjID = curTest.sbjID;
        var _this = this;
        if(note&&note.length>100){
            note=note.substr(0,100);
        }
    	var _success = function (json) {
    		var jsonData = JSON.parse(json);
    		if (jsonData.status === 200) {
               if(note){
                   _this.setUserNote(note);
    			   _this.setTime('今天');
               }else{
                   _this.setUserNote(null);
               }	
    		} else if (jsonData.status === 201) {
    			G_Prg.throw('程序运行错误，testData.setMyNote：status=' + jsonData.status + '更新笔记失败');
    		} else {
    			G_Prg.throw('程序运行错误，不能处理，testData.setMyNote：status=' + jsonData.status);
    		}
    	}
    	var params = {
    		appID : appID,
    		userID : userID,
    		cptID : cptID,
    		allTestID : allTestID,
    		childTableID : childTableID,
    		childTableName : childTableName,
    		srcID : srcID,
    		sbjID : sbjID,
    		styleID : styleID,
    		noteContent : note,
    		userName : userName,
    		guid : guid
    	};
    	G_AjaxApi.asyncPost('/api/exam/addUserNote', params, true, _success);
    }
     /********************************************************************************
     函数名：addReplyLog
     功能：添加答题记录明细
     输入参数:userAnswer 用户的答案；isRight标记用户是否回答正确
             endTime:答题结束时间； starTime：答题开始时间
     返回值：无
     创建信息：黎萍（2014-07-04）
     修改记录：廖黎
     审查人：无
     *******************************************************************************/
    this.addReplyLog = function(curTest,appID,userID,userName,guid,userAnswer,isRight,endTime, starTime,examType){
        var useTime = (endTime.getTime() - starTime.getTime())/1000;	
        var childTableID =  curTest.subTestID;	//子表ID
        var childTableName = curTest.testType;	//子表名称
        var allTestID = curTest.allTestID; //题目ID
        var styleID = curTest.styleID; //题型ID
        var cptID = curTest.cptID;	//章节ID
        var srcID = curTest.srcID;	//来源ID
        var sbjID = curTest.sbjID;	//科目ID
        var score = curTest.score;	//分数
        var lastUserReply = userAnswer;	//用户的答案
        var lastUserScore = 0;	//用户的得分
        if(isRight === 0){
            lastUserScore = score;
        }
		var examHistoryID = this.getExamHistoryID();
		var params = {
			examHistoryID : examHistoryID,
            appID : appID,
            userID : userID,
            cptID : cptID,
            allTestID : allTestID,
            childTableID : childTableID,
            childTableName : childTableName,
            srcID : srcID,
            sbjID : sbjID,
            styleID : styleID,
            lastUserReply : lastUserReply,
            score : score,
            lastUserScore : lastUserScore,
            userName : userName,
            guid : guid,
			spendTime : Math.ceil(useTime),
			examType : examType
        };
        G_AjaxApi.asyncPost('/api/exam/updateUserReply',params,true,function (json) {
            var jsonObj = JSON.parse(json);
            if (jsonObj.status === 200) {	//200 获取数据成功
                return;
            }else if (jsonObj.status === 300) {	//300 连接数据库失败
                G_Prg.throw('程序运行错误，不能处理 TestData.addReplyLog : status = "'+jsonObj.status+'"！', function () {
                    location.reload(true);
                });
            }else if (jsonObj.status === 400) {
                G_Prg.throw('程序运行错误，不能处理 TestData.addReplyLog : status = "'+jsonObj.status+'"！', function () {
                    location.reload(true);
                });
            }else{
                G_Prg.throw('程序运行错误，不能处理 TestData.addReplyLog : status = "'+jsonObj.status+'"！', function () {
                    location.reload(true);
                });
            }
        });
    }
     /********************************************************************************
     函数名：addFav
     功能：添加收藏
     输入参数:cb:执行成功后处理页面的回调函数
     返回值：无
     创建信息：韦友爱（2014-07-02）
     修改记录：黎萍（2014-07-04）修改提示信息
     审查人：无
     *******************************************************************************/
    this.addFav = function(curTest,appID,userID,userName,guid) {
        var _this = this;
        var dbSuccess = function(json){
            var jsonData = JSON.parse(json);
            if (jsonData.status === 200) {
                _this.setFav(1);	//收藏成功，将收藏状态修改到结构体数组中，供给上一题、下一题使用
            }else if (jsonData.status === 201) {
                G_Prg.throw('程序运行错误，不能处理，testData.addFav：status=' + jsonData.status + '添加收藏失败');
            }else{
                G_Prg.throw('程序运行错误，不能处理，testData.addFav：status=' + jsonData.status);
            }
        }
		var childTableID=curTest.subTestID;
		var childTableName=curTest.testType;
		var allTestID = curTest.allTestID; //题目ID
		var styleID = curTest.styleID; //题型ID
		var cptID=curTest.cptID;
		var srcID=curTest.srcID;
		var sbjID=curTest.sbjID;
		var params= {appID:appID,userID:userID,cptID:cptID,allTestID:allTestID,childTableID:childTableID,childTableName:childTableName,srcID:srcID,sbjID:sbjID,styleID:styleID,userName:userName,guid:guid};
	  G_AjaxApi.asyncPost('/api/exam/addUserFav', params,true, dbSuccess);
        
    }
     /********************************************************************************
     函数名：removeFav
     功能：取消收藏
     输入参数: cb:执行成功后处理页面的回调函数
     返回值：无
     创建信息：韦友爱（2014-07-02）
     修改记录：黎萍（2014-07-04）修改提示信息
     审查人：无
     *******************************************************************************/
    this.removeFav = function(curTest,appID,userID,userName,guid){
		var cptID=curTest.cptID;
		var allTestID = curTest.allTestID; //题目ID
		var childTableID=curTest.subTestID;
		var _this = this;
		var _success = function (json) {
			var jsonData = JSON.parse(json);
			if (jsonData.status === 200) {
				_this.setFav(0);	//取消收藏，将收藏状态修改到结构体数组中，供给上一题、下一题使用
			}else{
				G_Prg.throw('程序运行错误，不能处理，testData.removeFav：status=' + jsonData.status);
			}
		}
		var params={appID:appID,userID:userID,cptID:cptID,allTestID:allTestID,childTableID:childTableID,userName:userName,guid:guid};
		G_AjaxApi.asyncPost('/api/exam/deleteUserFav', params,true, _success);
       
    }
    /********************************************************************************
     函数名：updateChapterHistory
     功能：将批阅的成绩保存到数据库中
     输入参数：totalNum 试题总数,testNum 已答过的试题总数,rightTestNum 答对的试题总数
              startTime 答题开始时间， 
     返回值：无
     创建信息：黎萍（2014-07-16）
     修改记录：廖黎（2014-07-29）加入回调函数，用于数据处理完成后反馈至页面
     审查人：无
     *******************************************************************************/
    this.updateChapterHistory = function(curTest,appID,userID,cptName,totalNum,testNum,rightTestNum, startTime,examType,viewCount,allScore,userScore){
		var replyEndTime = new Date();
		var useTime = (replyEndTime.getTime() - startTime.getTime())/1000;
		var cptID = curTest.cptID;	//章节ID   
		var srcID = curTest.srcID;	//来源ID
		var sbjID = curTest.sbjID;	//科目ID
		var examHistoryID = this.getExamHistoryID();
		var params = {
			examHistoryID : examHistoryID,
			appID : appID,
			userID : userID,
			cptID : cptID,
			caption : cptName,
			replyStartTime : G_Prg.datetimeFormat(startTime,'yyyy-MM-dd hh:mm:ss'),
			replySpendTime : Math.ceil(useTime),
			rightTestNum : rightTestNum,
			totalNum : totalNum,
			testNum : testNum,
			score : allScore,
			userScore : userScore,
			srcID : srcID,
			sbjID : sbjID,
			viewCount : viewCount,
			examType : examType
		 };
		   G_AjaxApi.post('/api/chapterHistory/updateChapterHistory',params,false,function (json) {
			  var jsonObj = JSON.parse(json);
			  if (jsonObj.status === 200) {	//200 获取数据成功
				  return;
			  }else if (jsonObj.status === 300) {	//300 连接数据库失败
				  G_Prg.throw('程序运行错误，不能处理 TestData.updateChapterHistory : status = "'+jsonObj.status+'"！', function () {
					  location.reload(true);
				  });
			  }else if (jsonObj.status === 400) {
				  G_Prg.throw('程序运行错误，不能处理 TestData.updateChapterHistory : status = "'+jsonObj.status+'"！',  function () {
					  location.reload(true);
				  });
			  }else{
				  G_Prg.throw('程序运行错误，不能处理 TestData.updateChapterHistory : status = "'+jsonObj.status+'"！', function () {
					  location.reload(true);
				  });
			  }
			}
		  );
	}
    /********************************************************************************
     函数名：_setExplain
     功能：生成包含题型以及该题型结束题号的数组
     输入参数: 无
     返回值: type 包含题型以及该题型结束题号的数组
     创建信息：韦友爱（2014-08-06）
     修改记录：无
     审查人：无
     *******************************************************************************/
    this.setExplain=function() {
        var arrAllTest = _arrAllTest;
        var type = [];
        var index = 0;
        if(arrAllTest.length===1){
            type[0]={
                type : arrAllTest[0].type,
                startNO : 1,
                endNO : 1
            };
            return type;
        }
        for (var i = 0; i < arrAllTest.length - 1; i++) {
            var startNum=1;
            if(index>0){
                startNum = type[index-1].endNO + 1;
            }
            if (arrAllTest[i].style !== arrAllTest[i + 1].style) {
                var n = {
                    type : arrAllTest[i].type,
                    startNO : startNum,
                    endNO : i + 1
                };
                type[index] = n;
                index++;
                if (i === arrAllTest.length - 2) {//最后一题与前一题不同
                    var n = {
                        type : arrAllTest[i + 1].type,
                        startNO : type[index - 1].endNO+1,
                        endNO : arrAllTest.length
                    };
                    type[index] = n;
                    break;
                }
            }
            if (i === arrAllTest.length - 2) {//最后一题与前一题相同
                var n = {
                    type : arrAllTest[i + 1].type,
                    startNO : startNum,
                    endNO : arrAllTest.length
                };
                type[type.length] = n;
                break;
            }
        }
        return type;
    }
    /********************************************************************************
    函数名：getTestNO
    功能：生成包含题型以及该题型结束题号的数组
    输入参数: allTestID 试题编号
    返回值: 题号
    创建信息：韦友爱（2014-09-10）
    修改记录：无
    审查人：无
    *******************************************************************************/
	this.getTestNO=function(allTestID){
         if(!allTestID){
             return 1;
         }
         var arrContrast=_arrContrast;
         for(var i=0;i<arrContrast.length;i++){
             if(arrContrast[i]===allTestID){
                  return(i+1);
             }
         }
         return 1;
    }
    /********************************************************************************
    函数名：getOtherUserNote
    功能：获取当前题其他用户的笔记
    输入参数: curTest 当前试题 ，index 当前试题在试题数组中的下标，
                curPage 当前页码(不为零说明是点击‘加载更多’)
    返回值: _arrOtherNote[index] 当前题其他用户的笔记
    创建信息：韦友爱（2014-09-17）
    修改记录：无
    审查人：无
    *******************************************************************************/
    this.getOtherUserNote=function (curTest,index,curPage){
        if(_arrOtherNote[index]&&curPage===0){
            return(_arrOtherNote[index]);
        }
        if(curPage===0){
            _arrOtherNote[index]={
                arrUserNote:[],
                noteCount:0,
                curPage:0
            };
        }else{
            curPage=_arrOtherNote[index].curPage+1;
        }
        var otherUserNote='';
		var allTestID = curTest.allTestID; //题目ID
		var childTableID=curTest.subTestID;
        var params={
            appID:G_Cookie.getAppID(),
            allTestID:allTestID,
            userID:G_Cookie.getUserID(),
            childTableID:childTableID,
            curPage:curPage,
            guid:G_Cookie.getGuid(),
            eachNum:3,
            userName:G_Cookie.getUserName()
        };
        G_AjaxApi.post('/api/exam/getOtherUserNote',params,false,function(json){
            var otherNoteJson = JSON.parse(json);
            if(otherNoteJson.status===200){
                otherUserNote=otherNoteJson.data;
                var arrUserNote=otherUserNote.jsonOtherNote.Notes;
                for(var i=0;i<arrUserNote.length;i++){
                    _arrOtherNote[index].arrUserNote.push(arrUserNote[i]);
                }
                _arrOtherNote[index].noteCount=otherUserNote.otherUserNoteCount;
                _arrOtherNote[index].curPage=curPage;
            }else if(otherNoteJson.status===201){
                otherUserNote='';
            }else if(otherNoteJson.status===300){
                G_Prg.throw('TestData. getOtherUserNote: 连接数据库失败');
            }else if(otherNoteJson.status===400){
                G_Prg.throw('TestData. getOtherUserNote: 参数有错');
            }else {
                G_Prg.throw('TestData. getOtherUserNote: 程序运行错误，不能处理status='+otherNoteJson.status);
            }
        });
        return(_arrOtherNote[index]);
    }
    this.setOtherNote=function(index){
        _arrOtherNote[index]='';
    }
    this.isShowOtherNote=function (index){
       if(_arrOtherNote[index]){
            return true;
       }
       return false;
    }
	/********************************************************************************
    函数名：setShareTest
    功能：设置分享试题
    输入参数: 
    返回值: 无
    创建信息：黎萍（2014-09-23）
    修改记录：无
    审查人：无
    *******************************************************************************/
	this.setShareTest = function(testTitle,testJson){
		var params = {
			testTitle : testTitle,
			testJson : testJson
        };
        G_AjaxTestShare.post('/api/shareTest/getSharedHtmlUrl',params,false,function (json) {
            var jsonObj = JSON.parse(json);
            if (jsonObj.status === 200) {	//200 获取数据成功
				_shareUrl = jsonObj.data.url;
                return;
            }else if (jsonObj.status === 300) {	//300 连接数据库失败
                G_Prg.throw('程序运行错误，TestData. setShareTest:  status = "'+jsonObj.status+'"，连接数据库失败！', function () {
                    location.reload(true);
                });
            }else if (jsonObj.status === 400) {
                G_Prg.throw('程序运行错误，TestData.setShareTest : status = "'+jsonObj.status+'"，输入参数有误！', function () {
                    location.reload(true);
                });
            }else{
                G_Prg.throw('程序运行错误，不能处理 TestData.setShareTest : status = "'+jsonObj.status+'"！', function () {
                    location.reload(true);
                });
            }
        });
	}
	/********************************************************************************
    函数名：getCorrectRate
    功能：获取本章学习总人数和当前用户的击败率
    输入参数: 
    返回值: 无
    创建信息：黎萍（2014-10-23）
    修改记录：无
    审查人：无
    *******************************************************************************/
	this.getCorrectRate = function(appID,cptID,userCorrectRate,totalNum){
		var params = {
			appID : appID,
			cptID : cptID,
			userCorrectRate : userCorrectRate,
			totalNum : totalNum
        };
		var infos = '';
        G_AjaxApi.post('/api/exam/getBelowCorrectRate',params,false,function (json) {
            var jsonObj = JSON.parse(json);
            if (jsonObj.status === 200) {	//200 获取数据成功
				infos = jsonObj.data;
            }else if (jsonObj.status === 300) {	//300 连接数据库失败
                G_Prg.throw('程序运行错误，TestData.getCorrectRate:  status = "'+jsonObj.status+'"，连接数据库失败！', function () {
                    location.reload(true);
                });
            }else if (jsonObj.status === 400) {
                G_Prg.throw('程序运行错误，TestData.getCorrectRate : status = "'+jsonObj.status+'"，输入参数有误！', function () {
                    location.reload(true);
                });
            }else{
                G_Prg.throw('程序运行错误，不能处理 TestData.getCorrectRate : status = "'+jsonObj.status+'"！', function () {
                    location.reload(true);
                });
            }
        });
		return infos;
	}
}