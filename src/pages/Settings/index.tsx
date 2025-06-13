import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, message, Tabs, Alert } from 'antd';
import { KeyOutlined, ClearOutlined } from '@ant-design/icons';
import request from '../../utils/request';
import { API_ENDPOINTS } from '../../config/api';

const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    // 检查是否已设置 API Key
    if (!apiKey) {
      message.warning('请先设置 API Key 以使用统计功能');
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      message.error('请输入有效的 API Key');
      return;
    }
    localStorage.setItem('apiKey', apiKey);
    message.success('API Key 已保存');
    // 刷新页面以应用新的 API Key
    window.location.reload();
  };

  const handleClearCache = async (category?: string) => {
    setClearingCache(true);
    try {
      const url = category 
        ? `${API_ENDPOINTS.CACHE}?category=${category}`
        : API_ENDPOINTS.CACHE;
      await request.delete(url);
      message.success('缓存已清除');
    } catch (error) {
      console.error(error);
    } finally {
      setClearingCache(false);
    }
  };

  const items = [
    {
      key: '1',
      label: 'API配置',
      children: (
        <Card title="API Key 设置">
          {!localStorage.getItem('apiKey') && (
            <Alert
              message="需要配置 API Key"
              description="某些功能（如统计数据）需要 API Key 才能访问。请联系管理员获取 API Key。"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Form layout="vertical">
            <Form.Item label="API Key" help="用于访问统计等只读接口">
              <Input.Password
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="请输入 API Key"
                prefix={<KeyOutlined />}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSaveApiKey}>
                保存
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: '2',
      label: '缓存管理',
      children: (
        <Card title="缓存管理">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              icon={<ClearOutlined />}
              loading={clearingCache}
              onClick={() => handleClearCache()}
              block
            >
              清除所有缓存
            </Button>
          </Space>
        </Card>
      )
    }
  ];

  return <Tabs items={items} />;
};

export default Settings;
