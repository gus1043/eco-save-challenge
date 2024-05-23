//getLocation으로 받은 위경도를 지도로 띄우기
function getAddr(lat, lng) {
    console.log('위도:', lat, '경도:', lng);
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
                enableHighAccuracy: false,
                maximumAge: 0,
                timeout: Infinity,
            }
        );
    } else {
        alert('현재 브라우저에서는 geolocation를 지원하지 않습니다');
    }
    return;
}

getLocation();

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
