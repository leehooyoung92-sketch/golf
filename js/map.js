/* ============================================
   Kakao Map 초기화 (+ Google Maps 폴백)
   ============================================ */

var mapInitialized = false;

window.addEventListener('load', () => {
  try {
    if (typeof kakao !== 'undefined' && kakao.maps) {
      kakao.maps.load(() => {
        initKakaoMaps();
        mapInitialized = true;
      });
      // 3초 내 초기화 안 되면 폴백
      setTimeout(() => {
        if (!mapInitialized) showGoogleMapsFallback();
      }, 3000);
    } else {
      showGoogleMapsFallback();
    }
  } catch (e) {
    showGoogleMapsFallback();
  }
});

var venues = [
  {
    id: 'map-lakeside',
    name: '레이크사이드 컨트리클럽',
    address: '경기도 용인시 처인구 모현읍 능원로 181',
    lat: 37.2911,
    lng: 127.1556,
    googleEmbed: 'https://www.google.com/maps?q=37.2911,127.1556&z=14&output=embed'
  },
  {
    id: 'map-gapyeong',
    name: '가평베네스트 골프클럽',
    address: '경기도 가평군 상면 둔덕말길 232',
    lat: 37.7936,
    lng: 127.3569,
    googleEmbed: 'https://www.google.com/maps?q=37.7936,127.3569&z=14&output=embed'
  }
];

function initKakaoMaps() {
  var geocoder = new kakao.maps.services.Geocoder();

  venues.forEach(function(venue) {
    var container = document.getElementById(venue.id);
    if (!container) return;

    geocoder.addressSearch(venue.address, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        venue.lat = parseFloat(result[0].y);
        venue.lng = parseFloat(result[0].x);
      }

      if (!container.classList.contains('hidden')) {
        createKakaoMap(container, venue);
      } else {
        container._pendingVenue = venue;
      }
    });
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
    mapInitialized = true;
  } catch (e) {
    showGoogleMapFallbackSingle(container, venue);
  }
}

function showGoogleMapsFallback() {
  venues.forEach(function(venue) {
    var container = document.getElementById(venue.id);
    if (container && !container._kakaoMap) {
      showGoogleMapFallbackSingle(container, venue);
    }
  });
}

function showGoogleMapFallbackSingle(container, venue) {
  container.innerHTML =
    '<iframe src="' + venue.googleEmbed + '" ' +
    'width="100%" height="100%" style="border:0;" ' +
    'allowfullscreen="" loading="lazy" ' +
    'referrerpolicy="no-referrer-when-downgrade"></iframe>';
}
