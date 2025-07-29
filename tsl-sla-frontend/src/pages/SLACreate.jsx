import { useState } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { createSLA, submitSLA } from "../services/api";
import { getDepartments } from "../services/api";
import { useEffect } from "react";

const SLACreate = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetDept: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    metrics: [{ name: "", target: "", measurement: "" }],
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deptLoading, setDeptLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const depts = await getDepartments();
        setDepartments(depts.map((d) => d.name));
      } catch (error) {
        console.error("Error fetching departments:", error);
      } finally {
        setDeptLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMetricChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMetrics = [...formData.metrics];
    updatedMetrics[index][name] = value;
    setFormData((prev) => ({ ...prev, metrics: updatedMetrics }));
  };

  const addMetric = () => {
    setFormData((prev) => ({
      ...prev,
      metrics: [...prev.metrics, { name: "", target: "", measurement: "" }],
    }));
  };

  const removeMetric = (index) => {
    if (formData.metrics.length > 1) {
      const updatedMetrics = formData.metrics.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, metrics: updatedMetrics }));
    }
  };

  const validateStep1 = () => {
    if (
      !formData.title ||
      !formData.targetDept ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setError("Please fill all required fields");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    const emptyMetrics = formData.metrics.some(
      (metric) => !metric.name || !metric.target || !metric.measurement
    );
    if (emptyMetrics) {
      setError("Please fill all metric fields");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1 && validateStep1()) {
      setStep(2);
      return;
    }

    if (step === 2 && validateStep2()) {
      try {
        setLoading(true);

        // Prepare SLA data
        const slaData = {
          ...formData,
          raisingDept: user.department,
          createdBy: user._id,
          status: "draft",
        };

        // Create SLA
        const createdSLA = await createSLA(slaData);

        // Submit SLA for review
        await submitSLA(createdSLA._id);

        navigate("/dashboard");
      } catch (error) {
        setError(error.message || "Failed to create SLA");
      } finally {
        setLoading(false);
      }
    }
  };

  if (deptLoading) {
    return (
      <Container className="mt-4 d-flex justify-content-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h4>Create New SLA</h4>
          <div className="d-flex">
            <div className={`step ${step >= 1 ? "active" : ""}`}>
              1. Basic Info
            </div>
            <div className={`step ${step >= 2 ? "active" : ""}`}>
              2. Metrics
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            {step === 1 && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>SLA Title *</Form.Label>
                    <Form.Control
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Target Department *</Form.Label>
                    <Form.Select
                      name="targetDept"
                      value={formData.targetDept}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      {departments
                        .filter((d) => d !== user.department) // Exclude own department
                        .map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Form.Select>
                  </Form.Group>
                  <Row>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>Start Date *</Form.Label>
                        <Form.Control
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>End Date *</Form.Label>
                        <Form.Control
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}

            {step === 2 && (
              <div>
                <h5>SLA Metrics</h5>
                {formData.metrics.map((metric, index) => (
                  <Row key={index} className="mb-3 align-items-end">
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Metric Name *</Form.Label>
                        <Form.Control
                          name="name"
                          value={metric.name}
                          onChange={(e) => handleMetricChange(index, e)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Target *</Form.Label>
                        <Form.Control
                          name="target"
                          value={metric.target}
                          onChange={(e) => handleMetricChange(index, e)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Measurement *</Form.Label>
                        <Form.Control
                          name="measurement"
                          value={metric.measurement}
                          onChange={(e) => handleMetricChange(index, e)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeMetric(index)}
                        disabled={formData.metrics.length <= 1}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="secondary"
                  onClick={addMetric}
                  className="mb-3"
                >
                  Add Another Metric
                </Button>
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              {step > 1 && (
                <Button variant="secondary" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : step === 1 ? (
                  "Next"
                ) : (
                  "Submit SLA"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SLACreate;
