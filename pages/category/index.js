var util = require("../../utils/util.js");
var api = require("../../config/api.js");

Page({
  data: {
    navList: [],
    categoryList: [],
    currentCategory: {},
    goodsCount: 0,
    nowIndex: 0,
    nowId: 1,
    list: [],
    allPage: 1,
    allCount: 0,
    size: 8,
    hasInfo: 0,
    showNoMore: 0,
    loading: 0,
  },
  onLoad: function (options) {},

  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getCatalog();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh(); //停止下拉刷新
  },
  //分类加载
  getCatalog: function () {
    //CatalogList
    let that = this;
    util.request(api.CatalogList).then(function (res) {
      that.setData({
        navList: res.data.categoryList,
      });
    });
    util.request(api.GoodsCount).then(function (res) {
      that.setData({
        goodsCount: res.data.goodsCount,
      });
    });
  },

  //获取商品的列表信息list
  getCurrentList: function (id) {
    let that = this;
    util
      .request(
        api.GetCurrentList,
        {
          pageSize: that.data.size,
          currentPage: that.data.allPage,
          cateId: id,
        },
        "get"
      )
      .then(function (res) {
        if (res.errno === 0) {
          let count = res.data.count;
          that.setData({
            allCount: count,
            allPage: res.data.currentPage,
            list: that.data.list.concat(res.data.data),
            showNoMore: 1,
            loading: 0,
          });
          if (count == 0) {
            that.setData({
              hasInfo: 0,
              showNoMore: 0,
            });
          }
        }
      });
  },

  //
  onShow: function () {
    //拿到分类列表
    this.getCatalog();
    //cateid 默认是1 - 全部
    let id = this.data.nowId;
    //这个是在其他页面传过来的cateId  可能为空的
    let nowId = wx.getStorageSync("categoryId");

    if (id == nowId) return;
    nowId && (id = nowId);
    this.setData({
      list: [],
      allPage: 1,
      allCount: 0,
      size: 8,
      loading: 1,
    });
    this.getCurrentList(id);
    this.setData({
      nowId: id,
    });
    wx.setStorageSync("categoryId", id);
  },

  //处理点击切换分类函数
  switchCate: function (e) {
    //刚刚点击的id
    let id = e.currentTarget.dataset.id;
    //之前的id
    let nowId = this.data.nowId;
    if (id == nowId) return;
    if (id != nowId) {
      this.setData({
        list: [],
        allPage: 1,
        allCount: 0,
        size: 8,
        loading: 1,
      });
      this.getCurrentList(id);
      this.setData({
        nowId: id,
      });
      wx.setStorageSync("categoryId", id);
    }
  },

  onBottom: function () {
    let that = this;
    if (that.data.allCount / that.data.size < that.data.allPage) {
      that.setData({
        showNoMore: 0,
      });
      return false;
    }
    that.setData({
      allPage: that.data.allPage + 1,
    });
    let nowId = that.data.nowId;
    if (nowId == 0 || nowId == undefined) {
      that.getCurrentList(0);
    } else {
      that.getCurrentList(nowId);
    }
  },
});
