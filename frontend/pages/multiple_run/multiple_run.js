// pages/multiple_run.js
const utils = require('../../utils/util.js')
const app = require('../../app.js');

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
        startTime: '', // 开始跑步时间

        users: [
            { profilePic: '../../images/my-icon.png', username: 'NULL' },
            { profilePic: '../../images/my-icon.png', username: 'NULL' },
            { profilePic: '../../images/my-icon.png', username: 'NULL' },
            { profilePic: '../../images/my-icon.png', username: 'NULL' },
            { profilePic: '../../images/my-icon.png', username: 'NULL' },
            { profilePic: '../../images/my-icon.png', username: 'NULL' },
            { profilePic: '../../images/my-icon.png', username: 'NULL' },
            { profilePic: '../../images/my-icon.png', username: 'NULL' },
            { profilePic: '../../images/my-icon.png', username: 'NULL' },
        ],

        verifiedRoomID: '',
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
        app.tokenCheck();
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

        const username = wx.getStorageSync('username');
        if (username) {
            this.setData({
                username: username,
            });
        }

        const verifiedRoomID = wx.getStorageSync('verifiedRoomID');
        if (verifiedRoomID) {
            this.setData({
                verifiedRoomID: verifiedRoomID,
            });
        }

        const that = this;

        // Make sure the verifiedRoomID is set correctly
        const runID = that.data.verifiedRoomID;

        // Check if the runID is available
        if (!runID) {
            wx.showToast({
                title: 'Room ID is not available',
                icon: 'none'
            });
            return;
        }

        // Make the GET request with runID as part of the URL path
        wx.request({
            url: global.utils.getAPI(global.utils.serverURL, `/api/runRoom/${runID}`),  // Use getAPI to construct the URL
            method: 'GET',  // Make sure it's a GET request
            success(res) {
                if (res.data.success && res.data.code === 'ROOM_FOUND') {
                    // On success, extract the 'runners' array
                    const users = res.data.data.runners.map(user => ({
                        username: user.username,
                        profilePic: user.profile_pic,  // Assuming the 'profile_pic' is a URL or valid image path
                        latitude: user.latitude,
                        longitude: user.longitude,
                    }));

                    // Print the users array to the console for testing
                    console.log('Users:', users);

                    // Update the page's data to display users
                    that.setData({
                        users: users
                    });
                } else {
                    wx.showToast({
                        title: 'Failed to load users',
                        icon: 'none'
                    });
                }
            },
            fail(err) {
                wx.showToast({
                    title: 'Error fetching data',
                    icon: 'none'
                });
            }
        });

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
                meters: parseFloat((this.data.meters + pace).toFixed(1))
            })
            this.formatPace();
        })
    },

    endRun: function (e) {
        // 准备发送给后端的数据
        const runData = {
            username: "SHIKAI", // 这里需要替换为实际的用户名
            runRecord: {
                meters: 300.0,
                seconds: 100,
                markers: [{
                        "latitude": 40.00564480251736,
                        "longitude": 116.32357964409722,
                        "id": 1
                    },
                    {
                        "latitude": 40.00570556640625,
                        "longitude": 116.32352349175348,
                        "id": 2
                    },
                    {
                        "latitude": 40.00576822916667,
                        "longitude": 116.32327690972222,
                        "id": 3
                    },
                    {
                        "latitude": 40.005847981770835,
                        "longitude": 116.32312879774305,
                        "id": 4
                    },
                    {
                        "latitude": 40.00602891710069,
                        "longitude": 116.32269151475694,
                        "id": 5
                    },
                    {
                        "latitude": 40.005878092447915,
                        "longitude": 116.32220882161459,
                        "id": 6
                    },
                    {
                        "latitude": 40.00590556640625,
                        "longitude": 116.32352349175348,
                        "id": 7
                    },
                    {
                        "latitude": 40.00594480251736,
                        "longitude": 116.32357964409722,
                        "id": 8
                    }
                ],
                start: "2024-12-14T14:33:07.392Z",
                end: "2024-12-14T14:36:28.952Z"
            }
        };
        const app = getApp();
        app.globalData.currentRunData = runData;
        wx.navigateTo({
            url: '../singlerecord/singlerecord',
        });
        return;
    }

});