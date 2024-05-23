//위키버튼 누르면 수정 폼 보이도록
document.getElementById('edit').addEventListener('click', function () {
    const form = document.getElementById('wiki-form');
    if (form.style.display === 'block') {
        form.style.display = 'none';
    } else {
        form.style.display = 'block';
    }
});

// 위키 로딩
async function getWiki() {
    try {
        const res = await axios.get('/wikis');
        const wikis = res.data;
        console.log(wikis);
        const tbody = document.querySelector('#wiki-list tbody');
        tbody.innerHTML = '';
        wikis.map(function (wiki) {
            const row = document.createElement('tr');
            // 로우 셀 추가
            let td = document.createElement('td');
            td.textContent = new Date(wiki.created_at).toLocaleDateString();
            row.appendChild(td);
            td = document.createElement('td');
            td.innerHTML = marked.parse(wiki.content);
            row.appendChild(td);
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error(err);
    }
}

// 위키 등록 시
document.getElementById('wiki-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = e.target.wiki.value;
    const created_at = new Date().toISOString();

    if (!content) {
        return alert('내용을 입력하세요');
    }
    try {
        await axios.post('/wikis', { created_at, content });
        getWiki();
    } catch (err) {
        console.error(err);
    }
    e.target.wiki.value = '';
});
