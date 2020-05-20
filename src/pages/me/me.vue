<template>
	<div>
		<div class="mecontent">
			<div class="header">

				<div v-if="userInfo">
					<image :src="userInfo.avatarUrl" mode="scaleToFill" class="avatar"></image>
					<div class='nick'>{{userInfo.nickName}}</div>
					<div class="discribe">{{userInfo.desc}}</div>
					<div class='fishing'>
						渔点: {{userInfo.fishingDot}}
					</div>
				</div>
				<div v-else>
					<image src="@/static/notlogin.png" mode="scaleToFill" class="avatar notlogin"></image>
					<div class='nick'>未登录</div>
					<button size="mini" class="loginbtn" @click="bindLogin">登陆/注册</button>
				</div>
			</div>
			<div class="cont">


				<div class="list use" @click="addBeson">
					添加钓点
				</div>

				<div class="list" @click='nonono'>
					编辑个人签名
				</div>
				<div class="list" @click='nonono'>
					我收藏的钓点
				</div>
				<div class="list" @click='nonono'>
					我的钓点
				</div>




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
	const db = wx.cloud.database({
		env: 'fishing-7xw3p'
	})
	const user = db.collection('user')
	import auth from '@/components/auth/index.vue'
	export default {
		data() {
			return {
				userInfo: null,
				showAuth: false,
			}
		},
		components: {
			auth
		},
		onShow() {
			let userInfo = uni.getStorageSync('userInfo')
			if (userInfo) {
				this.userInfo = userInfo
			} else {

			}
		},
		methods: {
			nonono() {
				uni.showToast({
					title: '功能开发中...',
					icon: 'none'
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
						url: '../add/add'
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
