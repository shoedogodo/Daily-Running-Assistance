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

        users: [{
                profilePic: '../../images/my-icon.png',
                username: 'NULL'
            },
            {
                profilePic: '../../images/my-icon.png',
                username: 'NULL'
            },
            {
                profilePic: '../../images/my-icon.png',
                username: 'NULL'
            },
            {
                profilePic: '../../images/my-icon.png',
                username: 'NULL'
            },
            {
                profilePic: '../../images/my-icon.png',
                username: 'NULL'
            },
            {
                profilePic: '../../images/my-icon.png',
                username: 'NULL'
            },
            {
                profilePic: '../../images/my-icon.png',
                username: 'NULL'
            },
            {
                profilePic: '../../images/my-icon.png',
                username: 'NULL'
            },
            {
                profilePic: '../../images/my-icon.png',
                username: 'NULL'
            },
        ],

        verifiedRoomID: '',
        otherRunnersMarkers: [], // 其他跑步者的位置标记
        lastUpdateTime: null, // 上次更新时间
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
                title: '房间号不可用',
                icon: 'error'
            });
            return;
        }

        // Make the GET request with runID as part of the URL path
        wx.request({
            url: global.utils.getAPI(global.utils.serverURL, `/api/runRoom/${runID}`), // Use getAPI to construct the URL
            method: 'GET', // Make sure it's a GET request
            success(res) {
                if (res.data.success && res.data.code === 'ROOM_FOUND') {
                    // On success, extract the 'runners' array
                    const users = res.data.data.runners.map(user => ({
                        username: user.username,
                        profilePic: user.profile_pic, // Assuming the 'profile_pic' is a URL or valid image path
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
                        title: '加载用户失败',
                        icon: 'none'
                    });
                }
            },
            fail(err) {
                wx.showToast({
                    title: '获取数据失败',
                    icon: 'none'
                });
            }
        });

        this.formatPace();
        this.otherRunnersInterval = setInterval(this.updateOtherRunners.bind(this), 5000);
    },

    updateOtherRunners() {
        const runID = this.data.verifiedRoomID;
        if (!runID) return;

        wx.request({
            url: global.utils.getAPI(global.utils.serverURL, `/api/runRoom/${runID}`),
            method: 'GET',
            success: (res) => {
                if (res.data.success && res.data.code === 'ROOM_FOUND') {
                    // 过滤掉当前用户和不在房间内的用户
                    const currentUsername = wx.getStorageSync('username');
                    const otherRunners = res.data.data.runners.filter(
                        runner => runner.username !== currentUsername && runner.in_room === true
                    );

                    // 更新其他跑步者的标记
                    const otherRunnersMarkers = otherRunners.map((runner, index) => ({
                        id: `other-${index}`,
                        latitude: runner.latitude,
                        longitude: runner.longitude,
                        width: 30,
                        height: 30,
                        iconPath: '../../images/other-runner.png',
                        callout: {
                            content: runner.nickname || runner.username, // 优先显示昵称
                            color: '#000000',
                            fontSize: 14,
                            borderRadius: 5,
                            padding: 5,
                            display: 'ALWAYS',
                            textAlign: 'center',
                            bgColor: '#ffffff'
                        }
                    }));

                    // 更新用户列表数据
                    const updatedUsers = res.data.data.runners.map(runner => ({
                        profilePic: runner.profile_pic || '../../images/my-icon.png',
                        username: runner.username,
                        nickname: runner.nickname,
                        meters: runner.meters,
                        seconds: runner.seconds,
                        running: runner.running,
                        marathonPlace: runner.marathon_place
                    }));

                    this.setData({
                        otherRunnersMarkers,
                        users: updatedUsers
                    });

                    // 更新界面上其他用户的跑步数据
                    otherRunners.forEach(runner => {
                        if (runner.running) {
                            // 可以添加额外的UI更新逻辑，比如显示其他跑步者的实时数据
                            console.log(`${runner.nickname || runner.username}: ${runner.meters}米`);
                        }
                    });
                }
            },
            fail: (error) => {
                console.error('获取房间数据失败:', error);
            }
        });
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
        const runID = this.data.verifiedRoomID;
        if (!runID) return;
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
                id: this.data.markers.length + 1,
                width: 0,
                height: 0,
                alpha: 0
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
                    color: "#009688",
                    width: 5,
                    dottedLine: false,
                    arrowLine: false
                }],
                meters: parseFloat((this.data.meters + pace).toFixed(1))
            })
            this.formatPace();
            // 准备要发送到服务器的数据
            const updateData = {
                username: wx.getStorageSync('username'),
                runData: {
                    meters: parseFloat((this.data.meters).toFixed(1)),
                    seconds: this.data.seconds,
                    latitude: res.latitude,
                    longitude: res.longitude,
                    running: this.data.running,
                    markers: markers,
                    start: this.data.startTime,
                }
            };

            // 发送位置更新到服务器
            wx.request({
                url: global.utils.getAPI(global.utils.serverURL, `/api/users/run/data`),
                method: 'POST',
                data: updateData,
                success: (res) => {
                    if (res.data.success) {
                        console.log('更新位置成功');
                    }
                }
            });

        })
    },

    endRun: function (e) {

        // 如果轨迹点数少于两点，直接返回
        if (this.data.markers.length < 2) {
            console.log("你没有开始跑步！");
            wx.showToast({
                title: '你没有开始跑步！',
                icon: 'error'
            })
            return;
        }

        // 停止记录
        this.setData({
            running: false
        });
        clearInterval(this.interval);
        clearInterval(this.otherRunnersInterval);

        // 准备发送给后端的数据
        const runData = {
            username: wx.getStorageSync('username'), // 这里需要替换为实际的用户名
            runRecord: {
                meters: this.data.meters,
                seconds: this.data.seconds,
                markers: this.data.markers.map(marker => ({
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                    id: marker.id
                })),
                start: this.data.startTime,
                end: new Date().toISOString()
            }
        };

        // 在把数据发送到后端之前，先将数据存进globalData
        const app = getApp();
        app.globalData.currentRunData = runData;

        // 发送请求到后端
        wx.request({
            url: 'http://124.221.96.133:8000/api/users/run/record',
            method: 'POST',
            data: runData,
            success: (res) => {
                console.log('跑步数据上传成功:', res);
                // 上传成功后跳转到记录页面
                wx.navigateTo({
                    url: '../singlerecord/singlerecord',
                });
            },
            fail: (error) => {
                console.error('跑步数据上传失败:', error);
                wx.showModal({
                    title: '上传失败',
                    content: '是否重试上传数据？',
                    success: (res) => {
                        if (res.confirm) {
                            this.endRun(e); // 重试
                        } else {
                            wx.navigateTo({
                                url: '../singlerecord/singlerecord'
                            });
                        }
                    }
                });
            }
        });

    },

    onUnload() {
        // 页面卸载时清除所有定时器
        if (this.interval) {
            clearInterval(this.interval);
        }
        if (this.otherRunnersInterval) {
            clearInterval(this.otherRunnersInterval);
        }
    }
});