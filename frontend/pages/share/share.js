// pages/share/share.js
const app = require('../../app.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {

    data: {
      posts: [
        {
          image: '/path/to/first/image.jpg',
          text: '#我要减肥#俗话说7分吃3分练，每日搭配营养健身餐。',
          commentCount: 334,
          likeCount: 334
        },
        {
          image: '/path/to/second/image.jpg',
          text: '#小器械大作用#哑铃增肌入门的最好选择。',
          commentCount: 200,
          likeCount: 411
        },
      ]
    }

  },

  /**
   * 跳转编辑帖子页面
   */
  navigateToPost: function() {
    wx.navigateTo({
      url: '../post/post'
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