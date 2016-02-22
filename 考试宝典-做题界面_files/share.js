//匿名函数返回一个对象(这种封装方法不会暴露未实例化的function)
var G_Share = (function () {

    //定义函数 =========================================================================================================
    var yingsoftShare = function () {
        //分享到腾讯微博
//        this.txwb = function (shareURL,shareText) {
//            var _t = encodeURI(shareText);//'${(activity.intro)!}'这是取得Action穿过来的值，如果想取当前标题改为document.title
//            var _url = encodeURI(shareURL);//document.location
//            var _appkey = '';//encodeURI("appkey");//你从腾讯获得的appkey
//            var _pic = '';//encodeURI('');//（列如：var _pic='图片url1|图片url2|图片url3....）
//            var _site = '';//你的网站地址
//            var _u = 'http://v.t.qq.com/share/share.php?title='+_t+'&url='+_url+'&appkey='+_appkey+'&site='+_site+'&pic='+_pic;
////        console.log(_u);
//            window.open( _u,'分享到腾讯微博', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no' );
//        }
        this.txwb = function(shareURL,shareText){
            var shareqqstring='http://v.t.qq.com/share/share.php?title='+encodeURIComponent(shareText)+'&url='+encodeURIComponent(shareURL)+'&pic=';
            window.open(shareqqstring,'分享到腾讯微博', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no' );
        }
        this.xlwb = function(shareURL,shareText){
            var sharesinastring='http://v.t.sina.com.cn/share/share.php?title='+encodeURIComponent(shareText)+'&url='+encodeURIComponent(shareURL)+'&content=utf-8&sourceUrl='+encodeURIComponent(shareURL)+'&pic=';
            window.open(sharesinastring,'分享到新浪微博', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no');
        }
        this.qzone = function(shareURL,shareText){
            var shareqqzonestring='http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?summary='+encodeURIComponent(shareText)+'&url='+encodeURIComponent(shareURL)+'&pics=';
            window.open(shareqqzonestring,'分享到QQ空间', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no');
        }
    };
    //定义函数 end =============================================================
    //返回一个实例化的对象
    return new yingsoftShare();
})();