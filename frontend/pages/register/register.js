// pages/register/register.js
Page({
    data: {
        username: '',
        password: '',
        confirmpassword: '',
    },

    onLoad: function() {
      // 展示注册页面
      // console.log('Register page loaded');
    },

    // Handle username input
    onUsernameInput(e) {
        this.setData({
            username: e.detail.value,
        });
    },

    // Handle password input
    onPasswordInput(e) {
        this.setData({
            password: e.detail.value,
        });
    },

    // Handle confirm password input
    onConfirmPasswordInput(e) {
        this.setData({
            confirmpassword: e.detail.value,
        });
    },


    // Register button click handler
    onRegister() {
        const { username, password, confirmpassword } = this.data;

        // Check if inputs are provided
        if (!username || !password || !confirmpassword) {
            wx.showToast({
                title: 'All fields are required!',
                icon: 'none',
            });
            return;
        }

        // Check if passwords match
        if (password !== confirmpassword) {
            wx.showToast({
                title: 'Passwords do not match!',
                icon: 'none',
            });
            return;
        }

        // Proceed with HTTP request if validation passes
        wx.request({
            url: global.utils.getAPI(global.utils.serverURL, '/api/users'),
            method: 'POST',
            data: { username, password },
            header: {
                'Content-Type': 'application/json',
            },
            success(res) {
                if (res.statusCode === 200) {
                    wx.showToast({
                        title: 'Registration Successful!',
                    });
                    setTimeout(function() {
                      wx.navigateBack();
                  }, 1000); // 等待1000毫秒（1秒）后执行
                    //wx.navigateBack();
                } else {
                    wx.showToast({
                        title: 'Registration Failed',
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
    


    goBack: function() {
        wx.navigateBack();
    }
});
  