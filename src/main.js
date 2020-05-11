import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

App.mpType = 'app'


Vue.prototype.$appid='wxb6a27ad25a37c5f2'
Vue.prototype.$secrets='85065f9d2a10187b15f205dc4c29c9f4'

const app = new Vue({
  ...App
})
app.$mount()
