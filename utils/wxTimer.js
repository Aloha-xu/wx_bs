// var wxTimer = function(initObj) {
//     initObj = initObj || {};
//     console.log(initObj);
//     this.endTime = initObj.endTime || 0; //开始时间
//     this.interval = initObj.interval || 0; //间隔时间
//     this.complete = initObj.complete; //结束任务
//     this.intervalFn = initObj.intervalFn; //间隔任务
//     this.name = initObj.name; //当前计时器在计时器数组对象中的名字
//     this.intervarID = initObj.id; //计时ID
//     // this.intervarID; //计时ID
// }

// wxTimer.prototype = {
//     //开始
//     start: function(self) {
//         console.log('倒计时开始');
//         let end = this.endTime * 1000;
//         console.log(end);
//         let intId = this.intervarID;
//         var that = this;
//         //开始倒计时
//         var count = 0; //这个count在这里应该是表示s数，js中获得时间是ms，所以下面*1000都换成ms
//         function begin() {
//             var countdown = parseInt((end - new Date().getTime()) / 1000);
//             var day = _format(parseInt((end - new Date().getTime()) / 1000 / 60 / 60 / 24));
//             // var hour = _format(parseInt((end - new Date().getTime()) / 1000 / 60 / 60 % 24));
//             var hour = _format(parseInt((end - new Date().getTime()) / 1000 / 60 / 60 ));
//             var minute = _format(parseInt((end - new Date().getTime()) / 1000 / 60 % 60));
//             var seconds = _format(parseInt((end - new Date().getTime()) / 1000) % 60);
//             var wxTimerList = self.data.wxTimerList;
//             console.log(seconds);
//             //更新计时器数组
//             // console.log(that.name);
//             // console.log(
//             //     {
//             //         wxDay: day,
//             //         wxHour: hour,
//             //         wxMinute: minute,
//             //         wxSeconds: seconds,
//             //         wxCountdown: countdown,
//             //         wxIntId: intId
//             //     }
//             // );
//             wxTimerList[that.name] = {
//                 wxDay: day,
//                 wxHour: hour,
//                 wxMinute: minute,
//                 wxSeconds: seconds,
//                 wxCountdown: countdown,
//                 wxIntId: intId
//             }
//             self.setData({
//                 wxDay: day,
//                 wxHour: hour,
//                 wxMinute: minute,
//                 wxSeconds: seconds,
//                 countDown: countdown,
//                 wxTimerList: wxTimerList,
//                 wxIntId: intId
//             });
//             //结束执行函数
//             if (countdown <= 0) {
//                 if (that.complete) {
//                     that.complete(self);
//                     console.log('倒计时结束');
//                 }
//                 that.stop(self);
//             }
//         }
//         begin();
//         intId = setInterval(begin, 1000);
//     },
//     //结束
//     // stop: function (self) {
//     //     let Id = self.data.aTimer
//     //     clearInterval(Id);
//     // },
//     stop: function (self) {
//         let name = this.name;
//         let timerId = self.data.wxTimerList[name].wxIntId;
//         clearInterval(timerId);
//     },
//     // //校准
//     // calibration: function() {
//     //     this.endTime = this.endSystemTime - Date.now();
//     // }
// }

// function _format(time) {
//     if (time >= 10) {
//         return time
//     } else {
//         return '0' + time
//     }
// }



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

  module.exports = wxTimer;