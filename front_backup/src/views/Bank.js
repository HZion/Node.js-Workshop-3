import React from "react";

// react-bootstrap components
import {
    Badge,
    Button,
    Card,
    Navbar,
    Nav,
    Container,
    Row,
    Col,
} from "react-bootstrap";

function Bank() {
    return (
        <>
            <Container fluid>
                <Row>
                    <Col md="12">
                        <Card>
                            <Card.Header>
                                <Card.Title as="h4">My Account</Card.Title>
                            </Card.Header>
                            <Card.Body className="all-icons">
                                <Row>

                                    <Col className="font-icon-list" lg="2" md="3" sm="4" xs="6">
                                        <div className="font-icon-detail">
                                            <i className="nc-icon nc-bank"></i>
                                            <p>nc-bank</p>
                                        </div>
                                    </Col>

                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default Bank;
