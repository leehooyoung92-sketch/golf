/* ============================================
   Kakao Map 초기화 (autoload 모드)
   ============================================ */

var venues = [
  {
    id: 'map-lakeside',
    name: '레이크사이드 컨트리클럽',
    address: '경기도 용인시 처인구 모현읍 능원로 181',
    lat: 37.2911,
    lng: 127.1556,
    kakaoLink: 'https://map.kakao.com/link/map/레이크사이드CC,37.2911,127.1556'
  },
  {
    id: 'map-gapyeong',
    name: '가평베네스트 골프클럽',
    address: '경기도 가평군 상면 둔덕말길 232',
    lat: 37.7936,
    lng: 127.3569,
    kakaoLink: 'https://map.kakao.com/link/map/가평베네스트,37.7936,127.3569'
  }
];

window.addEventListener('load', function() {
  // autoload 모드: SDK 로드 완료 시 kakao.maps.LatLng 사용 가능
  if (typeof kakao !== 'undefined' && kakao.maps && kakao.maps.LatLng) {
    initKakaoMaps();
  } else {
    showMapPlaceholder();
  }
});

function initKakaoMaps() {
  venues.forEach(function(venue) {
    var container = document.getElementById(venue.id);
    if (!container) return;

    if (!container.classList.contains('hidden')) {
      createKakaoMap(container, venue);
    } else {
      container._pendingVenue = venue;
    }
  });
}

function createKakaoMap(container, venue) {
  if (container._kakaoMap) return;

  try {
    var position = new kakao.maps.LatLng(venue.lat, venue.lng);

    var map = new kakao.maps.Map(container, {
      center: position,
      level: 4
    });

    var marker = new kakao.maps.Marker({
      position: position,
      map: map
    });

    var infowindow = new kakao.maps.InfoWindow({
      content: '<div style="padding:8px 12px;font-size:13px;font-weight:700;white-space:nowrap;">' + venue.name + '</div>'
    });
    infowindow.open(map, marker);

    var zoomControl = new kakao.maps.ZoomControl();
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

    container._kakaoMap = map;
  } catch (e) {
    showSinglePlaceholder(container, venue);
  }
}

function showMapPlaceholder() {
  venues.forEach(function(venue) {
    var container = document.getElementById(venue.id);
    if (container && !container._kakaoMap) {
      showSinglePlaceholder(container, venue);
    }
  });
}

function showSinglePlaceholder(container, venue) {
  container.innerHTML =
    '<a href="' + venue.kakaoLink + '" target="_blank" ' +
    'style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'height:100%;background:#f0f0f0;color:#555;font-size:14px;text-align:center;' +
    'text-decoration:none;gap:8px;padding:20px;">' +
    '<span style="font-size:24px;">&#128205;</span>' +
    '<strong style="color:#333;">' + venue.name + '</strong>' +
    '<span style="font-size:12px;color:#888;">' + venue.address + '</span>' +
    '<span style="margin-top:4px;padding:8px 16px;background:#8B1A2B;color:#fff;' +
    'border-radius:6px;font-size:13px;font-weight:700;">카카오맵에서 보기</span>' +
    '</a>';
}
