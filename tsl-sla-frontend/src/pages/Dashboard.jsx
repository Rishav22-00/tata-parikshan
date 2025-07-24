import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getUserSLAs, getDepartmentSLAs } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, active: 0, overdue: 0 });
  const [recentSLAs, setRecentSLAs] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get SLAs for the current user
        const userSLAs = await getUserSLAs(user._id);
        
        // Get SLAs for the user's department that are pending review
        const deptSLAs = await getDepartmentSLAs(user.department);
        const pending = deptSLAs.filter(sla => sla.status === 'submitted');
        
        // Calculate statistics
        const statsData = {
          pending: userSLAs.filter(sla => sla.status === 'submitted').length,
          active: userSLAs.filter(sla => sla.status === 'active').length,
          overdue: userSLAs.filter(sla => sla.status === 'overdue').length,
        };
        
        // Get recent SLAs (last 5 created by user)
        const recent = userSLAs.slice(0, 5).map(sla => ({
          id: sla._id,
          title: sla.title,
          dept: sla.targetDept,
          status: sla.status,
          date: new Date(sla.createdAt).toISOString().split('T')[0]
        }));
        
        setStats(statsData);
        setRecentSLAs(recent);
        setPendingReviews(pending.map(sla => ({
          id: sla._id,
          title: `${sla.title} from ${sla.raisingDept}`
        })));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <Container className="mt-4 d-flex justify-content-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  const statCards = [
    { title: 'Pending SLAs', count: stats.pending, variant: 'warning' },
    { title: 'Active SLAs', count: stats.active, variant: 'success' },
    { title: 'Overdue SLAs', count: stats.overdue, variant: 'danger' },
  ];

  return (
    <Container className="mt-4">
      <h2>Dashboard</h2>
      <Row className="mb-4">
        {statCards.map((stat, index) => (
          <Col md={4} key={index}>
            <Card bg={stat.variant} text="white" className="mb-4">
              <Card.Body>
                <Card.Title>{stat.title}</Card.Title>
                <Card.Text className="display-4">{stat.count}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>Recent SLAs</span>
              <Button variant="primary" size="sm" onClick={() => navigate('/sla/create')}>
                Create New SLA
              </Button>
            </Card.Header>
            <ListGroup variant="flush">
              {recentSLAs.length > 0 ? recentSLAs.map((sla) => (
                <ListGroup.Item 
                  key={sla.id} 
                  action 
                  onClick={() => navigate(`/sla/track/${sla.id}`)}
                  className="d-flex justify-content-between"
                >
                  <div>
                    <strong>{sla.title}</strong>
                    <div className="text-muted small">{sla.dept} Department</div>
                  </div>
                  <div className="text-end">
                    <span className={`badge bg-${sla.status === 'submitted' ? 'warning' : sla.status === 'active' ? 'success' : 'danger'}`}>
                      {sla.status}
                    </span>
                    <div className="text-muted small">{sla.date}</div>
                  </div>
                </ListGroup.Item>
              )) : (
                <ListGroup.Item className="text-center text-muted">
                  No SLAs found
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>Pending Reviews</Card.Header>
            <ListGroup variant="flush">
              {pendingReviews.length > 0 ? pendingReviews.map((sla) => (
                <ListGroup.Item 
                  key={sla.id} 
                  action 
                  onClick={() => navigate(`/sla/review/${sla.id}`)}
                >
                  {sla.title}
                </ListGroup.Item>
              )) : (
                <ListGroup.Item className="text-center text-muted">
                  No pending reviews
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;