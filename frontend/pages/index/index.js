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
  
    /*
    onLogin: function() {
      console.log(utilsPath.server_URL);
      wx.navigateTo({
        url: '../home/home',
      })
    },
    */

    onLogin() {
      const { username, password } = this.data;

      if (!username) {
        wx.showToast({
            title: '请输入用户名!',
            icon: 'none',
        });
        return;
      }

      if (!password) {
        wx.showToast({
            title: '请输入密码!',
            icon: 'none',
        });
        return;
      }

      const data = { username, password };

      wx.request({
          url: 'http://124.221.96.133:8000/api/users/login', 
          method: 'POST',
          data: JSON.stringify(data),
          header: {
              'Content-Type': 'application/json', 
          },
          success(res) {
              if (res.statusCode === 200) {
                
                  wx.showToast({
                      title: '登陆成功!',
                      icon: 'none',
                  });
                  wx.setStorageSync('userName', username);
                  wx.navigateTo({
                    url: '../home/home'
                  });
              } else if(res.statusCode === 404){
                  wx.showToast({
                      title: '用户不存在',
                      icon: 'none',
                  });
              }else if(res.statusCode === 401){
                wx.showToast({
                    title: '密码错误',
                    icon: 'none',
                  });
              }
          },
          fail(err) {
              wx.showToast({
                  title: 'Network Error',
                  icon: 'none',
              });
              console.error(err);
          },
      });

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