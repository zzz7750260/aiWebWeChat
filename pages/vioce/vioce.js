//获取应用实例
const app = getApp()

//引入微信同声传译
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()
// pages/vioce/vioce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showSocketButton: true,   //声明链接socket的状态
    statusList: ["连接成功", "连接失败"],    //websocket状态列表
    websocketStatus: null,          //状态展现
    socketOpen: false,            //声明websocket的打开状态
    voiceStatus: false,           //声明录音的状态
    messageList: [],              //声明接收信息列表
  },

  getWebsocket: function () {
    wx.connectSocket({
      //url: 'ws://192.168.43.243:8898',
      //url: 'ws://127.0.0.1:8898',
      url: 'ws://192.168.137.1:8898',
      success: (res) => {
        console.log("socket连接成功")
        console.log(res)

        //将showSocketButton设置为false
        this.setData({
          showSocketButton: false,
          websocketStatus: this.data.statusList[0],
        })
      },
      fail: (err) => {
        console.log("socket连接失败")
        console.log(err)
      }
    })

    //在连接之后打开websocket
    wx.onSocketOpen((res) => {
      console.log("websocket打开成功")
      this.setData({
        socketOpen: true
      })
    })
  },

  //获取音频
  getVoice: function () {
    let voiceStatus = this.data.voiceStatus;

    if (voiceStatus == false) {
      //进行录音
      manager.start({ duration: 30000, lang: "zh_CN" })
      this.setData({
        voiceStatus: true
      })
    }
    else {
      manager.stop()
      this.setData({
        voiceStatus: false
      })
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //将全局的信息赋予userInfo
    this.setData({
      userInfo: app.globalData.userInfo
    })

    console.log(this.data.userInfo)
    //在登陆进来后触发连接socket
    this.getWebsocket()

    //监控微信同声传译
    manager.onRecognize = function (res) {
      console.log("current result", res.result)
    }
    manager.onStop =  (res) => {
      console.log("record file path", res.tempFilePath)
      console.log("result", res.result)

      //当socketOpen开启时
      if (this.data.socketOpen) {
        //向websocket发送信息
        wx.sendSocketMessage({
          data: res.result
        })
      }
    }
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    manager.onError = function (res) {
      console.error("error msg", res.msg)
    }

    //监控websocket返回信息
    wx.onSocketMessage((res) =>{
      let messageList = this.data.messageList
      
      console.log(res)
      //将信息传递到messageList中
      messageList.push(res.data.value)

      this.setData({
        messageList: messageList,
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})