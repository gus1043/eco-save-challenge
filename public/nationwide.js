const currentDate = new Date();
const currentYear = currentDate.getFullYear() - 1;
const currentMonth = currentDate.getMonth() + 1;

document.addEventListener('DOMContentLoaded', () => {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const countrySelect = document.getElementById('country');
    const orderSelect = document.getElementById('order');

    // 연도 옵션 설정
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearSelect.add(option);
    }

    // 월 옵션 설정
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month < 10 ? `0${month}` : `${month}`; // 1자리 수인 경우 앞에 0을 붙임
        option.text = `${month}월`;
        monthSelect.add(option);
    }

    // 각 select 요소 변경 시 fetchData 함수 호출
    yearSelect.addEventListener('change', fetchData);
    monthSelect.addEventListener('change', fetchData);
    countrySelect.addEventListener('change', fetchData);
    orderSelect.addEventListener('change', fetchData);

    fetchData(); // 초기 데이터 가져오기
});

async function fetchData() {
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const country = document.getElementById('country').value;
    const order = document.getElementById('order').value;

    try {
        const currentResponse = await axios.post('/nationwide', { year, month, country });
        const lastYearResponse = await axios.post('/nationwide', { year: year - 1, month, country });

        const currentData = currentResponse.data.data;
        const lastYearData = lastYearResponse.data.data;

        renderCharts(currentData, lastYearData, order, year);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function renderCharts(currentData, lastYearData, order, year) {
    Object.keys(currentData).forEach((category) => {
        currentData[category].sort((a, b) => {
            if (order === 'asc') {
                return a.bill - b.bill;
            } else if (order === 'desc') {
                return b.bill - a.bill;
            } else {
                // Default: no sorting
                return 0;
            }
        });
    });

    renderChart('chart-housing', '주택용 전력', currentData['주택용'], lastYearData['주택용'], year);
    renderChart('chart-commercial', '일반(상업)용 전력', currentData['일반용'], lastYearData['일반용'], year);
    renderChart('chart-education', '교육용 전력', currentData['교육용'], lastYearData['교육용'], year);
    renderChart('chart-industrial', '산업용 전력', currentData['산업용'], lastYearData['산업용'], year);
    renderChart('chart-agricultural', '농사용 전력', currentData['농사용'], lastYearData['농사용'], year);
    renderChart('chart-street', '가로등', currentData['가로등'], lastYearData['가로등'], year);
}

function renderChart(canvasId, label, currentData, lastYearData, year) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Check if a Chart instance already exists on the canvas and destroy it
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    // Create a new Chart instance
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: currentData.map((item) => `${item.city}`),
            datasets: [
                {
                    label: ` ${year}`,
                    data: currentData.map((item) => item.bill),
                    backgroundColor: 'rgba(21, 122, 44, 1)',
                    // borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
                {
                    label: ` ${year - 1}`,
                    data: lastYearData.map((item) => item.bill),
                    backgroundColor: 'rgba(32, 201, 104, 1)',
                    // borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}
