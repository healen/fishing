<template>
	<div v-if="userInfo">
		<div class="mecontent">
			<div class="header">
				<image :src="userInfo.avatarUrl" mode="scaleToFill" class="avatar"></image>
				<div class='nick'>{{userInfo.nickName}}</div>
				<div class='fishing'>
					渔点: {{userInfo.fishingDot}}
				</div>
			</div>
			
			<div class="cont">
				
				<navigator class="list use" url="../add/add">钓点钓点</navigator>
				
				
				<div class="list" @click='nonono'>
					编辑个人签名
				</div>
				
				
				<div class="list" @click='nonono'>
					我收藏的钓点
				</div>
				<div class="list" @click='nonono'>
					我的钓点
				</div>
				
				
				
			</div>
			
			
			
			
			
		</div>
	</div>
</template>

<script>
	export default {
		data(){
			return {
				userInfo:null
			}
		},
		onShow(){
			let userInfo = uni.getStorageSync('userInfo')
			if(userInfo){
				this.userInfo=userInfo
			}else{
				uni.switchTab({
					url:'../index/index'
				})
			}
		},
		methods:{
			nonono(){
				uni.showToast({
					title:'功能开发中...'
				})
			}
			
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
