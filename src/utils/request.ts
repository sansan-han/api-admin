import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '../config/api';
import { message } from 'antd';

// 创建自定义的axios实例类型
interface CustomAxiosInstance extends AxiosInstance {
  get<T = any>(url: string, config?: any): Promise<T>;
  post<T = any>(url: string, data?: any, config?: any): Promise<T>;
  put<T = any>(url: string, data?: any, config?: any): Promise<T>;
  delete<T = any>(url: string, config?: any): Promise<T>;
}

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}) as CustomAxiosInstance;

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    const apiKey = localStorage.getItem('apiKey');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    
    console.log('Request:', config.url, 'Token:', token ? 'exists' : 'missing', 'API Key:', apiKey ? 'exists' : 'missing');
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  response => response.data,
  (error: AxiosError) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      const errorData = error.response?.data as any;
      
      // 检查是否是因为缺少 API Key 而不是 token 失效
      if (errorData?.error?.includes('API Key')) {
        // 不跳转登录页，只是提示缺少 API Key
        if (window.location.pathname !== '/settings') {
          message.warning('请在系统设置中配置 API Key');
        }
      } else if (errorData?.error?.includes('token') || errorData?.error?.includes('Token')) {
        // 只有明确是 token 问题才跳转登录
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          message.error('登录已过期，请重新登录');
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
      // 其他401错误不自动跳转
    } else {
      // 显示具体的错误信息
      const errorMsg = (error.response?.data as any)?.error || 
                      (error.response?.data as any)?.message || 
                      '请求失败';
      message.error(errorMsg);
    }
    
    return Promise.reject(error);
  }
);

export default request;
