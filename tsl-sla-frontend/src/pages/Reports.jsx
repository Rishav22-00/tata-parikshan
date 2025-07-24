import React, { useState, useEffect } from 'react';
import { Container, Card, Tab, Tabs, Table, Row, Col, Button, Spinner } from 'react-bootstrap';
import { getSLA, getProgress, getComments } from '../services/api';

const Reports = () => {
  const [slaData, setSLAData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real app, we would have specific report endpoints
        // For demo, we'll fetch all SLAs and progress
        const slas = await getSLA();
        const progress = await getProgress();
        
        setSLAData(slas);
        setProgressData(progress);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate department stats
  const departmentStats = slaData.reduce((acc, sla) => {
    if (!acc[sla.raisingDept]) {
      acc[sla.raisingDept] = { pending: 0, active: 0, overdue: 0 };
    }
    
    if (sla.status === 'submitted') {
      acc[sla.raisingDept].pending += 1;
    } else if (sla.status === 'active') {
      acc[sla.raisingDept].active += 1;
    } else if (sla.status === 'overdue') {
      acc[sla.raisingDept].overdue += 1;
    }
    
    return acc;
  }, {});

  // Calculate compliance rates
  const complianceRates = slaData.map(sla => {
    const slaProgress = progressData.filter(p => p.sla === sla._id);
    const completedMetrics = slaProgress.reduce((total, progress) => {
      return total + progress.updates.filter(u => u.status === 'on_track').length;
    }, 0);
    
    const totalMetrics = slaProgress.reduce((total, progress) => {
      return total + progress.updates.length;
    }, 0);
    
    const compliance = totalMetrics > 0 
      ? Math.round((completedMetrics / totalMetrics) * 100)
      : 0;
      
    return {
      id: sla._id,
      title: sla.title,
      department: sla.raisingDept,
      compliance: `${compliance}%`,
      trend: compliance > 80 ? 'up' : compliance > 60 ? 'steady' : 'down'
    };
  });

  if (loading) {
    return (
      <Container className="mt-4 d-flex justify-content-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Reports & Analytics</h2>
      
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="dashboard" title="Dashboard">
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>SLA Status by Department</Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Pending</th>
                        <th>Active</th>
                        <th>Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(departmentStats).map(([dept, stats], index) => (
                        <tr key={index}>
                          <td>{dept}</td>
                          <td>{stats.pending}</td>
                          <td>{stats.active}</td>
                          <td>{stats.overdue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Header>Compliance Rates</Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>SLA</th>
                        <th>Department</th>
                        <th>Compliance</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complianceRates.map((row, index) => (
                        <tr key={index}>
                          <td>{row.title}</td>
                          <td>{row.department}</td>
                          <td>{row.compliance}</td>
                          <td>
                            {row.trend === 'up' && '↑ Improving'}
                            {row.trend === 'steady' && '→ Steady'}
                            {row.trend === 'down' && '↓ Declining'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
        <Tab eventKey="detailed" title="Detailed Reports">
          <Card>
            <Card.Header>Detailed SLA Reports</Card.Header>
            <Card.Body>
              <p>Detailed reports would be displayed here with filters and export options.</p>
              <Button variant="primary" className="me-2">
                Export to Excel
              </Button>
              <Button variant="secondary">
                Generate PDF
              </Button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Reports;