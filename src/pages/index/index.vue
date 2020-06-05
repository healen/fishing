<template>
	<view class="content">
		<scroll-view class="listview" @scrolltolower='nextPage' scroll-y="true">
			<div class="header">
				<image src="@/static/indexbanner.png" class="bg" mode="aspectFill"></image>
				<template v-if="!notLogin">
					<image :src="userInfo.avatarUrl" mode="scaleToFill" class="avatar"></image>
					<div class="text">
						<div class="name">
							{{userInfo.nickName}}大师
							<div class="wecom">{{wecom}}</div>
						</div>
					</div>
				</template>
				<template v-else>
					<image src="@/static/notlogin.png" mode="scaleToFill" class="avatar notlogin"></image>
					<div class="text">
						<div class="name">大师！您还没登录！</div>
						<div class="desc">
							<button size="mini" class="loginbtn" @click="bindLogin">快速登陆</button>
						</div>
					</div>
				</template>
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
							{{item.createTimeShow.slice(0,8)}}
							{{item.address}}
							<span class="goto" @click="goDetail(item._id)">查看详情</span>

						</div>
					</div>
				</div>
				<div class='loadingbar' v-if="showLoading">{{loadingText}}</div>
			</div>
		</scroll-view>

		<auth :show="showAuth" @cancel="bindCancel()" @auth="bindGetUserInfo" />


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
	import auth from '@/components/auth/index.vue'
	import {
		getOpenid,
		getUserByOpenid,
		regUser
	} from '@/service'

	export default {
		data() {
			return {
				title: 'Hello',
				lon:'',
				lat:'',
				list: [],
				count: 0,
				limit: 10,
				openid: '',
				skip: 0,
				showAuth: false,
				notLogin: false,
				loadingText: '',
				showLoading: false,
				userInfo: {
					nickName: '',
					sign: null
				},
			}
		},
		computed: {
			wecom() {
				let d = new Date().getHours()
				if (d >= 0 && d < 5) {
					return '深夜了，再守一会儿，有大鱼哟！'
				} else if (d >= 5 && d < 7) {
					return '早上好！这个时候，鱼刚睡醒处于懵逼状态，好钓哟！'
				} else if (d >= 7 && d < 12) {
					return '上午好！抓紧占钓位哟！'
				} else if (d >= 12 && d < 14) {
					return '中午好！中午要钓深哟！'
				} else if (d >= 14 && d < 18) {
					return '下午好！快点抽吧！来口了哟！'
				} else if (d >= 18 && d < 24) {
					return '晚上好！快去夜钓吧，有大鱼哟！'
				}
			}
		},


		onShareAppMessage() {

		},
		components: {
			auth
		},
		async onShow() {
			if (uni.getStorageSync('userInfo')) {
				this.showAuth = false
				this.notLogin = false
			}
			this.isGetLocation();
			this.refsList(this.skip);
			try {

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

			} catch (e) {
				console.error(e)
			}
		},
		async onLoad() {

		},
		methods: {
			// 取消授权
			bindCancel() {
				this.showAuth = false
			},

			goDetail(id) {
				uni.navigateTo({
					url: `../basanDetail/basanDetail?id=${id}`
				})
			},

			// 去这里


			// 刷新钓点列表
			refsList(skip = 0) {
				basan
					.orderBy('createTime', 'desc')
					.where({
						'reviewed': 1
					})
					.limit(this.limit)
					.skip(skip)
					.get()
					.then(res => {

						if (skip == 0) {
							this.list = res.data
						} else {
							if (res.data.length !== 0) {
								this.loadingText = '钓点加载中...'
								this.list.push(...res.data)
								this.showLoading = false
							} else {
								// this.loadingText = '没有更多钓点了...'
								// setTimeout(()=>{
								// 	this.showLoading = false

								// },1000)
							}

						}


					})
			},

			// 滚动到底部
			nextPage() {

				let count = basan.where({
					'reviewed': 1
				}).count

				let page = Math.ceil(count / this.limit)

				if (this.skip <= page) {
					this.skip++
					this.loadingText = '钓点加载中...'
					this.showLoading = true
					this.refsList(this.skip)
				} else {
					this.loadingText = '没有更多钓点了...'
					setTimeout(() => {
						this.showLoading = false

					}, 1000)
				}



			},
			bindLogin() {
				this.showAuth = true
			},

			initPage(openid) {
				this.findUser(openid, () => {
					uni.getSetting({
						success: async (res) => {
							if (res.authSetting['scope.userInfo']) {
								this.addUser(openid)
							} else {
								uni.removeStorageSync('userInfo')
								this.notLogin = true
								this.showAuth = true
							}
						}
					})
				})
			},

			async findUser(openid, callback) {
				try {
					let getUser = await getUserByOpenid(openid)
					let {
						success,
						data,
						msg
					} = getUser

					if (success) {
						if (!data) {
							callback && callback()

						} else {
							this.userInfo = data
							this.notLogin = false
							uni.setStorageSync('userInfo', data)

						}
					}

				} catch (e) {
					console.error(e)
				}
			},


			addUser(openid) {
				uni.getUserInfo({
					lang: 'zh_CN',
					success: async (res) => {
						let {
							nickName,
							city,
							country,
							province,
							avatarUrl,
							gender
						} = res.userInfo
						Vue.set(this.userInfo, 'nickName', nickName)
						Vue.set(this.userInfo, 'avatarUrl', avatarUrl)
						try {
							let regu = await regUser({
								nickName,
								city,
								country,
								province,
								avatarUrl,
								gender,
								point: 100,
								openid,
							})
							let {
								success,
								msg,
								data
							} = regu
							if (success) {
								this.showAuth = false
								this.findUser(openid)
							} else {
								console.error(msg)
							}

						} catch (e) {
							console.error(e)
						}
					}
				})
			},


			bindGetUserInfo() {
				this.showAuth = false
				this.initPage(this.openid)
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
					type: 'gcj02',
					success:(res)=>{
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
