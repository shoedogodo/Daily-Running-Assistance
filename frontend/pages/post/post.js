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
    inputTitle: function(e) {
        this.setData({
            titleInput: e.detail.value,
        });
    },
    inputContent: function(e) {
        this.setData({
            contentInput: e.detail.value,
        });
    },


    /**
     * 处理发布帖子的函数
     */
    publishPost: function () {
        // 获取标题和正文
        const title = this.data.titleInput; 
        const content = this.data.contentInput;

        // 获取图片URL数组
        const images = this.data.imagePreview;

        // 发布帖子的逻辑
        this.createPost(title, content, images);
    },
    /**
     * 用户上传图片
     * 调用wx.chooseImage()接口
     */
    uploadImage: function () {
        const that = this; // 保存当前页面的this引用
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function (res) {
                if (!Array.isArray(that.data.imagePreview)) {
                    that.setData({
                        imagePreview: []
                    }); // 确保imagePreview是数组
                }
                // 使用that引用页面data，避免this指向问题
                const newImages = that.data.imagePreview.concat(res.tempFilePaths);
                that.setData({
                    imagePreview: newImages,
                });
            }
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
     */

    //createPost: function(title, content, images) {
    createPost: function (title, content, images) {
        const username = wx.getStorageSync('username');

        // 发送请求到服务器，创建帖子
        wx.request({
            url: 'http://124.221.96.133:8000/api/users/share/posts', // 修正了URL
            method: 'POST',
            // TODO: 传入的参数应该还需要有author的信息，images[]图片数组
            // example:
            /*  images: [
                '../../images/run-icon.png',

            ], */
            data: {
                title: title,
                content: content,
                username: username,
                images: imagePreview,
            },
            success: function (res) {
                // BUG!!! 返回的状态码是201而非文档中写的200
                if (res.statusCode === 200) {
                    // 发布成功的处理
                    wx.showToast({
                        title: '发布成功',
                        icon: 'success',
                        duration: 2000
                    });
                    // 清空输入和图片预览
                    setTimeout(() => { //延迟发送，防止input沒有清空
                        this.setData({
                            titleInput: '',
                            contentInput: '',
                            imagePreview: [],
                        });
                      }, 100);
                      wx.navigateTo({
                        url: '../share/share',
                      })
                } else {
                    // 发布失败的处理
                    wx.showToast({
                        title: '发布失败',
                        icon: 'none',
                        duration: 2000
                    });
                    console.log(res);
                    console.log(title);
                    console.log(content);
                    console.log(username);
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