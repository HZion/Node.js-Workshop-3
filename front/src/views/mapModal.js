import React from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ showModal, onClose, onSubmit, placeName, setPlaceName, address, setAddress }) => {
  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return ReactDOM.createPortal(
    <div className="modal">
      <div className="modal_content">
        <h2>새로운 장소 추가</h2>
        <form onSubmit={handleSubmit}>
          <label>장소 이름:</label>
          <input type="text" value={placeName} onChange={(e) => setPlaceName(e.target.value)} required />
          <label>주소:</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <button type="submit">저장하기</button>
        </form>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default Modal;
