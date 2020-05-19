<template>
	<view class="content">
		<scroll-view class="listview" @scrolltolower='nextPage' scroll-y="true">
			<div class="header">
				<image src="@/static/indexbanner.png" class="bg" mode="scaleToFill"></image>

				<div class="text">
					<div class="name">{{userInfo.nickName}}</div>
					<div class="desc">
						{{userInfo.desc||''}}
						<!-- <navigator class="add" url="../add/add">钓点</navigator> -->
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

							<span class="goto" @click="goto(item.lat,item.lon,item.street_number)">去这里</span>

						</div>
					</div>


				</div>
			</div>
		</scroll-view>


		<div class="auth" v-if="showAuth">
			<div class="autncontent">
				<div class="title">您还没有注册，是否注册?</div>
				<div class="discribe">
					<p class='sam'>我们会获取您的昵称、头像等信息</p>
				</div>
				<div class="buttonbox">
					<navigator class="cancel" target="miniProgram" open-type="exit" >取消</navigator>
					<button class="ok" type="primary"  open-type="getUserInfo" @getuserinfo="bindGetUserInfo">一键注册</button>
				</div>
			</div>
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
	import {
		getOpenid
	} from '@/uitils'

	export default {
		data() {
			return {
				title: 'Hello',
				list: [],
				count: 0,
				limit: 20,
				openid: '',
				skip:0,
				showAuth: false,
				userInfo: {
					sign: null
				},
			}
		},
		async onShow() {
			this.isGetLocation();
			this.renderList(this.skip);
			let openid = await getOpenid()
			if (openid) {
				uni.setStorageSync('openid', openid)
				this.openid = openid
				this.initPage(openid)
			} else {
				uni.showToast({
					title: 'openid 获取失败',
					icon: 'none'
				})
			}
		},
		async onLoad() {

		},
		methods: {
			
			bindCancel(){
				this.showAuth = false
			},
			goto(lat, lon, numbers) {
				wx.getLocation({ //获取当前经纬度
					type: 'wgs84', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息
					success: function(res) {
						wx.openLocation({ //​使用微信内置地图查看位置。
							latitude: lat * 1, //要去的纬度-地址
							longitude: lon * 1, //要去的经度-地址
							name: numbers,
							address: numbers
						})
					}
				})
			},
			renderList(skip = 0) {
				let that = this
				basan
					.orderBy('createTime', 'desc')
					.limit(this.limit)
					.skip(skip)
					.watch({
						onChange: function() {
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
				uni.getSetting({
					success: (res) => {
						if (res.authSetting['scope.userInfo']) {
							console.log('授权过了')
							user.where({
								'_openid': openid
							}).get().then(res => {
								let {
									data
								} = res
								if (data.length === 0) {
									this.addUser()
								} else {
									this.userInfo = data[0]
									uni.setStorageSync('userInfo', data[0])
								}
							})
						} else {
							this.showAuth = true
						}
					}
				})
			},


			addUser() {
				uni.getUserInfo({
					lang: 'zh_CN',
					success: (res) => {
						let {
							nickName,
							city,
							province,
							avatarUrl,
							gender
						} = res.userInfo
						Vue.set(this.userInfo, 'nickName', nickName)
						Vue.set(this.userInfo, 'city', city)
						Vue.set(this.userInfo, 'province', province)
						Vue.set(this.userInfo, 'avatarUrl', avatarUrl)
						Vue.set(this.userInfo, 'gender', gender)
						Vue.set(this.userInfo, 'fishingDot', 100)
						Vue.set(this.userInfo, 'favorites', [])
						Vue.set(this.userInfo, 'createTime', new Date())
						let {
							fishingDot,
							favorites,
							createTime,
						} = this.userInfo
						user.add({
							data: {
								nickName: nickName,
								city,
								province,
								avatarUrl,
								gender,
								fishingDot,
								favorites,
								createTime,
							}
						}).then(info => {
							let {
								errMsg
							} = info
							if (errMsg == 'collection.add:ok') {
								this.showAuth = false
								user.where({
									'_openid': this.openid
								}).get().then(re => {
									let {
										data
									} = re
									this.userInfo = data[0]
									uni.setStorageSync('userInfo', data[0])
								})
							}
						})
					}
				})
			},


			bindGetUserInfo() {
				this.showAuth = false
				user.where({
					'_openid': this.openid
				}).get().then(res => {
					let {
						data
					} = res
					if (data.length === 0) {
						this.addUser()
					} else {
						this.userInfo = data[0]
						uni.setStorageSync('userInfo', data[0])
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
				var that = this;
				uni.getLocation({
					type: 'wgs84',
					success(res) {}
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
				this.isGetLocation()
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
