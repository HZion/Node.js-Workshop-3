import React from "react";
import Modal from "react-modal";

function InsertMemberModal({showModal, idInputChange, pwInputChange, nameInputChange, insertMember}) {
  return (
    <Modal
      isOpen={showModal}
      contentLabel="Minimal Modal Example"
      style={{
        overlay: {
          //backgroundColor: 'papayawhip'
        },
        content: {
          //color: "lightsteelblue",
          width: "600px",
          height: "500px",
          top: "150px",
          left: "350px",
        },
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          handleCloseModal();
        }}
      >
        Close Modal
      </button>
      <div>
        <div className="mb-3 mt-3">
          <label className="form-label">ID:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter id"
            onChange={idInputChange}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password:</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            onChange={pwInputChange}
          />
        </div>
        <div className="mb-3 mt-3">
          <label className="form-label">NAME:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter Name"
            onChange={nameInputChange}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            insertMember();
          }}
        >
          회원 가입
        </button>
      </div>
    </Modal>
  );
}

export default InsertMemberModal;
