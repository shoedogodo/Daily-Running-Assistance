// pages/share/share.js
const app = require('../../app.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      posts: [
        {
          image: '../../images/run-icon.png',
          title: '今日运动记录，12分长跑3千米',
          content: '#我要减肥#俗话说7分吃3分练，每日搭配营养健身餐。',
          commentCount: 334,
          likeCount: 334
        },
        {
          image: '../../images/group-icon.png',
          title: '长跑怎么提速啊求aaaaaaaaaaaaaaaaaaaaaaa助',
          content: '#我要减肥#俗话说7分吃3分练，每日搭配营养健身餐。',
          commentCount: 200,
          likeCount: 411
        },
      ]
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
   * 获取帖子列表
   * TODO: 后端API带连接
   */
  fetchPosts: function() {
    wx.request({
      url: 'http://your-server.com/api/posts', // 请替换为您的服务器API地址
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            posts: res.data
          });
        } else {
          wx.showToast({
            title: '获取帖子列表失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    app.tokenCheck();
    // TODO: 从服务器获取帖子list并加载

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