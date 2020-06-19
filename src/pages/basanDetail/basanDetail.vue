<template>
  <div class="detail" v-if="detail">


    <div class="floatbox">

      <button open-type="share">
        <div class="ic">
          <m-icon type='fen_xiang'/>
        </div>
        <div>分享好友</div>
      </button>

      <!-- <button>
        <div class="ic"><m-icon type='favorite'/></div>
        <div>收藏钓点</div>
      </button> -->

      <button @click="goHome">
        <div class="ic">
          <m-icon type='geng_duo'/>
        </div>
        <div>更多钓点</div>
      </button>

      <button @click="goHome">
        <div class="ic">
          <m-icon type='zhuye' size="16"/>
        </div>
        <div>返回首页</div>
      </button>

    </div>


    <div class="h1">
      {{detail.des}}
    </div>

    <div class="bottom" v-if="detail.createTime">
      <div> {{detail.createTime | fomatTime}} {{detail.nickName}}发布</div>
    </div>


    <div class='labels'>[地址]</div>
    <map class="map" :latitude="detail.lat" show-location :longitude="detail.lon" scale="12" :markers="markers"
         style="width:100%"></map>
    <div class="address">
      <div class="info">
        地址:{{detail.addressInfo}}
        <span class="readdr" @click="goto(detail.lat,detail.lon,detail.street,detail.street_number)">去这里</span>
      </div>
    </div>


    <div class='labels'>[钓点详情]</div>
    <div class="p1">
      <span>钓点类型：</span>{{detail.basanType}}
    </div>

    <div class="p1">
      <span>鱼种：</span>{{detail.fishType}}
    </div>


    <div class='labels'>[现场照片]</div>
    <div class="imgs">
      <div class="imglist" v-for="(pice,index) in detail.imgs" :key="index">
        <image :src="pice" mode="widthFix"></image>
      </div>
    </div>
    <div v-if="reviewed" class='admins'>
      <div class='labels'>审核状态：{{detail.reviewed==0?'审核未通过':'审核通过'}}</div>
      <button type="primary" @click="bindReview(1)">钓点真实，允许通过</button>
      <button type="warn" @click="bindReview(0)">钓点不真实，不准通过</button>
    </div>
  </div>
</template>

<script>

  import mIcon from '@/components/mIcon'
  import {getBasanById} from '@/service'




  export default {
    name: "basanDetail",
    data() {
      return {
        detail: null,
        markers: {},
        reviewed: 0,
        lat:'',
        lon:''
      }
    },
    components: {
      mIcon
    },
    onShareAppMessage(res) {
      return {
        title: `[钓点分享]${this.detail.address},${this.detail.desc}`,
        imageUrl: this.detail.pictures[0]
      }
    },
    onLoad(options) {
      let {
        id,
        reviewed
      } = options
      this.reviewed = reviewed || 0


      getBasanById(id).then(res => {

        let {success, msg,data} = res

        if(success){
          this.detail = data
              this.markers = [{
                latitude: res.data.lat,
                longitude: res.data.lon
              }]

        }

      }).catch(err => {
        console.error(err)
      })
    },
    onShow(){
      this.isGetLocation()
    },
    methods: {


      goHome() {
        uni.switchTab({
          url: '/pages/index/index'
        })
      },


      bindReview(reviewed) {
        // basan.doc(this.detail._id).update({
        //   data: {
        //     reviewed: reviewed
        //   },
        //   success() {
        //     uni.navigateBack()
        //   }
        // })
      },


      goto(lat, lon, numbers, ad) {
        wx.getLocation({ //获取当前经纬度
          type: 'gcj02', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息
          success: function (res) {
            wx.openLocation({ //​使用微信内置地图查看位置。
              latitude: lat * 1, //要去的纬度-地址
              longitude: lon * 1, //要去的经度-地址
              name: numbers,
              address: ad ? ad : numbers
            })
          }
        })
      },
      getAuthorizeInfo(a = "scope.userLocation") { //1. uniapp弹窗弹出获取授权（地理，个人微信信息等授权信息）弹窗
        var that = this;
        uni.authorize({
          scope: a,
          success() {
            that.getLocationInfo();
          },
          fail() {
            console.log("你拒绝了授权，无法获得周边信息")
          }
        })
      },
      getLocationInfo() { //2. 获取地理位置
        uni.getLocation({
          type: 'gcj02',
          success: (res) => {
            this.lat = res.latitude.toString()
            this.lon = res.longitude.toString()
          }
        });
      },
      isGetLocation(a = "scope.userLocation") { // 3. 检查当前是否已经授权访问scope属性，参考下截图
        var that = this;
        uni.getSetting({
          success(res) {
            if (!res.authSetting[a]) { //3.1 每次进入程序判断当前是否获得授权，如果没有就去获得授权，如果获得授权，就直接获取当前地理位置
              that.getAuthorizeInfo()
            } else {
              that.getLocationInfo()
            }
          }
        });
      }
    }
  }
</script>

<style lang="less">
  page {
    height: 100%;
    background: #fffbf7;
  }

  @import "basanDetail.less";
</style>
