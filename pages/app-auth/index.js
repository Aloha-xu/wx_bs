const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');
//获取应用实例
const app = getApp()

Page({
    data: {

    },
    onLoad: function (options) {

    },
    onShow: function () {
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo != '') {
            wx.navigateBack();
        };
    },
    // getUserInfo: function (e) {
    //     app.globalData.userInfo = e.detail.userInfo
    //     user.loginByWeixin().then(res => {
    //         app.globalData.userInfo = res.data.userInfo;
    //         app.globalData.token = res.data.token;
    //         let is_new = res.data.is_new;//服务器返回的数据；
    //         if (is_new == 0) {
    //             util.showErrorToast('您已经是老用户啦！');
    //             wx.navigateBack();
    //         }
    //         else if (is_new == 1) {
    //             wx.navigateBack();
    //         }

    //     }).catch((err) => { });
    // },

    getUserProfile: function () {
        let that = this;
        let code = '';
        wx.login({
            success: (res) => {
                code = res.code;
            },
        });
        // 获取用户信息
        wx.getUserProfile({
            lang: 'zh_CN',
            desc: '用户登录',
            success: (res) => {
                let loginParams = {
                    code: code,
                    encryptedData: res.encryptedData,
                    iv: res.iv,
                    rawData: res.rawData,
                    signature: res.signature
                };
                console.log(loginParams);
                //调用后台登陆接口 拿到token
                util.request(api.AuthLoginByWeixin, {
                    info: loginParams
                }, 'POST').then(function (res) {
                    console.log(res);
                    if (res.errno === 0) {
                        // 测试  先写死
                        // wx.setStorageSync('userInfo', '123');
                        // wx.setStorageSync('token', '123');
                        wx.setStorageSync('userInfo', res.data.userInfo);
                        wx.setStorageSync('token', res.data.token);
                        app.globalData.userInfo = res.data.userInfo;
                        app.globalData.token = res.data.token;
                        wx.navigateBack();
                    }
                });

            },
            // 失败回调
            fail: () => {
                // 弹出错误
                App.showError('已拒绝小程序获取信息');
            }
        });
    },
    //返回
    goBack: function () {
        wx.navigateBack();
    }
})