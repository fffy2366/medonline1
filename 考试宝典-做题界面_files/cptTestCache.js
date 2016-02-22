/************************************************************************/
/* �ļ�����cptTestCache.js
/* ���ã������½�����
/* �����ˣ�����
/* ʱ�䣺2014.9.15
/************************************************************************/
var G_CptTestCache = (function () {
    var yingSoftCptTestCache = function () {
        var _cacheSize = 1024*1024*2;       //�����С
        var _storage = window.sessionStorage;   //ʹ��sessionStorage
        var _cacheObj;                          //�������
        var _keyName = 'chapterTestCache';
        getCptTestCache();
        /********************************************************************************
        ��������addCache
        ����:���뽫ָ�����½���Ŀ������storage��
        �������: userID ָ����userID
                 appID ָ����appID
                 cptID ָ����cptID
                 data  �½���Ŀ����
        ����ֵ����
        ********************************************************************************/
        this.addCache = function (userID, appID, cptID, isVip, data) {
            if (!_storage) {
                return;
            }
            checkCacheSpace(data);
            setCache(userID, appID, cptID, isVip, data);
        }
        /********************************************************************************
        ��������setCache
        ����:����������д���ڴ����,��д��storage
        �������: userID ָ����userID
                 appID ָ����appID
                 cptID ָ����cptID
                 data  �½���Ŀ����
        ����ֵ����
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
                G_Prg.throw('���⻺��ռ䲻�� ' + 'cptTestCache   ' + 'setCache');
            }
        }
        /********************************************************************************
        ��������getCptTestCache
        ����:��ȡ��ǰ�������ݣ�������_cacheObj�С�
        �������: ��
        ����ֵ����
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
        ��������checkCacheSpace
        ����:���ȷ����ǰ����������һ���������ݺ��Ƿ�ᳬ����ֵ
        �������: data ��Ҫ��ӵ�����
        ����ֵ����
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
        ��������deleteOldCache
        ����:�Ƴ���ɣ�����ʱ����������⻺��
        �������:��
        ����ֵ����
        ********************************************************************************/
        function deleteOldCache() {
            var oldTime;
            var oldAppID;
            var oldCptID;
            var oldUserID;
            getIndex();
            deleteElement();
            //��ȡ����ʱ���Ԫ�ص�appID��cptID����
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
            //�Ƴ���ӦԪ��
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
        ��������getCache
        ����:��ȡָ���½ڵĻ���
        �������:userID ָ����userID
                 appID ָ����appID
                 cptID ָ����cptID
        ����ֵ����Ӧ�Ļ������ݣ���û���ҵ�������null
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