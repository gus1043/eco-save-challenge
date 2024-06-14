// 현재 월을 표시
function displayCurrentMonth() {
    const heading = document.getElementById('heading');
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth() + 1; // getMonth()는 zero-based
    heading.textContent = currentMonthIndex + '월 챌린지';
}
// 로그인하지 않았을 시 로그인 후 사용하라는 모달 띄우기
// loginModal이 ejs의 else 부분에 있어서 그때만 실행됨
document.addEventListener('DOMContentLoaded', function () {
    // DOM이 로드된 후에 실행될 코드
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        //로그인 안했을떄
        loginBtn.addEventListener('click', function () {
            window.location.href = '/users/login'; // 로그인 페이지 URL로 변경
        });
        drawChart(10, 20, 25);
    } else {
        //로그인했을때
        getPercent();
        getCountryRank();
        getAllusersRank();
    }
});

function formatNumber(input) {
    const value = input.value.replace(/,/g, '');
    if (!isNaN(value)) {
        input.value = Number(value).toLocaleString('en');
    } else {
        input.value = input.value.substring(0, input.value.length - 1);
    }
}

// 첫 요금 등록
document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('registerButton');
    if (registerButton) {
        registerButton.addEventListener('click', function () {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonthIndex = currentDate.getMonth() + 1;
            const formattedMonth = currentMonthIndex < 10 ? '0' + currentMonthIndex : currentMonthIndex;
            const formattedDate = `${currentYear}-${formattedMonth}`;
            Swal.fire({
                title: '요금 등록',
                text: `${currentMonthIndex}월 전기요금을 입력해주세요!`,
                imageUrl:
                    'https://em-content.zobj.net/source/microsoft-teams/363/raising-hands_light-skin-tone_1f64c-1f3fb_1f3fb.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                input: 'text',
                inputAttributes: {
                    id: 'numberInput',
                    placeholder: '숫자만 입력',
                },
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value) {
                        return '입력을 완료해주세요!';
                    }
                },
                didOpen: () => {
                    const numberInput = Swal.getInput();
                    numberInput.addEventListener('input', function (e) {
                        formatNumber(e.target);
                    });
                },
                confirmButtonColor: '#19A337',
                confirmButtonText: '예',
                cancelButtonText: '아니요',
            }).then((result) => {
                if (result.isConfirmed) {
                    const billAmount = result.value.replace(/,/g, '');
                    axios
                        .post('/users/billpost', { bill: billAmount, date: formattedDate })
                        .then((response) => {
                            if (response.status === 201) {
                                Swal.fire('등록 완료!', '요금이 성공적으로 등록되었습니다.', 'success');
                                window.location.reload();
                            }
                        })
                        .catch((error) => {
                            Swal.fire('오류', '요금 등록에 실패했습니다.', 'error');
                        });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                }
            });
        });
    }
});

// 추가로 이전 요금 등록
document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('addBillButton');
    if (registerButton) {
        registerButton.addEventListener('click', function () {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonthIndex = currentDate.getMonth() + 1;
            const formattedMonth = currentMonthIndex < 10 ? '0' + currentMonthIndex : currentMonthIndex;
            const formattedDate = `${currentYear}-${formattedMonth}`;
            Swal.fire({
                title: '이전 요금 등록',
                imageUrl:
                    'https://em-content.zobj.net/source/microsoft-teams/363/raising-hands_light-skin-tone_1f64c-1f3fb_1f3fb.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                html: `
                    <div class="custom-input-container">
                        <select id="yearSelect">
                            <option value="2022">2022</option>
                            <option value="2023">2023</option>
                            <option value="2024">2024</option>
                        </select>
                        <select id="monthSelect">
                            <option value="1">1월</option>
                            <option value="2">2월</option>
                            <option value="3">3월</option>
                            <option value="4">4월</option>
                            <option value="5">5월</option>
                            <option value="6">6월</option>
                            <option value="7">7월</option>
                            <option value="8">8월</option>
                            <option value="9">9월</option>
                            <option value="10">10월</option>
                            <option value="11">11월</option>
                            <option value="12">12월</option>
                        </select>
                    </div>
                    <div class="custom-input-container">
                        <input type="text" id="numberInput" placeholder="숫자만 입력">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#19A337',
                confirmButtonText: '예',
                cancelButtonText: '아니요',
                didOpen: () => {
                    const numberInput = document.getElementById('numberInput');
                    numberInput.addEventListener('input', function (e) {
                        formatNumber(e.target);
                    });
                },
                preConfirm: () => {
                    const yearSelect = document.getElementById('yearSelect').value;
                    const monthSelect = document.getElementById('monthSelect').value;
                    const numberInput = document.getElementById('numberInput').value;
                    if (!numberInput) {
                        Swal.showValidationMessage('입력을 완료해주세요!');
                        return false;
                    }
                    return {
                        year: yearSelect,
                        month: monthSelect,
                        bill: numberInput,
                    };
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    const billAmount = result.value.bill.replace(/,/g, '');
                    const formattedDate = `${result.value.year}-${String(result.value.month).padStart(2, '0')}`;
                    axios
                        .post('/users/billpost', { bill: billAmount, date: formattedDate })
                        .then((response) => {
                            if (response.status === 201) {
                                Swal.fire('등록 완료!', '요금이 성공적으로 등록되었습니다.', 'success');
                                window.location.reload();
                            }
                        })
                        .catch((error) => {
                            Swal.fire('오류', '요금 등록에 실패했습니다.', 'error');
                        });
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                    // 취소 버튼이 눌렸을 때의 처리
                }
            });

            function formatNumber(input) {
                let value = input.value.replace(/,/g, '');
                value = Number(value).toLocaleString();
                input.value = value;
            }
        });
    }
});

// 기본 리포트 로드
async function getPercent() {
    try {
        const res = await axios.get('/mychallenge');

        // 범위와 이미지, 정보 값 매핑
        const rangeInfoMap = {
            1500: { image: 'coin_1fa99.png', info: '동전' },
            5000: { image: 'steaming-bowl_1f35c.png', info: '라면 한 그릇' },
            8000: { image: 'hamburger_1f354.png', info: '싸이버거 세트' },
            10000: { image: 'green-salad_1f957.png', info: '샐러드' },
            12000: { image: 'fried-shrimp_1f364.png', info: '튀김' },
            15000: { image: 'curry-rice_1f35b.png', info: '카레' },
            35000: { image: 'flexed-biceps_medium-light-skin-tone_1f4aa-1f3fc_1f3fc.png', info: '헬스장 1일권' },
        };

        // 이미지와 정보 찾는 함수
        function findImageInfo(value) {
            for (let range in rangeInfoMap) {
                if (value < range) {
                    return rangeInfoMap[range];
                }
            }
            // 범위에 속하지 않는 경우에 대한 기본 값 반환
            return { image: 'defaultImage.png', info: '기본 정보' };
        }

        console.log(res.data);
        if (res.data !== null) {
            drawChart(res.data.mybill, res.data.ageaveragebills, res.data.averageBill);
            document.getElementById('heading').textContent = `${res.data.date}월 챌린지`;

            const mybill = res.data.mybill; // mybill 값을 데이터에서 가져옵니다.
            const { image, info } = findImageInfo(mybill);
            // 이미지와 정보를 HTML 요소에 설정
            document.getElementById('use').src = `https://em-content.zobj.net/source/microsoft-teams/363/${image}`;
            document.getElementById('how').innerHTML = `${info}만큼<br>전기를 사용했어요`;

            console.log('차트 아낀', res.data.savingsLastMonth);
            if (res.data.savingsLastMonth !== null) {
                document.getElementById(
                    'saving'
                ).innerHTML = `지난달보다<br>${res.data.savingsLastMonth}원 더 아꼈어요`;
                document.getElementById(
                    'percent'
                ).innerHTML = `이번달 전기요금은<br> ${res.data.age} 대 중 상위 ${res.data.agePercentRank}%, 전체상위 ${res.data.countryPercentRank}%입니다`;
            } else {
                document.getElementById('saving').textContent = `직전 달 요금이 등록되지 않았어요!`;
                document.getElementById('percent').textContent = `이번달이 첫 시작일이에요!`;
            }
            if (res.data.mybill !== null) {
                document.getElementById(
                    'percent'
                ).innerHTML = `이번달 전기요금은<br> ${res.data.age} 대 중 상위 ${res.data.agePercentRank}%, 전체상위 ${res.data.countryPercentRank}%입니다`;
            } else {
                document.getElementById('saving').textContent = `요금이 등록되지 않았어요!`;
            }
        } else {
            displayCurrentMonth();
        }
    } catch (err) {
        console.error(err);
    }
}

function drawChart(mybill, age, allusers) {
    if (mybill == null) {
        mybill = 0;
    }
    var ctx = document.getElementById('percentchcart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar', // 차트 유형
        data: {
            labels: ['내 절약', '내 나이대', '전체'], // X축 레이블
            datasets: [
                {
                    label: '나는 얼마나 절약했을까?!', // 차트 제목
                    data: [mybill, age, allusers], // 데이터 포인트
                    backgroundColor: [
                        '#9BF09D', // 각 바의 배경색
                        '#D9D9D9',
                        '#D9D9D9',
                    ],
                    borderRadius: 5,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            indexAxis: 'y', // 차트를 가로로 변경
            plugins: {
                legend: {
                    // 범례 사용 안 함
                    display: false,
                },
            },
            scales: {
                x: {
                    beginAtZero: true, // X축을 0부터 시작
                },
            },
        },
    });
}

//동네 절약 랭킹
async function getCountryRank() {
    try {
        const res = await axios.get('/countrychallenge');

        console.log(res.data);
        if (res.data !== null) {
            drawChart2(res.data.mybill, res.data.avgbill, res.data.alluser, 'countrychart');
        }
    } catch (err) {
        console.error(err);
    }
}

//전체 사용자 절약 랭킹
async function getAllusersRank() {
    try {
        const res = await axios.get('/userschallenge');

        console.log(res.data);
        if (res.data !== null) {
            drawChart2(res.data.mybill, res.data.avgbill, res.data.alluser, 'alluserschart');
        }
    } catch (err) {
        console.error(err);
    }
}

function drawChart2(myBill, avgBill, allUsers, chartname) {
    // allUsers에서 상위 30개 사용자의 닉네임과 전기요금을 추출
    const top30Users = allUsers.slice(0, 30).map((user) => ({
        name: user.Residence_info.nickname, // 사용자의 닉네임 가져오기
        bill: user.bill,
    }));

    console.log(top30Users);

    // 차트 데이터 준비
    const chartData = {
        labels: ['내 전기요금', '평균', ...top30Users.map((user) => user.name)], // 닉네임을 레이블로 사용
        datasets: [
            {
                label: 'Bill Amount',
                data: [myBill, avgBill, ...top30Users.map((user) => user.bill)],
                backgroundColor: ['#20C968', '#337A2C', ...top30Users.map(() => '#979797')],
                borderRadius: 5,
                borderWidth: 1,
            },
        ],
    };

    // 차트 그리기
    const ctx = document.getElementById(`${chartname}`).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}
