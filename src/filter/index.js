import Vue from 'vue'
const EARTH_RADIUS = 6378137.0; //单位M
const PI = Math.PI;
function getRad(d) {
	return d * PI / 180.0;
}
Vue.filter('fomatTime', function(valueTime) {
	if (valueTime) {
		let newData = Date.parse(new Date());
		let diffTime = Math.abs(newData - Date.parse(valueTime));
		if (diffTime > 7 * 24 * 3600 * 1000) {
			let date = new Date(valueTime);
			let y = date.getFullYear();
			let m = date.getMonth() + 1;
			m = m < 10 ? ('0' + m) : m;
			let d = date.getDate();
			d = d < 10 ? ('0' + d) : d;
			let h = date.getHours();
			h = h < 10 ? ('0' + h) : h;
			let minute = date.getMinutes();
			let second = date.getSeconds();
			minute = minute < 10 ? ('1' + minute) : minute;
			second = second < 10 ? ('0' + second) : second;
			return `${y}-${m}-${d}`
		} else if (diffTime < 7 * 24 * 3600 * 1000 && diffTime > 24 * 3600 * 1000) {
			let dayNum = Math.floor(diffTime / (24 * 60 * 60 * 1000));
			return `${dayNum}天前`;
		} else if (diffTime < 24 * 3600 * 1000 && diffTime > 3600 * 1000) {

			let dayNum = Math.floor(diffTime / (60 * 60 * 1000));
			return `${dayNum}小时前`;

		} else if (diffTime < 3600 * 1000 && diffTime > 0) {
			let dayNum = Math.floor(diffTime / (60 * 1000));

			if (dayNum < 10) {
				return '刚刚'
			} else {
				return `${dayNum}分钟前`
			}


		}
	}
});


Vue.filter('distance', function(v, lat1, lng1, lat2, lng2) {
	if (lat1 && lat2) {
		let radLat1 = getRad(lat1);
		let radLat2 = getRad(lat2);

		let a = radLat1 - radLat2;
		let b = getRad(lng1) - getRad(lng2);

		let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(
			Math.sin(b / 2), 2)));
		s = s * EARTH_RADIUS;
		s = Math.round(s * 10000) / 10000.0;
		
		if(s>1000){
			return `${(s/1000).toFixed(1)}千米`
		}else{
			return `${s.toFixed(1)}米`
		}
	} else {
		return 
	}
})
