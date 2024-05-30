// 현재 월을 표시
function displayLastYear() {
    const last = document.getElementById('last');
    const twoYear = document.getElementById('twoYear');
    const threeYear = document.getElementById('threeYear');
    const fourYear = document.getElementById('fourYear');
    const lastDate = new Date();
    last.textContent = lastDate.getFullYear() - 1;
    twoYear.textContent = lastDate.getFullYear() - 2;
    threeYear.textContent = lastDate.getFullYear() - 3;
    fourYear.textContent = lastDate.getFullYear() - 4;
}

window.addEventListener('load', displayLastYear);
