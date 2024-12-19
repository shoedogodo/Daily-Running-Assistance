// pages/postdetail/postdetail.js
Page({

    data: {
        postId: 0, //存储所要获取帖子的postId
        post: 
            {
                images: ['../../images/run-icon.png'],
                title: '今日运动记录，12分长跑3千米',
                content: '#我要减肥#俗话说7分吃3分练，每日搭配营养健身餐。',
                author: 'cuber',
                commentCount: 334,
                comments: [
                    {content: "haha", author: 'a commentator', createdAt: '2024-12-18 14:49'},
                    {content: "this is another comment", author: 'some commentator', createdAt: '2024-12-18 14:50'},
                    {content: "this is another comment", author: 'some commentator', createdAt: '2024-12-18 14:51'},
                    {content: "this is another comment", author: 'some commentator', createdAt: '2024-12-18 14:52'},
                    {content: "this is another comment", author: 'some commentator', createdAt: '2024-12-18 14:53'},
                    {content: "this is another comment", author: 'some commentator', createdAt: '2024-12-18 14:54'},
                    {content: "this is another comment", author: 'some commentator', createdAt: '2024-12-18 14:55'},
                    {content: "this is another another another another another comment", author: 'another commentator', createdAt: '2024-12-18 14:56'}
                ],
                likes: 334,
                createdAt: '2024-12-17 21:54'
            },
    },

    fetchPostDetails: function (postId) {
        wx.request({
            url: 'http://124.221.96.133:8000/api/users/share/posts/' + postId, // 请替换为您的服务器API地址
            method: 'GET',
            success: (res) => {
                if (res.statusCode === 200) {
                    this.setData({
                        post: res.data.post,
                        comments: res.data.comments
                    });
                console.log(this.data.post);
                console.log()
                } else {
                    wx.showToast({
                        title: '获取帖子详情失败',
                        icon: 'none',
                        duration: 2000
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    title: '网络请求失败',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },

    bindCommentInput: function (e) {
        this.setData({
            commentContent: e.detail.value
        });
    },

    submitComment: function () {
        const commentContent = this.data.commentContent;
        const postId = this.data.postId;
        if (!commentContent) {
            wx.showToast({
                title: '评论不能为空',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        this.createComment(postId, commentContent);
    },

    createComment: function (postId, commentContent) {
        console.log(postId);
        wx.request({
            // http://124.221.96.133:8000/api/users/share/posts/4/comments
            url: 'http://124.221.96.133:8000/api/users/share/posts/' + postId + '/comments' ,
            method: 'POST',
            data: {
                username: wx.getStorageSync('username'),
                content: commentContent
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    wx.showToast({
                        title: '评论成功',
                        icon: 'success',
                        duration: 2000
                    });
                    this.fetchPostDetails(postId); // 重新获取帖子详情以更新评论列表
                } else {
                    wx.showToast({
                        title: '评论失败',
                        icon: 'none',
                        duration: 2000
                    });
                }
            },
            fail: () => {
                wx.showToast({
                    title: '网络请求失败',
                    icon: 'none',
                    duration: 2000
                });
            }
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            postId: options.id
          });
        console.log(this.data.postId)
        this.fetchPostDetails(options.id);
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