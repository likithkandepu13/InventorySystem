import React, { useState } from 'react';
import RoomList from './components/RoomList';
import RoomDetails from './components/RoomDetails';
import GuestLog from './components/GuestLog';
import { Layout, Typography, Button } from 'antd';
import 'antd/dist/reset.css';
import './index.css';

const { Header, Content } = Layout;

function App() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showGuestLog, setShowGuestLog] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', minWidth: '100vw', background: '#f5f6fa' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <Typography.Title level={3} style={{ color: '#fff', margin: 0, lineHeight: '64px' }}>
          Hotel Room Dashboard
        </Typography.Title>
      </Header>
      <Content style={{ padding: '32px 8px', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        {showGuestLog ? (
          <div>
            <Button onClick={() => setShowGuestLog(false)} style={{ marginBottom: 16 }}>
              Back to Dashboard
            </Button>
            <GuestLog />
          </div>
        ) : !selectedRoom ? (
          <>
            <Button type="primary" onClick={() => setShowGuestLog(true)} style={{ marginBottom: 16 }}>
              View Guest Log
            </Button>
            <RoomList onSelectRoom={setSelectedRoom} />
          </>
        ) : (
          <RoomDetails roomId={selectedRoom} onBack={() => setSelectedRoom(null)} />
        )}
      </Content>
    </Layout>
  );
}

export default App;