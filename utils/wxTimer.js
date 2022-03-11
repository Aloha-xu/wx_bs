
var util = require("./util.js");
var api = require("../config/api.js");
// 传时间搓 
let wxTimer = function (endTime,self,intervalTimer) {
    let nowTime = new Date().getTime();
    //计算出现在时间与结束时间之间多少  毫秒   ms
    var millisecond = endTime - nowTime ;
    var interval = setInterval(function () {
      console.log('循环中');
      //减1秒
      millisecond -= intervalTimer;
      console.log(millisecond);
      //结束
      if (millisecond <= 0){
        clearInterval(interval);
        self.setData({
          countdown: {
            day: '00',
            hour: '00',
            minute: '00',
            second: '00'
          }
        });
        if(self.data.countdown.day == '00' && self.data.countdown.hour == '00' && self.data.countdown.minute == '00' && self.data.countdown.second == '00' && intervalTimer == 1000){
          cancleOrderFun()
        }
        if(self.data.countdown.day == '00' && self.data.countdown.hour == '00' && self.data.countdown.minute == '00' && self.data.countdown.second == '00' && intervalTimer == 60000){
          receivedFun()
        }
        return;
      }
      transformRemainTime(millisecond,self,interval);
    }, intervalTimer);
    transformRemainTime(millisecond,self,interval);
  }
  // 剩余时间(毫秒)处理转换时间
 function transformRemainTime(millisecond,self,interval) {
    var countdownObj = self.data.countdown;
    // 秒数   s   
    var seconds = Math.floor(millisecond / 1000);
    // 天数  60 60 24
    countdownObj.day = formatTime(Math.floor(seconds / 3600 / 24));
    // 小时
    countdownObj.hour = formatTime(Math.floor(seconds / 3600 % 24));
    // 分钟
    countdownObj.minute =formatTime(Math.floor(seconds / 60 % 60));
    // 秒
    countdownObj.second = formatTime(Math.floor(seconds % 60));
    self.setData({
      countdown: countdownObj,
      TimerInterval:interval,

    });
  }
  //格式化时间为2位
  function formatTime(time){
    if(time < 10)
      return '0' + time;
    return time;
  }

  //取消订单 超时未付款
  function cancleOrderFun(){
      util
      .request(
        api.OrderUpdataState,
        {
          orderId: self.data.orderId,
          orderState: 6,
        },
        "POST"
      )
      .then(function (res) {
        if (res.errno === 0) {
          wx.showToast({
            title: "取消订单成功",
          });
          wx.setStorageSync("doRefresh", 1);
          self.getOrderDetail();
        } else {
          util.showErrorToast(res.msg);
        }
      });
  }
  //已收货 超时未确认收货
  function receivedFun(){
    util
    .request(
      api.OrderConfirm,
      {
        orderId: self.data.orderId,
      },
      "POST"
    )
    .then(function (res) {
      if (res.errno === 0) {
        wx.showToast({
          title: "确认收货成功！",
        });
        wx.setStorageSync("doRefresh", 1);
        self.getOrderDetail();
      } else {
        util.showErrorToast(res.msg);
      }
    });
  }



  module.exports = wxTimer;