/*!

=========================================================
* Light Bootstrap Dashboard React - v2.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/light-bootstrap-dashboard-react
* Copyright 2022 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/light-bootstrap-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { Component, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Button } from "react-bootstrap";

import routes from "routes.js";
import { Cookies } from "react-cookie";
import Modal from "react-modal";
import LoginModal from "./LoginModal";
import InsertMemberModal from "./InsertMemberModal";

function Header() {
  const location = useLocation();
  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    var node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };

  const getBrandText = () => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Brand";
  };
  const cookies = new Cookies();
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    console.log(showModal);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    console.log(showModal);
    setShowModal(false);
  };

  const [memberInfo, setMemberInfo] = useState({
    id: "",
    pw: "",
    name: "",
  });

  const idInputChange = (e) => {
    setMemberInfo((prevState) => {
      return { ...prevState, id: e.target.value };
    });
  };

  const pwInputChange = (e) => {
    setMemberInfo((prevState) => {
      return { ...prevState, pw: e.target.value };
    });
  };

  const nameInputChange = (e) => {
    setMemberInfo((prevState) => {
      return { ...prevState, name: e.target.value };
    });
  };

  const insertMember = async () => {
    console.log(memberInfo);
    let data = await fetch("http://localhost:8080/account/insertMember", {
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      body: JSON.stringify(memberInfo),
    });
    console.log(data);
    data = await data.json();
    console.log(data);
    alert(data.msg);
    handleCloseModal();
  };

  const logInOut = () => {
    if (cookies.get("id")) {
      //login 상태이면
      cookies.remove("id");
      window.location.reload();
    } else {
      handleOpenLoginModal();
    }
  };

  const login = () => {
    fetch("http://localhost:4000/account/login", {
      method: "POST", //메소드 지정
      headers: {
        //데이터 타입 지정
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(memberInfo), //실제 데이터 파싱하여 body에 저장
    })
      .then((res) => res.json()) // 리턴값이 있으면 리턴값에 맞는 req 지정
      .then((res) => {
        if (res.msg.includes("ok")) {
          cookies.set("id", memberInfo.id);
          sessionStorage.setItem('token', res.token);
          handleCloseLoginModal();
        } else {
          alert(res.msg);
        }
      });
  };

  const [showLoginModal, setShowLoginModal] = useState(false);
  const handleOpenLoginModal = () => {
    setShowLoginModal(true);
  };
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  const sessionTest = async () => {
    const token = sessionStorage.getItem('token');
    let data = await fetch("http://localhost:8080/account/session-test", {
      headers: {
        Authorization: token,
      },
    });
    data = await data.json();
    alert(data.msg);
  };

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Container fluid>
          <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
            <Button variant="dark" className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2" onClick={mobileSidebarToggle}>
              <i className="fas fa-ellipsis-v"></i>
            </Button>
            <Navbar.Brand href="#home" onClick={(e) => e.preventDefault()} className="mr-2">
              {getBrandText()}
            </Navbar.Brand>
          </div>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="mr-2">
            <span className="navbar-toggler-bar burger-lines"></span>
            <span className="navbar-toggler-bar burger-lines"></span>
            <span className="navbar-toggler-bar burger-lines"></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="nav mr-auto" navbar>
              <Nav.Item>
                <Nav.Link data-toggle="dropdown" href="#pablo" onClick={(e) => e.preventDefault()} className="m-0">
                  <i className="nc-icon nc-palette"></i>
                  <span className="d-lg-none ml-1">Dashboard</span>
                </Nav.Link>
              </Nav.Item>
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle as={Nav.Link} data-toggle="dropdown" id="dropdown-67443507" variant="default" className="m-0">
                  <i className="nc-icon nc-planet"></i>
                  <span className="notification">5</span>
                  <span className="d-lg-none ml-1">Notification</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                    Notification 1
                  </Dropdown.Item>
                  <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                    Notification 2
                  </Dropdown.Item>
                  <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                    Notification 3
                  </Dropdown.Item>
                  <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                    Notification 4
                  </Dropdown.Item>
                  <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                    Another notification
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Nav.Item>
                <Nav.Link className="m-0" href="#pablo" onClick={(e) => e.preventDefault()}>
                  <i className="nc-icon nc-zoom-split"></i>
                  <span className="d-lg-block"> Search</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
            <Nav className="ml-auto" navbar>
              <Nav.Item>
                <Nav.Link className="m-0" href="#pablo" onClick={(e) => e.preventDefault()}>
                  <span className="no-icon">Account</span>
                </Nav.Link>
                <Nav.Link className="m-0" href="/banking/api" onClick={(e) => e.preventDefault()}>
                  <span className="no-icon">환전</span>
                </Nav.Link>
              </Nav.Item>
              <Dropdown as={Nav.Item}>
                <Dropdown.Toggle aria-expanded={false} aria-haspopup={true} as={Nav.Link} data-toggle="dropdown" id="navbarDropdownMenuLink" variant="default" className="m-0">
                  <span className="no-icon">Dropdown</span>
                </Dropdown.Toggle>
                <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink">
                  <Dropdown.Item
                    href="#pablo"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenModal();
                    }}
                  >
                    회원가입
                  </Dropdown.Item>
                  <Dropdown.Item href="#" onClick={sessionTest}>
                    세션 테스트
                  </Dropdown.Item>
                  <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                    Something
                  </Dropdown.Item>
                  <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                    Something else here
                  </Dropdown.Item>
                  <div className="divider"></div>
                  <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                    Separated link
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Nav.Item>
                <Nav.Link className="m-0" href="#" onClick={logInOut}>
                  <span className="no-icon">{cookies.get("id") ? "Log out" : "Log in"}</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 회원가입 모달  */}

      <InsertMemberModal
      showModal={showModal}
      idInputChange={idInputChange}
      pwInputChange={pwInputChange}
      nameInputChange={nameInputChange}
      insertMember={insertMember}
      handleCloseModal={handleCloseModal}
      ></InsertMemberModal>

      {/* 로그인 모달  */}
      <LoginModal
      showLoginModal={showLoginModal}
      idInputChange={idInputChange}
      pwInputChange={pwInputChange}
      login={login}
      handleCloseLoginModal ={handleCloseLoginModal}
      >
      </LoginModal>

    </div>
  );
}

export default Header;
