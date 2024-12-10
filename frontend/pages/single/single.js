const utils = require('../../utils/util')

Page({
    /**
     * 页面的初始数据
     */
    data: {
        meters: 0, // 里程，单位米
        seconds: 0, // 时间，单位秒
        latitude: 39.9050, // 纬度
        longitude: 116.4070, // 经度
        running: false, // 是否开始
        interval: 1000, // 定位更新间隔，单位毫秒
        markers: [], // 标记
        showMap: false, // 控制地图是否显示
        polyline: [], // 路线
        userName: '', // 用户名
    },

    /**
     * 页面的生命周期函数--页面加载时调用
     */
    onLoad() {
        //格式化日期 xxxx/xx/xx
        const date = new Date();
        this.setData({
            formattedDate: utils.formatDate(date),
        });

        this.mapCtx = wx.createMapContext('map');
        wx.getLocation({
            type: 'gcj02', // 使用中国国内的坐标系
            success: (res) => { // 获取位置成功时的回调
                console.log('获取位置成功')
                this.setData({
                    latitude: res.latitude,
                    longitude: res.longitude,
                    showMap: true,
                });
            },
            fail: (error) => { // 获取位置失败时的回调
                console.error('获取位置失败', error);
                wx.showToast({
                    title: '无法获取位置信息',
                    icon: 'none',
                });
            },
        });

        const userName = wx.getStorageSync('userName');
        if (userName) {
            this.setData({
                userName: userName,
            });
        }

    },

    startRun: function (e) {
        this.setData({
            running: !this.data.running
        })
        if (this.data.running == true) {
            console.log("开始跑步")
            this.interval = setInterval(this.record.bind(this), this.data.interval);
        } else {
            console.log("暂停/结束跑步")
            clearInterval(this.interval);
        }
    },

    record() {
        //没有开始跑步就不记录
        if (!this.data.running) {
            return
        }
        this.setData({
            seconds: this.data.seconds + this.data.interval / 1000
        })
        // if (this.data.seconds % 3 !== 0) {
        //     return;
        // }
        wx.getLocation({
            type: 'gcj02',
        }).then(res => {
            //当前标记位置信息
            let newMarker = {
                latitude: res.latitude,
                longitude: res.longitude,
                id: this.data.markers.length + 1
            }
            let markers = Array.isArray(this.data.markers) ? this.data.markers : [];
            let pace = 0;
            if (markers.length > 0) {
                let lastMarker = markers.slice(-1)[0]
                //根据上一次标记点和当前标记点计算距离，超出5m添加标记
                pace = utils.getDistance(lastMarker.latitude, lastMarker.longitude, newMarker.latitude, newMarker.longitude);
                pace = parseFloat(pace.toFixed(1))
                if (pace > 1) {
                    markers.push(newMarker);
                    console.log("dot");
                } else {
                    pace = 0;
                    console.log("here")
                }
            } else {
                markers.push(newMarker);
            }
            this.setData({
                latitude: res.latitude,
                longitude: res.longitude,
                markers,
                polyline: [{
                    points: markers.length > 0 ? markers.map(marker => ({
                        latitude: marker.latitude,
                        longitude: marker.longitude
                    })) : [],
                    color: "#FFA500",
                    width: 5,
                    dottedLine: false,
                }],
                meters: this.data.meters + pace,
            })
        })
    },

    endRun: function (e) {
        console.log('meters: ' + this.data.meters);
        console.log('seconds: ' + this.data.seconds);
        console.log('latitude: ' + this.data.latitude);
        console.log('longitude: ' + this.data.longitude);
        console.log('running: ' + this.data.running);
        console.log('interval: ' + this.data.interval);
        console.log('markers: ' + this.data.markers);
        console.log('showMap: ' + this.data.showMap);
        console.log('polyline: ' + this.data.polyline);
        console.log('userName: ' + this.data.userName);

        wx.navigateTo({
            url: '../singlerecord/singlerecord',
        })
    }

    // translateMarker: function (e) {
    //     let markers = this.data.markers;
    //     console.log(markers.length);

    //     // 确保有足够的标记点可以进行回放
    //     if (markers.length < 2) {
    //         console.log('标记点不足以进行回放');
    //         return;
    //     }

    //     let ii = 0;
    //     const that = this;

    //     // 使用循环而不是递归进行标记点的回放
    //     const replayTrack = () => {
    //         if (ii >= markers.length - 1) {
    //             console.log('所有标记点已经完成回放');
    //             return;
    //         }

    //         let markerId = markers[ii].id;
    //         let destination = {
    //             longitude: markers[ii + 1].longitude,
    //             latitude: markers[ii + 1].latitude,
    //         };

    //         // 根据两个标记点之间的距离，计算移动的持续时间
    //         let duration = utils.getDistance(
    //             markers[ii].latitude,
    //             markers[ii].longitude,
    //             markers[ii + 1].latitude,
    //             markers[ii + 1].longitude
    //         ) * 5;

    //         // 使用 MapContext.translateMarker 实现轨迹回放
    //         that.mapCtx.translateMarker({
    //             markerId: markerId, // 当前标记点
    //             destination: destination, // 要移动到的下一个标记点
    //             autoRotate: false, // 关闭旋转
    //             duration: duration, // 动画时长
    //             success(res) {
    //                 // 更新 ii 的值，准备移动到下一个标记点
    //                 ii += 1;
    //                 // 调用下一次标记点的移动
    //                 replayTrack();
    //             },
    //             fail(err) {
    //                 console.log('fail', err);
    //             },
    //         });
    //     };

    //     // 启动回放
    //     replayTrack();
    // }


});