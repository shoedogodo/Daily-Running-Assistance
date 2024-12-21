// pages/multiple/multiple.js
const app = require('../../app.js');
const util = require('../../utils/util.js');

Page({
    /**
     * 页面的初始数据
     */
    data: {
        username: '',
        roomID: '',
        password: '',
        verifiedRoomID: '', // this is the roomID passed onto multipl_run
    },

    bindRoomIdInput: function (e) {
        this.setData({
            roomID: e.detail.value
        });
    },

    bindPasswordInput: function (e) {
        this.setData({
            password: e.detail.value
        });
    },

    createGroup() {
        const {
            roomID,
            password
        } = this.data;
        const data = {
            runID: roomID,
            password
        };

        if (!roomID) {
            wx.showToast({
                title: '请输入房间号!',
                icon: 'none',
            });
            return;
        }

        if (!password) {
            wx.showToast({
                title: '请输入房间密码!',
                icon: 'none',
            });
            return;
        }

        wx.request({
            url: `http://124.221.96.133:8000/api/runRoom/create`,
            method: 'POST',
            data: data,
            success: (res) => {
                if (res.statusCode === 201) {
                    wx.showToast({
                        title: '房间创建成功!',
                        icon: 'success',
                    });
                    // Perform any additional actions after successful room creation
                } else {
                    wx.showToast({
                        title: '房间创建失败!',
                        icon: 'none',
                    });
                    console.error('Error creating room:', res.data.error);
                }
            },
            fail: (error) => {
                wx.showToast({
                    title: '请求失败!',
                    icon: 'none',
                });
                console.error('Request failed:', error);
            },
        });
    },

    joinGroup() {
        const {
            roomID,
            password,
            username
        } = this.data;
        const data = {
            runID: roomID,
            password,
            username
        };

        if (!roomID) {
            wx.showToast({
                title: '请输入房间号!',
                icon: 'none',
            });
            return;
        }

        if (!password) {
            wx.showToast({
                title: '请输入房间密码!',
                icon: 'none',
            });
            return;
        }

        wx.request({
            url: `http://124.221.96.133:8000/api/runRoom/join`,
            method: 'POST',
            data: data,
            success: (res) => {
                if (res.statusCode === 200) {
                    wx.showToast({
                        title: '加入房间成功!',
                        icon: 'success',
                    });

                    wx.setStorageSync('verifiedRoomID', roomID),

                        // Navigate to the multiple_run room
                        wx.navigateTo({
                            url: '../multiple_run/multiple_run',
                            success: function () {
                                console.log('Navigation succeeded');
                            },
                            fail: function (error) {
                                console.error('Navigation failed', error);
                            }
                        });
                } else {
                    wx.showToast({
                        title: '加入房间失败!',
                        icon: 'none',
                    });
                    console.error('Error joining room:', res.data.error);
                }
            },
            fail: (error) => {
                wx.showToast({
                    title: '请求失败!',
                    icon: 'none',
                });
                console.error('Request failed:', error);
            },
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        app.tokenCheck();

        const date = new Date();
        this.setData({
            formattedDate: util.formatDate(date)
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
                // 更新地图中心位置
                // this.mapCtx.moveToLocation();
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
    },


})