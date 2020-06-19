<template>
	<div>
		<div class="mecontent">
			<div class="header">
				<div v-if="userInfo.nickName">
					<image :src="userInfo.avatarUrl" mode="scaleToFill" class="avatar"></image>
					<div class='nick'>{{userInfo.nickName}}</div>
					<div class="discribe">{{userInfo.des}}</div>
					<div class='fishing'>
						渔点: {{userInfo.point}}
					</div>
				</div>
				<div v-else>
					<image src="@/static/notlogin.png" mode="scaleToFill" class="avatar notlogin"></image>
					<div class='nick'>未登录</div>
					<button size="mini" class="loginbtn" @click="bindLogin">快速登陆</button>
				</div>
			</div>
			<div class="cont">
				<div class="list use" @click="addBeson">
					添加钓点
				</div>
				<div class="list" @click='nonono'>
					我的钓点
				</div>
				<div class="list" @click='nonono'>
					我的收藏
				</div>
				
				<div class="list" @click='nonono'>
					修改个人信息
				</div>
				
				<template v-if='userInfo.purview ==2'>
					<div class="list" @click="goAdminIndex">钓点管理</div>
				</template>
				<template v-if='userInfo.purview ==3'>
					<div class="list" @click="goAdminIndex">用户管理</div>
				</template>
				
				<template v-if='userInfo.purview ==4'>
					<div class="list" @click="goAdminIndex">钓点管理</div>
					<div class="list" @click="goAdminIndex">用户管理</div>
				</template>
				
				<button class="posion" open-type="contact" session-from="weapp">
					<div>提交宝贵意见</div>
					<image src="@/static/xin.png" mode="scaleToFill"></image>
				</button>
			</div>
		</div>
		<auth :show="showAuth" @cancel="bindCancel()" @auth="bindGetUserInfo" />
	</div>
</template>

<script>
	import auth from '@/components/auth/index.vue'
	import {getUserByOpenid,regUser} from '@/service'
	import Vue from 'vue'
	export default {
		data() {
			return {
				userInfo: {},
				showAuth: false,
				openid:''
			}
		},
		components: {
			auth
		},
		onShow() {
			let userInfo = uni.getStorageSync('userInfo')
			this.openid = uni.getStorageSync('openid')
			if (userInfo) {
				this.userInfo = userInfo
			}else{
				this.showAuth = true
			}
		},
		methods: {
			nonono() {
				uni.showToast({
					title: '功能开发中...',
					icon: 'none'
				})
			},
			goAdminIndex(){
				uni.navigateTo({
					url:'../adminIndex/adminIndex'
				})
			},

			addBeson() {
				let userInfo = uni.getStorageSync('userInfo')
				if (!userInfo) {
					uni.showToast({
						title: '您还没有登陆，请先登陆',
						icon: 'none'
					})
				} else {
					uni.navigateTo({
						url: '../addBasan/addBasan'
					})
				}
			},
			// 取消授权
			bindCancel() {
				this.showAuth = false
			},
			bindLogin() {
				this.showAuth = true
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
				
				getUserByOpenid(this.openid).then(res=>{
					let {msg,data,success} = res
					if(success) {
						if(data){
							this.userInfo = data
							uni.setStorageSync('userInfo',data)
						}else{
							console.log(this.openid,2)
							
							this.addUser(this.openid)
						}
					}else{
						console.error(msg)
					}
				}).catch(err=>{
					console.error()(err)
				})
			},

		}

	}
</script>

<style lang="less">
	page {
		height: 100%;
		background: #fffbf7;
	}

	@import "./me.less";
</style>
