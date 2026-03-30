/* ============================================
   Kakao Map 초기화
   ============================================ */

// Kakao Maps SDK 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
  // SDK가 로드되었는지 확인
  if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
    console.warn('Kakao Maps SDK가 로드되지 않았습니다. API 키를 확인하세요.');
    showMapPlaceholder();
    return;
  }

  kakao.maps.load(() => {
    initMaps();
  });
});

function initMaps() {
  const venues = [
    {
      id: 'map-lakeside',
      name: '레이크사이드 컨트리클럽',
      address: '경기도 용인시 처인구 모현읍 능원로 181'
    },
    {
      id: 'map-gapyeong',
      name: '가평베네스트 골프클럽',
      address: '경기도 가평군 상면 둔덕말길 232'
    }
  ];

  const geocoder = new kakao.maps.services.Geocoder();

  venues.forEach(venue => {
    const container = document.getElementById(venue.id);
    if (!container) return;

    // 주소로 좌표 검색
    geocoder.addressSearch(venue.address, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = {
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x)
        };
        venue.lat = coords.lat;
        venue.lng = coords.lng;

        // 현재 보이는 컨테이너만 바로 초기화
        if (!container.classList.contains('hidden')) {
          createKakaoMap(container, venue);
        } else {
          // 숨겨진 컨테이너는 탭 전환 시 초기화
          container._pendingVenue = venue;
        }
      } else {
        console.warn('주소 검색 실패:', venue.address);
        // 폴백: 대략적 좌표 사용
        if (venue.id === 'map-lakeside') {
          venue.lat = 37.2911;
          venue.lng = 127.1556;
        } else {
          venue.lat = 37.7936;
          venue.lng = 127.3569;
        }

        if (!container.classList.contains('hidden')) {
          createKakaoMap(container, venue);
        } else {
          container._pendingVenue = venue;
        }
      }
    });
  });
}

function createKakaoMap(container, venue) {
  if (container._kakaoMap) return; // 이미 초기화됨

  const position = new kakao.maps.LatLng(venue.lat, venue.lng);

  const map = new kakao.maps.Map(container, {
    center: position,
    level: 4
  });

  const marker = new kakao.maps.Marker({
    position: position,
    map: map
  });

  const infowindow = new kakao.maps.InfoWindow({
    content: '<div style="padding:8px 12px;font-size:13px;font-weight:700;white-space:nowrap;">' + venue.name + '</div>'
  });
  infowindow.open(map, marker);

  // 지도 컨트롤 추가
  const zoomControl = new kakao.maps.ZoomControl();
  map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  container._kakaoMap = map;
}

// Kakao SDK 로드 실패 시 플레이스홀더 표시
function showMapPlaceholder() {
  const containers = document.querySelectorAll('.map-container');
  containers.forEach(container => {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;' +
      'color:#999;font-size:14px;text-align:center;padding:20px;">' +
      '지도를 불러올 수 없습니다.<br>Kakao API 키를 설정해주세요.</div>';
  });
}
