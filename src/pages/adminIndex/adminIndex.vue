<template>
	<view class="content">
		<scroll-view class="listview" @scrolltolower='nextPage' scroll-y="true">
			<div class="inview">
				<div class="list" v-for="(item,index) in list" :key="index" :class="{'dele':item.reviewed==0}">
					<image :src="item.creater.avatarUrl" class="avatarsamll" mode="widthFix"></image>
					<div class="right">
						<div class="name">{{item.creater.nickName}}</div>
						<div class="con">
							{{item.desc}}
						</div>
						<div class="time">
							{{item.createTimeShow.slice(0,8)}}
							{{item.address}}
						</div>
						<div class="btnbox">
							<button type="primary" size="mini" @click="goDetail(item._id)">前往审核</button>
							<button type="warn" size="mini" @click="removeBas(item)">删除钓点</button>
						</div>
					</div>
				</div>
				<div class='loadingbar' v-if="showLoading">{{loadingText}}</div>
			</div>
		</scroll-view>
		


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
				
				list: [],
				count: 0,
				limit: 20,
				skip: 0,
				loadingText:'',
				showLoading:false,
				
			}
		},
		
		
	
		
		async onShow() {
			this.refsList(this.skip);
		},

		methods: {
	
			goDetail(id){
				uni.navigateTo({
					url:`../basanDetail/basanDetail?id=${id}&reviewed=1`
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
								
							}
							
						}
						
						
					})
			},
			
			
			
			removeBas(item){
				let that = this
				basan.doc(item._id).remove({
					success(){
						
						
						wx.cloud.deleteFile({
							fileList:item.pictures,
							success(){
								that.refsList(0)
							}
						})
						
						
						
						
					}
				})
			},
			
			
			

			// 滚动到底部
			nextPage() {
				
				let count = basan.where({
						'reviewed':1
					}).count
				
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
				
			}
			

		

			

			
			
			
			
		}
	}
</script>

<style lang="less">
	page {
		height: 100%;
		background: #fffbf7;
	}

	@import 'adminIndex.less';
</style>
<style>

</style>
