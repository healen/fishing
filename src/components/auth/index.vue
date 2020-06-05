<template>
	<div class="auth" v-if="show">
		<div class="autncontent">
			<div class="title">温馨提示</div>
			<div class="discribe">
				<p class='sam'>大师！您还没登录呢！是否登陆？</p>
			</div>
			<div class="buttonbox">
				<button class="cancel" @click="bindCancel()">不用了谢谢</button>
				<button class="ok" type="primary" open-type="getUserInfo" @getuserinfo="bindGetUserInfo">快速登陆</button>
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
