import React, { useEffect, useState } from 'react';
import { getRooms } from '../api';
import { Card, Row, Col, Button, Tag, Spin, Empty } from 'antd';

const statusColor = {
  available: 'green',
  occupied: 'red',
};

const RoomList = ({ onSelectRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRooms().then(res => {
      setRooms(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;

  if (!rooms.length) return <Empty description="No rooms found" style={{ marginTop: 60 }} />;

  return (
    <Row gutter={[24, 24]}>
      {rooms.map(room => (
        <Col xs={24} sm={12} md={8} key={room._id}>
          <Card
            title={`Room 10${room.number}`}
            extra={
              <Tag color={statusColor[room.status]} style={{ fontWeight: 600 }}>
                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
              </Tag>
            }
            actions={[
              <Button type="primary" block onClick={() => onSelectRoom(room._id)}>
                View Details
              </Button>,
            ]}
            style={{ borderRadius: 8 }}
          >
            {room.status === 'occupied' && (
              <>
                <div>
                  <b>Guest:</b> {room.guest?.name || 'N/A'}
                </div>
                <div>
                  <b>Check-In:</b> {room.checkIn ? new Date(room.checkIn).toLocaleDateString() : '-'}
                </div>
                <div>
                  <b>Check-Out:</b> {room.checkOut ? new Date(room.checkOut).toLocaleDateString() : '-'}
                </div>
              </>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default RoomList; 