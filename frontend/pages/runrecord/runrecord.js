// pages/runrecord/runrecord.js
const app = require('../../app.js');

Page({

    data: {
        records: []
    },

    onLoad: function (options) {
        const that = this;
        app.tokenCheck();
        const username = wx.getStorageSync('username');
        if (!username) {
            wx.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        wx.showLoading({
            title: '加载中...',
        });

        wx.request({
            url: `http://124.221.96.133:8000/api/users/run/records/${username}`,
            method: 'GET',
            success: function (res) {
                if (res.data && res.data.records && res.data.records.length > 0) {
                    that.processRecords(res.data.records);
                    console.log('成功获取数据');
                } else {
                    wx.showToast({
                        title: '暂无跑步记录',
                        icon: 'none',
                        duration: 2000
                    });
                }
            },
            fail: function (err) {
                console.error('获取跑步记录失败:', err);
                wx.showToast({
                    title: '获取记录失败',
                    icon: 'none',
                    duration: 2000
                });
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },


    processRecords: function (records) {
        // 预防空数据
        if (!Array.isArray(records)) {
            console.error('records is not an array:', records);
            return;
        }

        const processedRecords = records.map(record => {
            try {
                // 格式化日期
                const startDate = new Date(record.start);
                const formattedDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')} ${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;

                // 格式化距离
                const formattedDistance = (record.meters / 1000).toFixed(2) + ' km';

                // 格式化时长
                const minutes = Math.floor(record.seconds / 60);
                const seconds = record.seconds % 60;
                const formattedDuration = `${minutes}'${seconds.toString().padStart(2, '0')}"`;

                // 计算配速 (分钟/公里)
                let pace = '- -';
                if (record.meters > 0) { // 防止除以0
                    const paceMinutes = Math.floor((record.seconds / 60) / (record.meters / 1000));
                    const paceSeconds = Math.floor(((record.seconds / 60) / (record.meters / 1000) % 1) * 60);
                    pace = `${paceMinutes}'${paceSeconds.toString().padStart(2, '0')}/km`;
                }

                // 创建新对象，不使用展开运算符
                return {
                    runId: record.runId,
                    meters: record.meters,
                    seconds: record.seconds,
                    markers: record.markers,
                    start: record.start,
                    end: record.end,
                    timestamp: record.timestamp,
                    _id: record._id,
                    formattedDate: formattedDate,
                    formattedDistance: formattedDistance,
                    formattedDuration: formattedDuration,
                    pace: pace
                };
            } catch (error) {
                console.error('处理记录出错:', error, record);
                return null;
            }
        }).filter(record => record !== null); // 过滤掉处理失败的记录

        this.setData({
            records: processedRecords
        });
    },

    onRecordClick: function(e) {
        // 获取点击的记录数据
        const record = e.currentTarget.dataset.record;
        
        // 构造 runData 对象
        const runData = {
            username: wx.getStorageSync('username'),
            runRecord: {
                meters: record.meters,
                seconds: record.seconds,
                markers: record.markers,
                start: record.start,
                end: record.end
            }
        };
        
        // 设置全局数据
        const app = getApp();
        app.globalData.currentRunData = runData;
        
        // 跳转到详情页
        wx.navigateTo({
            url: '../singlerecord/singlerecord'
        });
    },
})