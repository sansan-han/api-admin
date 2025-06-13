import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Tabs } from 'antd';
import { FileImageOutlined, FileTextOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import request from '../../utils/request';
import { API_ENDPOINTS } from '../../config/api';
import { SentenceStatistics, ImageStatistics } from '../../types';

const Statistics: React.FC = () => {
  const [sentenceStats, setSentenceStats] = useState<SentenceStatistics | null>(null);
  const [imageStats, setImageStats] = useState<ImageStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const [sentenceRes, imageRes] = await Promise.all([
        request.get<SentenceStatistics>(API_ENDPOINTS.SENTENCE_STATISTICS),
        request.get<ImageStatistics>(API_ENDPOINTS.IMAGE_STATISTICS)
      ]);
      setSentenceStats(sentenceRes);
      setImageStats(imageRes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 句子分类分布图
  const getSentenceCategoryChartOption = () => {
    if (!sentenceStats) return {};
    
    const data = Object.values(sentenceStats.byCategory).map(item => ({
      name: item.name,
      value: item.count
    }));

    return {
      title: { text: '句子分类分布' },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  };

  // 句子作者TOP10
  const getAuthorChartOption = () => {
    if (!sentenceStats) return {};
    
    const sorted = Object.entries(sentenceStats.byAuthor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      title: { text: 'Top 10 作者' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: sorted.map(item => item[0]),
        axisLabel: { rotate: 45 }
      },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          data: sorted.map(item => item[1]),
          itemStyle: { color: '#1890ff' }
        }
      ]
    };
  };

  // 图片请求时间分布
  const getImageHourlyChartOption = () => {
    if (!imageStats?.date || !imageStats?.hourly) return {};
    
    const hours = Object.keys(imageStats.hourly).sort((a, b) => parseInt(a) - parseInt(b));
    const data = hours.map(hour => ({
      hour: `${hour}:00`,
      total: parseInt(imageStats.hourly[hour].total || '0')
    }));

    return {
      title: { text: `图片请求时间分布 (${imageStats.date})` },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}次'
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.hour)
      },
      yAxis: { 
        type: 'value',
        name: '请求次数'
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data: data.map(item => item.total),
          areaStyle: {
            opacity: 0.3
          },
          itemStyle: { color: '#52c41a' }
        }
      ]
    };
  };

  // 图片分类请求分布
  const getImageCategoryChartOption = () => {
    if (!imageStats?.total?.byCategory) return {};
    
    const data = Object.entries(imageStats.total.byCategory).map(([category, count]) => ({
      name: category,
      value: count
    }));

    return {
      title: { text: '图片分类请求分布' },
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data
        }
      ]
    };
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const sentenceTabContent = (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="句子总数"
              value={sentenceStats?.total || 0}
              suffix="条"
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="分类数"
              value={Object.keys(sentenceStats?.byCategory || {}).length}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="作者数"
              value={Object.keys(sentenceStats?.byAuthor || {}).length}
              suffix="位"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均句长"
              value={
                sentenceStats?.total 
                  ? Math.floor(
                      Object.values(sentenceStats.byCategory)
                        .reduce((sum, cat) => sum + cat.count, 0) / 
                      Object.keys(sentenceStats.byCategory).length
                    )
                  : 0
              }
              suffix="条/类"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={getSentenceCategoryChartOption()} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={getAuthorChartOption()} />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const imageTabContent = (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日请求"
              value={imageStats?.total?.requests || 0}
              suffix="次"
              prefix={<FileImageOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="随机接口调用"
              value={imageStats?.total?.byEndpoint?.random || 0}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="分类接口调用"
              value={imageStats?.total?.byEndpoint?.categories || 0}
              suffix="次"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃分类数"
              value={Object.keys(imageStats?.total?.byCategory || {}).length}
              suffix="个"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card>
            <ReactECharts option={getImageHourlyChartOption()} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <ReactECharts option={getImageCategoryChartOption()} />
          </Card>
        </Col>
      </Row>

      {/* 分类详细统计 */}
      <Card title="分类详细统计" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          {imageStats?.total?.byCategory && Object.entries(imageStats.total.byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => (
              <Col span={6} key={category} style={{ marginBottom: 16 }}>
                <Card size="small">
                  <Statistic
                    title={category}
                    value={count}
                    suffix="次"
                  />
                </Card>
              </Col>
            ))}
        </Row>
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: 'sentences',
      label: '句子统计',
      icon: <FileTextOutlined />,
      children: sentenceTabContent
    },
    {
      key: 'images',
      label: '图片统计',
      icon: <FileImageOutlined />,
      children: imageTabContent
    }
  ];

  return (
    <Tabs 
      defaultActiveKey="sentences" 
      items={tabItems}
      size="large"
    />
  );
};

export default Statistics;
