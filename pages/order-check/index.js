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
    postscript: "",
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
    let postscript = event.detail.value;
    this.setData({
      postscript: postscript,
    });
  },
  onLoad: function (options) {
    // let addType = options.addtype;
    // let orderFrom = options.orderFrom;
    // if (addType != undefined) {
    //   this.setData({
    //     //??
    //     addType: addType,
    //   });
    // }
    // if (orderFrom != undefined) {
    //   this.setData({
    //     orderFrom: orderFrom,
    //   });
    // }
  },
  onUnload: function () {
    wx.removeStorageSync("addressId");
  },
  onShow: function () {
    // 页面显示
    // TODO结算时，显示默认地址，而不是从storage中获取的地址值
    let that = this
    try {
      let addressId = wx.getStorageSync("addressId");
      if (addressId == 0 || addressId == "") {
        addressId = 0;
      }
      this.setData({
        addressId: addressId,
      });
    } catch (e) { }
    this.getCheckoutInfo();
    //更新地址
    util.request(api.AddressDetail, {
      id: that.data.addressId
  }).then(function(res) {
      if (res.errno === 0) {
          that.setData({
              checkedAddress:res.data,
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
  // 状态0 等待支付 /  付款之后 待发货 状态 1   / 商家已发货  状态2  待收货

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
            //地址详情
            checkedAddress: res.data.checkedAddress,
            //实际需要支付的总价
            actualPrice: res.data.actualPrice,
            //地址id
            // addressId: addressId,
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
          //   wx.setStorageSync("addressId", addressId);
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
    let postscript = this.data.postscript;
    let freightPrice = this.data.freightPrice;
    let actualPrice = this.data.actualPrice;
    wx.showLoading({
      title: "",
      mask: true,
    });
    util
      .request(
        api.OrderSubmit,
        {
          addressId: addressId,
          postscript: postscript,
          freightPrice: freightPrice,
          actualPrice: actualPrice,
          offlinePay: 0,
        },
        "POST"
      )
      .then((res) => {
        if (res.errno === 0) {
          wx.removeStorageSync("orderId");
          wx.setStorageSync("addressId", 0);
          const orderId = res.data.orderInfo.id;
          pay
            .payOrder(parseInt(orderId))
            .then((res) => {
              wx.redirectTo({
                url: "/pages/payResult/payResult?status=1&orderId=" + orderId,
              });
            })
            .catch((res) => {
              wx.redirectTo({
                url: "/pages/payResult/payResult?status=0&orderId=" + orderId,
              });
            });
        } else {
          util.showErrorToast(res.errmsg);
        }
        wx.hideLoading();
      });
  },
  offlineOrder: function (e) {
    if (this.data.addressId <= 0) {
      util.showErrorToast("请选择收货地址");
      return false;
    }
    let addressId = this.data.addressId;
    let postscript = this.data.postscript;
    let freightPrice = this.data.freightPrice;
    let actualPrice = this.data.actualPrice;
    util
      .request(
        api.OrderSubmit,
        {
          addressId: addressId,
          postscript: postscript,
          freightPrice: freightPrice,
          actualPrice: actualPrice,
          offlinePay: 1,
        },
        "POST"
      )
      .then((res) => {
        if (res.errno === 0) {
          wx.removeStorageSync("orderId");
          wx.setStorageSync("addressId", 0);
          wx.redirectTo({
            url: "/pages/payOffline/index?status=1",
          });
        } else {
          util.showErrorToast(res.errmsg);
          wx.redirectTo({
            url: "/pages/payOffline/index?status=0",
          });
        }
      });
  },
});
