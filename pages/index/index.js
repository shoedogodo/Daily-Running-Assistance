// index.js
// const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

// Page({
//   data: {
//     motto: 'Hello World',
//     userInfo: {
//       avatarUrl: defaultAvatarUrl,
//       nickName: '',
//     },
//     hasUserInfo: false,
//     canIUseGetUserProfile: wx.canIUse('getUserProfile'),
//     canIUseNicknameComp: wx.canIUse('input.type.nickname'),
//   },
//   bindViewTap() {
//     wx.navigateTo({
//       url: '../logs/logs'
//     })
//   },
//   onChooseAvatar(e) {
//     const { avatarUrl } = e.detail
//     const { nickName } = this.data.userInfo
//     this.setData({
//       "userInfo.avatarUrl": avatarUrl,
//       hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
//     })
//   },
//   onInputChange(e) {
//     const nickName = e.detail.value
//     const { avatarUrl } = this.data.userInfo
//     this.setData({
//       "userInfo.nickName": nickName,
//       hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
//     })
//   },
//   getUserProfile(e) {
//     // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
//     wx.getUserProfile({
//       desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
//       success: (res) => {
//         console.log(res)
//         this.setData({
//           userInfo: res.userInfo,
//           hasUserInfo: true
//         })
//       }
//     })
//   },
// })

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
      // 直接跳转到首页
      wx.navigateTo({
        url: '../home/home'
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