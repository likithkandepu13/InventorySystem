import React, { useEffect, useState } from 'react';
import { getRoom, checkIn, checkOut, updateGuest } from '../api';
import { Card, Button, Form, Input, DatePicker, Tag, Space, message, Row, Col, InputNumber, Switch, Modal } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const statusColor = {
  available: 'green',
  occupied: 'red',
};

const RoomDetails = ({ roomId, onBack }) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [editModal, setEditModal] = useState(false);
  const [editForm] = Form.useForm();

  const fetchRoom = () => {
    getRoom(roomId).then(res => {
      setRoom(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchRoom();
    // eslint-disable-next-line
  }, [roomId]);

  const handleCheckIn = async (values) => {
    try {
      await checkIn(roomId, {
        ...values,
        paid: values.paid || false,
        checkIn: values.checkIn.toISOString(),
      });
      message.success('Checked in successfully!');
      fetchRoom();
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.error || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut(roomId);
      message.success('Checked out successfully!');
      fetchRoom();
    } catch (err) {
      message.error(err.response?.data?.error || 'Check-out failed');
    }
  };

  const handleEdit = () => {
    editForm.setFieldsValue({
      amount: room.guest?.amount,
      paid: !!room.guest?.paid,
    });
    setEditModal(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      await updateGuest(roomId, {
        amount: values.amount,
        paid: values.paid,
      });
      message.success('Guest info updated!');
      setEditModal(false);
      fetchRoom();
    } catch (err) {
      message.error(err.response?.data?.error || 'Update failed');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: 60 }}>Loading...</div>;
  if (!room) return <div>Room not found.</div>;

  return (
    <Card
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={onBack} />
          Room {room.number} Details
        </Space>
      }
      extra={
        <Tag color={statusColor[room.status]} style={{ fontWeight: 600 }}>
          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
        </Tag>
      }
      style={{ width: '100%', borderRadius: 8, margin: '0 auto', padding: 0 }}
      bodyStyle={{ padding: 24 }}
    >
      {room.status === 'available' ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCheckIn}
          style={{ marginBottom: 24, width: '100%' }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="name" label="Guest Name" rules={[{ required: true }]}> 
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Amount is required' }]}> 
                <InputNumber min={0} style={{ width: '100%' }} prefix="₹" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="paid" label="Amount Paid?" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="checkIn" label="Check-In Date & Time" rules={[{ required: true }]}> 
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Check In
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ) : (
        <Row gutter={[16, 16]} style={{ width: '100%' }}>
          <Col xs={24} md={16} lg={12}>
            <div style={{ marginBottom: 24 }}>
              <div>
                <b>Guest:</b> {room.guest?.name || 'N/A'}
              </div>
              <div>
                <b>Phone:</b> {room.guest?.phone || '-'}
              </div>
              <div>
                <b>Email:</b> {room.guest?.email || '-'}
              </div>
              <div>
                <b>Amount:</b> {room.guest?.amount ? `₹${room.guest.amount}` : '-'}
                <Button icon={<EditOutlined />} size="small" style={{ marginLeft: 8 }} onClick={handleEdit} />
              </div>
              <div>
                <b>Paid:</b> {room.guest?.paid ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}
              </div>
              <div>
                <b>Check-In:</b> {room.checkIn ? dayjs(room.checkIn).format('YYYY-MM-DD HH:mm') : '-'}
              </div>
              <div>
                <b>Check-Out:</b> {room.checkOut ? dayjs(room.checkOut).format('YYYY-MM-DD HH:mm') : '-'}
              </div>
              <Button type="primary" danger style={{ marginTop: 12 }} onClick={handleCheckOut}>
                Check Out
              </Button>
            </div>
          </Col>
        </Row>
      )}

      <Modal
        title="Edit Guest Info"
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => editForm.submit()}
        okText="Save"
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Amount is required' }]}> 
            <InputNumber min={0} style={{ width: '100%' }} prefix="₹" />
          </Form.Item>
          <Form.Item name="paid" label="Amount Paid?" valuePropName="checked">
            <Switch checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RoomDetails; 