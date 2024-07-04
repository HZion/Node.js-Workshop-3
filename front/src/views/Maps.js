import React, { useState, useEffect } from 'react';
import '../assets/css/map.css';
import { useHistory } from 'react-router-dom';

import Modal from 'react-modal';

Modal.setAppElement('#root'); // 모달의 접근성을 위해 반드시 설정해줘야 합니다.
function Maps() {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };


  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=004ee596aeb819eca0cffa88867e0ca4&autoload=false`;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        const mapContainer = document.getElementById('map');
        const options = {
          center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
          level: 3,
        };
        const map = new window.kakao.maps.Map(mapContainer, options);

        // 마커 추가 예시
        const markerPosition = new window.kakao.maps.LatLng(37.566826, 126.9786567);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
        });
        marker.setMap(map);
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const searchPlaces = () => {
    const keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
      alert('키워드를 입력해주세요!');
      return false;
    }

    const ps = new window.kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status, pagination) => {
      if (status === window.kakao.maps.services.Status.OK) {
        displayPlaces(data, pagination);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
      }
    });
  };

  const displayPlaces = (places, pagination) => {
    const listEl = document.getElementById('placesList');
    const menuEl = document.getElementById('menu_wrap');
    const bounds = new window.kakao.maps.LatLngBounds();

    removeAllChildNodes(listEl);
    removeMarker();

    places.forEach((place, index) => {
      const placePosition = new window.kakao.maps.LatLng(place.y, place.x);
      const marker = addMarker(placePosition, index, place.place_name);
      bounds.extend(placePosition);
      const itemEl = getListItem(index, place);
      listEl.appendChild(itemEl);

      itemEl.addEventListener('mouseover', () => {
        displayInfowindow(marker, place.place_name);
      });

      itemEl.addEventListener('mouseout', () => {
        infowindow.close();
      });
    });

    map.setBounds(bounds);
    menuEl.scrollTop = 0;
    displayPagination(pagination);
  };

  const addMarker = (position, idx, title) => {
    const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png';
    const imageSize = new window.kakao.maps.Size(36, 37);
    const imgOptions = {
      spriteSize: new window.kakao.maps.Size(36, 691),
      spriteOrigin: new window.kakao.maps.Point(0, (idx * 46) + 10),
      offset: new window.kakao.maps.Point(13, 37),
    };
    const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions);
    const marker = new window.kakao.maps.Marker({
      position: position,
      image: markerImage,
    });
    marker.setMap(map);
    markers.push(marker);
    return marker;
  };

  const displayInfowindow = (marker, title) => {
    const content = `<div style="padding:5px;z-index:1;">${title}</div>`;
    infowindow.setContent(content);
    infowindow.open(map, marker); 
  };

  const removeAllChildNodes = (parent) => {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  };

  const removeMarker = () => {
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];
  };

  const displayPagination = (pagination) => {
    const paginationEl = document.getElementById('pagination');
    removeAllChildNodes(paginationEl);

    for (let i = 1; i <= pagination.last; i++) {
      const el = document.createElement('a');
      el.href = '#';
      el.innerHTML = i;

      if (i === pagination.current) {
        el.className = 'on';
      } else {
        el.onclick = () => {
          pagination.gotoPage(i);
        };
      }

      paginationEl.appendChild(el);
    }
  };

  const handleAddButtonClick = () => {
    history.push('/admin/icons'); // /admin/icons 경로로 이동
  };

  return (
    <div className="map_wrap">
      <div id="map" style={{ width: '100%', height: '800px' }}></div>

      <div id="menu_wrap" className="bg_white">
        <div className="option">
          <div>
            <form onSubmit={(e) => { e.preventDefault(); searchPlaces(); }}>
              키워드 : <input type="text" defaultValue="" id="keyword" size="15" /> 
              <button type="submit">검색하기</button> 
            </form>
          </div>
        </div>
        <hr />
        <ul id="placesList">
          <button onClick={openModal}>추가하기</button>
        </ul>
        <div id="pagination"></div>
      </div>

     <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        className="custom-modal"
      >
        <h2>모달 타이틀</h2>
        <p>모달 내용</p>
        <button onClick={closeModal}>닫기</button>
      </Modal>

    </div>
  );
}

export default Maps;
