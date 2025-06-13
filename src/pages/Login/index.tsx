import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import { API_ENDPOINTS } from '../../config/api';
import { LoginForm, LoginResponse } from '../../types';
import './index.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const res = await request.post<LoginResponse>(API_ENDPOINTS.LOGIN, values);
      
      // 确保token存在
      if (!res.token) {
        message.error('登录失败：未收到有效token');
        return;
      }
      
      // 保存token
      localStorage.setItem('token', res.token);
      
      // 如果有用户信息也保存
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      
      message.success('登录成功');
      
      // 确保token已保存后再跳转
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
      
    } catch (error) {
      console.error('Login error:', error);
      // 错误已在request拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="饮夏API管理面板">
        <Form onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
