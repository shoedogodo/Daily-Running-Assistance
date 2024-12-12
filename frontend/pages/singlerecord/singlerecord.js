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

    formatPace: function () {
        const pace = (this.data.meters === 0) ? 0 : Math.round(this.data.seconds * 1000 / this.data.meters);
        const minutes = Math.floor(pace / 60);
        const seconds = (pace % 60).toString().padStart(2, '0');
        this.setData({
            pace: `${minutes}'${seconds}"`
        });
    },

    onLoad: function (options) {
        // 获取数据
        const app = getApp();
        if (app.globalData.currentRunData) {
            // 从markers生成完整的路线
            const points = app.globalData.currentRunData.markers.map(marker => ({
                latitude: marker.latitude,
                longitude: marker.longitude
            }));

            this.setData({
                latitude: app.globalData.currentRunData.latitude,
                longitude: app.globalData.currentRunData.longitude,
                meters: app.globalData.currentRunData.meters,
                seconds: app.globalData.currentRunData.seconds,
                markers: app.globalData.currentRunData.markers,
                starttime: app.globalData.currentRunData.start,
                endtime: app.globalData.currentRunData.end,
                // 设置完整路线
                'polyline[0].points': points
            });

            // 添加起点和终点标记
            if (points.length > 0) {
                this.setData({
                    markers: [{
                            id: 0,
                            latitude: points[0].latitude,
                            longitude: points[0].longitude,
                            width: 25,
                            height: 25,
                            iconPath: '../../images/startend-icon.png', // 起点图标
                            title: '起点'
                        },
                        {
                            id: 1,
                            latitude: points[points.length - 1].latitude,
                            longitude: points[points.length - 1].longitude,
                            width: 25,
                            height: 25,
                            iconPath: '../../images/startend-icon.png', // 终点图标
                            title: '终点'
                        }
                    ]
                });
            }
        }
        this.formatPace();
        this.mapCtx = wx.createMapContext('map');
    },

    onUnload: function () {
        // 清除动画定时器
        if (this.data.animationTimer) {
            clearInterval(this.data.animationTimer);
        }
    },

    startTrackAnimation: function (markers) {
        if (this.data.animationTimer) {
            clearInterval(this.data.animationTimer);
        }
    
        this.setData({
            currentPointIndex: 0
        });
    
        // 获取原有的起终点标记
        const originalMarkers = this.data.markers;
    
        const timer = setInterval(() => {
            const currentMarker = markers[this.data.currentPointIndex];
            
            // 更新动态标记，保留原有的起终点标记
            this.setData({
                markers: [
                    ...originalMarkers,  // 保留起终点标记
                    {
                        id: 999,  // 使用不会与起终点冲突的id
                        latitude: currentMarker.latitude,
                        longitude: currentMarker.longitude,
                        width: 20,
                        height: 20,
                        iconPath: '../../images/location-icon.png'
                    }
                ]
            });
    
            this.data.currentPointIndex++;
    
            if (this.data.currentPointIndex >= markers.length) {
                this.data.currentPointIndex = 0;
            }
        }, 100);
    
        this.setData({
            animationTimer: timer
        });
    },
});