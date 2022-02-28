var util = require("../../../utils/util.js");
var api = require("../../../config/api.js");


// pages/ucenter/refund.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    refundReason: "",
  },

  bindinputRefundReason(event) {
    let refundReason = event.detail.value;
    this.setData({
      refundReason,
    });
  },

  UpdataRefund(){
    let that = this
    let orderId = wx.getStorageSync('orderId')
    let refundReason = this.data.refundReason
    util.request(api.OrderRefund,{
      orderId, 
      refundReason
    },
    "post").then((res)=>{
      res.errno == 0 && (wx.showToast({
        title: '提交成功',
      }),
      that.setData({
        refundReason :'',
      }))

      res.errno != 0 && wx.showToast({
        title: '提交失败',
      })
      
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
