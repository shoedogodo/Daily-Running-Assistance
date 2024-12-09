// pages/my/my.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showModal: false,
        currentAction: '',
        avatarUrl: '',
        nicknameInput: '',
        nickname: 'nickname_not_updated', // 从用户信息中获取的昵称
        userName: '', // 从用户信息中获取的用户名
        imagePreview: [], // 用于存储图片预览的数组
        unique: 0, // 添加一个唯一标识符，用于wx:key
        
        profilePicUrl: '../../images/my-icon.png',
        tempImagePath: '', // Add this to store temporary image path
        defaultPicUrl: '../../images/my-icon.png'
    },

    updateProfilePicDisplay(userName) {
        // First check if we have a profile picture URL
        const profilePicUrl = global.api.getProfilePicture(userName);
        
        // If the URL is null/undefined/empty, use default immediately
        if (!profilePicUrl) {
            this.setData({
                profilePicUrl: this.data.defaultPicUrl
            });
            return;
        }
        
        // Verify if the URL is accessible
        wx.request({
            url: profilePicUrl,
            method: 'HEAD',
            success: (res) => {
                this.setData({
                    profilePicUrl: res.statusCode === 200 ? profilePicUrl : this.data.defaultPicUrl
                });
            },
            fail: () => {
                this.setData({
                    profilePicUrl: this.data.defaultPicUrl
                });
            }
        });
    },


    handleImageError(e) {
        this.setData({
            profilePicUrl: this.data.defaultPicUrl
        });
    },

    /**
     * 跳转我的跑步记录页面
     */
    navigateToRecord: function () {
        wx.navigateTo({
            url: '../runrecord/runrecord' // 确保路径正确
        });
    },

    showModal: function (e) {
        const action = e.currentTarget.dataset.action;
        this.setData({
            showModal: true,
            currentAction: action
        });
    },
    
    hideModal: function() {
        this.setData({
            showModal: false,
            currentAction: ''
        });
    },
    /**
     * 获取输入的新昵称
     *  */ 

    inputNickname: function (e) {
        this.setData({
            nicknameInput: e.detail.value
        });
    },

    /**
     * 选择头像，并进行显示，限定一张
     * TODO: 上传到服务器
     */
    chooseAvatar: function(e) {
        const userName = wx.getStorageSync('userName');
        if (!userName) {
            wx.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempFilePath = res.tempFilePaths[0];
                
                // Store the temporary file path and show modal
                this.setData({
                    tempImagePath: tempFilePath,
                    showModal: true,
                    currentAction: 'avatar'
                });
            },
            fail: (err) => {
                console.error('Failed to choose image:', err);
                wx.showToast({
                    title: '选择图片失败',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },

    /**
     * 点击弹窗的确认
     * TODO: 上传到服务器保存的逻辑待完成
     */
    onModalSuccess: function () {
        if (this.data.currentAction === 'nickname') {
            const newNickname = this.data.nicknameInput;
            const username = wx.getStorageSync('userName');

            // Check if the nickname is not empty
            if (newNickname.trim() !== '') {
                // Update the page's nickname
                this.setData({
                    nickname: newNickname
                });
    
                const nickname = newNickname;
                
                // Call the editNickname API
                global.api.updateNickname(username, nickname)
                    .then(() => {
                        // Optional: Additional actions after successful nickname update
                        wx.showToast({
                            title: '昵称已更新',
                            icon: 'success'
                        });
                    })
                    .catch((error) => {
                        // Handle update errors if needed
                        console.error('Nickname update failed:', error);
                    });

                // Close the modal (if applicable)
                this.setData({
                    currentAction: ''  // Reset the action to close the modal
                });
            } else {
                wx.showToast({
                    title: '请输入有效的昵称',
                    icon: 'none'
                });
            }
            
            // 执行修改昵称的逻辑
            console.log('新昵称:', this.data.nickname);
        } 
        
        else if (this.data.currentAction === 'avatar' && this.data.tempImagePath) {
            const userName = wx.getStorageSync('userName');
            
            wx.showLoading({
                title: '上传中...'
            });

            global.api.updateProfilePicture(userName, this.data.tempImagePath)
                .then(() => {
                    // Get the new profile picture URL
                    const newProfilePicUrl = global.api.getProfilePicture(userName);
                    
                    this.setData({
                        profilePicUrl: newProfilePicUrl + '?t=' + new Date().getTime()
                    });
                    
                    wx.showToast({
                        title: '头像已更新',
                        icon: 'success',
                        duration: 2000
                    });
                })
                .catch((error) => {
                    wx.showToast({
                        title: error.message || '上传失败',
                        icon: 'none',
                        duration: 2000
                    });
                })
                .finally(() => {
                    wx.hideLoading();
                    this.setData({
                        tempImagePath: ''
                    });
                });
        }


        this.hideModal();
    },

    onModalFail: function() {
        // Clear the temporary image path if user cancels
        if (this.data.currentAction === 'avatar') {
            this.setData({
                tempImagePath: ''
            });
        }
        console.log('用户点击了取消');
        this.hideModal();
    },

    /**
     * 登出函数
     * TODO: 待完成
     */
    onLogout: function(){
        ;
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const userName = wx.getStorageSync('userName');
        const nickname = wx.getStorageSync('nickname');

        try {
            // Get the profile picture URL
            const profilePicUrl = global.api.getProfilePicture(userName);
            
            // If the URL is null/undefined/empty, use default
            if (!profilePicUrl) {
                this.setData({
                    userName: userName,
                    nickname: nickname,
                    profilePicUrl: this.data.defaultPicUrl
                });
                return;
            }
    
            // Verify if the URL is accessible
            wx.request({
                url: profilePicUrl,
                method: 'HEAD',
                success: (res) => {
                    this.setData({
                        userName: userName,
                        nickname: nickname,
                        profilePicUrl: res.statusCode === 200 ? profilePicUrl : this.data.defaultPicUrl
                    });
                },
                fail: () => {
                    this.setData({
                        userName: userName,
                        nickname: nickname,
                        profilePicUrl: this.data.defaultPicUrl
                    });
                }
            });
            
        } catch (error) {
            console.error('Failed to get profile picture:', error);
            this.setData({
                userName: userName,
                nickname: nickname,
                profilePicUrl: this.data.defaultPicUrl
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