var app = getApp();
var WxParse = require("../../lib/wxParse/wxParse.js");
var util = require("../../utils/util.js");
var timer = require("../../utils/wxTimer.js");
var api = require("../../config/api.js");
const user = require("../../services/user.js");
Page({
  data: {
    id: 0,
    goods: {},
    gallery: [],
    galleryImages: [],
    specificationList: [],
    productList: [],
    cartGoodsCount: 0,
    checkedSpecPrice: 0,
    number: 1,
    checkedSpecText: "",
    tmpSpecText: "请选择规格和数量",
    openAttr: false,
    soldout: false,
    disabled: "",
    alone_text: "单独购买",
    userId: 0,
    priceChecked: false,
    //wx 内部的商品数量 用于判断是不是最后一件 其实也不用
    goodsNumber: 0,
    loading: 0,
    current: 0,
    showShareDialog: 0,
    userInfo: {},
    autoplay: true,
  },
  hideDialog: function (e) {
    let that = this;
    that.setData({
      showShareDialog: false,
    });
  },
  shareTo: function () {
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo == "") {
      util.loginNow();
      return false;
    } else {
      this.setData({
        showShareDialog: !this.data.showShareDialog,
      });
    }
  },
  createShareImage: function () {
    let id = this.data.id;
    wx.navigateTo({
      url: "/pages/share/index?goodsid=" + id,
    });
  },
  previewImage: function (e) {
    let current = e.currentTarget.dataset.src;
    let that = this;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: that.data.galleryImages, // 需要预览的图片http链接列表
    });
  },
  bindchange: function (e) {
    let current = e.detail.current;
    this.setData({
      current: current,
    });
  },
  inputNumber(event) {
    let number = event.detail.value;
    this.setData({
      number: number,
    });
  },
  goIndex: function () {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },
  onShareAppMessage: function (res) {
    let id = this.data.id;
    let name = this.data.goods.name;
    let image = this.data.goods.list_pic_url;
    let userId = this.data.userId;
    return {
      title: name,
      path: "/pages/goods/goods?id=" + id + "&&userId=" + userId,
      imageUrl: image,
    };
  },
  onUnload: function () {},
  handleTap: function (event) {
    //阻止冒泡
  },
  getGoodsInfo: function () {
    let that = this;
    util
      .request(api.GoodsDetail, {
        goodsId: Number(that.data.id),
      })
      .then(function (res) {
        if (res.errno === 0) {
          let galleryImages = [];
          let imgs = res.data.info[0].slider.split(",");
          for (const item of imgs) {
            galleryImages.push(item);
          }
          that.setData({
            goods: res.data.info[0],
            goodsNumber: res.data.info[0].inventory,
            gallery: galleryImages,
            galleryImages: galleryImages,
            loading: 1,
          });
          setTimeout(() => {
            WxParse.wxParse(
              "goodsDetail",
              "html",
              res.data.info[0].detail,
              that
            );
          }, 1000);
          wx.setStorageSync("goodsImage", res.data.info[0].img);
        } else {
          util.showErrorToast(res.errmsg);
        }
      });
  },
  addFootPrint: function () {
    util
      .request(
        api.FootprintAdd,
        {
          id: +this.data.id,
        },
        "post"
      )
      .then(function (res) {
        console.log(res);
      });
  },

  //根据已选的值，计算其它值的状态
  setSpecValueStatus: function () {},

  onLoad: function (options) {
    let id = 0;
    var scene = decodeURIComponent(options.scene);
    if (scene != "undefined") {
      id = scene;
    } else {
      id = options.id;
    }
    this.setData({
      id: id, // 这个是商品id
      valueId: id,
    });
  },

  onShow: function () {
    let userInfo = wx.getStorageSync("userInfo");
    let info = wx.getSystemInfoSync();
    // let sysHeight = info[0].windowHeight - 100;
    let userId = userInfo.id;
    if (userId > 0) {
      this.setData({
        userId: userId,
        userInfo: userInfo,
      });
    }
    this.setData({
      priceChecked: false,
      // sysHeight: sysHeight
    });
    this.getGoodsInfo();
    // this.getCartCount();
    this.addFootPrint();
  },
  onHide: function () {
    this.setData({
      autoplay: false,
    });
  },
  getCartCount: function () {
    let that = this;
    util.request(api.CartGoodsCount).then(function (res) {
      if (res.errno === 0) {
        that.setData({
          cartGoodsCount: res.data.cartTotal.goodsCount,
        });
      }
    });
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getGoodsInfo();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh(); //停止下拉刷新
  },
  openCartPage: function () {
    wx.switchTab({
      url: "/pages/cart/cart",
    });
  },
  goIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },
  switchAttrPop: function () {
    if (this.data.openAttr == false) {
      this.setData({
        openAttr: !this.data.openAttr,
      });
    }
  },
  closeAttr: function () {
    this.setData({
      openAttr: false,
      alone_text: "单独购买",
    });
  },
  goMarketing: function (e) {
    let that = this;
    that.setData({
      showDialog: !this.data.showDialog,
    });
  },

  //添加到购物车
  addToCart: function () {
    // 判断是否登录，如果没有登录，则登录
    util.loginNow();
    var that = this;
    let userInfo = wx.getStorageSync("userInfo");
    // let productLength = this.data.productList.length;
    if (userInfo == "") {
      return false;
    }
    util
      .request(
        api.CartAdd,
        {
          // addType: 0,
          //商品id
          goodsId: +this.data.id,
          //商品数量
          number: this.data.number,
          //？
          // productId: checkedProduct.id,
        },
        "POST"
      )
      .then(function (res) {
        let _res = res;
        if (_res.errno == 0) {
          wx.showToast({
            title: "添加成功",
          });
        } else {
          wx.showToast({
            image: "/images/icon/icon_error.png",
            title: _res.errmsg,
          });
        }
        wx.hideLoading();
      });
  },

  //立即购买  就直接跳到确认订单那了
  fastToCart: function () {
    // 判断是否登录，如果没有登录，则登录
    util.loginNow();
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo == "") {
      return false;
    }
    let goodsId = [];
    goodsId.push(+this.data.id);
    wx.setStorageSync("cartInfo", goodsId);
    //跳转
    wx.navigateTo({
      url: "/pages/order-check/index",
    });
  },
  cutNumber: function () {
    this.setData({
      number: this.data.number - 1 > 1 ? this.data.number - 1 : 1,
    });
    this.setData({
      disabled: "",
    });
  },
  addNumber: function () {
    this.setData({
      number: Number(this.data.number) + 1,
    });
    let checkedProductArray = this.getCheckedProductItem(
      this.getCheckedSpecKey()
    );
    let checkedProduct = checkedProductArray;
    var check_number = this.data.number + 1;
    if (checkedProduct.goods_number < check_number) {
      this.setData({
        disabled: true,
      });
    }
  },
});
