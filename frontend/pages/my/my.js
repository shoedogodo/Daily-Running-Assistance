// pages/my/my.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showModal: false,
        currentAction: '',
        avatarUrl: '',
        nickname: '', // 从用户信息中获取的昵称
        userName: '', // 从用户信息中获取的用户名
        imagePreview: [], // 用于存储图片预览的数组
        unique: 0, // 添加一个唯一标识符，用于wx:key
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
    /**
     * 获取输入的新昵称
     *  */ 
    inputNickname: function (e) {
        this.setData({
            nickname: e.detail.value
        });
    },

    /**
     * 选择头像，并进行显示，限定一张
     * TODO: 上传到服务器
     */
    chooseAvatar: function (e) {
        // 处理选择头像的逻辑
        const that = this; // 保存当前页面的this引用
        wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: function(res) {
            if (!Array.isArray(that.data.imagePreview)) {
            that.setData({ imagePreview: [] }); // 确保imagePreview是数组
            }
            // 使用that引用页面data，避免this指向问题
            
            const newImages = that.data.imagePreview.concat(res.tempFilePaths);
            that.setData({
                imagePreview: [res.tempFilePaths[0]],
            });
        }
        });
        console.log('选择的头像索引:', e.detail.index);
    },

    /**
     * 点击弹窗的确认
     * TODO: 上传到服务器保存的逻辑待完成
     */
    onModalSuccess: function () {
        if (this.data.currentAction === 'nickname') {
            // 执行修改昵称的逻辑
            console.log('新昵称:', this.data.nickname);
        } else if (this.data.currentAction === 'avatar') {
            // 执行修改头像的逻辑
        }
        this.hideModal();
    },

    onModalFail: function() {
        console.log('用户点击了取消');
        this.hideModal();
    },

    /**
     * 登出函数
     * TODO: 待完成
     */
    onLogout: function(){
        ;
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