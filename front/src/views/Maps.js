import React, { useState, useEffect } from 'react';
import '../assets/css/map.css';
import Modal from 'react-modal';
import { KakaoMap, Marker, InfoWindow } from 'react-kakao-maps'; // react-kakao-maps에서 필요한 컴포넌트 임포트

Modal.setAppElement('#root');
const host = process.env.REACT_APP_HOST

 const API_PORT = '30000'
function Maps() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [realEstateName, setRealEstateName] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [infoWindow, setInfoWindow] = useState(null); // 인포윈도우 상태 추가
  const [properties, setProperties] = useState([]); // 부동산 정보 배열 상태 추가

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
//랜더링 시작시 db와 연결
  const fetchProperties = async () => {
    try {
      const serverResponse = await fetch(`http://${host}:${API_PORT}/maps/loadmap`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });

      if (!serverResponse.ok) {
        throw new Error('서버에서 데이터를 가져오는 데 문제가 발생했습니다.');
      }

      const data = await serverResponse.json();
      setProperties(data); // 서버에서 받아온 데이터를 상태에 설정
      console.log(data);
      // 데이터를 기반으로 마커 추가
      data.forEach((property) => {
        setProperties((prevProperties) => [
          ...prevProperties,
          {
            name: property.title,
            price: property.asset,
            address: property.address,
            lat: property.lat,
            lng: property.log,
          },
        ]);


      });

    } catch (error) {
      console.error('데이터를 불러오는 중 오류가 발생했습니다:', error.message);
    }
  };

  const handleAddProperty = async () => {
    console.log('부동산 이름:', realEstateName);
    console.log('가격:', price);
    console.log('주소:', address);

    // 주소로부터 좌표를 가져오기 위한 요청
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`
    );
    const data = await response.json();

    if (data.length > 0) {
      const coords = data[0];
      setCoordinates({ lat: coords.lat, lng: coords.lon });
      console.log('위도:', coords.lat, '경도:', coords.lon);
      addMarker(coords.lat, coords.lon, realEstateName, price, address);

      // 부동산 정보를 상태에 추가
      setProperties((prevProperties) => [
        ...prevProperties,
        {
          name: realEstateName,
          price,
          address,
          lat: coords.lat,
          lng: coords.lon,
        },
      ]);

      // 부동산 정보를 서버로 전송

        const serverResponse = await fetch(`http://${host}:${API_PORT}/maps/insertmap`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify({
            name: realEstateName,
            price,
            address: address,
            lat: coords.lat,
            lng: coords.lon,
          }),
        });


    } else {
      console.error('주소를 찾을 수 없습니다.');
    }

    closeModal();
  };

  const addMarker = (lat, lng, name, price, address) => {
    const markerPosition = new window.kakao.maps.LatLng(lat, lng);
    const newMarker = new window.kakao.maps.Marker({
      position: markerPosition,
      map,
    });

    // 마커에 마우스를 올렸을 때 인포윈도우 열기
    newMarker.addListener('mouseover', () => {
      const content = `
        <div style="padding:10px;">
          <h4>${name}</h4>
          <p>가격: ${price}</p>
          <p>주소: ${address}</p>
        </div>
      `;
      const infoWindow = new window.kakao.maps.InfoWindow({
        content,
        removable: true,
        position: markerPosition,
      });
      infoWindow.open(map, newMarker);
      setInfoWindow(infoWindow); // 인포윈도우 상태 업데이트
    });

    // 마커에서 마우스를 내릴 때 인포윈도우 닫기
    newMarker.addListener('mouseout', () => {
      if (infoWindow) {
        infoWindow.close(); // 인포윈도우 닫기
        setInfoWindow(null); // 인포윈도우 상태 초기화
      }
    });

    setMarkers((prevMarkers) => [...prevMarkers, { marker: newMarker, name }]); // 마커 배열에 추가
  };

  const handleMouseOver = (marker) => {
    console.log("마커관련정보" +marker);
    const content = `
      <div style="padding:10px;">
        <h4>${marker.name}</h4>
        <p>가격: ${price}</p>
        <p>주소: ${address}</p>
      </div>
    `;
    const infoWindow = new window.kakao.maps.InfoWindow({
      content,
      removable: true,
      position: marker.marker.getPosition(),
    });
    infoWindow.open(map, marker.marker);
    setInfoWindow(infoWindow);
  };

  const handleMouseOut = () => {
    if (infoWindow) {
      infoWindow.close();
      setInfoWindow(null);
    }
  };
// kakao map 생성
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
        const newMap = new window.kakao.maps.Map(mapContainer, options);
        setMap(newMap); // 지도 객체 상태 업데이트
      });
    };

    fetchProperties();

    return () => {
      document.head.removeChild(script);
    };
  }, []);
// 서버에서 db 정보 긁어오기

  return (
    <div className="map_wrap">
      <div id="map" style={{ width: '100%', height: '800px' }}></div>

      <div id="menu_wrap" className="bg_white">
        <div className="option">
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                /* searchPlaces(); */
              }}
            >
              키워드 :{' '}
              <input type="text" defaultValue="" id="keyword" size="15" />
              <button type="submit">검색하기</button>
            </form>
          </div>
        </div>
        <button onClick={openModal}>추가하기</button>
        <hr />

        <ul id="placesList">
          {properties.map((property, index) => (
            <li
              key={index}
              style={{ borderBottom: '3px solid black', padding: '10px' }}
              onMouseOver={() => handleMouseOver(markers[index])}
              onMouseOut={handleMouseOut}
            >
              <h4 id="item_title">{property.name}</h4>
              <p>가격: {property.price}</p>
              <p>주소: {property.address}</p>
            </li>
          ))}
        </ul>
        <div id="pagination"></div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
        className="custom-modal"
      >
        <h2>부동산 정보 추가</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddProperty();
          }}
        >
          <div>
            <label>부동산 이름:</label>
            <input
              type="text"
              value={realEstateName}
              onChange={(e) => setRealEstateName(e.target.value)}
            />
          </div>
          <div>
            <label>가격:</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label>주소:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <button type="submit">추가하기</button>
        </form>
        <button onClick={closeModal}>닫기</button>
      </Modal>
    </div>
  );
}

export default Maps;
