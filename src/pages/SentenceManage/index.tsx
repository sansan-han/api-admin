import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, Select, Tag,
  message, Popconfirm, Upload, Card, Row, Col
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  UploadOutlined, ReloadOutlined
} from '@ant-design/icons';
import request from '../../utils/request';
import { API_ENDPOINTS } from '../../config/api';
import { Sentence, SentencesResponse, SentenceQueryParams, ImportResponse } from '../../types';
import type { SorterResult } from 'antd/es/table/interface';

const categoryMap: Record<string, string> = {
  a: '动画', b: '漫画', c: '游戏', d: '文学',
  e: '原创', f: '来自网络', g: '影视', h: '诗词',
  i: '网易云', j: '哲学', k: '抖机灵', l: '其他'
};

const SentenceManage: React.FC = () => {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState<{ category?: string; author?: string }>({});
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sorter, setSorter] = useState<{ field?: string; order?: 'ascend' | 'descend' }>({});

  const fetchSentences = async (params?: SentenceQueryParams) => {
  setLoading(true);
  try {
    const queryParams: SentenceQueryParams = {
      page: params?.page || pagination.current,
      pageSize: params?.pageSize || pagination.pageSize,
      category: params?.category || filters.category,
      keyword: params?.keyword || searchKeyword,
      author: params?.author || filters.author,
      sortBy: params?.sortBy || (sorter.field as any),
      sortOrder: params?.sortOrder || (sorter.order === 'ascend' ? 'asc' : 'desc')
    };

    // 构建查询字符串
    const queryString = Object.entries(queryParams)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const res = await request.get<SentencesResponse>(
      `${API_ENDPOINTS.SENTENCES}?${queryString}`
    );
    
    setSentences(res.data || []);
    setPagination(prev => ({ ...prev, total: res.pagination.total || 0 }));
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchSentences({ page: 1, pageSize: 10 });
  }, []);

  const handleAdd = () => {
    setEditingSentence(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Sentence) => {
    setEditingSentence(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await request.delete(`${API_ENDPOINTS.SENTENCES}/${id}`);
      message.success('删除成功');
      fetchSentences();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingSentence) {
        await request.put(`${API_ENDPOINTS.SENTENCES}/${editingSentence.id}`, values);
        message.success('更新成功');
      } else {
        await request.post(API_ENDPOINTS.SENTENCES, values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchSentences();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      ellipsis: true
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      sorter: true,
      render: (date: string) => new Date(date).toLocaleString('zh-CN')
    },
    {
      title: '出处',
      dataIndex: 'source',
      key: 'source',
      width: 150
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 80,
      render: (cat: string) => <Tag color="blue">{categoryMap[cat]}</Tag>
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      )
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Sentence) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Input.Search
              placeholder="搜索句子内容"
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              onSearch={value => {
                setPagination(prev => ({ ...prev, current: 1 }));
                fetchSentences({ keyword: value, page: 1 });
              }}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="选择分类"
              style={{ width: '100%' }}
              value={filters.category}
              onChange={value => {
                setFilters(prev => ({ ...prev, category: value }));
                setPagination(prev => ({ ...prev, current: 1 }));
                fetchSentences({ category: value, page: 1 });
              }}
              allowClear
            >
              {Object.entries(categoryMap).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Input
              placeholder="按作者筛选"
              value={filters.author}
              onChange={e => setFilters(prev => ({ ...prev, author: e.target.value }))}
              onPressEnter={e => {
                setPagination(prev => ({ ...prev, current: 1 }));
                fetchSentences({ author: (e.target as any).value, page: 1 });
              }}
              allowClear
            />
          </Col>
        </Row>

        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                添加句子
              </Button>
              <Upload
                accept=".json"
                showUploadList={false}
                customRequest={async ({ file }) => {
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    try {
                      const data = JSON.parse(e.target?.result as string);
                      const res = await request.post<ImportResponse>(
                        API_ENDPOINTS.IMPORT_SENTENCES, 
                        data
                      );
                      message.success(`导入成功: ${res.success}条`);
                      fetchSentences();
                    } catch (error) {
                      message.error('导入失败');
                    }
                  };
                  reader.readAsText(file as any);
                }}
              >
                <Button icon={<UploadOutlined />}>批量导入</Button>
              </Upload>
            </Space>
          </Col>
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchSentences({
                page: pagination.current,
                pageSize: pagination.pageSize,
                category: filters.category,
                keyword: searchKeyword,
                author: filters.author,
                sortBy: sorter.field as any,
                sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
              })}
            >
              刷新
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={sentences}
          loading={loading}
          rowKey="id"
           pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={(pag, _, sort) => {
            const newPagination = {
              current: pag.current || 1,
              pageSize: pag.pageSize || 10,
              total: pagination.total
            };
            setPagination(newPagination);
            
            // 类型断言为单个排序对象
            const singleSort = sort as SorterResult<Sentence>;
            
            // 处理排序状态
            if (singleSort && singleSort.field && singleSort.order) {
              // 只在有排序时才更新，忽略 null 值
              setSorter({ 
                field: singleSort.field as string, 
                order: singleSort.order as 'ascend' | 'descend'
              });
            } else {
              // 清除排序
              setSorter({});
            }
            
            fetchSentences({
              page: newPagination.current,
              pageSize: newPagination.pageSize,
              sortBy: singleSort?.field as any,
              sortOrder: singleSort?.order === 'ascend' ? 'asc' : 
                        singleSort?.order === 'descend' ? 'desc' : undefined
            });
          }}
        />


      </Card>
      <Modal
        title={editingSentence ? '编辑句子' : '添加句子'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入句子内容' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="author" label="作者">
            <Input placeholder="默认: 佚名" />
          </Form.Item>
          <Form.Item name="source" label="出处">
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select>
              {Object.entries(categoryMap).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="输入后按回车添加标签" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SentenceManage;
