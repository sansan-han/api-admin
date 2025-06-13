import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, List, Tag, Alert, Spin, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import request from '../../utils/request';
import { API_ENDPOINTS } from '../../config/api';
import { HealthStatus, SentenceStatistics, Sentence } from '../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [recentSentences, setRecentSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(true);
  const [needApiKey, setNeedApiKey] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      // Health 接口通常不需要认证或使用 JWT
      const healthRes = await request.get<HealthStatus>(API_ENDPOINTS.HEALTH)
        .catch(err => {
          console.error('Health check failed:', err);
          return null;
        });
      
      if (healthRes) {
        setHealth(healthRes);
      }

      // 检查是否有 API Key
      const hasApiKey = localStorage.getItem('apiKey');
      if (!hasApiKey) {
        setNeedApiKey(true);
        setLoading(false);
        return;
      }

      // 统计接口需要 API Key
      const sentenceRes = await request.get<SentenceStatistics>(API_ENDPOINTS.SENTENCE_STATISTICS)
        .catch(err => {
          console.error('Statistics fetch failed:', err);
          // 如果是因为缺少 API Key
          if (err.response?.status === 401 && err.response?.data?.error?.includes('API Key')) {
            setNeedApiKey(true);
          }
          return null;
        });
      
      if (sentenceRes) {
        setRecentSentences(sentenceRes.recentlyAdded || []);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (needApiKey) {
    return (
      <div>
        <Alert
          message="需要配置 API Key"
          description="要查看完整的仪表盘数据，请先在系统设置中配置 API Key。"
          type="warning"
          showIcon
          action={
            <Button 
              size="small" 
              type="primary"
              icon={<SettingOutlined />}
              onClick={() => navigate('/settings')}
            >
              前往设置
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="系统状态"
                value={health?.status === 'ok' ? '正常' : '异常'}
                prefix={
                  health?.status === 'ok' 
                    ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    : <CloseCircleOutlined style={{ color: '#f5222d' }} />
                }
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="运行时间"
                value={Math.floor((health?.uptime || 0) / 3600)}
                suffix="小时"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Redis状态"
                value={health?.redis === 'connected' ? '已连接' : '未连接'}
                valueStyle={{
                  color: health?.redis === 'connected' ? '#52c41a' : '#f5222d'
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div>
      <Alert
        message="欢迎使用 API 管理系统"
        description="在这里您可以管理句子、查看统计数据、配置系统设置。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="系统状态"
              value={health?.status === 'ok' ? '正常' : '异常'}
              prefix={
                health?.status === 'ok' 
                  ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  : <CloseCircleOutlined style={{ color: '#f5222d' }} />
              }
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="运行时间"
              value={Math.floor((health?.uptime || 0) / 3600)}
              suffix="小时"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Redis状态"
              value={health?.redis === 'connected' ? '已连接' : '未连接'}
              valueStyle={{
                color: health?.redis === 'connected' ? '#52c41a' : '#f5222d'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近添加的句子" style={{ marginTop: 16 }}>
        {recentSentences.length > 0 ? (
          <List
            dataSource={recentSentences.slice(0, 5)}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.content}
                  description={
                    <span>
                      {item.author && <Tag>{item.author}</Tag>}
                      {item.source && <Tag color="blue">{item.source}</Tag>}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#999' }}>
            暂无数据
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
