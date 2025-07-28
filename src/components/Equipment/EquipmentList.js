import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm
} from 'antd';

const { Option } = Select;

const EquipmentList = () => {
  const [equipment, setEquipment] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const fetchEquipment = async () => {
    try {
      const res = await axios.get('/api/equipment');
      setEquipment(res.data);
    } catch (err) {
      message.error('Error fetching equipment');
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleAdd = async (values) => {
    try {
      await axios.post('/api/equipment', values);
      message.success('Equipment added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchEquipment();
    } catch (err) {
      message.error('Error adding equipment');
    }
  };

  const handleEdit = async (values) => {
    try {
      await axios.put(`/api/equipment/${editingId}`, values);
      message.success('Equipment updated successfully');
      setIsModalVisible(false);
      setEditingId(null);
      form.resetFields();
      fetchEquipment();
    } catch (err) {
      message.error('Error updating equipment');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/equipment/${id}`);
      message.success('Equipment deleted successfully');
      fetchEquipment();
    } catch (err) {
      message.error('Error deleting equipment');
    }
  };

  const showEditModal = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => showEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this equipment?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="primary"
        onClick={() => {
          setEditingId(null);
          form.resetFields();
          setIsModalVisible(true);
        }}
        style={{ marginBottom: '16px' }}
      >
        Add New Equipment
      </Button>

      <Table columns={columns} dataSource={equipment} rowKey="id" />

      <Modal
        title={editingId ? 'Edit Equipment' : 'Add New Equipment'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          onFinish={editingId ? handleEdit : handleAdd}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input equipment name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status!' }]}
          >
            <Select>
              <Option value="available">Available</Option>
              <Option value="in_use">In Use</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="retired">Retired</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please input category!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingId ? 'Update' : 'Add'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EquipmentList; 