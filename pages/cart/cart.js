var util = require("../../utils/util.js");
var api = require("../../config/api.js");
const app = getApp();

Page({
  data: {
    //购物车 商品
    cartGoods: [],
    cartTotal: {
      //商品数量
      goodsCount: 0,
      // goodsAmount: 0.0,
      //已选择的数量
      checkedGoodsCount: 0,
      //选中的商品的总价
      checkedGoodsAmount: 0.0,
      // userId_test: "",
    },
    isEditCart: false,
    //是否全选状态
    checkedAllStatus: false,
    editCartList: [],
    isTouchMove: false,
    startX: 0, //开始坐标
    startY: 0,
    //判断购物车有无商品
    hasCartGoods: 0,
  },
  onLoad: function () {},
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
    this.getCartList();
    this.getCartNum();
    wx.removeStorageSync("categoryId");
  },

  //跳转到商品详情
  goGoodsDetail(e) {
    let goodsId = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: "/pages/goods/goods?id=" + goodsId,
    });
  },
  nothing: function () {},
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.getCartList();
    this.getCartNum();
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh(); //停止下拉刷新
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  //返回首页
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },

  //获取购物车列表信息
  getCartList: function () {
    let that = this;
    util.request(api.CartList, {}, "POST").then(function (res) {
      if (res.errno === 0) {
        let hasCartGoods = res.data.cartList;
        if (hasCartGoods.length != 0) {
          hasCartGoods = 1;
        } else {
          hasCartGoods = 0;
        }
        let cartGoods = res.data.cartList.map((i) => {
          i.checked = false;
          return i;
        });
        that.setData({
          cartGoods: cartGoods,
          cartTotal: res.data.cartList.length,
          hasCartGoods: hasCartGoods,
        });
        // if (res.data.cartTotal.numberChange == 1) {
        //   util.showErrorToast("部分商品库存有变动");
        // }
        //赋值一套控制选中商品的数据
      }
      that.setData({
        checkedAllStatus: that.isCheckedAll(),
      });
    });
  },

  //判断购物车商品已全选
  isCheckedAll: function () {
    return this.data.cartGoods.every((i) => {
      return i.checked == true;
    });
  },
  //计算 选中商品的数量与总价
  getCheckedGoodsCount: function () {
    let checkedGoodsCount = 0;
    let checkedGoodsAmount = 0;

    this.data.cartGoods.forEach(function (v) {
      if (v.checked == true) {
        checkedGoodsCount += v.goodsNumber;
        checkedGoodsAmount += v.goodsNumber * v.price;
      }
    });
    this.setData({
      "cartTotal.checkedGoodsCount": checkedGoodsCount,
      "cartTotal.checkedGoodsAmount": checkedGoodsAmount,
    });
  },

  //全选 / 全不选
  checkedAll: function () {
    // let that = this;
    // if (!this.data.isEditCart) {
    //   var productIds = this.data.cartGoods.map(function (v) {
    //     return v.cartId;
    //   });
    //   util
    //     .request(
    //       api.CartChecked,
    //       {
    //         cartId: productIds.join(","),
    //         isChecked: that.isCheckedAll() ? 0 : 1,
    //       },
    //       "POST"
    //     )
    //     .then(function (res) {
    //       if (res.errno === 0) {
    //         that.setData({
    //           cartGoods: res.data.cartList,
    //           cartTotal: res.data.cartTotal,
    //         });
    //       }

    //       that.setData({
    //         checkedAllStatus: that.isCheckedAll(),
    //       });
    //     });
    // } else {
    //   //编辑状态
    //   let checkedAllStatus = that.isCheckedAll();
    //   let tmpCartData = this.data.cartGoods.map(function (v) {
    //     v.checked = !checkedAllStatus;
    //     return v;
    //   });
    //   getCheckedGoodsCount();
    //   that.setData({
    //     cartGoods: tmpCartData,
    //     checkedAllStatus: that.isCheckedAll(),
    //   });
    // }

    //找到一个没有被选中的就返回false ----就可以全选   否者就全不选
    this.isCheckedAll();
    let cartGoods, checkedAllStatus;
    if (!this.data.checkedAllStatus) {
      //设置全选
      cartGoods = this.data.cartGoods.map((i) => {
        i.checked = true;
        return i;
      });
      checkedAllStatus = true;
    } else {
      //设置全不选
      cartGoods = this.data.cartGoods.map((i) => {
        i.checked = false;
        return i;
      });
      checkedAllStatus = false;
    }
    this.setData({
      cartGoods,
      checkedAllStatus,
    });
    this.getCheckedGoodsCount();
  },

  //加减商品数量
  updateCart: function (itemIndex, goodsId, number, cartId) {
    let that = this;
   
    util
      .request(
        api.CartUpdate,
        {
          //商品id
          goodsId: goodsId,
          goodsNumber: number,
          //购物车id
          cartId: cartId,
        },
        "POST"
      )
      .then(function (res) {
        if (res.errno === 0) {
          //更新数据的时候需要把checked也要龙上去
          let cartGoods = that.data.cartGoods;
          cartGoods[itemIndex].goodsNumber =
            res.data.cartList[itemIndex].goodsNumber;
          that.setData({
            cartGoods,
          });
          // that.getCartList();
          that.getCartNum();
          that.getCheckedGoodsCount();
        } else {
          util.showErrorToast("库存不足了");
        }
        that.setData({
          checkedAllStatus: that.isCheckedAll(),
        });
      });
  },

  //减少商品数量
  cutNumber: function (event) {
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    if (cartItem.goodsNumber - 1 == 0) {
      util.showErrorToast("删除左滑试试");
    }
    //判断商品数量是不大于一 大于一就减一 否者就 返回一
    let number = cartItem.goodsNumber - 1 > 1 ? cartItem.goodsNumber - 1 : 1;
    this.setData({
      cartGoods: this.data.cartGoods,
    });
    this.updateCart(itemIndex, cartItem.goodsId, number, cartItem.cartId);
  },

  //增加商品数量
  addNumber: function (event) {
    let itemIndex = event.target.dataset.itemIndex;
    let cartItem = this.data.cartGoods[itemIndex];
    let number = Number(cartItem.goodsNumber) + 1;
    this.setData({
      cartGoods: this.data.cartGoods,
    });
    this.updateCart(itemIndex, cartItem.goodsId, number, cartItem.cartId);
  },

  //获取购物车数量
  getCartNum: function () {
    // util.request(api.CartGoodsCount, {}, "post").then(function (res) {
    //   if (res.errno === 0) {
    //     let cartGoodsCount = "";
    //     if (res.data.cartTotal.goodsCount == 0) {
    //       wx.removeTabBarBadge({
    //         index: 2,
    //       });
    //     } else {
    //       cartGoodsCount = res.data.cartTotal.goodsCount + "";
    //       wx.setTabBarBadge({
    //         index: 2,
    //         text: cartGoodsCount,
    //       });
    //     }
    //   }
    // });
    util.getCartNum();
  },

  //去到确认订单页面
  checkoutOrder: function () {
    wx.removeStorageSync("cartInfo");
    //获取已选择的商品
    util.loginNow();
    //赛选出 选择的了商品
    let goods = [];
    let checkedGoods = this.data.cartGoods.filter(({ checked, goodsId }) => {
      //拿到商品id的数组
      checked && goods.push(goodsId);
      return checked == true;
    });
    // checkedGoods.map(({ goodsId }) => {
    //   goods.push(goodsId);
    // });

    //[{goodsId:1},{goodsId:2}] ==> [1,2]

    // console.log(goods);
    //
    if (checkedGoods.length <= 0) {
      util.showErrorToast("你好像没选中商品");
      return false;
    }
    //把购物车的信息存储到本地
    //选择的商品goodsId 穿这个
    wx.setStorageSync("cartInfo", JSON.stringify(goods));

    wx.navigateTo({
      url: "/pages/order-check/index?addtype=0",
    });
  },

  selectTap: function (e) {
    const index = e.currentTarget.dataset.index;
    const list = this.data.goodsList.list;
    if (index !== "" && index != null) {
      list[parseInt(index, 10)].active = !list[parseInt(index, 10)].active;
      this.setGoodsList(
        this.getSaveHide(),
        this.totalPrice(),
        this.allSelect(),
        this.noSelect(),
        list
      );
    }
  },

  //选择器 事件
  checkedItem: function (e) {
    let itemIndex = e.currentTarget.dataset.itemIndex;
    let cartGoods = this.data.cartGoods;
    cartGoods[itemIndex].checked = !this.data.cartGoods[itemIndex].checked;
    this.setData({
      cartGoods: cartGoods,
    });
    this.getCheckedGoodsCount();

    // if (!this.data.isEditCart) {
    //   util
    //     .request(
    //       api.CartChecked,
    //       {
    //         cartId: that.data.cartGoods[itemIndex].product_id,
    //         isChecked: that.data.cartGoods[itemIndex].checked ? 0 : 1,
    //       },
    //       "POST"
    //     )
    //     .then(function (res) {
    //       if (res.errno === 0) {
    //         that.setData({
    //           cartGoods: res.data.cartList,
    //           cartTotal: res.data.cartTotal,
    //         });
    //       }

    //       that.setData({
    //         checkedAllStatus: that.isCheckedAll(),
    //       });
    //     });
    // } else {
    //   //编辑状态
    //   let tmpCartData = this.data.cartGoods.map(function (
    //     element,
    //     index,
    //     array
    //   ) {
    //     if (index == itemIndex) {
    //       element.checked = !element.checked;
    //     }

    //     return element;
    //   });
    //   this.getCheckedGoodsCount();
    //   that.setData({
    //     cartGoods: tmpCartData,
    //     checkedAllStatus: that.isCheckedAll(),
    //     // 'cartTotal.checkedGoodsCount': that.getCheckedGoodsCount()
    //   });
    // }
  },
  handleTap: function (event) {
    //阻止冒泡
  },
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.cartGoods.forEach(function (v, i) {
      if (v.isTouchMove)
        //只操作为true的
        v.isTouchMove = false;
    });
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      cartGoods: this.data.cartGoods,
    });
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index, //当前索引
      startX = that.data.startX, //开始X坐标
      startY = that.data.startY, //开始Y坐标
      touchMoveX = e.changedTouches[0].clientX, //滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY, //滑动变化坐标
      //获取滑动角度
      angle = that.angle(
        {
          X: startX,
          Y: startY,
        },
        {
          X: touchMoveX,
          Y: touchMoveY,
        }
      );
    that.data.cartGoods.forEach(function (v, i) {
      v.isTouchMove = false;
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX)
          //右滑
          v.isTouchMove = false;
        //左滑
        else v.isTouchMove = true;
      }
    });
    //更新数据
    that.setData({
      cartGoods: that.data.cartGoods,
    });
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y;
    //返回角度 /Math.atan()返回数字的反正切值
    return (360 * Math.atan(_Y / _X)) / (2 * Math.PI);
  },
  //删除事件
  deleteGoods: function (e) {
    //获取已选择的商品
    let itemIndex = e.currentTarget.dataset.itemIndex;
    let cartId = this.data.cartGoods[itemIndex].cartId;
    let that = this;
    util
      .request(
        api.CartDelete,
        {
          cartId,
        },
        "POST"
      )
      .then(function (res) {
        if (res.errno === 0) {
          // let cartList = res.data.cartList;
          // that.setData({
          //   cartGoods: cartList,
          //   cartTotal: res.data.cartTotal,
          // });
          that.getCartList();
          that.getCartNum();
        }
        that.setData({
          checkedAllStatus: that.isCheckedAll(),
        });
      });
  },
});
