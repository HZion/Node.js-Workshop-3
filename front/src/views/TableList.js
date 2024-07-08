import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Table,
  Container,
  Row,
  Col,
  Modal,
  Form
} from "react-bootstrap";

function TableList() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState({});
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [posts, setPosts] = useState([]);
  const API_PORT = '30000';

  useEffect(() => {
    // Fetch posts from the server when the component mounts
    const fetchPosts = async () => {
      try {
        const serverResponse = await fetch(`http://localhost:${API_PORT}/post/loadpost`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        });
        console.log('데이터 읽어오기 성공');
        if (!serverResponse.ok) {
          throw new Error('서버에서 데이터를 가져오는 데 문제가 발생했습니다.');
        }
      
          const data = await serverResponse.json();
          console.log(data);
          setPosts(data);
        
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const handleRowClick = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleClosePostModal = () => setShowPostModal(false);
  const handleShowAddModal = () => setShowAddModal(true);

  const handleAddPost = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:${API_PORT}/post/insertpost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify({
          title: newPost.title,
          author: 'guest',
          content: newPost.content,
        }),
      });

      if (response.ok) {
        const newId = posts.length + 1;
        const updatedPosts = [...posts, { id: newId, ...newPost }];
        setPosts(updatedPosts);
        setNewPost({ title: "", content: "" });
        setShowAddModal(false);
      } else {
        console.error("Failed to insert post");
      }
    } catch (error) {
      console.error("Error inserting post:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPost({ ...newPost, [name]: value });
  };

  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              <Card.Header>
                <Card.Title as="h4">Striped Table with Hover</Card.Title>
                <p className="card-category">
                  Here is a subtitle for this table
                </p>
                <Button variant="primary" onClick={handleShowAddModal}>
                  Add Post
                </Button>
              </Card.Header>
              <Card.Body className="table-full-width table-responsive px-0">
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">ID</th>
                      <th className="border-0">Name</th>
                      <th className="border-0">title</th>                   
                      <th className="border-0">date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} onClick={() => handleRowClick(post)}>
                        <td>{post.id}</td>
                        <td>{post.Uid}</td>
                        <td>{post.title}</td>
                        <td>{post.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showPostModal}
        onHide={handleClosePostModal}
        backdrop="static"
        style={{ zIndex: 1050 }} // Adjust z-index here
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedPost.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Author:</strong> {selectedPost.Uid}
          </p>
          <p>
            <strong>Date:</strong> {selectedPost.created_at}
          </p>
          <p>{selectedPost.body}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePostModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        backdrop="static"
        style={{ zIndex: 1050 }} // Adjust z-index here
      >
        <Modal.Header closeButton>
          <Modal.Title>Add New Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddPost}>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                name="title"
                value={newPost.title}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formContent">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter content"
                name="content"
                value={newPost.content}
                onChange={handleChange}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Post
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TableList;