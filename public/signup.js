// 사용자 등록 시
document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const passwordcheck = e.target.passwordcheck.value;
    if (!name) {
        return alert('이름을 입력하세요');
    }

    //이메일 형식 확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        return alert('이메일을 입력하세요');
    } else if (!emailRegex.test(email)) {
        return alert('올바른 이메일 형식을 입력하세요');
    }

    // 비밀번호 제약조건 확인
    const passwordMinLength = 8;

    if (!password) {
        return alert('비밀번호를 입력하세요');
    } else if (password.length < passwordMinLength) {
        return alert(`비밀번호는 최소 ${passwordMinLength}자 이상이어야 합니다`);
    }

    if (password !== passwordcheck) {
        return alert('비밀번호가 서로 다릅니다!');
    }
    try {
        // 서버에 회원가입 요청
        const response = await axios.post('/users/signup', { name, email, password });
        // 성공하면 login으로 이동
        if (response.status === 201) {
            await Swal.fire({
                imageUrl:
                    'https://em-content.zobj.net/source/microsoft-teams/363/clapping-hands_light-skin-tone_1f44f-1f3fb_1f3fb.png',
                imageWidth: 140,
                imageHeight: 140,
                imageAlt: 'Custom image',
                title: '회원가입 성공!',
                text: '로그인 페이지로 이동합니다.',
                timer: 800, // 0.8초 후에 자동으로 닫힘
                showConfirmButton: false, // 확인 버튼 숨기기
                timerProgressBar: true, // 타이머 진행 표시줄 표시
                allowOutsideClick: false, // 바깥쪽 클릭으로 창을 닫지 못하도록 설정
            }).then(() => {
                window.location.href = '/users/login'; // 로그인 페이지로 이동
            });
        } else {
            // 서버에서 정의된 다른 상태 코드 처리
            await Swal.fire({
                imageUrl:
                    'https://em-content.zobj.net/source/microsoft-teams/363/woman-facepalming-light-skin-tone_1f926-1f3fb-200d-2640-fe0f.png',
                imageWidth: 140,
                imageHeight: 140,
                imageAlt: 'Custom image',
                title: '회원가입 실패',
                confirmButtonColor: '#19A337',
                confirmButtonText: '확인',
            });
        }
    } catch (err) {
        if (err.response && err.response.status === 409) {
            console.error(err);
            await Swal.fire({
                imageUrl:
                    'https://em-content.zobj.net/source/microsoft-teams/363/woman-facepalming-light-skin-tone_1f926-1f3fb-200d-2640-fe0f.png',
                imageWidth: 140,
                imageHeight: 140,
                imageAlt: 'Custom image',
                title: '회원가입 실패',
                text: '이미 있는 이메일 입니다.',
                confirmButtonColor: '#19A337',
                confirmButtonText: '확인',
            });
        } else {
            console.error(err);
            await Swal.fire({
                imageUrl:
                    'https://em-content.zobj.net/source/microsoft-teams/363/woman-facepalming-light-skin-tone_1f926-1f3fb-200d-2640-fe0f.png',
                imageWidth: 140,
                imageHeight: 140,
                imageAlt: 'Custom image',
                title: '회원가입 실패',
                text: '회원가입 중 오류가 발생했습니다.',
                confirmButtonColor: '#19A337',
                confirmButtonText: '확인',
            });
        }
    }

    e.target.name.value = '';
    e.target.email.value = '';
    e.target.password.value = '';
    e.target.passwordcheck.value = '';
});
