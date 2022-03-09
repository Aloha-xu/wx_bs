var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
const pay = require('../../../services/pay.js');
const app = getApp()
Page({
    data: {
        orderList: [],
        // allOrderList: [],
        // allPage: 1,
        // allCount: 0,
        // size: 8,
        showType: 9,
        hasOrder: 0,
        showTips: 0,
        status: {}
    },
    toOrderDetails: function(e) {
        let orderId = e.currentTarget.dataset.id;
        wx.setStorageSync('orderId', orderId)
        wx.navigateTo({
            url: '/pages/ucenter/order-details/index',
        })
    },
    payOrder: function(e) {
        let orderId = e.currentTarget.dataset.orderid;
        let that = this;

          wx.showModal({
            title: "提示",
            content: "模拟付款",
            success: function (e) {
              if (e.confirm) {
                // 已付款 模拟付款接口
                util
                  .request(
                    api.OrderUpdataState,
                    {
                      orderState: 1,
                      orderId: orderId,
                    },
                    "POST"
                  )
                  .then((res) => {
                    res.errno === 0 &&
                      wx.redirectTo({
                        url:
                          "/pages/payResult/payResult?status=1&orderId=" +
                          orderId,
                      });
                  });
              } else if (e.cancel) {
                // 取消付款
                util
                  .request(
                    api.OrderUpdataState,
                    {
                      orderState: 0,
                      orderId: orderId,
                    },
                    "POST"
                  )
                  .then((res) => {
                    res.errno === 0 &&
                      wx.redirectTo({
                        url:
                          "/pages/payResult/payResult?status=0&orderId=" +
                          orderId,
                      });
                  });
              }

              let showType = wx.getStorageSync('showType');
            that.setData({
                showType: showType,
                orderList: [],
            });
            that.getOrderList();
            that.getOrderInfo();
            },
          });


        // pay.payOrder(parseInt(orderId)).then(res => {
        //     let showType = wx.getStorageSync('showType');
        //     that.setData({
        //         showType: showType,
        //         orderList: [],
        //         allOrderList: [],
        //         allPage: 1,
        //         allCount: 0,
        //         size: 8
        //     });
        //     that.getOrderList();
        //     that.getOrderInfo();
        // }).catch(res => {
        //     util.showErrorToast(res.errmsg);
        // });
    },
    getOrderInfo: function(e) {
        let that = this;
        util.request(api.OrderCountInfo).then(function(res) {
            if (res.errno === 0) {
                let status = res.data;
                that.setData({
                    status: status
                });
            }
        });
    },
    getOrderList() {
        let that = this;
        let status = +wx.getStorageSync('showType')
        util.request(api.OrderList, {
            status: status
        },'post').then((res)=> {
            // console.log(res);
            if (res.errno == 0) {
                // console.log(res.data);
                
                // let count = res.data.count;

                //转换
                // let orderlist =res.data
                // orderlist.map(i => {
                //     i.createTime = util.rTime(i.createTime)
                // });


                that.setData({
                    // allCount: count,
                    // allOrderList: that.data.allOrderList.concat(res.data.data),
                    // allPage: res.data.currentPage,
                    orderList: res.data
                });
                // let hasOrderData = that.data.allOrderList.concat(res.data.data);
                // if (count == 0) {
                //     that.setData({
                //         hasOrder: 1
                //     });
                // }
            }
        })

    },
    toIndexPage: function(e) {
        wx.switchTab({
            url: '/pages/index/index'
        });
    },
    onLoad: function() {},
    onShow: function() {
        let showType = wx.getStorageSync('showType');
        let nowShowType = this.data.showType;
        // let doRefresh = wx.getStorageSync('doRefresh');
        if (nowShowType != showType ) {
            this.setData({
                showType: showType,
                orderList: [],
                // allOrderList: [],
                // allPage: 1,
                // allCount: 0,
                // size: 8
            });
            this.getOrderList();
            // wx.removeStorageSync('doRefresh');
        }
        // this.getOrderInfo();
        
    },
    switchTab: function(event) {
        // wx.showLoading({
        //   title: '加载中...',
        // })
        let showType = event.currentTarget.dataset.index;
        wx.setStorageSync('showType', showType);
        this.setData({
            showType: showType,
            // orderList: [],
            // allOrderList: [],
            // allPage: 1,
            // allCount: 0,
            // size: 8
        });
        // this.getOrderInfo();
        this.getOrderList();
        
    },
    // “取消订单”点击效果
    cancelOrder: function(e) {
        let that = this;
        let orderId = e.currentTarget.dataset.index;
        wx.showModal({
            title: '',
            content: '确定要取消此订单？',
            success: function(res) {
                if (res.confirm) {
                    util.request(api.OrderCancel, {
                        orderId: orderId
                    }, 'POST').then(function(res) {
                        if (res.errno === 0) {
                            wx.showToast({
                                title: '取消订单成功'
                            });
                            that.setData({
                                orderList: [],
                                allOrderList: [],
                                allPage: 1,
                                allCount: 0,
                                size: 8
                            });
                            that.getOrderList();
                        } else {
                            util.showErrorToast(res.errmsg);
                        }
                    });
                }
            }
        });
    },
})