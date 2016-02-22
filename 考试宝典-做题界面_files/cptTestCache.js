/************************************************************************/
/* 文件名：cptTestCache.js
/* 作用：缓存章介试题
/* 创建人：廖黎
/* 时间：2014.9.15
/************************************************************************/
var G_CptTestCache = (function () {
    var yingSoftCptTestCache = function () {
        var _cacheSize = 1024*1024*2;       //缓存大小
        var _storage = window.sessionStorage;   //使用sessionStorage
        var _cacheObj;                          //缓存对象
        var _keyName = 'chapterTestCache';
        getCptTestCache();
        /********************************************************************************
        函数名：addCache
        功能:加入将指定的章节题目缓存至storage中
        输入参数: userID 指定的userID
                 appID 指定的appID
                 cptID 指定的cptID
                 data  章节题目数据
        返回值：无
        ********************************************************************************/
        this.addCache = function (userID, appID, cptID, isVip, data) {
            if (!_storage) {
                return;
            }
            checkCacheSpace(data);
            setCache(userID, appID, cptID, isVip, data);
        }
        /********************************************************************************
        函数名：setCache
        功能:讲缓存数据写入内存对象,并写入storage
        输入参数: userID 指定的userID
                 appID 指定的appID
                 cptID 指定的cptID
                 data  章节题目数据
        返回值：无
        ********************************************************************************/
        function setCache(userID, appID, cptID, isVip, data) {
            if (!_storage) {
                return;
            }
            if (!(userID in _cacheObj)) {
                _cacheObj[userID] = {};
            }
            if (!(appID in _cacheObj[userID])) {
                _cacheObj[userID][appID] = {};
            }
            var cacheNode = {};
            cacheNode = {
                'time': new Date().getTime(),
                'isVip' : isVip,
                'data': data
            };
            _cacheObj[userID][appID][cptID] = cacheNode;
            try{
                _storage.setItem(_keyName, JSON.stringify(_cacheObj));
            } catch (ex) {
                G_Prg.throw('试题缓存空间不足 ' + 'cptTestCache   ' + 'setCache');
            }
        }
        /********************************************************************************
        函数名：getCptTestCache
        功能:获取当前缓存内容，保存在_cacheObj中。
        输入参数: 无
        返回值：无
        ********************************************************************************/
        function getCptTestCache() {
            if (!_storage) {
                return;
            }
            _cacheObj = JSON.parse(_storage.getItem(_keyName));
            if (!_cacheObj) {
                _cacheObj = {};
            }
        }
        /********************************************************************************
        函数名：checkCacheSpace
        功能:检查确保当前缓存再新增一份试题数据后是否会超过阀值
        输入参数: data 需要添加的数据
        返回值：无
        ********************************************************************************/
        function checkCacheSpace(data) {
            if (!_storage) {
                return false;
            }
            var newLength = JSON.stringify(data).length;
            if (_cacheObj) {
                var orgLength = JSON.stringify(_cacheObj).length;
                if (newLength + orgLength > _cacheSize) {
                    deleteOldCache();
                    checkCacheSpace(data);
                }
            }
        }
        /********************************************************************************
        函数名：deleteOldCache
        功能:移除最旧（保存时间最长）的试题缓存
        输入参数:无
        返回值：无
        ********************************************************************************/
        function deleteOldCache() {
            var oldTime;
            var oldAppID;
            var oldCptID;
            var oldUserID;
            getIndex();
            deleteElement();
            //获取保存时间最长元素的appID和cptID索引
            function getIndex() {
                for (userID in _cacheObj) {
                    for (appID in _cacheObj[userID]) {
                        for (cptID in _cacheObj[userID][appID]) {
                            if ((!oldTime) || (oldTime > _cacheObj[userID][appID][cptID].time)) {
                                time = _cacheObj[userID][appID][cptID].time;
                                oldUserID = userID;
                                oldAppID = appID;
                                oldCptID = cptID;
                            }
                        }
                    } //end of (appID in _cacheObj[userID])
                } //end of (userID in _cacheObj)

            }
            //移除对应元素
            function deleteElement() {
                if (oldUserID && oldAppID && oldCptID
                        && _cacheObj[oldUserID] && _cacheObj[oldUserID][oldAppID] && _cacheObj[oldUserID][oldAppID][oldCptID]) {
                    delete _cacheObj[oldUserID][oldAppID][oldCptID];
                    var cptCount = 0;
                    for (cpt in _cacheObj[userID][appID]) {
                        cptCount++;
                    }
                    if (cptCount === 0) {
                        delete _cacheObj[userID][oldAppID];
                    }
                    var appCount = 0;
                    for (app in _cacheObj[userID]) {
                        cptCount++;
                    }
                    if (cptCount === 0) {
                        delete _cacheObj[userID];
                    }
                }
            }
        }

        /********************************************************************************
        函数名：getCache
        功能:获取指定章节的缓存
        输入参数:userID 指定的userID
                 appID 指定的appID
                 cptID 指定的cptID
        返回值：对应的缓存数据，若没有找到，返回null
        ********************************************************************************/
        this.getCache = function (userID, appID, cptID) {
            var data = {'data':{}, 'isVip':0};
            if (_cacheObj[userID] && _cacheObj[userID][appID] && _cacheObj[userID][appID][cptID]) {
                data.data = _cacheObj[userID][appID][cptID].data;
                data.isVip = _cacheObj[userID][appID][cptID].isVip;
            }
            return data;
        }
    };
    return new yingSoftCptTestCache();
})();