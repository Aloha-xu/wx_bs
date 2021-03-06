var util = require("../../../utils/util.js");
var api = require("../../../config/api.js");
const pay = require("../../../services/pay.js");
const app = getApp();
// 触底上拉刷新 TODO 这里要将page传给服务器，作者没写
Page({
  data: {
    addresses: [],
    nowAddress: 0,
  },
  //跳转添加地址 id =  0
  addAddress: function () {
    wx.navigateTo({
      url: "/pages/ucenter/address-detail/index?id=" + 0,
    });
  },
  //跳转编辑地址 id
  goAddressDetail: function (e) {
    let id = e.currentTarget.dataset.addressid;
    wx.navigateTo({
      url: "/pages/ucenter/address-detail/index?id=" + id,
    });
  },
  getAddresses() {
    let that = this;
    util.request(api.GetAddresses).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          addresses: res.data,
        });
      }
    });
  },
  //这是在type 是订单进去地址管理的页面时候 才有的
  //设置本地的选中的地址  也只有在该情况下才用本地地址id
  selectAddress: function (e) {
    let addressId = e.currentTarget.dataset.addressid;
    wx.setStorageSync("addressId", addressId);
    wx.navigateBack();
  },
  onLoad: function (options) {
    //type
    let type = options.type;
    this.setData({
      type: type,
    });
  },
  onUnload: function () {},
  onShow: function () {
    this.getAddresses();
    let addressId = wx.getStorageSync("addressId");
    if (addressId) {
      this.setData({
        nowAddress: wx.getStorageSync("addressId"),
      });
    } else {
      this.setData({
        nowAddress: 0,
      });
    }
  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getAddresses();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh(); //停止下拉刷新
  },
});
