/********************************************************************************
 试题数据处理库
 *******************************************************************************/
var G_SetTestInfo = new YingSoftSetTestInfo();

function YingSoftSetTestInfo(){}

/********************************************************************************
 函数名：setFavAndNoteTest
 功能：遍历试题,将用户收藏和笔记写入获取到的试题json中生成新的试题JSON
 输入参数:allTestJson 章节试题json数据；arrUserTest 保存用户收藏、用户笔记的数组
 返回值：testJsonData 解析后包含用户收藏，用户笔记试题数据
 创建信息：黎萍（2014-07-03）
 修改记录：韦友爱（2014-07-16）添加题型判断，修改A3型、B型题的处理
 韦友爱（2014-07-21）添加A3题型、B型题的CptID、AllTestID赋值
 审查人：无
 *******************************************************************************/
YingSoftSetTestInfo.prototype.setFavAndNoteTest = function (allTestJson, arrUserTest) {
    if (arrUserTest.length === 0 || allTestJson === '') {
        return allTestJson;
    }
    var testJsonData = allTestJson;
    for (var i = 0; i < arrUserTest.length; i++) {
        var userTest = arrUserTest[i]; //包含用户收藏、用户笔记的一道试题
        var allTestId = userTest.AllTestID; //试题Id
        var subTestId = userTest.ChildTableID; //小题Id，针对A3题型和B题型的小题
        var isFav = userTest.IsFav; //是否收藏
        var userNote = userTest.UserNote; //用户笔记
        var styleItems = testJsonData.StyleItems;
        //ok :
            for (var a = 0; a < styleItems.length; a++) {
                var testType = styleItems[a].Type; //试题所属题型
                var testItems = styleItems[a].TestItems; //试题数组
                for (var j = 0; j < testItems.length; j++) {
                    if (testItems[j].AllTestID === allTestId) {
                        if (testType === 'A3TEST') {
                            var A3TestItems = testItems[j].A3TestItems;
                            for (var k = 0; k < A3TestItems.length; k++) {
                                A3TestItems[k].CptID = testItems[j].CptID;
                                A3TestItems[k].AllTestID = testItems[j].AllTestID
                                if (A3TestItems[k].A3TestItemID === subTestId) {
                                    //if (isFav !== 0) {
                                        A3TestItems[k].IsFav = isFav;
                                   // }
                                    //if (userNote !== null) {
                                        A3TestItems[k].UserNoteContent = userNote;
                                        A3TestItems[k].NoteTime = userTest.NoteTime;
                                   // }
                                   // break ok;
                                }
                            }
                        } else if (testType === 'BTEST') {
                            var BTestItems = testItems[j].BTestItems;
                            for (var k = 0; k < BTestItems.length; k++) {
                                BTestItems[k].CptID = testItems[j].CptID;
                                BTestItems[k].AllTestID = testItems[j].AllTestID
                                if (BTestItems[k].BTestItemID === subTestId) {
                                   // if (isFav !== 0) {
                                        BTestItems[k].IsFav = isFav;
                                    //}
                                    //if (userNote !== null) {
                                        BTestItems[k].UserNoteContent = userNote;
                                        BTestItems[k].NoteTime = userTest.NoteTime;
                                    //}
                                    //break ok;
                                }
                            }
                        } else {
                            //if (isFav !== 0) {
                                testItems[j].IsFav = isFav;
                            //}
                            //if (userNote !== null) {
                                testItems[j].UserNoteContent = userNote;
                                testItems[j].NoteTime = userTest.NoteTime;
                            //}
                            //break ok;
                        }
                    } //end 判断testItems[j].AllTestID === allTestId
                }
            } //end 试题循环
    } //end 记录用户笔记和收藏的数组循环
    return testJsonData;
}
/********************************************************************************
 函数名：replaceImgURL
 功能：把字符串中包含的类似[N.gif]的数据替换成<img src="路径/N.gif"/>的格式,路径可后期修改
 输入参数:allTestJson 章节试题json数据
 返回值：testJsonData 解析后包含路径的完整图片格式的试题数据
 创建信息：黎萍（2014-06-26）
 修改记录：黎萍（2014-07-03）增加对试题数据为空的判断情况
 审查人：兰涛（2014-06-26）
 *******************************************************************************/
YingSoftSetTestInfo.prototype.replaceImgURL = function (allTestJson) {
    if (allTestJson === '' || allTestJson === undefined) {
        return allTestJson;
    }
    var testJsonData = allTestJson;
    var styleItems = testJsonData.StyleItems;
    for (var i = 0; i < styleItems.length; i++) {
        var testType = styleItems[i].Type; //试题所属题型
        var testItems = styleItems[i].TestItems; //试题数组
        for (var j = 0; j < testItems.length; j++) {
            if (testType === 'ATEST' || testType === 'XTEST') {
                testItems[j].Title = this.setImgURL(testItems[j].Title);
                testItems[j].Explain = this.setImgURL(testItems[j].Explain);
                var selectedItems = testItems[j].SelectedItems;
                for (var k = 0; k < selectedItems.length; k++) {
                    selectedItems[k].Content = this.setImgURL(selectedItems[k].Content);
                }
            } else if (testType === 'JDTEST' || testType === 'PDTEST' || testType === 'TKTEST') {
                testItems[j].Title = this.setImgURL(testItems[j].Title);
                testItems[j].Explain = this.setImgURL(testItems[j].Explain);
                testItems[j].Answer = this.setImgURL(testItems[j].Answer);
            } else if (testType === 'A3TEST') {
                testItems[j].FrontTitle = this.setImgURL(testItems[j].FrontTitle);
                testItems[j].Explain = this.setImgURL(testItems[j].Explain);
                var A3TestItems = testItems[j].A3TestItems;
                for (var k = 0; k < A3TestItems.length; k++) {
                    A3TestItems[k].Title = this.setImgURL(A3TestItems[k].Title);
                    A3TestItems[k].Explain = this.setImgURL(A3TestItems[k].Explain);
                    var selectedItems = A3TestItems[k].SelectedItems;
                    for (var l = 0; l < selectedItems.length; l++) {
                        selectedItems[l].Content = this.setImgURL(selectedItems[l].Content);
                    }
                }
            } else if (testType === 'BTEST') {
                testItems[j].Explain = this.setImgURL(testItems[j].Explain);
                var selectedItems = testItems[j].SelectedItems;
                for (var k = 0; k < selectedItems.length; k++) {
                    selectedItems[k].Content = this.setImgURL(selectedItems[k].Content);
                }
                var BTestItems = testItems[j].BTestItems;
                for (var k = 0; k < BTestItems.length; k++) {
                    BTestItems[k].Title = this.setImgURL(BTestItems[k].Title);
                    BTestItems[k].Explain = this.setImgURL(BTestItems[k].Explain);
                }
            } else {
                G_Prg.throw('程序运行错误，YingSoftSetTestInfo.replaceImgURL：testType = "' + testType + '",无法解析数据');
            }
        }
    }
    return testJsonData;
}

/********************************************************************************
 函数名：setImgURL
 功能：把字符串中包含的类似[N.gif]的数据替换成<img src="路径/N.gif"/>的格式,路径可后期修改
 输入参数:strValue 原字符串
 返回值：result 解析后包含路径的完整图片格式
 创建信息：黎萍（2014-06-18）
 修改记录：无
 审查人：兰涛（2014-06-26）
 *******************************************************************************/
YingSoftSetTestInfo.prototype.setImgURL = function(htmlTxt){
//    var subject = G_Cookie.getAppEName(); 	//从Cookie中获取科目名称
//    var result = strValue;
//	if(result === '' || result === null || result === undefined ){
//		return result;
//	}
//    //判断字符串中是否包含有图片
//    if ((result.indexOf('.gif') >= 0) || (result.indexOf('.GIF') >= 0) || (result.indexOf('.jpg') >= 0) || (result.indexOf('.JPG') >= 0)) {
//        //http://t.api.ksbao.com/tk_img/ImgDir_ZYYS_SDXXGWKEJD/~-.gif
//        var imgSrc = 'http://t.api.ksbao.com/tk_img/ImgDir_' + subject + '/';
//        result = result.replace(/[%[]/g, '<img src="' + imgSrc);
//        result = result.replace(/]/g, '"/>');
//    }
//    return result;

    var indexArr = [];	//id索引数组
    var curIndex = 0;		//当前试题索引
    var newHtml = ""; //替换后的html

//    if(!htmlTxt && !htmlTxt.length){
    if(!htmlTxt){
        return htmlTxt;
    }

    while(htmlTxt.length > curIndex && htmlTxt.indexOf("[",curIndex) > -1){
        //处理找到的<img>标签
        var imgIndex =  htmlTxt.indexOf("[",curIndex);
        indexArr.push(imgIndex);
        curIndex = imgIndex+1;
    }
    if(indexArr.length === 0){
        return htmlTxt;
    }

    var newIndexArr = [];

    //循环处理[]里的内容，剔除不规范的[]，比如[ddd[ggg[ee.gif]]]
    for(var i=0;i<indexArr.length;i++){
        var startIndex = indexArr[i];
        var endIndex = htmlTxt.indexOf(']',startIndex);
        if(endIndex > -1 && ((i !== indexArr.length-1 && indexArr[i+1] > endIndex) || (i === indexArr.length-1 && indexArr[i] < endIndex))){
           var picName = htmlTxt.substring(startIndex+1,endIndex);
            if((picName.indexOf('.gif') >= 0) || (picName.indexOf('.GIF') >= 0)
                || (picName.indexOf('.jpg') >= 0) || (picName.indexOf('.JPG') >= 0)
                || (picName.indexOf('.png') >= 0) || (picName.indexOf('.PNG') >= 0)){
                newIndexArr.push([startIndex,endIndex+1]);
            }
        }
    }

    if(newIndexArr.length === 0){
        return htmlTxt;
    }

    var subject = G_Cookie.getAppEName(); 	//从Cookie中获取科目名称
    var imgSrc = 'http://t.api.ksbao.com/tk_img/ImgDir_' + subject + '/';

    //添加网址前缀
    for(var i=0;i<newIndexArr.length;i++){
        if(i === 0){
            newHtml = htmlTxt.substring(0,newIndexArr[i][0]);
            newHtml += _replaceImgSrc(htmlTxt.substring(newIndexArr[i][0],newIndexArr[i][1]));
            //只有一个则加上尾部
            if(newIndexArr.length === 1){
                newHtml += htmlTxt.substring(newIndexArr[i][1],htmlTxt.length);
            }
        }
        else if(i === newIndexArr.length-1){
            newHtml += htmlTxt.substring(newIndexArr[i-1][1],newIndexArr[i][0]);
            newHtml += _replaceImgSrc(htmlTxt.substring(newIndexArr[i][0],newIndexArr[i][1]));
            newHtml += htmlTxt.substring(newIndexArr[i][1],htmlTxt.length);
        }
        else{
            newHtml += htmlTxt.substring(newIndexArr[i-1][1],newIndexArr[i][0]);
            newHtml += _replaceImgSrc(htmlTxt.substring(newIndexArr[i][0],newIndexArr[i][1]));
        }
    }
    var urlArr = location.pathname.split('/');
    var pageName = urlArr[urlArr.length - 1];
    if(pageName === 'testInfoMenu.html'){//考试指南页特殊处理，不替换\r\n
        return newHtml;
    }
    return newHtml.replace(new RegExp('\r', 'gm'), '<br/>').replace(new RegExp('\n', 'gm'), '');

    //[sdfsdf.gif]
    function _replaceImgSrc(str){
        var picSrcStr = imgSrc+str.substr(1,str.length-2);
        var urlArr = location.pathname.split('/');
        var pageName = urlArr[urlArr.length - 1];
        if(pageName === 'doExam.html'||pageName === 'testList.html'){
            return '<img style="max-width:100%;height:auto;vertical-align:middle;" onclick="G_ImageZoom(this);" src="'+picSrcStr+'"/>';
        }
        else{
            return '<img style="max-width:100%;height:auto;" src="'+picSrcStr+'"/>';
        }
    }

}

/********************************************************************************
 功能：解析填空题的答案
 输入参数:answer 解析前填空题的答案
 返回值：result 解析后填空题的答案
 最后修改人：黎萍（2015-02-03）
 修改内容：增加对填空题答案中包含有图片进行特殊处理 
 *******************************************************************************/
YingSoftSetTestInfo.prototype.splitTKTestAnswer = function(answer) {
	//如果答案中包含有图片，无需进行答案处理
	if(answer.indexOf('<img') >= 0){
		return answer;	
	}
    var result = answer;
	var reg =/\s+/;	//检测答案中是否还有空格
    if (result.indexOf('｜') >= 0) {
        result = result.replace(/｜/g, '；');
    } else if (result.indexOf('‖') >= 0) {
        result = result.replace(/‖/g, '；');
    } else if (reg.test(result)) {
        result = result.replace(/\s+/g,"；");
    } else if (result.indexOf(';') >= 0) {
        result = result.replace(/;/g, '；');
    } else if (result.indexOf('、') >= 0) {
        result = result.replace(/、/g, '；');
    } else if (result.indexOf('|') >= 0) {
        result = result.replace(/\|+/g, '；');
    }/* else if (result.indexOf('，') >= 0) {
        result = result.replace(/，/g, '；');
    }*/
    return result;
}

/********************************************************************************
 函数名：setImgTagURL
 功能：为<img>标签的src追加前缀，原<img src="11.jpg"/>，追加后<img src="http://127.0.0.1/11.jpg"/>
 输入参数:htmlTxt 待处理的html代码
 返回值：string 处理后的html
 创建信息：谢建沅（2014-07-08）
 修改记录：无
 审查人：无
 *******************************************************************************/
YingSoftSetTestInfo.prototype.setImgTagURL = function(htmlTxt){
    var subject = G_Cookie.getAppEName(); 	//从Cookie中获取科目名称
    //要追加的URL前缀
    var imgPath = 'http://t.api.ksbao.com/tk_img/ImgDir_' + subject + '/';
    var indexArr = [];	//id索引数组
    var curIndex = 0;		//当前试题索引
    var newHtml = ""; //替换后的html
    //查找所有id的索引
    while(htmlTxt.length > curIndex && htmlTxt.indexOf("<img",curIndex) > -1) {
        //处理找到的<img>标签
        var imgIndex =  htmlTxt.indexOf("<img",curIndex);

        //继续查找img下的src属性
        //src结束索引
        var srcEndIndex = htmlTxt.indexOf('>', imgIndex);
        //src开始索引
        var srcStartIndex = htmlTxt.indexOf('src',imgIndex);
        if(srcStartIndex > 0 && srcStartIndex<srcEndIndex) {
            //取出img标签里的src的值的起始和结束索引
            var srcValueStartIndex = htmlTxt.indexOf('\"',srcStartIndex)+1;
            indexArr.push(srcValueStartIndex); //记录src属性待插入位置的索引
        }

        //更新curIndex位置
        if(imgIndex<htmlTxt.length){
            curIndex = srcEndIndex+1;
        } else{
            break;
        }

        //如果之后的html没有<img>标签，退出循环
        if(htmlTxt.indexOf("<img",curIndex) <= 0){
            break;
        }
    }
    //如果html没有<img>标签则返回原html
    if(indexArr.length === 0){
        return htmlTxt;
    }
    //开始替换，从后往前替换，否则前面的索引改变后定位错误
    for(var i=indexArr.length-1;i>=0;i--){
        if(i === indexArr.length-1){
            newHtml = imgPath + _replaceLineTag(htmlTxt.substring(indexArr[i],htmlTxt.length));
            if(indexArr.length === 1){
                newHtml = htmlTxt.substring(0,indexArr[i])+newHtml;
                break;
            }else{
                newHtml = _replaceLineTag(htmlTxt.substring(indexArr[i-1],indexArr[i]))+newHtml;
            }
        }else if(i === 0){
            newHtml = htmlTxt.substring(0,indexArr[i])+imgPath+newHtml;
        }else{
            newHtml = _replaceLineTag(htmlTxt.substring(indexArr[i-1],indexArr[i]))+imgPath+newHtml;
        }
    }
    return newHtml;

    //img标签的src属性只取图片文件名，去除多余的相对路径
    function _replaceLineTag(htmlStr){
        var lineTagIndex = htmlStr.indexOf('/');
        var urlEndTagIndex = htmlStr.indexOf('\"');
        var imgEndTagIndex = htmlStr.indexOf('>');
        if(lineTagIndex < urlEndTagIndex && lineTagIndex < imgEndTagIndex && urlEndTagIndex < imgEndTagIndex){
            return htmlStr.substring(lineTagIndex+1);
        }else{
            return htmlStr;
        }
    }
}


/********************************************************************************
 函数名：G_ImageZoom
 功能：展示试题图片
 输入参数:imgURL 图片URL地址
 返回值：无
 创建信息：谢建沅（2014-08-22）
 修改记录：无
 审查人：无
 *******************************************************************************/
function G_ImageZoom(imgURL){
    _disposeImgZoom();

    var bg = document.createElement('div');
    bg.id = 'ImageZoomBg';

    bg.style.zIndex = 100;
    bg.style.display = 'none';
    //bg.style.opacity = 0.5;
    bg.style.width = '100%';
    bg.style.height = '100%';
    bg.style.backgroundColor = '#000000';
    bg.style.position = 'fixed';
    bg.style.left = '0px';
    bg.style.top = '0px';
    document.body.appendChild(bg);

    //ImageZoomContent
    var content = document.createElement('div');
    content.id = 'ImageZoomContent';

    content.style.zIndex = 101;
    content.style.display = 'none';
    content.style.width = '100%';
    content.style.height = '100%';
    content.style.position = 'fixed';
    content.style.left = '0px';
    content.style.top = '0px';
    content.style.overflow = 'scroll';
    //关闭按钮
    var html = '<div id="ImageZoomBtn" style="z-index:102;position:fixed;display:block;width:30px;height:30px;right:10px;top:10px;cursor:pointer;float:right;"><img src="../images/close.png"></div>';
    //放大缩小
    html += '<div style="z-index:103;position:fixed;display:block;width:150px;height:45px;text-align:left;bottom:10px;left:50%;margin-left:-75px;"><img id="zoomOutBtn" style="cursor:pointer;" src="../images/zoomOut.png"><img id="zoomInBtn" style="margin-left:70px;cursor:pointer;" src="../images/zoomIn.png"></div>';
    //图片
    html += '<img id="ImageZoomImg" style="z-index:101;position:absolute;left:0px;top:0px;right:0px;bottom:0px;margin:auto;" src="'+imgURL.src+'" />';
    content.innerHTML = html;
    document.body.appendChild(content);
    content.onclick = function(){_disposeImgZoom();}
    document.getElementById('ImageZoomBtn').onclick = function(){_disposeImgZoom();}
    document.getElementById('ImageZoomImg').onclick = function(event){
        event=event?event:window.event;
        event.stopPropagation();
        _disposeImgZoom();
    }
    //绑定缩小按钮的事件
    document.getElementById('zoomOutBtn').onclick = function(event){
        event=event?event:window.event;
        event.stopPropagation();
        var zoomImage = document.getElementById('ImageZoomImg');
        var imgWidth = zoomImage.clientWidth;
        var imgHeight = zoomImage.clientHeight;
        zoomImage.style.width = (imgWidth*0.8)+'px';
        zoomImage.style.height = (imgHeight*0.8)+'px';
    };
    //绑定放大按钮的事件
    document.getElementById('zoomInBtn').onclick = function(event){
        event=event?event:window.event;
        event.stopPropagation();
        var zoomImage = document.getElementById('ImageZoomImg');
        var imgWidth = zoomImage.clientWidth;
        var imgHeight = zoomImage.clientHeight;
        zoomImage.style.width = (imgWidth*1.2)+'px';
        zoomImage.style.height = (imgHeight*1.2)+'px';
    };
    document.getElementById('ImageZoomImg').onload = function(){
        G_ImageZoomLoaded();
    }

    function _disposeImgZoom(){
        var zoomBg = document.getElementById('ImageZoomBg');
        var zoomContent = document.getElementById('ImageZoomContent');
        var urlArr = location.pathname.split('/');
        var pageName = urlArr[urlArr.length - 1];
        if (pageName === 'testInfoMenu.html') {//考试指南页特殊处理
            document.body.style.overflow = "scroll"; //强制滚动条
        } 
        if(zoomBg){
            document.body.removeChild(zoomBg);
        }
        if(zoomContent){
            document.body.removeChild(zoomContent);
        }
    }

}

//判断图片的大小，过小的图片不放大
function G_ImageZoomLoaded(){
    var zoomBg = document.getElementById('ImageZoomBg');
    var zoomContent = document.getElementById('ImageZoomContent');

    var img = document.getElementById('ImageZoomImg');
    var flag = false;
    //判断图片的宽度是否大于网页宽度 或者 高度是否大于网页高度
//    if(img.width > window.document.body.clientWidth || img.height > window.document.body.clientHeight){
//        flag = true;
//    }

    if(img.width > window.document.body.clientWidth){
      flag = true;
        img.style.right = '';
    }
    if(img.height > window.document.body.clientHeight){
        flag = true;
        img.style.bottom = '';
    }

//    alert('宽:'+img.width+'>'+window.document.body.clientWidth+',高:'+img.height+'>'+window.document.body.clientHeight);
//    alert(flag);

    if(zoomBg){
        if(flag){
            zoomBg.style.display = 'block';
            var urlArr = location.pathname.split('/');
            var pageName = urlArr[urlArr.length - 1];
            if (pageName === 'testInfoMenu.html') {//考试指南页特殊处理
                document.body.style.overflow = "hidden"; //隐藏body的滚动条
            }
        } else{
            document.body.removeChild(zoomBg);
        }
    }

    if(zoomContent){
        if(flag){
            zoomContent.style.display = 'block';
            var urlArr = location.pathname.split('/');
            var pageName = urlArr[urlArr.length - 1];
            if (pageName === 'testInfoMenu.html') {//考试指南页特殊处理
                document.body.style.overflow = "hidden"; //隐藏body的滚动条
            }
        } else{
            document.body.removeChild(zoomContent);
        }
    }
}

/********************************************************************************
 函数名：sortingTest
 功能：将试题json按题型排序
 输入参数:allTestJson 试题json
 返回值：allTestJson 排序后的试题json
 创建信息：韦友爱（2014-09-12）
 修改记录：无
 审查人：无
 *******************************************************************************/
YingSoftSetTestInfo.prototype.sortingTest = function (allTestJson) {
    if (!allTestJson) {
        return allTestJson;
    }
    var styleItems=allTestJson.StyleItems;
    var arrStyItems=[];
    arrStyItems[0]=styleItems[0];
    for(var i=1;i<styleItems.length;i++){
        var styleID=styleItems[i].StyleID;
        for(var j=0;j<arrStyItems.length;j++){
           if(arrStyItems[j].StyleID===styleID){
               for(var k=0;k<styleItems[i].TestItems.length;k++){
                    arrStyItems[j].TestItems.push(styleItems[i].TestItems[k]);
               }
               var isPush=true;
               break;
           }
           var isPush=false;
        }
        if(!isPush){
            arrStyItems.push(styleItems[i]);
        }
    }
    allTestJson.StyleItems=arrStyItems;
    return allTestJson;
}