<template>
	<div class="detail">
		
		
		<div class="h2">
			{{detail.desc}}
		</div>
		
		<div class="bottom">
			<div>发布人：{{detail.creater.nickName}}</div>
			<div>发布时间：{{detail.createTimeShow}}</div>
			<div>地址：{{detail.city}} {{detail.street}} {{detail.street_number}}</div>
		</div>
		
		
		
		
		<map class="map" :latitude="detail.lat" show-location :longitude="detail.lon" :markers="markers" style="width:100%"></map>
		
		<button type="primary" class="btn" @click="goto(detail.lat,detail.lon,detail.street,detail.street_number)">我要去这里</button>
		
		
		<div class="title">[渔货]</div>
		
		<div class="imgs">
			<div class="imglist" v-for="(pice,index) in detail.pictures" :key="index">
				<image :src="pice" mode="widthFix"></image>
			</div>
		</div>
		
		
	
	</div>
</template>

<script>
	const db = wx.cloud.database({
		env: 'fishing-7xw3p'
	})
	const user = db.collection('user')
	const basan = db.collection('basan')
	const _ = db.command

	export default {
		name: "basanDetail",
		data() {
			return {
				detail: null,
				markers: {}
			}
		},
		onLoad(options) {
			let {
				id
			} = options
			basan.doc(id).get().then(res => {
				if (res.errMsg == 'document.get:ok') {
					this.detail = res.data

					this.markers = [{
						latitude: res.data.lat,
						longitude: res.data.lon
					}]
				}
			})
		},
		methods:{
			goto(lat, lon, numbers,ad) {
				wx.getLocation({ //获取当前经纬度
					type: 'wgs84', //返回可以用于wx.openLocation的经纬度，官方提示bug: iOS 6.3.30 type 参数不生效，只会返回 wgs84 类型的坐标信息
					success: function(res) {
						wx.openLocation({ //​使用微信内置地图查看位置。
							latitude: lat * 1, //要去的纬度-地址
							longitude: lon * 1, //要去的经度-地址
							name: numbers,
							address: ad?ad:numbers
						})
					}
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

	@import "basanDetail.less";
</style>
