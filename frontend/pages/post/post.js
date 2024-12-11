// pages/post/post.js
const app = require('../../app.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {
      imagePreview: [], // 用于存储图片预览的数组
      unique: 0, // 添加一个唯一标识符，用于wx:key
    },
  },

  /**
   * 处理发布帖子的函数
   */
  publishPost: function() {
    // 获取标题和正文
    const title = this.data.titleInput; // 假设您已经在data中定义了titleInput
    const content = this.data.contentTextarea; // 假设您已经在data中定义了contentTextarea

    // 获取图片URL数组
    const images = this.data.imagePreview;

    // 发布帖子的逻辑
    this.createPost(title, content, images);
  },
  /**
   * 用户上传图片
   * 调用wx.chooseImage()接口
   */
  uploadImage: function() {
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
          imagePreview: newImages,
        });
      }
    });
  },

  showDeleteModal: function(e) {
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
  deleteImage: function(index) {
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
  createPost: function(title, content, images) {
    // 发送请求到服务器，创建帖子
    wx.request({
      url: 'https://your-server.com/api/posts', // 修正了URL
      method: 'POST',
      data: {
        title: title,
        content: content,
        images: images // 假设服务器接受一个图片数组
      },
      success: function(res) {
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