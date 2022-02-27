function reTime(time, timeId, that) {
    let endTime = time ;
    that.setData({
        [timeId]: {
            day: _format(parseInt((endTime - new Date().getTime())  / 60 / 60 / 24)),
            hour: _format(parseInt((endTime - new Date().getTime())  / 60 / 60 % 24)),
            minute: _format(parseInt((endTime - new Date().getTime()) / 60 % 60)),
        }
    })
}

function _format(time) {
    if (time >= 10) {
        return time
    } else {
        return '0' + time
    }
}

module.exports = {
    reTime
}