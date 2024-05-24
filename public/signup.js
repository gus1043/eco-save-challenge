let map;
let marker;

// 현재 위치를 파악하여 검색 창에 자동으로 채워주는 함수
function setCurrentLocationToSearchBar() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var geocoder = new google.maps.Geocoder();
                var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                // Geocoder를 사용하여 현재 위치의 주소를 가져옴
                geocoder.geocode({ location: latLng }, function (results, status) {
                    if (status === 'OK') {
                        if (results[0]) {
                            // 검색 창에 주소 설정
                            document.getElementById('addressInput').value = results[0].formatted_address;
                        } else {
                            console.log('주소를 찾을 수 없습니다. ');
                        }
                    } else {
                        console.log('실패: ' + status);
                    }
                });
            },
            function (error) {
                console.error(error);
            }
        );
    } else {
        alert('이 브라우저에서는 geolocation이 지원되지 않습니다.');
    }
}

// 입력된 주소를 기반으로 지도와 마커를 업데이트하는 함수
async function updateMapWithAddress(address) {
    // Google Maps Geocoding API로 주소를 검색하여 위치 좌표 가져오기
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function (results, status) {
        if (status === 'OK') {
            // 검색된 위치 좌표
            var location = results[0].geometry.location;
            // 검색 창에 주소 설정
            document.getElementById('addressInput').value = results[0].formatted_address;

            // map이 이미 생성되어 있는지 확인하고, 새로운 map을 생성하거나 기존의 map을 업데이트
            if (!map) {
                map = new google.maps.Map(document.getElementById('map'), {
                    center: location,
                    zoom: 15,
                });
            } else {
                map.setCenter(location);
            }

            // marker이 이미 생성되어 있는지 확인하고, 새로운 marker을 생성하거나 기존의 marker을 업데이트
            if (!marker) {
                marker = new google.maps.Marker({
                    position: location,
                    map: map,
                });
            } else {
                marker.setPosition(location);
            }
        } else {
            alert('실패: ' + status);
        }
    });
}

// 버튼 클릭시 updateMapWithAddress 함수 호출
document.getElementById('searchButton').addEventListener('click', function () {
    var address = document.getElementById('addressInput').value;
    updateMapWithAddress(address);
});

// 엔터 키를 누르면 updateMapWithAddress 함수 호출
document.getElementById('addressInput').addEventListener('keypress', function (e) {
    // 엔터 키의 키 코드 13
    if (e.keyCode === 13) {
        var address = document.getElementById('addressInput').value;
        updateMapWithAddress(address);
    }
});

//getLocation으로 받은 위경도를 지도로 띄우기
async function getAddr(lat, lng) {
    console.log('위도:', lat, '경도:', lng);

    // 구글 객체가 정의되었는지 확인
    if (typeof google === 'undefined') {
        console.error('Google 객체가 정의되지 않았습니다.');
        return;
    }

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: lat, lng: lng },
        zoom: 20,
    });

    // 마커 생성
    marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
        title: '내 위치', // 마커에 툴팁으로 표시될 제목
    });
}

//geolocation으로 위 경도 받아오기
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                //getAddr(위도, 경도);
                getAddr(position.coords.latitude, position.coords.longitude);
            },
            function (error) {
                console.error(error);
            },
            {
                enableHighAccuracy: true, //정확한 위치요구
                maximumAge: 0, //캐시 유효시간
                timeout: Infinity, //최대 대기 시간
            }
        );
    } else {
        alert('현재 브라우저에서는 geolocation를 지원하지 않습니다');
    }
    return;
}
window.onload = function () {
    getLocation();
    setCurrentLocationToSearchBar();
};
var form_1 = document.querySelector('.form_1');
var form_2 = document.querySelector('.form_2');
var form_3 = document.querySelector('.form_3');

var form_1_btns = document.querySelector('.form_1_btns');
var form_2_btns = document.querySelector('.form_2_btns');
var form_3_btns = document.querySelector('.form_3_btns');

var form_1_next_btn = document.querySelector('.form_1_btns .btn_next');
var form_2_back_btn = document.querySelector('.form_2_btns .btn_back');
var form_2_next_btn = document.querySelector('.form_2_btns .btn_next');
var form_3_back_btn = document.querySelector('.form_3_btns .btn_back');

var form_2_progessbar = document.querySelector('.form_2_progessbar');
var form_3_progessbar = document.querySelector('.form_3_progessbar');

var btn_done = document.querySelector('.btn_done');
var modal_wrapper = document.querySelector('.modal_wrapper');
var shadow = document.querySelector('.shadow');

form_1_next_btn.addEventListener('click', function () {
    form_1.style.display = 'none';
    form_2.style.display = 'block';

    form_1_btns.style.display = 'none';
    form_2_btns.style.display = 'flex';

    form_2_progessbar.classList.add('active');
});

form_2_back_btn.addEventListener('click', function () {
    form_1.style.display = 'block';
    form_2.style.display = 'none';

    form_1_btns.style.display = 'flex';
    form_2_btns.style.display = 'none';

    form_2_progessbar.classList.remove('active');
});

form_2_next_btn.addEventListener('click', function () {
    form_2.style.display = 'none';
    form_3.style.display = 'block';

    form_3_btns.style.display = 'flex';
    form_2_btns.style.display = 'none';

    form_3_progessbar.classList.add('active');
});

form_3_back_btn.addEventListener('click', function () {
    form_2.style.display = 'block';
    form_3.style.display = 'none';

    form_3_btns.style.display = 'none';
    form_2_btns.style.display = 'flex';

    form_3_progessbar.classList.remove('active');
});

btn_done.addEventListener('click', function () {
    modal_wrapper.classList.add('active');
});

shadow.addEventListener('click', function () {
    modal_wrapper.classList.remove('active');
});
