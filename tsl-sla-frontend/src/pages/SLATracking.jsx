import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Form,
  Button,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import {
  getSLA,
  saveProgress,
  getProgress,
  addComment,
  getComments,
} from "../services/api";

const SLATracking = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [sla, setSLA] = useState(null);
  const [progress, setProgress] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const slaData = await getSLA(id);
        const progressData = await getProgress(id);
        const commentsData = await getComments(id);

        setSLA(slaData);
        setProgress(progressData);
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load SLA data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusChange = (progressId, metricIndex, status) => {
    setProgress((prev) =>
      prev.map((p) => {
        if (p._id === progressId) {
          const updatedUpdates = [...p.updates];
          updatedUpdates[metricIndex] = {
            ...updatedUpdates[metricIndex],
            status,
          };
          return { ...p, updates: updatedUpdates };
        }
        return p;
      })
    );
  };

  const handleActualChange = (progressId, metricIndex, value) => {
    setProgress((prev) =>
      prev.map((p) => {
        if (p._id === progressId) {
          const updatedUpdates = [...p.updates];
          updatedUpdates[metricIndex] = {
            ...updatedUpdates[metricIndex],
            actual: value,
          };
          return { ...p, updates: updatedUpdates };
        }
        return p;
      })
    );
  };

  const handleCommentChange = (progressId, comment) => {
    setProgress((prev) =>
      prev.map((p) => {
        if (p._id === progressId) {
          return { ...p, overallComments: comment };
        }
        return p;
      })
    );
  };

  const handleSubmitUpdate = async (progressId) => {
    try {
      setSaving(true);
      const progressToUpdate = progress.find((p) => p._id === progressId);

      // Prepare update data
      const updateData = {
        month: progressToUpdate.month,
        updates: progressToUpdate.updates.map((update) => ({
          metric: update.metric,
          target: update.target,
          actual: update.actual,
          status: update.status,
        })),
        overallComments: progressToUpdate.overallComments,
        updatedBy: user._id,
      };

      await saveProgress(id, updateData);
      setSuccess("Progress updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.message || "Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommenting(true);
      const commentData = {
        content: newComment,
        user: user._id,
      };

      const newCommentData = await addComment(id, commentData);
      setComments((prev) => [...prev, newCommentData]);
      setNewComment("");
      setSuccess("Comment added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error.message || "Failed to add comment");
    } finally {
      setCommenting(false);
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

  // Generate monthly progress entries if they don't exist
  const months = [];
  let monthDate = new Date(sla.startDate);

  while (monthDate <= new Date(sla.endDate)) {
    months.push(new Date(monthDate));
    monthDate.setMonth(monthDate.getMonth() + 1);
  }

  // Create progress entries for months that don't have them
  const allProgress = months.map((month) => {
    const monthStr = month.toISOString().substring(0, 7);
    const existing = progress.find(
      (p) => new Date(p.month).toISOString().substring(0, 7) === monthStr
    );

    return (
      existing || {
        _id: `new-${monthStr}`,
        month: month.toISOString(),
        updates: sla.metrics.map((metric) => ({
          metric: metric.name,
          target: metric.target,
          actual: "",
          status: "",
        })),
        overallComments: "",
      }
    );
  });

  return (
    <Container className="mt-4">
      <Card className="mb-4">
        <Card.Header>
          <h4>Tracking: {sla.title}</h4>
          <div>
            <Badge bg="success" className="me-2">
              {sla.status}
            </Badge>
            <span className="text-muted">
              Between {sla.raisingDept} and {sla.targetDept} departments
            </span>
          </div>
        </Card.Header>
        <Card.Body>
          <h5 className="mb-3">Monthly Progress Updates</h5>
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Table responsive bordered>
            <thead>
              <tr>
                <th>Month</th>
                <th>Metrics</th>
                <th>Actual</th>
                <th>Status</th>
                <th>Comments</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allProgress.map((progressItem) => (
                <tr key={progressItem._id}>
                  <td>
                    {new Date(progressItem.month).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <ul className="small">
                      {progressItem.updates.map((metric, mIndex) => (
                        <li key={mIndex}>
                          <strong>{metric.metric}:</strong> Target{" "}
                          {metric.target}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    {progressItem.updates.map((metric, mIndex) => (
                      <Form.Control
                        key={mIndex}
                        size="sm"
                        className="mb-2"
                        value={metric.actual}
                        onChange={(e) =>
                          handleActualChange(
                            progressItem._id,
                            mIndex,
                            e.target.value
                          )
                        }
                        placeholder={`Actual ${metric.metric}`}
                      />
                    ))}
                  </td>
                  <td>
                    {progressItem.updates.map((metric, mIndex) => (
                      <Form.Select
                        key={mIndex}
                        size="sm"
                        className="mb-2"
                        value={metric.status}
                        onChange={(e) =>
                          handleStatusChange(
                            progressItem._id,
                            mIndex,
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select Status</option>
                        <option value="on_track">On Track</option>
                        <option value="at_risk">At Risk</option>
                        <option value="off_track">Off Track</option>
                      </Form.Select>
                    ))}
                  </td>
                  <td>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={progressItem.overallComments}
                      onChange={(e) =>
                        handleCommentChange(progressItem._id, e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubmitUpdate(progressItem._id)}
                      disabled={saving}
                    >
                      {saving ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h5>Discussion</h5>
        </Card.Header>
        <Card.Body>
          <div className="mb-3 p-3 bg-light rounded">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="d-flex mb-3">
                  <div className="me-3">
                    <div
                      className="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      {comment.user?.department
                        ?.substring(0, 2)
                        .toUpperCase() || "??"}
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <strong>
                        {comment.user?.username || "Unknown User"}
                      </strong>
                      <small className="text-muted">
                        {new Date(comment.createdAt).toLocaleString()}
                      </small>
                    </div>
                    {comment.progress && (
                      <div className="text-muted small mb-1">
                        Regarding:{" "}
                        {new Date(comment.progress.month).toLocaleDateString(
                          "en-US",
                          { month: "short", year: "numeric" }
                        )}
                      </div>
                    )}
                    <p className="mt-1 mb-0">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted">No comments yet</div>
            )}
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Add Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={commenting}
            />
          </Form.Group>
          <Button
            variant="primary"
            onClick={handleAddComment}
            disabled={commenting || !newComment.trim()}
          >
            {commenting ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Post Comment"
            )}
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SLATracking;
