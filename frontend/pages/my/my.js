// pages/my/my.js
const app = require('../../app.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
      userName: '', // 用户名
  },

  /**
   * 跳转我的跑步记录页面
   */
  navigateToRecord: function() {
    wx.navigateTo({
      url: '../runrecord/runrecord' // 确保路径正确
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showToast({
      title: 'tokencheck',
      icon: 'none'
    });

    setTimeout(function() {        app.tokenCheck();    }, 3000); // 等待1000毫秒（1秒）后执行
    
    const userName = wx.getStorageSync('userName');
    if(userName){
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

