//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    src: '',
    oldsrc:'',
    style: ['candy', 'cubist', 'fuchunshanjutu', 'hundertwasser', 'kandinsky', 'miss', 'scream', 'starry', 'sunflower', 'weeping', 'composition', 'edtaonisl', 'hokusai', 'kanagawa', 'mangzhong', 'ritual', 'seurat', 'starrynight', 'sunrise'],
    currentTab: -1
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
  onShow: function () {
    this.setData({
      src: '',
      oldsrc:'',
      style: ['candy', 'cubist', 'fuchunshanjutu', 'hundertwasser', 'kandinsky', 'miss', 'scream', 'starry', 'sunflower', 'weeping' , 'composition', 'edtaonisl', 'hokusai', 'kanagawa', 'mangzhong', 'ritual', 'seurat', 'starrynight', 'sunrise'],
      currentTab: -1
    })
  },
  addPhoto: function (e) {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths[0]);
        that.setData({
          src: tempFilePaths,
          oldsrc: tempFilePaths,
          currentTab: -1
        })
      }
    })

  },
  chooseStyle: function (e) {
    var that = this;
    console.log((this.data.currentTab === e.target.dataset.current) || !this.data.src)
    if (!this.data.oldsrc) {
      wx.showToast({
        title: '请先添加照片',
        duration: 2000
      })
      return false;
    } else if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      wx.showLoading({
        title: '图片制作中请稍后',
        mask:true
      });
      wx.uploadFile({
        url: 'https://atns.oookini.com/api/v1/image_style', //仅为示例，非真实的接口地址
        filePath: that.data.oldsrc[0],
        name: 'image',
        formData: {
          style: e.target.dataset.style
        },
        success: function (res) {
          if (res.statusCode == 413) {
            wx.showToast({
              title: '添加照片过大请重新选择',
              duration: 2000
            })
            that.setData({
              currentTab: -1
            })
          } else {
            var state = '';
            var s = setInterval(function () {
              if (state == 'PENDING' || state == '') {
                wx.request({
                  url: 'https://atns.oookini.com/api/task/result/' + JSON.parse(res.data).task_id,
                  method: 'get',
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  success: function (r) {
                    state = r.data.state;
                    if (state == 'SUCCESS') {
                      // wx.downloadFile({
                      //   url: eval('(' + r.data.result + ')').url, //仅为示例，并非真实的资源
                      //   success: function (r2) {
                      //     wx.hideLoading();
                      //     that.setData({
                      //       currentTab: e.target.dataset.current,
                      //       src: [r2.tempFilePath]
                      //     })                        
                      //   }
                      // })
                      wx.hideLoading();
                      that.setData({
                        currentTab: e.target.dataset.current,
                        src: [eval('(' + r.data.result + ')').url]
                      })
                      
                    }
                  }
                })
              } else if (state == 'SUCCESS'){
                clearInterval(s);
              }else{
                clearInterval(s);
                wx.showToast({
                  title: '渲染失败，请稍后再试',
                  duration: 2000
                })
              }
            }, 1000)
          }
        }
      })

    }
  },
  saveImg: function (e) {
    var that=this;
    console.log(that.data.src)
    wx.setClipboardData({
      data: that.data.src[0],
      success: function (res) {
        wx.showToast({
          title: '图片地址已复制',
          duration: 2000
        })
      }
    })

    
  }
})
