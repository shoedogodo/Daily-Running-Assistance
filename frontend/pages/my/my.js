// pages/my/my.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showModal: false,
        currentAction: '',
        nickname: '', // 从用户信息中获取的昵称
        userName: '' // 从用户信息中获取的用户名
    },

    /**
     * 跳转我的跑步记录页面
     */
    navigateToRecord: function () {
        wx.navigateTo({
            url: '../runrecord/runrecord' // 确保路径正确
        });
    },

    showModal: function (e) {
        const action = e.currentTarget.dataset.action;
        this.setData({
            showModal: true,
            currentAction: action
        });
    },
    hideModal: function () {
        this.setData({
            showModal: false
        });
    },
    inputNickname: function (e) {
        this.setData({
            nickname: e.detail.value
        });
    },
    chooseAvatar: function (e) {
        // 处理选择头像的逻辑
        console.log('选择的头像索引:', e.detail.index);
    },
    confirmAction: function () {
        if (this.data.currentAction === 'nickname') {
            // 执行修改昵称的逻辑
            console.log('新昵称:', this.data.nickname);
        } else if (this.data.currentAction === 'avatar') {
            // 执行修改头像的逻辑
        }
        this.hideModal();
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