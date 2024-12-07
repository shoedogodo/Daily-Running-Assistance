// pages/single/single.js
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
        paceFormatted: '', // 格式化配速输出
        startTime: '' // 开始跑步时间
    },

    formatPace: function () {
        const pace = (this.data.meters === 0) ? 0 : Math.round(this.data.seconds * 1000 / this.data.meters);
        const minutes = Math.floor(pace / 60);
        const seconds = (pace % 60).toString().padStart(2, '0');
        this.setData({
            paceFormatted: `${minutes}'${seconds}"`
        });
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

        this.formatPace();
    },

    startRun: function (e) {
        this.setData({
            running: !this.data.running
        })
        if (this.data.running == true) {
            console.log("开始跑步")
            this.interval = setInterval(this.record.bind(this), this.data.interval);
            if (this.data.startTime === '') {
                this.setData({
                    startTime: new Date().toISOString()
                });
            }
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
                if (pace > 5) {
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
            this.formatPace();
        })
    },

    endRun: function (e) {
        // 如果轨迹点数少于两点，直接返回
        if (this.data.markers.length < 2) {
            console.log("你没有开始跑步！");
            return;
        }

        // 停止记录
        this.setData({
            running: false
        });
        clearInterval(this.interval);

        // 准备发送给后端的数据
        const runData = {
            data: {
                meters: this.data.meters,
                seconds: this.data.seconds,
                latitude: this.data.latitude,
                longitude: this.data.longitude,
                running: false,
                markers: this.data.markers,
                start: this.data.startTime, 
                end: new Date().toISOString()
            }
        };

        // 发送请求到后端
        wx.request({
            url: 'http://124.221.96.133:8000/api/users/sendRunData', 
            method: 'POST',
            data: runData,
            header: {
                'content-type': 'application/json',
            },
            success: (res) => {
                console.log('跑步数据上传成功:', res);
                // 上传成功后跳转到记录页面
                wx.navigateTo({
                    url: '../singlerecord/singlerecord',
                });
            },
            fail: (error) => {
                console.error('跑步数据上传失败:', error);
                wx.showToast({
                    title: '数据上传失败，请重试',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    }

});