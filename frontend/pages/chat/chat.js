// pages/AIchat/AIchat.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        nickname: '', // 从用户信息中获取的昵称
        userName: 'username', // 从用户信息中获取的用户名
        messages: [], // 存储聊天消息的数组
        messageInput: '', // 用户输入的消息
        pageContext: this, //当前页面的引用
        fromUser: false, //bool变量，表示当前是否消息由用户发出
    },

    /**
     * 获取用户输入
     */
    inputMessage: function (e) {
        this.setData({
            messageInput: e.detail.value,
        });
    },

    /**
     * 点击发送按钮，发送信息并更新对话列表
     */
    sendMessage: function () {
        if (this.data.messageInput.trim() === '') return;

        // 将用户输入的消息添加到消息数组中
        const newMessage = {
            'role': 'user',
            'content': this.data.messageInput,
        };
        this.setData({
            fromUser: true,
        });
        const messages = this.data.messages.concat(newMessage);

        // 清空输入框
        this.setData({
            messages: messages,
            messageInput: '',
        });
        console.log('After send:', this.data.messageInput); // 打印发送后的消息输入值

        // 显示加载指示器
        wx.showLoading({
            title: '正在回复...',
        });

        const that = this; // 保存当前页面的this引用
        // 发送请求到AI模型
        wx.request({
            
            url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', // 请求URL
            method: 'POST',
            data: {
                model: 'glm-4', // 模型代码
                messages: that.data.messages,
                // 其他可选参数
            },
            header: {
                'Content-Type': 'application/json',// 设置请求头
                'Authorization': 'Bearer 0d567b5f2975fe9553b9122af1fb183e.zC8c4UK9yC8nuxmF' //设置api key
            },
            success(res) {
                console.log(res.data); // 处理响应数据
                const aiMessage = {
                    'role': 'assistant', // 来自AI的答复
                    'content': res.data.choices[0].message.content, // 假设响应数据中有AI回复的内容       
                };
                that.setData({
                    fromUser: false,
                    messages: messages.concat(aiMessage),
                });
                wx.hideLoading(); // 隐藏加载指示器
            },
            fail(error) {
                console.error(error); // 处理请求失败情况
                wx.showToast({
                    title: '请求失败，请重试',
                    icon: 'none',
                });
                wx.hideLoading(); // 隐藏加载指示器
            }
        });
    },

    clearMessages: function () {
        // 清除聊天记录
        this.setData({
            messages: [],
        });
        // 可选：清空输入框
        this.setData({
            messageInput: '',
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const userName = wx.getStorageSync('userName');
        if (userName) {
            this.setData({
                userName: userName,
            });
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})