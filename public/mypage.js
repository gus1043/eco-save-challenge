document.addEventListener('DOMContentLoaded', function () {
    var today = new Date();
    var month = today.getMonth() + 1; // 월은 0부터 시작하므로 1을 더합니다.
    var reportTitle = document.getElementById('report-title');
    reportTitle.textContent = month + '월 절약리포트';
});
