var util = require("../../../utils/util.js");
var api = require("../../../config/api.js");

var app = getApp();

Page({
  data: {
    footprintList: [],
    hasPrint: 1,
    showNoMore: 1,
  },
  getFootprintList() {
    let that = this;
    util
      .request(
        api.FootprintList,
        {
          // page: that.data.allPage,
          // size: that.data.size,
        },
        "POST"
      )
      .then(function (res) {
        if (res.erron == 0) {
          that.setData({
            footprintList: res.data,
          });
        }
        if (res.data.length == 0) {
          that.setData({
            hasPrint: 0,
            showNoMore: 1,
          });
        }
        // wx.hideLoading();
      });
  },
  onLoad: function (options) {
    this.getFootprintList();
  },
  deletePrint: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.val;
    util
      .request(api.FootprintDelete, { id}, "POST")
      .then(function (res) {
        if (res.errno === 0) {
          wx.showToast({
            title: "删除成功",
            icon: "success",
            mask: true,
          });
          that.setData({
            footprintList: [],
          });
          that.getFootprintList();
        }
      });
  },
  toIndexPage: function (e) {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },
  // onReachBottom: function () {
  //     let that = this;
  //     if (that.data.allCount / that.data.size < that.data.allPage) {
  //         that.setData({
  //             showNoMore: 0
  //         });
  //         return false;
  //     }
  //     that.setData({
  //         allPage: that.data.allPage + 1
  //     });
  //     that.getFootprintList();
  // }
});
