const utilsPath = require('../../utils/util.js'); // Path: frontend/utils/util.js

Page({
    data: {
      username: '',
      password: ''
    },
  
    bindUsernameInput: function(e) {
      this.setData({
        username: e.detail.value
      });
    },
  
    bindPasswordInput: function(e) {
      this.setData({
        password: e.detail.value
      });
    },
  
    onLogin: function() {
      console.log(utilsPath.server_URL);
      wx.navigateTo({
        url: '../home/home',
      })
    },
  
    onRegister: function() {
      wx.navigateTo({
        url: '../register/register'
      });
    },
  
    onWeChatLogin: function(e) {
      if (e.detail.userInfo) {
        wx.showToast({
          title: '微信登录成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '微信登录失败',
          icon: 'none'
        });
      }
    }
  });