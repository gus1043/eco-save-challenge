let map;
document.addEventListener('DOMContentLoaded', function () {
    var today = new Date();
    var month = today.getMonth() + 1; // 월은 0부터 시작하므로 1을 더합니다.
    var reportTitle = document.getElementById('report-title');
    reportTitle.textContent = month + '월 절약리포트';
});

// 프로필 로드
async function getProfile() {
    try {
        const res = await axios.get('/users/profile');
        const profile = res.data;

        if (profile.bill) {
            getReport();
        } else {
            document.getElementById('report').textContent = '요금 등록하고 시작하기';
            document.getElementById('consult').textContent = '요금 등록하고 시작하기';
        }

        console.log(profile);

        // 데이터를 HTML 요소에 채워넣기
        document.getElementById('addressInput').value = profile.address;
        document.getElementById('homestructure').value = profile.house_structure;
        document.getElementById('num_member').value = profile.num_member;
        document.getElementById('elect_application').value = profile.electrical_appliance;
        document.getElementById('age').value = profile.age;
        document.getElementById('bill').src = `https://em-content.zobj.net/source/microsoft-teams/363/${profile.image}`;
        if (profile.date) {
            document.getElementById('report-title').textContent = `${profile.date}월 절약리포트`;
        } else {
            document.getElementById('report-title').textContent = `절약리포트`;
        }
    } catch (err) {
        console.error(err);
    }
}

// 컨설트/리포트 로드
async function getReport() {
    try {
        const res = await axios.get('/aireport');
        const aireport = res.data;

        console.log();

        if (aireport.consult !== null) {
            //컨설트 내용이 있다면
            document.getElementById('report').innerHTML = marked.parse(aireport.report);
            document.getElementById('consult').innerHTML = marked.parse(aireport.consult);
        } else {
            document.getElementById('report').textContent = '3213213';
            document.getElementById('consult').textContent = '3213213';
            const response = await axios.post('/aireport');
            // 페이지 새로고침
            if (response.status === 200) {
                window.location.reload();
            }
        }
    } catch (err) {
        console.error(err);
    }
}

// 퀴즈 로드
async function getQuiz() {
    try {
        const res = await axios.get('/quiz');
        const quizzes = res.data;

        // 랜덤으로 하나의 퀴즈 선택
        const randomIndex = Math.floor(Math.random() * quizzes.length);
        const quiz = quizzes[randomIndex];

        // 퀴즈 데이터를 HTML 요소에 채워넣기
        const questionContainer = document.getElementById('question-container');
        questionContainer.classList.remove('hide');
        questionContainer.querySelector('#question').textContent = quiz.quiz;

        // 정답 여부 확인
        const trueButton = document.querySelector('.true');
        const falseButton = document.querySelector('.false');

        trueButton.addEventListener('click', () => checkAnswer(quiz.answer, true));
        falseButton.addEventListener('click', () => checkAnswer(quiz.answer, false));
    } catch (err) {
        console.error(err);
    }
}

function checkAnswer(correctAnswer, userAnswer) {
    console.log(correctAnswer, userAnswer);
    if (correctAnswer === userAnswer) {
        Swal.fire({
            imageUrl:
                'https://em-content.zobj.net/source/microsoft-teams/363/clapping-hands_light-skin-tone_1f44f-1f3fb_1f3fb.png',
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: 'Custom image',
            title: '정답입니다!',
            timer: 800, // 0.8초 후에 자동으로 닫힘
            showConfirmButton: false, // 확인 버튼 숨기기
            timerProgressBar: true, // 타이머 진행 표시줄 표시
            allowOutsideClick: false, // 바깥쪽 클릭으로 창을 닫지 못하도록 설정
        }).then(() => {
            getQuiz();
        });
    } else {
        Swal.fire({
            imageUrl:
                'https://em-content.zobj.net/source/microsoft-teams/363/supervillain_light-skin-tone_1f9b9-1f3fb_1f3fb.png',
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: 'Custom image',
            title: '틀렸습니다!',
            text: `정답은 ${correctAnswer}!`,
            confirmButtonColor: '#19A337',
            confirmButtonText: '확인',
        });
    }
}

// 페이지 로드 시 프로필 로딩
window.onload = function () {
    getProfile();
    getQuiz();
};

// 프로필 수정 버튼 클릭 이벤트 리스너 추가
document.getElementById('editProfile').addEventListener('click', async (e) => {
    e.preventDefault();

    // 수정된 내용을 가져오기
    const address = document.getElementById('addressInput').value;
    const houseStructure = document.getElementById('homestructure').value;
    const numMember = document.getElementById('num_member').value;
    const electApplication = document.getElementById('elect_application').value;
    const age = document.getElementById('age').value;

    // 수정된 내용을 서버에 전송
    try {
        await axios.put('/users/mypage/profile', {
            address,
            houseStructure,
            numMember,
            electApplication,
            age,
        });

        // 페이지 새로고침
        window.location.reload();
    } catch (error) {
        console.error(error);
    }
});

const searchInput = document.getElementById('addressInput');
const searchButton = document.getElementById('searchButton');

// 엔터 키를 누를 때 폼 제출 방지 및 주소 검색 함수 호출
searchInput.addEventListener('keydown', function (e) {
    // 엔터 키의 키 코드 13
    if (e.keyCode === 13) {
        e.preventDefault(); // 폼 제출 방지
        var address = searchInput.value;
        updateMapWithAddress(address);
    }
});
// searchButton 클릭 시 폼 제출 방지 및 주소 검색 함수 호출
searchButton.addEventListener('click', function (e) {
    e.preventDefault(); // 폼 제출 방지
    var address = searchInput.value;
    updateMapWithAddress(address);
});

// 버튼 클릭시 updateMapWithAddress 함수 호출
document.getElementById('searchButton').addEventListener('click', function () {
    var address = document.getElementById('addressInput').value;
    updateMapWithAddress(address);
});

// updateMapWithAddress 함수 수정: 도로명 주소를 가져와서 입력란에 출력
async function updateMapWithAddress(address) {
    console.log('입력 주소', address);
    // Google Maps Geocoding API로 주소를 검색하여 도로명 주소 가져오기
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function (results, status) {
        if (status === 'OK') {
            // 검색된 도로명 주소 출력
            var formattedAddress = results[0].formatted_address;
            document.getElementById('addressInput').value = formattedAddress;
        } else {
            alert('실패: ' + status);
        }
    });
}

//로그아웃
document.getElementById('logout').addEventListener('click', async () => {
    try {
        const response = await axios.get('/users/logout');
        if (response.status === 200) {
            // 로그아웃 성공 시 페이지 새로고침
            window.location.reload();
        } else {
            console.error('로그아웃 실패');
        }
    } catch (error) {
        console.error('로그아웃 오류:', error);
    }
});

//탈퇴
document.getElementById('delete').addEventListener('click', async () => {
    try {
        const result = await Swal.fire({
            icon: 'success',
            title: '탈퇴 알림!',
            text: '정말로 탈퇴하시겠습니까?',
            confirmButtonColor: '#19A337',
            confirmButtonText: '확인',
            cancelButtonColor: '#fff',
            cancelButtonText: '취소',
        });
        if (result.isConfirmed) {
            await axios.delete('/users/delete');

            // 탈퇴 성공 시 페이지 새로고침
            window.location.reload();
        }
    } catch (error) {
        console.error('로그아웃 오류:', error);
    }
});
