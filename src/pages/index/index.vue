<template>
	<view class="content">
		<scroll-view class="listview" @scrolltolower='nextPage' scroll-y="true">
			<div class="header">
				<image src="@/static/indexbanner.png" class="bg" mode="scaleToFill"></image>
				<div v-if="!notLogin">
					<div class="text">
						<div class="name" >{{userInfo.nickName}}</div>
						<div class="desc">
							{{userInfo.desc||''}}
						</div>
					</div>
					<image :src="userInfo.avatarUrl" mode="scaleToFill" class="avatar"></image>
				</div>
				<div v-else>
					<div class="text">
						<div class="name">未登录</div>
						<div class="desc">
							<button size="mini" class="loginbtn" @click="bindLogin">登陆/注册</button>
						</div>
					</div>
					<image src="@/static/notlogin.png" mode="scaleToFill" class="avatar notlogin"></image>
				</div>
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
							{{item.city}} {{item.district}}
							<span class="goto" @click="goDetail(item._id)">查看详情</span>

						</div>
					</div>
				</div>
				<div class='loadingbar' v-if="showLoading">{{loadingText}}</div>
			</div>
		</scroll-view>
		
		<auth :show="showAuth" @cancel="bindCancel()" @auth="bindGetUserInfo"/>


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
		getOpenid
	} from '@/uitils'

	export default {
		data() {
			return {
				title: 'Hello',
				list: [],
				count: 0,
				limit: 10,
				openid: '',
				skip: 0,
				showAuth: false,
				notLogin: false,
				loadingText:'',
				showLoading:false,
				
				userInfo: {
					nickName:'',
					sign: null
				},
			}
		},
		components:{
			auth
		},
		async onShow() {
			
			if(uni.getStorageSync('userInfo')){
				this.showAuth = false
				this.notLogin = false
			}
			
			
			this.isGetLocation();
			this.refsList(this.skip);
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
			// 取消授权
			bindCancel() {
				this.showAuth = false
			},
			
			goDetail(id){
				uni.navigateTo({
					url:`../basanDetail/basanDetail?id=${id}`
				})
			},

			// 去这里
		

			// 刷新钓点列表
			refsList(skip = 0) {
				basan
					.orderBy('createTime', 'desc')
					.limit(this.limit)
					.skip(skip)
					.get()
					.then(res => {
						
						if(skip==0){
							this.list = res.data
						}else{
							if(res.data.length!==0){
								this.loadingText = '钓点加载中...'
								this.list.push(...res.data)
								this.showLoading = false
							}else{
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
				
				let count = basan.count
				
				let page = Math.ceil(count/this.limit)
				
				if(this.skip<=page){
					this.skip++
					this.loadingText = '钓点加载中...'
					this.showLoading = true
					this.refsList(this.skip)
				}else{
					this.loadingText = '没有更多钓点了...'
					setTimeout(()=>{
						this.showLoading = false
						
					},1000)
				}
				
				
				
			},
			bindLogin() {
				this.showAuth = true
			},

			initPage(openid) {
				uni.getSetting({
					success: (res) => {
						if (res.authSetting['scope.userInfo']) {
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
							uni.removeStorageSync('userInfo')
							this.notLogin = true
							
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
								desc:'',
								purview:'',
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
					this.notLogin = false
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
