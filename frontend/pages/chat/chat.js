// pages/AIchat/AIchat.js
const app = require('../../app.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: [], // 存储聊天消息的数组
    messageInput: '', // 用户输入的消息
  },

  /**
   * 获取用户输入
   */
  inputMessage: function(e) {
    this.setData({
      messageInput: e.detail.value,
    });
  },

  /**
   * 点击发送按钮，发送信息并更新对话列表
   */
  sendMessage: function() {
    if (this.data.messageInput.trim() === '') return;

    // 将用户输入的消息添加到消息数组中
    const newMessage = {
      text: this.data.messageInput,
      fromUser: true, // 表示消息是从用户发出的
    };
    const messages = this.data.messages.concat(newMessage);

    // 清空输入框
    this.setData({
      messages: messages,
      messageInput: '',
    });
    console.log('After send:', this.data.messageInput); // 打印发送后的消息输入值

    // 模拟AI助手回复
    setTimeout(() => {
      const aiMessage = {
        text: '这是AI助手的回复', // 实际应用中，这里应该是AI处理后的结果
        fromUser: false,
      };
      this.setData({
        messages: messages.concat(aiMessage),
      });
    }, 1000);
  },

  clearMessages: function() {
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