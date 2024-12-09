function login(username, password) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: global.utils.getAPI(global.utils.serverURL, '/api/users/login'),
            method: 'POST',
            data: JSON.stringify({ username, password }),
            header: {
                'Content-Type': 'application/json', 
            },
            success(res) {
                if (res.statusCode === 200) {
                    // Store user information in local storage
                    wx.setStorageSync('userName', username);
                    wx.setStorageSync('nickname', res.data.user.nickname);
                    wx.setStorageSync('profilepicture', res.data.user.profilepic);

                    // Show success toast
                    wx.showToast({
                        title: '登录成功!',
                        icon: 'none',
                    });

                    // Resolve the promise with response data
                    resolve(res.data);
                } else if(res.statusCode === 404){
                    wx.showToast({
                        title: '用户不存在',
                        icon: 'none',
                    });
                    reject(new Error('User not found'));
                } else if(res.statusCode === 401){
                    wx.showToast({
                        title: '密码错误',
                        icon: 'none',
                    });
                    reject(new Error('Incorrect password'));
                } else {
                    reject(new Error('Login failed'));
                }
            },
            fail(err) {
                wx.showToast({
                    title: 'Network Error',
                    icon: 'none',
                });
                console.error(err);
                reject(err);
            },
        });
    });
}

function register(username, password) {
    return new Promise((resolve, reject) => {
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
                        icon: 'success',
                        duration: 2000
                    });
                    resolve(res.data);
                } else if (res.statusCode === 409) {
                    // Assuming 409 might be used for username already exists
                    wx.showToast({
                        title: 'Username already exists',
                        icon: 'none',
                        duration: 2000
                    });
                    reject(new Error('Username already exists'));
                } else {
                    wx.showToast({
                        title: 'Registration Failed',
                        icon: 'none',
                        duration: 2000
                    });
                    reject(new Error('Registration failed'));
                }
            },
            fail(err) {
                wx.showToast({
                    title: 'Network Error',
                    icon: 'none',
                    duration: 2000
                });
                console.error(err);
                reject(err);
            },
        });
    });
}

function updateNickname(username, nickname) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: global.utils.getAPI(global.utils.serverURL, '/api/users/update/nickname'),
            method: 'PUT',
            data: { username, nickname },
            header: {
                'Content-Type': 'application/json',
            },
            success(res) {
                console.log('Username:', username);
                console.log('Nickname:', nickname);
                console.log('Response:', res.data);

                if (res.statusCode === 200) {
                    // Store the new nickname in local storage
                    wx.setStorageSync('nickname', nickname);

                    wx.showToast({
                        title: '修改昵称成功!',
                        icon: 'none',
                        duration: 2000
                    });

                    resolve(res.data);
                } else if (res.statusCode === 404) {
                    wx.showToast({
                        title: '用户不存在',
                        icon: 'none',
                        duration: 2000
                    });
                    reject(new Error('User not found'));
                } else {
                    wx.showToast({
                        title: 'API error',
                        icon: 'none',
                        duration: 2000
                    });
                    reject(new Error('Failed to update nickname'));
                }
            },
            fail(err) {
                wx.showToast({
                    title: 'Network Error',
                    icon: 'none',
                    duration: 2000
                });
                console.error('Network Error:', err);
                reject(err);
            },
        });
    });
}

function updateProfilePicture(userName, fileInfo) {
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: global.utils.getAPI(global.utils.serverURL, '/api/users/update/profilepic'),
            filePath: fileInfo,
            name: 'profilePicture',
            formData: {
                username: userName
            },
            header: {
                'content-type': 'multipart/form-data'
            },
            success(res) {
                if (res.statusCode === 200) {
                    // Update local storage with new profile picture URL
                    const data = JSON.parse(res.data);
                    wx.setStorageSync('profilepicture', data.profilepic);
                    
                    wx.showToast({
                        title: '头像更新成功!',
                        icon: 'success',
                        duration: 2000
                    });
                    resolve(data);
                } else {
                    wx.showToast({
                        title: '更新失败',
                        icon: 'none',
                        duration: 2000
                    });
                    reject(new Error('Failed to update profile picture'));
                }
            },
            fail(err) {
                wx.showToast({
                    title: 'Network Error',
                    icon: 'none',
                    duration: 2000
                });
                console.error('Error uploading profile picture:', err);
                reject(err);
            }
        });
    });
}

function getProfilePicture(username) {
    const url = global.utils.getAPI(global.utils.serverURL, '/api/users/profilepic/' + username);
    return url;
}


module.exports = {
    login,
    register,
    updateNickname,
    updateProfilePicture,
    getProfilePicture,
}
  