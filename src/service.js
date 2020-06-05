import config from '@/config'
import req from '@/req'

export async function getOpenid() {
	const promise = new Promise((resolve, reject) => {
		uni.login({
			success: (res) => {
				let {
					code
				} = res
				req.post('/getOpenid', {
					code
				}).then(respose => {

					let {
						data,
						success,
						msg
					} = respose
					if (success) {
						resolve(data.openid)
					} else {
						reject(respose)
					}
				}).catch(err => {
					reject(err)
					console.error(err)

				})
			}
		})
	})
	return promise
}



/* 
注册用户 
 */
export async function regUser(data) {
	return req.post('/regUser', data)
}

/**
 * 删除文件
 */

export async function deleteFile (fileName) {
	return req.post('/deleteFile',{fileName})
}

/**
 * 添加钓点
 */
export async function addBasan (data) {
	return req.post('/addBasan', data)
}

/* 
 根据openid查询用户
 */
export async function getUserByOpenid(openid) {
	return req.post('/getUserById', {
		openid
	})
}
/* 
 根据id查用户
 */
export async function getUserById(id) {
	return req.post('/getUserById', {
		id
	})
}
