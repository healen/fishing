<template>
	<view class="content">


		<scroll-view class="listview" @scrolltolower='nextPage' scroll-y="true" v-if="!showAuth">
			<div class="header">
				<image src="@/static/indexbanner.png" class="bg" mode="scaleToFill"></image>

				<div class="text">
					<div class="name">{{userInfo.nickName}}</div>
					<div class="desc">
						{{userInfo.desc||'简单介绍一下自己吧'}}
						<navigator class="add" url="../add/add">钓点</navigator>
					</div>
				</div>

				<image :src="userInfo.avatarUrl" mode="scaleToFill" class="avatar"></image>
			</div>
			<div class="inview">
				<div class="list" v-for="(item,index) in list" :key="index">
					<image :src="item.creater.avatarUrl" class="avatarsamll" mode="widthFix"></image>
					<div class="right">
						<div class="name">{{item.creater.nickName}}</div>
						<div class="con">
							{{item.desc}}
						</div>

						<div class="picbox">
							<div class="pis" v-for="(pice,pindex) in item.pictures" :key="pindex">
								<image :src="pice" mode="aspectFill"></image>
							</div>
						</div>

						<div class="time">
							{{item.createTimeShow}}
							{{item.city}} {{item.district}}
						</div>
					</div>


				</div>
			</div>
		</scroll-view>
		<div class="auth" v-if="showAuth">
			<button type="primary" open-type="getUserInfo" @getuserinfo="bindGetUserInfo">授权</button>
		</div>
	</view>
</template>

<script>
	const db = wx.cloud.database({
		env: 'fishing-7xw3p'
	})
	const user = db.collection('user')
	const basan = db.collection('basan')
	const _ = db.command
	import Vue from 'vue'
	export default {
		data() {
			return {
				title: 'Hello',
				list: [],
				count: 0,
				limit: 20,
				showAuth: false,
				userInfo: {
					sign: null

				},
			}
		},
		onShow() {
			this.isGetLocation();
		},

		onLoad() {
			let that = this
			let openid = uni.getStorageSync('openid')
			if (!openid) {
				uni.login({
					provider: '',
					success: res => {
						let l = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + this.$appid + '&secret=' + this.$secrets +
							'&js_code=' + res.code + '&grant_type=authorization_code';
						console.log(res.code)
						uni.request({
							data: {},
							url: l,
							method: 'GET',
							success(data) {
								let {
									openid
								} = data.data
								uni.setStorageSync('openid', openid)
								that.initPage(openid)
							}
						})
					},
				});
			} else {
				that.initPage(openid)
				that.renderList(0)
			}
		},
		methods: {

			renderList(skip = 0) {
				let that = this
				basan
					.orderBy('createTime', 'desc')
					.limit(this.limit)
					.skip(skip)
					.watch({
						onChange: function(snapshot) {
							that.refsList(skip)

						},
						onError: function(err) {
							console.error('the watch closed because of error', err)
						}
					})

			},
			refsList(skip = 0) {
				basan
					.orderBy('createTime', 'desc')
					.limit(this.limit)
					.skip(skip)
					.get()
					.then(res => {
						this.list = res.data
					})


			},


			nextPage() {
				uni.showToast({
					title: '滚动到底部了'
				});
			},

			initPage(openid) {
				Vue.set(this.userInfo, 'openid', openid)
				user
					.where({
						openid: openid
					})
					.get().then(res => {
						let {
							errMsg,
							data
						} = res
						if (errMsg == 'collection.get:ok') {
							if (data.length != 0) {
								this.userInfo = data[0]
								uni.setStorageSync('userInfo', data[0])
							} else {
								this.showAuth = true
							}

						}
					})
			},
			bindGetUserInfo(e) {
				let that = this
				uni.getUserInfo({
					lang: 'zh_CN',
					success(res) {
						let {
							nickName,
							city,
							province,
							avatarUrl,
							gender
						} = res.userInfo
						Vue.set(that.userInfo, 'nickName', nickName)
						Vue.set(that.userInfo, 'city', city)
						Vue.set(that.userInfo, 'province', province)
						Vue.set(that.userInfo, 'avatarUrl', avatarUrl)
						Vue.set(that.userInfo, 'gender', gender)
						Vue.set(that.userInfo, 'fishingDot', 100)
						Vue.set(that.userInfo, 'favorites', [])
						Vue.set(that.userInfo, 'createTime', new Date())

						user.add({
							data: that.userInfo
						}).then(info => {

							let {
								errMsg
							} = info
							if (errMsg == 'collection.add:ok') {
								that.showAuth = false
								user.where({
									openid: that.openid
								}).get().then(re => {

									let {
										errMsg,
										data
									} = re


									that.userInfo = data[0]
									uni.setStorageSync('userInfo', data[0])
								})
							}

						})

					}
				})
			},

			getAuthorizeInfo(a = "scope.userLocation") { //1. uniapp弹窗弹出获取授权（地理，个人微信信息等授权信息）弹窗
				var that = this;
				uni.authorize({
					scope: a,
					success() { //1.1 允许授权
						that.getLocationInfo();
					},
					fail() { //1.2 拒绝授权

						console.log("你拒绝了授权，无法获得周边信息")
					}
				})
			},
			getLocationInfo() { //2. 获取地理位置
				var that = this;
				uni.getLocation({
					type: 'wgs84',
					success(res) {
						console.log("你当前经纬度是：")
						console.log(res)

						Vue.set(that.userInfo, 'lat', res.latitude.toString())
						Vue.set(that.userInfo, 'lon', res.longitude.toString())
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
			},
			goAddData() {
				uni.navigateTo({
					url: '/pages/add/add',
				});
			},
		}
	}
</script>

<style lang="less">
	page {
		height: 100%;
		background: #fffbf7;
	}

	@import 'index.less';
</style>
<style>

</style>
