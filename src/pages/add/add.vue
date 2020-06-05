<template>
	<div class="add">
		<div class='labels'>[地址信息]</div>
		<map :latitude="lat" :longitude="lon" scale="12" :markers="markers"></map>
		<div class="address">
			<div class="info">
				地址:{{address}}{{addressInfo}}
				<span class="readdr" @click="editLocation">不用当前地址，我要选择新地址</span>
			</div>
		</div>
		<div class='labels'>[上传照片]</div>
		<div class="add_img">
			<div class="add_btn" v-for="(img,index) in imgbox" :key="index">
				<image class="img" :src="img" mode="aspectFill"></image>
				<span @click='imgDelete(index)'>+</span>
			</div>
			<div class="add_btn" v-if="imgbox.length<maxImgLenth" @click="addPic">
				<m-icon type='photo' size="25" />
			</div>
		</div>
		<div class='labels'>[上传视频]</div>
		<div class="add_img">
			<video v-if="video" :src="video" controls></video>
			<div class="add_btn" v-if="imgbox.length<maxImgLenth" @click="addVideo">
				<m-icon type='video' size="25" />
			</div>
		</div>
		<div class='labels'>[输入描述]</div>
		<div class="desc">
			<textarea class="input" placeholder="请输入描述" v-model="des" />
			</div>
		<div class='labels'>[鱼种]</div>
		<input class="inputs" type="text" value="" v-model="fishType" placeholder="请输入鱼的种类 鲫鱼 鲤鱼 白条 翘嘴" />
		<div class='labels'>[钓点类型]</div>
		<div class="beason_type">
			<span  v-for="(item,key) in basanArr" :class="{'selected':(item==basanType)}" :key="key" @click="changeBasonType(item)">
				{{item}}
			</span>
		</div>
    <button class="send" @click="send" type="primary">提交</button>
  </div>
</template>

<script>
  import config from '@/config'
  import {deleteFile,addBasan} from '@/service'
  import mIcon from '@/components/mIcon'
  import {qqMapSdk} from '@/uitils'
  export default {
    name: 'add',
    data() {
      return {
        imgbox: [], //图片缓存地址
		maxImgLenth:4,
        imgs: [], //上传服务器后返回的值
		video:'',
		markers:{},
        des: '',
        lat: '',
        lon: '',
        province: '',
        city: '',
        district: '',
        street: '',
		address:'',
		addressInfo:'',
		basanType:'野钓',
		fishType:'',
		basanArr:[
			'野钓',
			'黑坑',
			'水库'
		]
		
      }
    },
	components:{
		mIcon
	},
    onLoad() {
      this.getLocationInfo()
    },
    methods: {
		
		
      // 删除照片 &&
      async imgDelete(index) {
		let {imgbox,imgs} = this
		let temp = imgs[index].split('/')
		let fileName = temp[temp.length-1] 
        imgbox.splice(index, 1)
		this.imgbox = imgbox		
		try{
			let delete_file = await deleteFile(fileName)
			let {success,msg} = delete_file
			if(success){
				imgs.splice(index, 1)
				this.imgs = imgs
				
			}else{
				console.error(msg)
			}
		}catch(e){
			console.error(e)
		}
      },
	  changeBasonType(type){
		this.basanType = type  
	  },
	  
	  
	  
      addPic(e) {	
		let {imgbox,maxImgLenth} = this;
		let n = imgbox.length==0 ? maxImgLenth : maxImgLenth-imgbox.length; 
        uni.chooseImage({
          count: n, // 默认4张，设置图片张数
          sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success:  (res) => {
            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
            var tempFilePaths = res.tempFilePaths
            if (imgbox.length == 0) {
              imgbox = tempFilePaths
            } else if (imgbox.length>1) { 
              imgbox = imgbox.concat(tempFilePaths);
            }
            this.imgbox = imgbox;
			this.uploadPice(imgbox);
          }
        })
      },
	  addVideo(e){
		  uni.chooseVideo({
			  maxDuration:10,
			  success:res=>{
				  let {tempFilePath} = res
				  this.uploadPice(tempFilePath)
			  }
		  })
	  },
	 
	  async uploadPice(imgbox){ 
		  if(typeof imgbox==='string'){
			  
			  if(this.video !== ''){
				  let temp = this.video.split('/')
				  let fileName = temp[temp.length-1]
				  
				  try{
				  	let delete_file = await deleteFile(fileName)
				  	let {success,msg} = delete_file
				  	if(success){
				  					console.log('之前视频删除成功')
				  	}else{
				  		console.error(msg)
				  	}
				  }catch(e){
				  	console.error(e)
				  }
				  
			  }
			  
			  
			  
			  
			  
			  
			  uni.uploadFile({
			  	url:`${config.baseURL}/upload`,
			  	filePath:imgbox,
			  	name:'basanImg',
			  	success:(res)=>{
			  		let result = res.data;					
			  		let {success,data} =  JSON.parse(result)
			  		if(success==true){
						
						
						
						
			  			this.video = data
			  		}
			  	}
			  })
		  }else{
			  for(let i=this.imgs.length;i<imgbox.length;i++){
			  	uni.uploadFile({
			  		url:`${config.baseURL}/upload`,
			  		filePath:imgbox[i],
			  		name:'basanImg',
			  		success:(res)=>{
			  			let result = res.data;					
			  			let {success,data} =  JSON.parse(result)
			  			if(success==true){
			  				this.imgs.push(data)
			  			}
			  		}
			  	})
			  }
			  
		  }
	  },
	  
	  


      //发布按钮
      send(e) {
        let that = this
		if(!this.imgbox.length){
			wx.showToast({
			  icon: 'none',
			  title: '图片类容为空'
			});
			return 
		}
		let {
				imgs,
				video,
				des, 
				lat, 
				lon, 
				province, 
				city, 
				district,
				address,
				addressInfo,
				basanType,
				fishType
			} = this
			let {
				openid,
				id
			} = uni.getStorageSync('userInfo')
			let userId = id
			addBasan({
				userId,
				openid,
				imgs:JSON.stringify(imgs),
				video,
				des, 
				lat, 
				lon, 
				province, 
				city, 
				district,
				address,
				addressInfo,
				basanType,
				fishType
			}).then(res=>{
				if(res.success){
					uni.switchTab({
					  url: '/pages/index/index'
					})
				}
			}).catch(e=>{
				console.error(e)
			})
      },
	  editLocation(){
		  uni.chooseLocation({
			latitude:this.lat*1,
			longitude:this.lon*1,
		  	success:(res)=>{
				console.log(res)
				this.lat = res.latitude.toString()
				this.lon = res.longitude.toString()
				this.getLocationFn(this.lat*1,this.lon*1)
				
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
			this.getLocationFn(this.lat*1,this.lon*1)
          }
        });
      },
	  
	  
	  getLocationFn(lat,lon){
		  qqMapSdk.reverseGeocoder({
			  location:`${lat},${lon}`,
			  success:res=>{				  
				  let {province, city, district, street,street_number} = res.result.address_component
				  let {address,formatted_addresses} = res.result
				  this.province = province;
				  this.city = city;
				  this.district = district;
				  this.street = street;
				  this.street_number = street_number
				  this.address = address
				  this.addressInfo = formatted_addresses.rough
				  this.markers=[
					  {
						latitude:lat,
						longitude:lon,
						title:`${address}${formatted_addresses.rough}`
									  
					  }
				  ]
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
  @import 'add.less';
</style>
