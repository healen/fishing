<template>
	<div class="auth" v-if="show">
		<div class="autncontent">
			<div class="title">您还没有注册，是否注册?</div>
			<div class="discribe">
				<p class='sam'>我们会获取您的昵称、头像等信息</p>
			</div>
			<div class="buttonbox">
				<button class="cancel" @click="bindCancel()">取消</button>
				<button class="ok" type="primary" open-type="getUserInfo" @getuserinfo="bindGetUserInfo">一键注册</button>
			</div>
		</div>
	</div>
	
</template>

<script>
	export default {
		name:'auth',
		props:{
			show:{
				type:Boolean,
				default:false
			}
		},
		methods:{
			bindCancel(){
				this.$emit('cancel')
			},
			bindGetUserInfo(){
				this.$emit('auth')
			}
			
		}
	}
</script>

<style lang="less">
	@import "index.less";
</style>
