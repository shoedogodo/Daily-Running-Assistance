// pages/post/post.js
const app = require('../../app.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        data: {
            titleInput: '',
            contentInput: '',
            imagePreview: [], // 用于存储图片预览的数组
            unique: 0, // 添加一个唯一标识符，用于wx:key
        },
    },


    /**
     * 获取输入的标题、正文
     */
    inputTitle: function (e) {
        this.setData({
            titleInput: e.detail.value,
        });
    },

    showDeleteModal: function (e) {
        const that = this; // 保存当前页面的this引用
        const index = e.currentTarget.dataset.index; // 获取被长按图片的索引
        wx.showModal({
            title: '提示',
            content: '确定要删除这张图片吗？',
            success: (res) => { // 使用箭头函数保持this的上下文
                if (res.confirm) {
                    that.deleteImage(index); // 调用删除函数
                }
            }
        });
    },
    deleteImage: function (index) {
        console.log('Current imagePreview:', this.data.imagePreview); //打印过滤前的
        const newImages = this.data.imagePreview.filter((item, idx) => idx !== index);
        this.setData({
            imagePreview: newImages,
        });
    },

    /**
     * 
     * 确认发布按钮，在服务器创建帖子并存储
     * TODO: wx.request()方法待完善
     */

    //createPost: function(title, content, images) {
    createPost: function (title, content) {
        const username = wx.getStorageSync('username');

        console.log(title);
        console.log(content);
        console.log(username);

        // 发送请求到服务器，创建帖子
        wx.request({
            //url: 'http://124.221.96.133:8000/api/users/share/posts', // 修正了URL
            url: global.utils.getAPI(global.utils.serverURL, '/api/users/share/posts'),
            method: 'POST',
            data: {
                title: title,
                content: content,
                username: username,
                //images: images // 假设服务器接受一个图片数组
            },
            success: function (res) {
                if (res.statusCode === 200) {
                    // 发布成功的处理
                    wx.showToast({
                        title: '发布成功',
                        icon: 'success',
                        duration: 2000
                    });
                    // 清空输入和图片预览
                    this.setData({
                        titleInput: '',
                        contentTextarea: '',
                        imagePreview: [],
                    });
                } else {
                    // 发布失败的处理
                    wx.showToast({
                        title: '发布失败',
                        icon: 'none',
                        duration: 2000
                    });
                }
            }
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        app.tokenCheck();
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