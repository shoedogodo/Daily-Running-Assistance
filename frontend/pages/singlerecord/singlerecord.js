// pages/singlerecord/singlerecord.js
Page({
    data: {
        latitude: 39.9050,
        longitude: 116.4070,
        markers: [],
        polyline: [{
            points: [],
            color: "#009688",
            width: 5,
            arrowLine: true
        }],
        startTime: '',
        endTime: '',
        meters: '0',
        seconds: '0',
        pace: '0\'00"',
        animationTimer: null,
        currentPointIndex: 0,
        isPanelExpanded: false,
        panelHeight: 200,
        startY: 0
    },

    formatPace: function () {
        const pace = (this.data.meters === 0) ? 0 : Math.round(this.data.seconds * 1000 / this.data.meters);
        const minutes = Math.floor(pace / 60);
        const seconds = (pace % 60).toString().padStart(2, '0');
        this.setData({
            pace: `${minutes}'${seconds}"`
        });
    },

    // 评估体力消耗的函数
    calculateExertionLevel: function (data) {
        // 数据验证
        if (!data || !data.meters || !data.seconds || data.meters <= 0 || data.seconds <= 0) {
            return '数据无效';
        }

        // 基础数据计算
        const distance = data.meters / 1000; // 转换为公里
        const duration = data.seconds / 60; // 转换为分钟
        const speed = (distance / duration) * 60; // 速度(公里/小时)

        let exertionScore = 0;

        // 1. 基于速度的评分 (40分)
        if (speed >= 12) exertionScore += 40; // 配速 5分钟/公里
        else if (speed >= 10) exertionScore += 35; // 配速 6分钟/公里
        else if (speed >= 8) exertionScore += 30; // 配速 7.5分钟/公里
        else if (speed >= 6) exertionScore += 25; // 配速 10分钟/公里
        else exertionScore += 20;

        // 2. 基于距离的评分 (40分)
        if (distance >= 10) exertionScore += 40;
        else if (distance >= 5) exertionScore += 35;
        else if (distance >= 3) exertionScore += 30;
        else if (distance >= 1) exertionScore += 25;
        else exertionScore += 20;

        // 3. 基于持续时间的评分 (20分)
        if (duration >= 60) exertionScore += 20; // 1小时以上
        else if (duration >= 45) exertionScore += 18; // 45分钟以上
        else if (duration >= 30) exertionScore += 15; // 30分钟以上
        else if (duration >= 15) exertionScore += 12; // 15分钟以上
        else exertionScore += 10;

        // 评估结果 (总分100分)
        let level = 0;
        if (exertionScore >= 90) {
            level = 5;
        } else if (exertionScore >= 75) {
            level = 4;
        } else if (exertionScore >= 60) {
            level = 3;
        } else if (exertionScore >= 45) {
            level = 2;
        } else {
            level = 1;
        }

        return level;
    },

    padStart: function (str, targetLength, padString) {
        str = String(str);
        if (str.length >= targetLength) {
            return str;
        }
        padString = String(padString || '0');
        const padding = padString.repeat(targetLength - str.length);
        return padding + str;
    },

    // 格式化时间显示
    formatDateTime: function (isoString) {
        const date = new Date(isoString);
        return `${date.getFullYear()}-${this.padStart(date.getMonth()+1, 2, '0')}-${this.padStart(date.getDate(), 2, '0')} ${this.padStart(date.getHours(), 2, '0')}:${this.padStart(date.getMinutes(), 2, '0')}:${this.padStart(date.getSeconds(), 2, '0')}`;
    },

    onLoad: function (options) {
        // 获取数据
        const app = getApp();
        if (app.globalData.currentRunData) {
            // 从markers生成完整的路线
            const points = app.globalData.currentRunData.runRecord.markers.map(marker => ({
                latitude: marker.latitude,
                longitude: marker.longitude
            }));

            this.setData({
                latitude: app.globalData.currentRunData.runRecord.markers[0].latitude,
                longitude: app.globalData.currentRunData.runRecord.markers[0].longitude,
                meters: app.globalData.currentRunData.runRecord.meters,
                seconds: app.globalData.currentRunData.runRecord.seconds,
                markers: app.globalData.currentRunData.runRecord.markers.map(marker => ({
                    ...marker,
                    width: 0, // 添加固定宽度
                    height: 0, // 添加固定高度
                    alpha: 0
                })),
                startTime: this.formatDateTime(app.globalData.currentRunData.runRecord.start),
                endTime: this.formatDateTime(app.globalData.currentRunData.runRecord.end),
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
            // 启动轨迹回放动画
            setTimeout(() => {
                this.startTrackAnimation(app.globalData.currentRunData.runRecord.markers);
            }, 500); // 稍微延迟启动动画，确保地图和标记都已经加载
        }
        this.formatPace();
        this.mapCtx = wx.createMapContext('map');
        // 根据体力消耗等级设置建议
        const exertionLevel = this.calculateExertionLevel(this.data);
        let suggestion = '';

        switch (exertionLevel) {
            case 5:
                suggestion = "建议休息48-72小时。请保证睡眠质量（8-9小时），补充蛋白质和碳水化合物，进行轻度拉伸，可以冷敷或冰浴缓解肌肉疲劳。避免高强度运动，以恢复性训练为主。";
                break;
            case 4:
                suggestion = "建议休息24-48小时。请保证充足睡眠（7-8小时），注意补充营养，可以进行20分钟轻度有氧运动或拉伸。适度按摩或泡温水澡有助于帮助恢复。";
                break;
            case 3:
                suggestion = "建议休息24小时。请保持正常作息，可以进行30分钟中等强度有氧运动或力量训练。注意补充水分和适量蛋白质，帮助肌肉恢复。";
                break;
            case 2:
                suggestion = "可以继续进行训练，建议适当增加运动强度或时长。注意在运动前做足热身，合理安排训练计划。可以尝试增加配速或距离来提高训练效果。";
                break;
            case 1:
                suggestion = "当前运动强度较低，建议逐步增加运动量。可以尝试增加运动时间或强度，建议制定循序渐进的训练计划。注意保持运动的持续性和规律性。";
                break;
            default:
                suggestion = "数据无效，无法提供建议。请确保正确记录运动数据。";
        }
        this.setData({
            suggestion: "运动建议：" + suggestion
        })
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
                    ...originalMarkers, // 保留起终点标记
                    {
                        id: 9999, // 使用不会与起终点冲突的id
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
        }, 500);

        this.setData({
            animationTimer: timer
        });
    },

    // 处理触摸开始事件
    handleTouchStart: function (e) {
        this.setData({
            startY: e.touches[0].clientY
        });
    },

    // 处理触摸移动事件
    handleTouchMove: function (e) {
        const currentY = e.touches[0].clientY;
        const moveDistance = this.data.startY - currentY;

        // 计算新的面板高度
        let newHeight = this.data.panelHeight + moveDistance;

        // 限制面板高度的范围
        newHeight = Math.max(200, Math.min(newHeight, 500));

        this.setData({
            panelHeight: newHeight,
            isPanelExpanded: newHeight > 300,
            startY: currentY
        });
    },

    // 处理触摸结束事件
    handleTouchEnd: function () {
        // 根据当前高度决定是否自动展开或收起
        const finalHeight = this.data.isPanelExpanded ? 500 : 200;
        this.setData({
            panelHeight: finalHeight
        });
    }
});