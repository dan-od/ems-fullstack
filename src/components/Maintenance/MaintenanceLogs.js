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
  Popconfirm,
  DatePicker
} from 'antd';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const MaintenanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/maintenance');
      setLogs(res.data);
    } catch (err) {
      message.error('Error fetching maintenance logs');
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await axios.get('/api/equipment');
      setEquipment(res.data);
    } catch (err) {
      message.error('Error fetching equipment list');
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchEquipment();
  }, []);

  const handleAdd = async (values) => {
    try {
      const data = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };
      await axios.post('/api/maintenance', data);
      message.success('Maintenance log added successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchLogs();
    } catch (err) {
      message.error('Error adding maintenance log');
    }
  };

  const handleEdit = async (values) => {
    try {
      const data = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };
      await axios.put(`/api/maintenance/${editingId}`, data);
      message.success('Maintenance log updated successfully');
      setIsModalVisible(false);
      setEditingId(null);
      form.resetFields();
      fetchLogs();
    } catch (err) {
      message.error('Error updating maintenance log');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/maintenance/${id}`);
      message.success('Maintenance log deleted successfully');
      fetchLogs();
    } catch (err) {
      message.error('Error deleting maintenance log');
    }
  };

  const showEditModal = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      date: moment(record.date),
    });
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Equipment',
      dataIndex: 'equipment_name',
      key: 'equipment_name',
    },
    {
      title: 'Maintenance Type',
      dataIndex: 'maintenance_type',
      key: 'maintenance_type',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Performed By',
      dataIndex: 'user_name',
      key: 'user_name',
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
            title="Are you sure you want to delete this maintenance log?"
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
        Add New Maintenance Log
      </Button>

      <Table columns={columns} dataSource={logs} rowKey="id" />

      <Modal
        title={editingId ? 'Edit Maintenance Log' : 'Add New Maintenance Log'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        maskClosable={true}
        closable={true}
        footer={null}
      >
        <Form
          form={form}
          onFinish={editingId ? handleEdit : handleAdd}
          layout="vertical"
        >
          <Form.Item
            name="equipment_id"
            label="Equipment"
            rules={[{ required: true, message: 'Please select equipment!' }]}
          >
            <Select>
              {equipment.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="maintenance_type"
            label="Maintenance Type"
            rules={[{ required: true, message: 'Please select maintenance type!' }]}
          >
            <Select>
              <Option value="preventive">Preventive</Option>
              <Option value="corrective">Corrective</Option>
              <Option value="condition_based">Condition Based</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input description!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
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

export default MaintenanceLogs; 