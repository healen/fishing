<template>

  <div class="add">
    <div class="add_img">
      <div class="add_btn" v-for="(img,index) in imgbox" :key="index">
        <image class="img" :src="img" mode="aspectFill"></image>
        <span @click='imgDelete(index)'>+</span>
      </div>
      <div class="add_btn" @click="addPic">
        +
      </div>
    </div>

    <div class="desc">
      <textarea class="input" placeholder="请输入描述" v-model="desc"/>
    </div>
    <button class="send" @click="send" type="primary">提交</button>
  </div>
</template>

<script>
  import moment from 'moment'

  const db = wx.cloud.database({
    env: 'fishing-7xw3p'
  })
  const basan = db.collection('basan')
  const user = db.collection('user')
  const _ = db.command
  export default {
    name: 'add',
    data() {
      return {
        imgbox: [], //选择图片
        fileIDs: [], //上传云存储后的返回值
        desc: '',
        lat: '',
        lon: '',
        province: '',
        city: '',
        district: '',
        street: ''


      }
    },
    onShow() {
      this.getLocationInfo()
    },
    methods: {
      // 删除照片 &&
      imgDelete(index) {
        let that = this;
        let imgbox = this.imgbox;
        imgbox.splice(index, 1)
        that.imgbox = imgbox
      },


      addPic(e) {
        var imgbox = this.imgbox;
        var that = this;
        var n = 9;
        if (9 > imgbox.length > 0) {
          n = 9 - imgbox.length;
        } else if (imgbox.length == 9) {
          n = 1;
        }
        wx.chooseImage({
          count: n, // 默认9，设置图片张数
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function (res) {
            // console.log(res.tempFilePaths)
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            var tempFilePaths = res.tempFilePaths

            if (imgbox.length == 0) {
              imgbox = tempFilePaths
            } else if (9 > imgbox.length) {
              imgbox = imgbox.concat(tempFilePaths);
            }
            that.imgbox = imgbox;
          }
        })
      },


      //发布按钮
      send(e) {
        let that = this
        if (!this.imgbox.length) {
          wx.showToast({
            icon: 'none',
            title: '图片类容为空'
          });
        } else {
          //上传图片到云存储
          wx.showLoading({
            title: '上传中',
          })
          let promiseArr = [];
          for (let i = 0; i < this.imgbox.length; i++) {
            promiseArr.push(new Promise((reslove, reject) => {
              let item = this.imgbox[i];
              let suffix = /\.\w+$/.exec(item)[0];//正则表达式返回文件的扩展名
              wx.cloud.uploadFile({
                cloudPath: new Date().getTime() + suffix, // 上传至云端的路径
                filePath: item, // 小程序临时文件路径
                success: res => {
                  this.fileIDs = this.fileIDs.concat(res.fileID)
                  console.log(res.fileID)//输出上传后图片的返回地址
                  reslove();
                  wx.hideLoading();
                  wx.showToast({
                    title: "上传成功",
                  })
                },
                fail: res => {
                  wx.hideLoading();
                  wx.showToast({
                    title: "上传失败",
                  })
                }

              })
            }));
          }
          Promise.all(promiseArr).then(res => {//等数组都做完后做then方法
            // console.log("图片上传完成后再执行")
            let {fileIDs, desc, lat, lon, province, city, district, street,street_number} = this



            user.where({'_openid':uni.getStorageSync('openid')}).get().then(res=>{

              let {_openid,avatarUrl,nickName} = res.data[0]

              basan.add({
                data: {
                  createTime: new Date(),
                  createTimeShow: moment().format('YY.MM.DD hh:mm:ss'),
                  createrId:_openid,
                  creater: {
                    openid:_openid,
                    avatarUrl,
                    nickName
                  },
                  pictures: fileIDs,
                  desc,
                  lat,
                  lon,
                  province,
                  city,
                  district,
                  street,
                  street_number,
                  fishsingDot: 1,
				  reviewed:0

                }

              }).then(res => {
                uni.switchTab({
                  url: '/pages/index/index'
                })
              })




            })






          })

        }
      },

      getLocationInfo() { //2. 获取地理位置
        var that = this;
        uni.getLocation({
          type: 'wgs84',
          success(res) {
            console.log("你当前经纬度是：")
            console.log(res)

            that.lat = res.latitude.toString()
            that.lon = res.longitude.toString()


            console.log(res)


            uni.request({
              header: {
                "Content-Type": "application/text"
              },
              url: 'https://apis.map.qq.com/ws/geocoder/v1/?location=' + that.lat + ',' + that.lon +
              '&key=PY2BZ-TZS33-7563V-YMUE7-IIKBV-BEBIZ',
              success(re) {
                console.log("中文位置")
                console.log(re.data.result.address_component)

                let {province, city, district, street,street_number} = re.data.result.address_component

                that.province = province;
                that.city = city;
                that.district = district;
                that.street = street;
                that.street_number = street_number


                if (re.statusCode === 200) {
                  console.log("获取中文街道地理位置成功")
                } else {
                  console.log("获取信息失败，请重试！")
                }
              }
            });
          }
        });
      },
    }
  }
</script>

<style lang="less">
  @import 'add.less';
</style>
