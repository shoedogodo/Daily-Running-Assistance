// pages/singlerecord/singlerecord.js
Page({
    data: {
        latitude: 39.9050,
        longitude: 116.4070,
        markers: [],
        polyline: [{
            points: [],
            color: "#FF4500",
            width: 4,
            arrowLine: true
        }],
        starttime: '',
        endtime: '',
        meters: '0',
        seconds: '0',
        pace: '0\'00"',
        animationTimer: null,
        currentPointIndex: 0
    },

    onLoad: function (options) {
        // 从服务器获取数据
        this.fetchRecordData();
    },

    onUnload: function () {
        // 清除动画定时器
        if (this.data.animationTimer) {
            clearInterval(this.data.animationTimer);
        }
    },

    fetchRecordData: function () {
        // 这里替换为实际的API调用
        wx.request({
            url: 'YOUR_API_ENDPOINT',
            method: 'GET',
            success: (res) => {
                const data = res.data.data;

                // 更新基础数据
                this.setData({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    starttime: this.formatTime(new Date(data.start)),
                    endtime: this.formatTime(new Date(data.end)),
                    meters: (data.meters / 1000).toFixed(2) + ' km',
                    seconds: this.formatDuration(data.seconds),
                    pace: this.calculatePace(data.meters, data.seconds)
                });

                // 如果有markers数据，开始动画
                if (data.markers && data.markers.length > 0) {
                    this.startTrackAnimation(data.markers);
                }
            },
            fail: (error) => {
                console.error('获取数据失败：', error);
                wx.showToast({
                    title: '数据加载失败',
                    icon: 'none'
                });
            }
        });
    },

    startTrackAnimation: function (markers) {
        // 清除之前的动画
        if (this.data.animationTimer) {
            clearInterval(this.data.animationTimer);
        }

        // 设置初始点
        this.setData({
            'polyline[0].points': [],
            currentPointIndex: 0
        });

        // 创建动画定时器
        const timer = setInterval(() => {
            const points = this.data.polyline[0].points;
            const currentMarker = markers[this.data.currentPointIndex];

            // 添加新的点到路线
            points.push({
                latitude: currentMarker.latitude,
                longitude: currentMarker.longitude
            });

            // 更新地图显示
            this.setData({
                'polyline[0].points': points,
                markers: [{
                    id: 1,
                    latitude: currentMarker.latitude,
                    longitude: currentMarker.longitude,
                    width: 20,
                    height: 20,
                    iconPath: '../../images/location.png' // 确保有这个图片资源
                }]
            });

            // 移动到下一个点
            this.data.currentPointIndex++;

            // 如果到达终点，重新开始动画
            if (this.data.currentPointIndex >= markers.length) {
                this.data.currentPointIndex = 0;
                this.setData({
                    'polyline[0].points': []
                });
            }
        }, 100); // 每100ms移动一次

        this.setData({
            animationTimer: timer
        });
    },

    formatTime: function (date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        return `${year}-${this.padZero(month)}-${this.padZero(day)} ${this.padZero(hour)}:${this.padZero(minute)}`;
    },

    formatDuration: function (seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
    },

    calculatePace: function (meters, seconds) {
        if (meters <= 0) return "0'00\"";
        const pace = (seconds / 60) / (meters / 1000); // 分钟/公里
        const paceMinutes = Math.floor(pace);
        const paceSeconds = Math.round((pace - paceMinutes) * 60);
        return `${paceMinutes}'${this.padZero(paceSeconds)}"`;
    },

    padZero: function (num) {
        return num < 10 ? `0${num}` : num;
    }
});