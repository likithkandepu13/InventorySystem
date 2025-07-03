import React, { useEffect, useState, useMemo } from 'react';
import { Table, Input, Button, Space, DatePicker, Tag, Popconfirm, message, Row, Col, Statistic, Card as AntCard, Segmented } from 'antd';
import { DownloadOutlined, SearchOutlined, DeleteOutlined, BarChartOutlined, LineChartOutlined } from '@ant-design/icons';
import { getAllGuests, deleteGuestHistory } from '../api';
import dayjs from 'dayjs';
import { Column, Line } from '@ant-design/charts';

const { RangePicker } = DatePicker;

const GuestLog = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState({ room: '', name: '', dateRange: [] });
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('byRoom');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    getAllGuests().then(res => {
      setData(res.data);
      setFilteredData(res.data);
      setLoading(false);
    });
  };

  const handleFilter = () => {
    let filtered = data;
    if (search.room) {
      filtered = filtered.filter(item => String(item.roomNumber).includes(search.room));
    }
    if (search.name) {
      filtered = filtered.filter(item => item.name && item.name.toLowerCase().includes(search.name.toLowerCase()));
    }
    if (search.dateRange.length === 2) {
      const [start, end] = search.dateRange;
      filtered = filtered.filter(item => {
        const checkIn = dayjs(item.checkIn);
        return checkIn.isAfter(start.startOf('day').subtract(1, 'ms')) && checkIn.isBefore(end.endOf('day').add(1, 'ms'));
      });
    }
    setFilteredData(filtered);
  };

  const handleCSV = () => {
    const header = ['Room Number', 'Name', 'Phone', 'Email', 'Amount', 'Paid', 'Check-In', 'Check-Out', 'Status'];
    const rows = filteredData.map(item => [
      item.roomNumber,
      item.name,
      item.phone,
      item.email,
      item.amount,
      item.paid ? 'Yes' : 'No',
      item.checkIn ? dayjs(item.checkIn).format('YYYY-MM-DD HH:mm') : '',
      item.checkOut ? dayjs(item.checkOut).format('YYYY-MM-DD HH:mm') : '',
      item.status
    ]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (roomNumber, historyId) => {
    try {
      await deleteGuestHistory(roomNumber, historyId);
      message.success('Entry deleted');
      fetchData();
    } catch (err) {
      message.error('Failed to delete entry');
    }
  };

  // Total amount calculation
  const totalAmount = useMemo(() =>
    filteredData.reduce((sum, item) => sum + (item.amount || 0), 0),
    [filteredData]
  );

  // Chart data
  const chartDataByRoom = useMemo(() => {
    const map = {};
    filteredData.forEach(item => {
      map[item.roomNumber] = (map[item.roomNumber] || 0) + 1;
    });
    return Object.entries(map).map(([room, count]) => ({ room, count }));
  }, [filteredData]);

  const chartDataByDate = useMemo(() => {
    const map = {};
    filteredData.forEach(item => {
      const day = item.checkIn ? dayjs(item.checkIn).format('YYYY-MM-DD') : 'Unknown';
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [filteredData]);

  const columns = [
    { title: '_id', dataIndex: '_id', key: '_id' },
    { title: 'Room', dataIndex: 'roomNumber', key: 'roomNumber', sorter: (a, b) => a.roomNumber - b.roomNumber },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: v => v ? `₹${v}` : '-' },
    { title: 'Paid', dataIndex: 'paid', key: 'paid', render: v => v ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag> },
    { title: 'Check-In', dataIndex: 'checkIn', key: 'checkIn', render: v => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'Check-Out', dataIndex: 'checkOut', key: 'checkOut', render: v => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        record._id ? (
          <Popconfirm
            title="Delete this entry?"
            onConfirm={() => handleDelete(record.roomNumber, record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <AntCard bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic title="Total Amount" value={totalAmount} prefix="₹" />
          </AntCard>
        </Col>
        <Col xs={24} sm={12} md={16}>
          <AntCard bordered={false} style={{ height: '100%' }}>
            <Segmented
              options={[
                { label: <><BarChartOutlined /> By Room</>, value: 'byRoom' },
                { label: <><LineChartOutlined /> By Date</>, value: 'byDate' },
              ]}
              value={chartType}
              onChange={setChartType}
              style={{ marginBottom: 8 }}
            />
            {chartType === 'byRoom' ? (
              <Column
                data={chartDataByRoom}
                xField="room"
                yField="count"
                xAxis={{ title: { text: 'Room' } }}
                yAxis={{ title: { text: 'Check-Ins' } }}
                height={180}
                color="#1890ff"
                tooltip={{ showMarkers: false }}
                label={{ position: 'middle', style: { fill: '#fff' } }}
              />
            ) : (
              <Line
                data={chartDataByDate}
                xField="date"
                yField="count"
                xAxis={{ title: { text: 'Date' } }}
                yAxis={{ title: { text: 'Check-Ins' } }}
                height={180}
                color="#1890ff"
                tooltip={{ showMarkers: false }}
                label={{ style: { fill: '#1890ff' } }}
              />
            )}
          </AntCard>
        </Col>
      </Row>
      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Room Number"
          value={search.room}
          onChange={e => setSearch(s => ({ ...s, room: e.target.value }))}
          style={{ width: 120 }}
        />
        <Input
          placeholder="Guest Name"
          value={search.name}
          onChange={e => setSearch(s => ({ ...s, name: e.target.value }))}
          style={{ width: 180 }}
        />
        <RangePicker
          value={search.dateRange}
          onChange={dates => setSearch(s => ({ ...s, dateRange: dates || [] }))}
        />
        <Button icon={<SearchOutlined />} type="primary" onClick={handleFilter}>
          Filter
        </Button>
        <Button icon={<DownloadOutlined />} onClick={handleCSV}>
          Download CSV
        </Button>
      </Space>
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey={record => record._id || `${record.roomNumber}-${record.checkIn}`}
        />
      </div>
    </div>
  );
};

export default GuestLog; 