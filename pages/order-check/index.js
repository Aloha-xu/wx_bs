var util = require("../../utils/util.js");
var api = require("../../config/api.js");
const pay = require("../../services/pay.js");
const app = getApp();

Page({
  data: {
    checkedGoodsList: [],
    checkedAddress: {},
    goodsTotalPrice: 0.0, //商品总价
    freightPrice: 0.0, //快递费
    orderTotalPrice: 0.0, //订单总价
    actualPrice: 0.0, //实际需要支付的总价
    addressId: 0,
    goodsCount: 0,
    note: "",
    outStock: 0,
    payMethodItems: [
      {
        name: "offline",
        value: "线下支付",
      },
      {
        name: "online",
        value: "在线支付",
        checked: "true",
      },
    ],
    payMethod: 1,
  },
  payChange(e) {
    let val = e.detail.value;
    if (val == "offline") {
      this.setData({
        payMethod: 0,
      });
    } else {
      this.setData({
        payMethod: 1,
      });
    }
  },
  toGoodsList: function (e) {
    wx.navigateTo({
      url: "/pages/ucenter/goods-list/index?id=0",
    });
  },
  //type 1
  toSelectAddress: function () {
    wx.navigateTo({
      url: "/pages/ucenter/address/index?type=1",
    });
  },
  toAddAddress: function () {
    wx.navigateTo({
      url: "/pages/ucenter/address-add/index",
    });
  },
  bindinputMemo(event) {
    let note = event.detail.value;
    this.setData({
      note: note,
    });
  },
  onUnload: function () {
    wx.removeStorageSync("addressId");
  },
  onLoad: function () {
    this.getCheckoutInfo();
  },
  onShow: function () {
    let that = this;
    try {
      let addressId = wx.getStorageSync("addressId");
      if (addressId == 0 || addressId == "") {
        addressId = 0;
      }
      this.setData({
        addressId: addressId,
      });
    } catch (e) {}
    //更新地址 这个时候拿到的addressid是地址选择后的
    util
      .request(api.AddressDetail, {
        id: that.data.addressId,
      })
      .then(function (res) {
        if (res.errno === 0) {
          that.setData({
            checkedAddress: res.data,
          });
        }
      });
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    try {
      var addressId = wx.getStorageSync("addressId");
      if (addressId == 0 || addressId == "") {
        addressId = 0;
      }
      this.setData({
        addressId: addressId,
      });
    } catch (e) {
      // Do something when catch error
    }
    this.getCheckoutInfo();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh(); //停止下拉刷新
  },
  //确认订单的信息 或者说 拿到订单的信息
  //进去这个确认订单的详情页 他是还没有生成订单的 只是在确定信息
  // submitOrder 之后才生成订单 这时候就有订单了
  // 状态0 等待支付  ---  跳到一个模拟的支付页面  支付成功 -修改状态为1  取消支付  -修改状态为0
  //  付款之后 待发货 状态 1
  // 商家已发货  状态2  待收货

  getCheckoutInfo: function () {
    let that = this;
    //默认的地址id
    // let addressId = that.data.addressId;
    //拿到已选择的商品
    let goods = JSON.parse(wx.getStorageSync("cartInfo"));

    // let orderFrom = that.data.orderFrom;
    // let addType = that.data.addType;
    util
      .request(
        api.CartCheckout,
        {
          goods,
        },
        "post"
      )
      .then(function (res) {
        if (res.errno === 0) {
          // let addressId = 0;
          // if (res.data.checkedAddress != 0) {
          //   addressId = res.data.checkedAddress.id;
          // }
          that.setData({
            //选择中的商品
            checkedGoodsList: res.data.checkedGoodsList,
            //地址详情 默认的id
            checkedAddress: res.data.checkedAddress,
            //实际需要支付的总价
            actualPrice: res.data.actualPrice,
            //地址id 默认的id
            addressId: res.data.addressId,
            //快递费
            freightPrice: res.data.freightPrice,
            //商品总价
            goodsTotalPrice: res.data.goodsTotalPrice,
            //订单总价
            orderTotalPrice: res.data.orderTotalPrice,
            //商品数量
            goodsCount: res.data.goodsCount,
            //是否无货了
            outStock: res.data.outStock,
          });
          //   let goods = res.data.checkedGoodsList;
          wx.setStorageSync("addressId", that.data.addressId);
          //   if (res.data.outStock == 1) {
          //     util.showErrorToast("有部分商品缺货或已下架");
          //   } else if (res.data.numberChange == 1) {
          //     util.showErrorToast("部分商品库存有变动");
          //   }
        }
      });
  },

  // TODO 有个bug，用户没选择地址，支付无法继续进行，在切换过token的情况下
  submitOrder: function (e) {
    if (this.data.addressId <= 0) {
      util.showErrorToast("请选择收货地址");
      return false;
    }
    let addressId = this.data.addressId;
    let note = this.data.note;
    let freightPrice = this.data.freightPrice;
    let actualPrice = this.data.actualPrice;

    wx.showLoading({
      title: "",
      mask: true,
    });

    //封装数据 goodsList
    let goodsList = [];
    goodsList = this.data.checkedGoodsList.map(({ goodsId, goodsNumber }) => ({
      goodsId: goodsId,
      num: goodsNumber,
    }));

    // 提交 生成 订单

    // 状态0 等待支付  ---  跳到一个模拟的支付页面  支付成功 -修改状态为1  取消支付  -修改状态为0
    // 付款之后 待发货 状态1
    // 商家已发货  状态2  待收货
    // 生成订单需要传的数据 openid \ addressId \ freightPrice \  note \ actualPay
    //暂时不用传 payTime 支付完才生成 \
    util
      .request(
        api.OrderSubmit,
        {
          //地址di
          addressId: addressId,
          //备注
          note: note,
          //快递费
          freightPrice: freightPrice,
          //实际需要支付的总价
          actualPay: actualPrice,
          goodsList,
        },
        "POST"
      )
      .then((res) => {
        if (res.errno === 0) {
          wx.removeStorageSync("orderId");
          wx.setStorageSync("addressId", 0);
          const orderId = res.data.orderId;
          wx.showModal({
            title: "提示",
            content: "模拟付款",
            success: function (e) {
              if (e.confirm) {
                // 已付款 模拟付款接口
                // 这里调用 接口跟新状态 -- 3
                util
                  .request(
                    api.OrderUpdataState,
                    {
                      code: 3,
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
                // 这里调用 接口跟新状态 -- 2
                util
                  .request(
                    api.OrderUpdataState,
                    {
                      code: 2,
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
            },
          });
          // util.showErrorToast(res.errmsg);
          wx.hideLoading();
        }
      });
  },

  // offlineOrder: function (e) {
  //   if (this.data.addressId <= 0) {
  //     util.showErrorToast("请选择收货地址");
  //     return false;
  //   }
  //   let addressId = this.data.addressId;
  //   let note = this.data.note;
  //   let freightPrice = this.data.freightPrice;
  //   let actualPrice = this.data.actualPrice;
  //   util
  //     .request(
  //       api.OrderSubmit,
  //       {
  //         addressId: addressId,
  //         note: note,
  //         freightPrice: freightPrice,
  //         actualPrice: actualPrice,
  //         offlinePay: 1,
  //       },
  //       "POST"
  //     )
  //     .then((res) => {
  //       if (res.errno === 0) {
  //         wx.removeStorageSync("orderId");
  //         wx.setStorageSync("addressId", 0);
  //         wx.redirectTo({
  //           url: "/pages/payOffline/index?status=1",
  //         });
  //       } else {
  //         util.showErrorToast(res.errmsg);
  //         wx.redirectTo({
  //           url: "/pages/payOffline/index?status=0",
  //         });
  //       }
  //     });
  // },
});
