//匿名函数返回一个对象(这种封装方法不会暴露未实例化的function)
var G_AgentInfo = (function () {
    //定义函数开始
    var yingsoftAgentInfo = function () {
        /********************************************************************************
        函数名：getAgentInfo
        功能：获取代理商信息json（先看session中是否有数据，有数据则直接取session中的数据，否则，从接口中取数据）
        输入参数: 无
        返回值: agentInfo 包含代理商信息的json
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        function getAgentInfo() {
            var agentInfo = JSON.parse(sessionStorage.getItem('agentInfo')); //session中获取数据
            if (!agentInfo) {
                var agentUrl = G_Cookie.getAgentUrl();//cookie中取
                if (!agentUrl) { //cookie中没有，默认为二级域名
                    agentUrl = location.host;
                }
                var URL = '/api/agentInfo/getAgentInfo';
                var param = {
                    AgentUrl: agentUrl
                };
                G_AjaxApi.post(URL, param, false, function (json) {
                    var jsonData = JSON.parse(json);
                    if (jsonData.status === 200) {
                        agentInfo = jsonData.data.agentInfo;
                        //将url、code存进cookie，将整个json存到seesion
                        G_Cookie.setAgentUrl(agentInfo.AgentUrl);
                        G_Cookie.setAgentCode(agentInfo.AgentCode);
                        sessionStorage.setItem('agentInfo', JSON.stringify(agentInfo));
                    } else {
                        alert('代理商信息加载错误！');
                    }
                });
            }
            return agentInfo;
        }
        /********************************************************************************
        函数名：getAgentCode
        功能：获取代理商名称
        输入参数: 无
        返回值: agentCode 代理商名称
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getAgentCode = function () {
            var agentInfoJson = getAgentInfo();
            var agentCode = agentInfoJson.AgentCode;
            if (!agentCode) {
                G_Prg.alert('代理商名称AgentCode=' + agentCode);
            }
            return agentCode;
        }
        /********************************************************************************
        函数名：getAgentName
        功能：获取代理商代码
        输入参数: 无
        返回值: agentName 代理商代码
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getAgentName = function () {
            var agentInfoJson = getAgentInfo();
            var agentName = agentInfoJson.AgentName;
            if (!agentName) {
                G_Prg.alert('代理商代码AgentName=' + agentName);
            }
            return agentName;
        }
        /********************************************************************************
        函数名：getAgentUrl
        功能：获取代理商二级域名
        输入参数: 无
        返回值: agentUrl 代理商二级域名
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getAgentUrl = function () {
            var agentInfoJson = getAgentInfo();
            var agentUrl = agentInfoJson.AgentUrl;
            if (!agentUrl) {
                G_Prg.alert('代理商二级域名AgentUrl=' + agentUrl);
            }
            return agentUrl;
        }
        /********************************************************************************
        函数名：getQQ
        功能：获取代理商客服QQ
        输入参数: 无
        返回值: QQ 代理商客服QQ
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getQQ = function () {
            var agentInfoJson = getAgentInfo();
            var QQ = agentInfoJson.QQ;
            if (!QQ) {
                G_Prg.alert('客服QQ=' + QQ);
            }
            return QQ;
        }
        /********************************************************************************
        函数名：getTelephone
        功能：获取代理商客服电话
        输入参数: 无
        返回值: telephone 代理商客服电话
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getTelephone = function () {
            var agentInfoJson = getAgentInfo();
            var telephone = agentInfoJson.Telephone;
            if (!telephone) {
                G_Prg.alert('客服电话Telephone=' + telephone);
            }
            return telephone;
        }
        /********************************************************************************
        函数名：getNewsLink
        功能：获取考试资讯链接
        输入参数: 无
        返回值: newsLink 考试资讯链接
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getNewsLink = function () {
            var agentInfoJson = getAgentInfo();
            if (agentInfoJson.AgentUrl === 'newt.ksbao.com' || agentInfoJson.AgentUrl === 'new.ksbao.com') {//默认
                return 'examInformation.html';
            }
            var newsLink = agentInfoJson.NewsLink;
            if (!newsLink) {
                G_Prg.alert('考试资讯链接NewsLink=' + newsLink);
                newsLink = 'examInformation.html';
            }
            return newsLink;
        }
        /********************************************************************************
        函数名：getLogoUrl
        功能：获取代理商Logo的图片地址
        输入参数: 无
        返回值: logoUrl 代理商Logo的图片地址
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getLogoUrl = function () {
            var agentInfoJson = getAgentInfo();
            var logoUrl = agentInfoJson.LogoUrl;
            if (!logoUrl) {
                G_Prg.alert('代理商Logo的图片地址LogoUrl=' + logoUrl);
            }
            if (logoUrl.indexOf('http://') === -1) {//相对路径
                logoUrl = '../' + logoUrl;
            }
            return logoUrl;
        }
        /********************************************************************************
        函数名：getIconUrl
        功能：获取浏览器图标地址
        输入参数: 无
        返回值: iconUrl 浏览器图标地址
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getIconUrl = function () {
            var agentInfoJson = getAgentInfo();
            var iconUrl = agentInfoJson.IconUrl;
            if (iconUrl) {
                if (iconUrl.indexOf('http') > -1) {
                    return iconUrl;
                } else {
                    return '../' + iconUrl;
                }
            } else {
                return '../images/favicon.ico';
            }
        }
        /********************************************************************************
        函数名：getIndexCssUrl
        功能：获取代理商启动页css地址
        输入参数: 无
        返回值: indexCssUrl 启动页css地址
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getIndexCssUrl = function () {
            var agentInfoJson = getAgentInfo();
            var indexCssUrl = agentInfoJson.IndexCssUrl;
            if (!indexCssUrl) {
                G_Prg.alert('启动页css地址IndexCssUrl=' + indexCssUrl);
            }
            return indexCssUrl;
        }
        /********************************************************************************
        函数名：getCoverImgUrl
        功能：获取代理商启动页图片地址
        输入参数: 无
        返回值: coverImgUrl 启动页图片地址
        创建信息：谢建沅（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getCoverImgUrl = function () {
            var agentInfoJson = getAgentInfo();
            var coverImgUrl = agentInfoJson.CoverImgUrl;
            if (!coverImgUrl) {
                G_Prg.alert('启动页图片地址CoverImgUrl=' + coverImgUrl);
            }
            return coverImgUrl;
        }
        /********************************************************************************
        函数名：loadIcon
        功能：加载代理商icon图标
        输入参数: 无
        返回值: 无
        创建信息：韦友爱（2014-09-25）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.loadIcon = function () {
            var agentInfoJson = getAgentInfo();
            var iconTag = document.createElement('link');
            iconTag.rel = 'icon';
            var iconUrl = agentInfoJson.IconUrl;
            if (!iconUrl) {
                G_Prg.alert('浏览器图标地址IconUrl=' + iconUrl);
            }
            if (iconUrl.indexOf('http://') === -1) {//相对路径
                iconTag.href = '../' + iconUrl;
            } else { //绝对路径
                iconTag.href = iconUrl;
            }
            iconTag.type = 'image/x-icon';
            document.getElementsByTagName("head")[0].appendChild(iconTag);
        }
		/********************************************************************************
        函数名：getPhonePayUrl
        功能：获取手机端支付链接
        输入参数: 无
        返回值: phonePayUrl 手机端支付链接
        创建信息：韦友爱（2015-10-23）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getPhonePayUrl = function () {
            var agentInfoJson = getAgentInfo();
			var phonePayUrl = agentInfoJson.PhonePayUrl;
            if (!phonePayUrl||phonePayUrl===-1||phonePayUrl==='-1') {//空值
                return null;
            }
			return phonePayUrl;
        }
		/********************************************************************************
        函数名：getWeiXinPayUrl
        功能：获取手机端支付链接
        输入参数: 无
        返回值: weiXinPayUrl 微信支付链接
        创建信息：韦友爱（2015-10-23）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getWeiXinPayUrl = function () {
            var agentInfoJson = getAgentInfo();
			var weiXinPayUrl = agentInfoJson.WeiXinPayUrl;
            if (!weiXinPayUrl||weiXinPayUrl===-1||weiXinPayUrl==='-1') {//空值
                return null;
            }
			return weiXinPayUrl;
        }
		/********************************************************************************
        函数名：getPCPayUrl
        功能：获取PC支付链接
        输入参数: 无
        返回值: PCPayUrl PC支付链接
        创建信息：韦友爱（2015-10-23）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getPCPayUrl = function () {
            var agentInfoJson = getAgentInfo();
			var PCPayUrl = agentInfoJson.PCPayUrl;
            if (!PCPayUrl||PCPayUrl===-1||PCPayUrl==='-1') {//空值
                return null;
            }
			return PCPayUrl;
        }
		/********************************************************************************
        函数名：getProductLink
        功能：获取产品站链接
        输入参数: 无
        返回值: productLink 产品站链接
        创建信息：韦友爱（2015-10-27）
        修改记录：无
        审查人：无
        *******************************************************************************/
        this.getProductLink = function () {
            var agentInfoJson = getAgentInfo();
			var productLink = agentInfoJson.ProductLink;
            if (!productLink||productLink===-1||productLink==='-1') {//空值
                return null;
            }
			return productLink;
        }
    } //函数定义结束
    return new yingsoftAgentInfo();
})();