import axios from 'axios';
import { ElMessage } from 'element-plus';
import {useTokenStore} from '@/stores/token.js';
import router from '../router';
//公共的前缀 
const baseURL = '/api';
const instance = axios.create({baseURL})

//请求拦截器
instance.interceptors.request.use(
    (config)=>{
        const tokenStore = useTokenStore();
        if(tokenStore.token){
            config.headers.Authorization = tokenStore.token
        }
        return config;
    },
    (err)=>{
        Promise.reject(err)
    }
)
//响应拦截器
instance.interceptors.response.use(
    result=>{
        if(result.data.code==0){
            return result.data;
          }
          ElMessage.error(result.data.message || '服务异常')
          return Promise.reject(result.data)
    },
    err=>{
        if(err.response.status === 401){
            ElMessage.error('请先登录')
            router.push('/login')
        }else{
            ElMessage.error('服务异常')
        }
        return Promise.reject(err);
    }
)

export default instance;