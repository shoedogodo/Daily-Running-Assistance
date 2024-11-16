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

      wx.request({
        url: 'http://124.221.96.133:3000/api/login',
        method: 'POST',
        data: {
          username: 'user',
          password: 'pass'
        },
        success(res) {
          // Store the token
          wx.setStorageSync('token', res.data.token);
        }
      });

      /*
      wx.request({
        url: 'http://localhost:3000/api/data',  // URL to your backend API
        method: 'GET',
        success: (res) => {
          console.log('Backend response:', res.data);
          this.setData({
            message: res.data.message
          });
        },
        fail: (err) => {
          console.error('Error:', err);
        }
      });
      */
    
      /*
      // 直接跳转到首页
      wx.navigateTo({ 
        url: '../home/home'
      });
      */
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