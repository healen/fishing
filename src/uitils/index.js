import getOpenid from './src/getOpenid'
import QQMapWX from './src/qqmap-wx-jssdk'
import config from '@/config'

const qqMapSdk = new QQMapWX({
	key:config.qqMapKey
})export {  getOpenid,
  qqMapSdk}