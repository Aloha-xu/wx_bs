var api = require('../config/api.js');

//封装微信的request
function request(url, data = {}, method = "GET") {
    return new Promise(function(resolve, reject) {
        wx.request({
            url: url,
            data: data,
            method: method,
            header: {
            'Content-Type': 'application/json',
                //这是使用另外一个后端需要带上token 的代码
                'Authorization':`Bearer ${wx.getStorageSync('token')}`
                //这个配套的代码是自定义一个变量带token
                // 'X-Hioshop-Token': wx.getStorageSync('token')
            },
            success: function(res) {
                if (res.statusCode == 200) {
                    if (res.data.errno == 401) {
                        //需要登录后才可以操作

                        // let code = null;
                        // return login().then((res) => {
                        //     code = res.code;
                        //     return getUserInfo();
                        // }).then((userInfo) => {
                        //     //登录远程服务器
                        //     request(api.AuthLoginByWeixin, {
                        //         code: code,
                        //         userInfo: userInfo
                        //     }, 'POST').then(res => {
                        //         if (res.errno === 0) {
                        //             //存储用户信息
                        //             wx.setStorageSync('userInfo', res.data.userInfo);
                        //             wx.setStorageSync('token', res.data.token);
                        //             resolve(res);
                        //         } else {
                        //             reject(res);
                        //         }
                        //     }).catch((err) => {
                        //         reject(err);
                        //     });
                        // }).catch((err) => {
                        //     reject(err);
                        // })
                    } else {
                        resolve(res.data);
                    }
                } else {
                    reject(res.errMsg);
                }

            },
            fail: function(err) {
                reject(err)
            }
        })
    });
}

//检查微信会话是否过期
function checkSession() {
    return new Promise(function(resolve, reject) {
        wx.checkSession({
            success: function() {
                resolve(true);
            },
            fail: function() {
                reject(false);
            }
        })
    });
}

//调用微信登录
function login() {
    return new Promise(function(resolve, reject) {
        wx.login({
            success: function(res) {
                if (res.code) {
                    //登录远程服务器
                    resolve(res);
                } else {
                    reject(res);
                }
            },
            fail: function(err) {
                reject(err);
            }
        });
    });
}

//获取登录用户的信息 
function getUserInfo() {
    return new Promise(function(resolve, reject) {
        wx.getUserInfo({
            //是否带上登录态信息。当 withCredentials 为 true 时，要求此前有调用过 wx.login 且登录态尚未过期，此时返回的数据会包含 encryptedData, iv 等敏感信息；当 withCredentials 为 false 时，不要求有登录态，返回的数据不包含 encryptedData, iv 等敏感信息。
            withCredentials: true,
            success: function(res) {
                resolve(res);
            },
            fail: function(err) {
                reject(err);
            }
        })
    });
}

function sentRes(url, data, method, fn) {
    data = data || null;
    if (data == null) {
        var content = require('querystring').stringify(data);
    } else {
        var content = JSON.stringify(data); //json format
    }

    var parse_u = require('url').parse(url, true);
    var isHttp = parse_u.protocol == 'http:';
    var options = {
        host: parse_u.hostname,
        port: parse_u.port || (isHttp ? 80 : 443),
        path: parse_u.path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(content, "utf8"),
            // 'Trackingmore-Api-Key': '1b70c67e-d191-4301-9c05-a50436a2526d'
        }
    };
    var req = require(isHttp ? 'http' : 'https').request(options, function(res) {
        var _data = '';
        res.on('data', function(chunk) {
            _data += chunk;
        });
        res.on('end', function() {
            fn != undefined && fn(_data);
        });
    });
    req.write(content);
    req.end();
}

// 判断有没有登陆 没有登录就跳转到登陆那里
function loginNow() {
    // let userInfo = wx.getStorageSync('userInfo');
    // if (userInfo == '') {
    //     wx.navigateTo({
    //         url: '/pages/app-auth/index',
    //     });
    //     return false;
    // } else {
    //     return true;
    // }
    //暂时测试 直接返回true
    return true;
}


//获取年月日小时分钟秒
function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 1 => 01
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

// function formatTimeNum(number, format) {

//     var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
//     var returnArr = [];

//     var date = new Date(number * 1000);
//     returnArr.push(date.getFullYear());
//     returnArr.push(formatNumber(date.getMonth() + 1));
//     returnArr.push(formatNumber(date.getDate()));

//     returnArr.push(formatNumber(date.getHours()));
//     returnArr.push(formatNumber(date.getMinutes()));
//     returnArr.push(formatNumber(date.getSeconds()));

//     for (var i in returnArr) {
//         format = format.replace(formateArr[i], returnArr[i]);
//     }
//     return format;
// }

function testMobile(num) {
    console.log
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1})|(16[0-9]{1})|(19[0-9]{1}))+\d{8})$/;
    if (num.length == 0) {
        wx.showToast({
            title: '手机号为空',
            image: '/images/icon/icon_error.png',
        })
        return false;
    } else if (num.length < 11) {
        wx.showToast({
            title: '手机号长度有误！',
            image: '/images/icon/icon_error.png',
        })
        return false;
    } else if (!myreg.test(num)) {
        wx.showToast({
            title: '手机号有误！',
            image: '/images/icon/icon_error.png',
        })
        return false;
    } else {
        return true;
    }
}

function showErrorToast(msg) {
    wx.showToast({
        title: msg,
        icon: 'none',
    })
}

function showSuccessToast(msg) {
    wx.showToast({
        title: msg,
        icon: 'success',
    })
}

function getTextLength(str, full) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        //单字节加1 
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
            len++;
        } else {
            len += (full ? 2 : 1);
        }
    }
    return len;
}

/**
 * rgba(255, 255, 255, 1) => #ffffff
 * @param {String} color 
 */
function transferColor(color = '') {
    let res = '#';
    color = color.replace(/^rgba?\(/, '').replace(/\)$/, '');
    color = color.split(', ');

    color.length > 3 ? color.length = 3 : '';
    for (let item of color) {
        item = parseInt(item || 0);
        if (item < 10) {
            res += ('0' + item)
        } else {
            res += (item.toString(16))
        }
    }

    return res;
}

function transferBorder(border = '') {
    let res = border.match(/(\w+)px\s(\w+)\s(.*)/);
    let obj = {};

    if (res) {
        obj = {
            width: +res[1],
            style: res[2],
            color: res[3]
        }
    }

    return res ? obj : null;
}


/**
 * 内边距，依次为上右下左
 * @param {*} padding 
 */
function transferPadding(padding = '0 0 0 0') {
    padding = padding.split(' ');
    for (let i = 0, len = padding.length; i < len; i++) {
        padding[i] = +padding[i].replace('px', '');
    }

    return padding;
}
/**
 * type1: 0, 25, 17, rgba(0, 0, 0, 0.3)
 * type2: rgba(0, 0, 0, 0.3) 0px 25px 17px 0px => (0, 25, 17, rgba(0, 0, 0, 0.3))
 * @param {*} shadow 
 */
function transferBoxShadow(shadow = '', type) {
    if (!shadow || shadow === 'none') return;
    let color;
    let split;

    split = shadow.match(/(\w+)\s(\w+)\s(\w+)\s(rgb.*)/);

    if (split) {
        split.shift();
        shadow = split;
        color = split[3] || '#ffffff';
    } else {
        split = shadow.split(') ');
        color = split[0] + ')'
        shadow = split[1].split('px ');
    }

    return {
        offsetX: +shadow[0] || 0,
        offsetY: +shadow[1] || 0,
        blur: +shadow[2] || 0,
        color
    }
}

function getUid(prefix) {
    prefix = prefix || '';

    return (
        prefix +
        'xxyxxyxx'.replace(/[xy]/g, c => {
            let r = (Math.random() * 16) | 0;
            let v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        })
    );
}

function add0(m){
    return m<10?'0'+m:m 
}

function rTime(timestamp) {
    // var json_date = new Date(date).toJSON();
    // return new Date(+new Date(json_date) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
    
    var time = new Date(+timestamp * 1000);
    var y = time.getFullYear();
    var m = time.getMonth()+1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);


}


module.exports = {
    formatTime: formatTime,
    // formatTimeNum: formatTimeNum,
    request,
    showErrorToast,
    showSuccessToast,
    checkSession,
    login,
    getUserInfo,
    testMobile,
    sentRes,
    loginNow,
    getTextLength,
    transferBorder,
    transferColor,
    transferPadding,
    transferBoxShadow,
    getUid,
    rTime
}