// 사용자 등록 시
document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (!email) {
        return alert('이메일를 입력하세요');
    }
    if (!password) {
        return alert('비밀번호를 입력하세요');
    }
    try {
        // 서버에 로그인 요청
        const response = await axios.post('/users/login', { email, password }, { withCredentials: true });
        // 성공하면 login으로 이동
        if (response.status === 200) {
            await Swal.fire({
                icon: 'success',
                title: '로그인 성공!',
                text: '메인 페이지로 이동합니다.',
                confirmButtonColor: '#19A337',
                confirmButtonText: '확인',
            });

            // 여기서 response.data에 따라 다른 페이지로 리다이렉션하는 로직을 추가
            if (response.data.address && response.data.address !== 'No residence information found') {
                // 주소 정보가 있을 경우의 페이지
                window.location.href = '/';
            } else {
                // 주소 정보가 없을 경우의 페이지
                window.location.href = '/users/residenceInfo';
            }
        } else {
            // 서버에서 정의된 다른 상태 코드 처리
            await Swal.fire({
                icon: 'error',
                title: '로그인 실패',
                confirmButtonColor: '#19A337',
                confirmButtonText: '확인',
            });
        }
    } catch (err) {
        if (err.response && err.response.status === 409) {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: '로그인 실패',
                text: '가입되지 않은 이메일입니다.',
                confirmButtonColor: '#19A337',
                confirmButtonText: '확인',
            });
        } else {
            console.error(err);
            await Swal.fire({
                icon: 'error',
                title: '로그인 실패',
                text: '로그인에 실패하였습니다.',
                confirmButtonColor: '#19A337',
                confirmButtonText: '확인',
            });
        }
    }

    e.target.email.value = '';
    e.target.password.value = '';
});
