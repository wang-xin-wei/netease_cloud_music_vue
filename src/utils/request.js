import axios from 'axios' //引入axios

import { Toast } from 'vant' //vant 组件库 

const instance = axios.create({
	baseURL: '',
	timeout: 1000 * 12,
})

instance.defaults.headers.post['Content-Type'] =
	'application/x-www-form-urlencoded' //设置默认请求头

// 先导入vuex,因为我们要使用到里面的状态对象
// import store from '@/store/index'

// 请求拦截器
instance.interceptors.request.use(
	config => {
		// 每次发送请求之前判断vuex中是否存在token
		// 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
		// 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
		// const token = store.state.token
		token && (config.headers.Authorization = token)
		return config
	},
	error => {
		return Promise.error(error)
	}
)

// 响应拦截器
instance.interceptors.response.use(
	response => {
		// 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
		// 否则的话抛出错误
		if (response.status === 200) {
			return Promise.resolve(response)
		} else {
			return Promise.reject(response)
		}
	},
	error => {
		if (error.response.status) {
			switch (error.response.status) {
				// 401: 未登录
				// 未登录则跳转登录页面，并携带当前页面的路径
				// 在登录成功后返回当前页面，这一步需要在登录页操作。
				case 401:
					router.replace({
						path: '/login',
						query: {
							redirect: router.currentRoute.fullPath,
						},
					})
					break

				// 403 token过期
				// 登录过期对用户进行提示
				// 清除本地token和清空vuex中token对象
				// 跳转登录页面
				case 403:
					Toast({
						message: '登录过期，请重新登录',
						duration: 1000,
						forbidClick: true,
					})
					// 清除token
					localStorage.removeItem('token')
					// store.commit('loginSuccess', null)
					// 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
					setTimeout(() => {
						router.replace({
							path: '/login',
							query: {
								redirect: router.currentRoute.fullPath,
							},
						})
					}, 1000)
					break

				// 404请求不存在
				case 404:
					Toast({
						message: '网络请求不存在',
						duration: 1500,
						forbidClick: true,
					})
					break
				// 其他错误，直接抛出错误提示
				default:
					Toast({
						message: error.response.data.message,
						duration: 1500,
						forbidClick: true,
					})
			}
			return Promise.reject(error.response)
		}
	}
)

export default instance
