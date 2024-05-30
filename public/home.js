// 현재 월을 표시
function displayCurrentMonth() {
    const heading = document.getElementById('heading');
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth() + 1; //getMonth()메서드는 zero-base라서 +1해줘야함
    heading.textContent = currentMonthIndex + '월 챌린지';
}

// 페이지 로드 시 현재 월 표시
window.addEventListener('load', displayCurrentMonth);
