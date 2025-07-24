import React, { useState, useEffect } from 'react';
import { Container, Card, Button, ListGroup, Form, Alert, Badge, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getSLA, reviewSLA } from '../services/api';

const SLAReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [sla, setSLA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSLA = async () => {
      try {
        setLoading(true);
        const slaData = await getSLA(id);
        setSLA(slaData);
      } catch (error) {
        console.error('Error fetching SLA:', error);
        setError('Failed to load SLA data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSLA();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!decision) {
      setError('Please select a decision');
      return;
    }
    
    try {
      setSubmitting(true);
      const reviewData = {
        decision,
        comments,
        reviewedBy: user._id
      };
      
      await reviewSLA(id, reviewData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 d-flex justify-content-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!sla) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">SLA not found</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>Review SLA: {sla.title}</h4>
          <Badge bg="warning" className="fs-6">Pending Review</Badge>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <h5>Basic Information</h5>
            <Row>
              <Col md={6}>
                <p><strong>Raising Department:</strong> {sla.raisingDept}</p>
                <p><strong>Description:</strong> {sla.description}</p>
              </Col>
              <Col md={6}>
                <p><strong>Priority:</strong> <span className="text-capitalize">{sla.priority}</span></p>
                <p><strong>Duration:</strong> {new Date(sla.startDate).toLocaleDateString()} to {new Date(sla.endDate).toLocaleDateString()}</p>
              </Col>
            </Row>
          </div>

          <div className="mb-4">
            <h5>SLA Metrics</h5>
            <ListGroup>
              {sla.metrics.map((metric, index) => (
                <ListGroup.Item key={index}>
                  <strong>{metric.name}:</strong> Target {metric.target} ({metric.measurement})
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Your Decision *</Form.Label>
              <div>
                <Form.Check
                  inline
                  label="Accept SLA"
                  name="decision"
                  type="radio"
                  id="accept"
                  onChange={() => setDecision('accept')}
                  disabled={submitting}
                />
                <Form.Check
                  inline
                  label="Return for Revision"
                  name="decision"
                  type="radio"
                  id="return"
                  onChange={() => setDecision('return')}
                  disabled={submitting}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                disabled={submitting}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                className="me-2" 
                onClick={() => navigate('/dashboard')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={submitting || !decision}
              >
                {submitting ? (
                  <Spinner animation="border" size="sm" />
                ) : 'Submit Decision'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SLAReview;