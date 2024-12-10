// app.js

App({
  onLaunch() {
    // Set up a global reference to utils
    global.utils = require('./utils/util.js');
    global.api = require('./utils/api.js');

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})

function tokenCheck() {   
  const token = wx.getStorageSync('token'); // 从本地存储中获取 token

  console.log(token);//

  if (!token) {
      // 如果 token 不存在，则跳转到登录页面
      console.log('notoken');
      wx.redirectTo({
          url: '../index/index'
      });
      return;
  }

  wx.request({
      url: 'http://124.221.96.133:8000/api/users/tokenCheck', 
      method: 'POST',
      header: {
          'Authorization': `Bearer ${token}`, // 在头部添加 token 用于身份验证
          'Content-Type': 'application/json', 
      },
      success(res) {
        if (res.statusCode === 200) {
            // 如果 token 验证成功
            console.log('Token 验证成功');
        } else {
          console.log(res.statusCode);
            //token 验证失败
          

            console.error('Token 验证失败: 登录过期或无效');
            wx.redirectTo({
              url: '../index/index?message=登录过期，请重新登录'
            });
        }
      },
      fail(err) {
          console.error('获取受保护数据失败:', err);
          // 网络错误或其他问题，处理错误
          wx.showToast({
              title: '网络错误或服务器无响应',
              icon: 'none'
          });
      },
  });
}

module.exports = {
  tokenCheck
};