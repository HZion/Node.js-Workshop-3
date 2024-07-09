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

const host = process.env.REACT_APP_HOST
function TableList() {
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState({});
  const [newPost, setNewPost] = useState({ title: "", content: "", image: null });
  const [posts, setPosts] = useState([]);
  const API_PORT = '30000';

  useEffect(() => {
    // 페이지 로드 시 게시물 데이터를 서버에서 가져옴
    const fetchPosts = async () => {
      try {
        const serverResponse = await fetch(`http://${host}:${API_PORT}/post/loadpost`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
        });
        if (!serverResponse.ok) {
          throw new Error('서버에서 데이터를 가져오는 데 문제가 발생했습니다.');
        }

      
        const data = await serverResponse.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  // 게시물 모달 열기
  const handleRowClick = (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  // 게시물 추가 모달 열기
  const handleShowAddModal = () => setShowAddModal(true);

  // 새로운 게시물 추가 요청
  const handleAddPost = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`http://${host}:${API_PORT}/post/insertpost`, {
      const formData = new FormData();
      formData.append('title', newPost.title);
      //jwt 토큰있으면 Uid, 없으면 guest 
      
      formData.append('content', newPost.content);

      if (newPost.image) {
        formData.append('image', newPost.image);
      }

      const response = await fetch(`http://localhost:${API_PORT}/post/insertpost`, {headers: {
        Authorization: token,
      },
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // 새로운 게시물 추가 후 모달 닫기
        const newId = posts.length + 1;
        const updatedPosts = [
          ...posts,
          {
            id: newId,
            title: newPost.title,
            content: newPost.content,
            image: newPost.image ? URL.createObjectURL(newPost.image) : null, 
                   
          },
        ];
        setPosts(updatedPosts);
        setNewPost({ title: "", content: "", image: null });
        setShowAddModal(false);
      } else {
        console.error("Failed to insert post");
      }
    } catch (error) {
      console.error("Error inserting post:", error);
    }
  };

  // 입력 양식 값 변경 시 상태 업데이트
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setNewPost({ ...newPost, image: files[0] });
    } else {
      setNewPost({ ...newPost, [name]: value });
    }
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

                      <th className="border-0">Title</th>                   
                      <th className="border-0">Date</th>
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

      {/* 게시물 모달 */}
      <Modal
        show={showPostModal}
        onHide={() => setShowPostModal(false)}
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
          <p>
            <strong>Image:</strong> {selectedPost.img_url && (
              <img
              src={`http://localhost:${API_PORT}${selectedPost.img_url}`}
              alt="Post image"
              style={{ width: "100%" }}
              />
            )}
          </p>
          <p>{selectedPost.body}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPostModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 새로운 게시물 추가 모달 */}
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
            <Form.Group controlId="formImage">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
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
