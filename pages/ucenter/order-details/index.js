var util = require("../../../utils/util.js");
var api = require("../../../config/api.js");
var wxTimer = require("../../../utils/wxTimer.js");
var remaintimer = require("../../../utils/remainTime.js");
const pay = require("../../../services/pay.js");
const app = getApp();

// TODO 拼团订单不能退款
Page({
  data: {
    orderId: 0,
    orderInfo: {},
    addressInfo: {},
    orderGoods: [],
    handleOption: {},
    textCode: {},
    goodsCount: 0,
    addressId: 0,
    postscript: "",
    hasPay: 0,
    success: 0,
    imageUrl: "",
    wxTimerList: {},
    express: {},
    onPosting: 0,
    userInfo: {},
    countdown: {
      day: "00",
      hour: "00",
      minute: "00",
      second: "00",
    },
    orderCreateTime: null,
    orderPayTime: null,
    orederShipTime: null,
    orederFinishTime: null,
  },
  reOrderAgain: function () {
    let orderId = this.data.orderId;
    wx.redirectTo({
      url: "/pages/order-check/index?addtype=2&orderFrom=" + orderId,
    });
  },
  copyText: function (e) {
    let data = e.currentTarget.dataset.text;
    wx.setClipboardData({
      data: data,
      success(res) {
        wx.getClipboardData({
          success(res) {},
        });
      },
    });
  },
  toGoodsList: function (e) {
    let orderId = this.data.orderId;
    wx.navigateTo({
      url: "/pages/ucenter/goods-list/index?id=" + orderId,
    });
  },
  toExpressInfo: function (e) {
    let orderId = this.data.orderId;
    wx.navigateTo({
      url: "/pages/ucenter/express-info/index?id=" + orderId,
    });
  },
  toRefundSelect: function (e) {
    wx.navigateTo({
      url: "/pages/refund-select/index",
    });
  },
  payOrder: function (e) {
    let that = this;
    pay
      .payOrder(parseInt(that.data.orderId))
      .then((res) => {
        that.getOrderDetail();
      })
      .catch((res) => {
        util.showErrorToast(res.errmsg);
      });
  },
  toSelectAddress: function () {
    let orderId = this.data.orderId;
    wx.navigateTo({
      url: "/pages/ucenter/address-select/index?id=" + orderId,
    });
  },
  onLoad: function () {},
  onShow: function () {
    var orderId = wx.getStorageSync("orderId");
    let userInfo = wx.getStorageSync("userInfo");
    this.setData({
      orderId: orderId,
      userInfo: userInfo,
    });
    wx.showLoading({
      title: "加载中...",
    });
    this.getOrderDetail();
    this.getExpressInfo();
  },
  onUnload: function () {
    // let oCancel = this.data.handleOption.cancel;
    // if (oCancel == true) {
    //     let orderTimerID = this.data.wxTimerList.orderTimer.wxIntId;
    //     clearInterval(orderTimerID);
    // }
    this.data.TimerInterval && clearInterval(this.data.TimerInterval);
  },
  onHide: function () {
    let oCancel = this.data.handleOption.cancel;
    if (oCancel == true) {
      let orderTimerID = this.data.wxTimerList.orderTimer.wxIntId;
      clearInterval(orderTimerID);
    }
  },
  orderTimer: function (endTime) {
    let that = this;
    var orderTimerID = "timeId";
    let wxTimer2 = new timer({
      endTime: endTime,
      name: "orderTimer",
      id: orderTimerID,
      complete: function () {
        that.letOrderCancel();
      },
    });
    wxTimer2.start(that);
  },
  bindinputMemo(event) {
    let postscript = event.detail.value;
    this.setData({
      postscript: postscript,
    });
  },
  getExpressInfo: function () {
    this.setData({
      onPosting: 0,
    });
    let that = this;
    util
      .request(api.OrderExpressInfo, {
        orderId: that.data.orderId,
      })
      .then(function (res) {
        if (res.errno === 0) {
          let express = res.data;
          express.traces = JSON.parse(res.data.traces);
          that.setData({
            onPosting: 1,
            express: express,
          });
        }
      });
  },
  getOrderDetail: function () {
    let that = this;
    util
      .request(
        api.OrderDetail,
        {
          orderId: that.data.orderId,
        },
        "POST"
      )
      .then(function (res) {
        if (res.errno === 0) {
          let orderInfo = res.data.orderInfo;
          that.setData({
            orderInfo,
            orderGoods: res.data.orderGoods,
            // handleOption: res.data.handleOption,
            // textCode: res.data.textCode,
            addressInfo: res.data.addressInfo,
            // goodsCount: res.data.goodsCount
            orderCreateTime:orderInfo.createTime,
            orderPayTime: orderInfo.payTime && orderInfo.payTime,
            orederShipTime:
              orderInfo.shipTime && orderInfo.shipTime,
            orederFinishTime:
              orderInfo.finishTime && orderInfo.finishTime,
            orederCloseTime:
              orderInfo.closeTime && orderInfo.closeTime,
          });
          let code = orderInfo.code;
          //这应该是快递到买家手中 等待收货 就是待确认收货的时间  点击完确认收货 订单就到了关闭时间
          let endTime = 0;
          if (code == 2) {
            // let confirm_remainTime = res.data.orderInfo.finishTime;
            // remaintimer.reTime(confirm_remainTime, 'c_remainTime', that);
            //商家发货了 15天后自动收货
            endTime = +res.data.orderInfo.shipTime + 24 * 60 * 60 * 15;
            wxTimer(endTime * 1000, that, 1000 * 60);
          }
          if (code == 0) {
            endTime = +res.data.orderInfo.createTime + 24 * 60 * 60;
            wxTimer(endTime * 1000, that, 1000);
          }
        }
      });
    wx.hideLoading();
  },
  letOrderCancel: function () {
    let that = this;
    util
      .request(
        api.OrderCancel,
        {
          orderId: that.data.orderId,
        },
        "POST"
      )
      .then(function (res) {
        if (res.errno === 0) {
          that.getOrderDetail();
        } else {
          util.showErrorToast(res.errmsg);
        }
      });
  },
  // “删除”点击效果  1-正常，0-删除  修改的是订单的状态
  deleteOrder: function () {
    let that = this;
    wx.showModal({
      title: "",
      content: "确定要删除此订单？",
      success: function (res) {
        if (res.confirm) {
          util
            .request(
              api.OrderDelete,
              {
                orderId: that.data.orderId,
              },
              "POST"
            )
            .then(function (res) {
              if (res.errno === 0) {
                wx.showToast({
                  title: "删除订单成功",
                });
                wx.removeStorageSync("orderId");
                wx.setStorageSync("doRefresh", 1);
                wx.navigateBack();
              } else {
                util.showErrorToast(res.msg);
              }
            });
        }
      },
    });
  },
  // “确认收货”点击效果  修改orderstate  ---3
  confirmOrder: function () {
    let that = this;
    wx.showModal({
      title: "",
      content: "确认收货？",
      success: function (res) {
        if (res.confirm) {
          util
            .request(
              api.OrderConfirm,
              {
                orderId: that.data.orderId,
              },
              "POST"
            )
            .then(function (res) {
              if (res.errno === 0) {
                wx.showToast({
                  title: "确认收货成功！",
                });
                wx.setStorageSync("doRefresh", 1);
                that.getOrderDetail();
              } else {
                util.showErrorToast(res.msg);
              }
            });
        }
      },
    });
  },
  // “取消订单”点击效果   取消订单是买了没给钱  orderstate  ---6
  cancelOrder: function (e) {
    let that = this;
    wx.showModal({
      title: "",
      content: "确定要取消此订单？",
      success: function (res) {
        if (res.confirm) {
          util
            .request(
              api.OrderUpdataState,
              {
                orderId: that.data.orderId,
                orderState: 6,
              },
              "POST"
            )
            .then(function (res) {
              if (res.errno === 0) {
                wx.showToast({
                  title: "取消订单成功",
                });
                that.setData({
                  orderList: [],
                  //   allOrderList: [],
                  //   allPage: 1,
                  //   allCount: 0,
                  //   size: 8,
                });
                wx.setStorageSync("doRefresh", 1);
                // let orderTimerID = that.data.wxTimerList.orderTimer.wxIntId;
                // clearInterval(orderTimerID);
                that.getOrderDetail();
              } else {
                util.showErrorToast(res.msg);
              }
            });
        }
      },
    });
  },
  refundOrder: function () {
    //直接跳转页面到一个新页面
    wx.navigateTo({
      url: "/pages/ucenter/refund/index?id=" + this.data.orderId,
    });
  },
});
