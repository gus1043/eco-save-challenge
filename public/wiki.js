//위키버튼 누르면 수정 폼 보이도록
document.getElementById('edit').addEventListener('click', function () {
    const form = document.getElementById('wiki-form');
    const wikiContent = document.getElementById('wiki-content');
    if (form.style.display === 'block') {
        form.style.display = 'none';
        wikiContent.style.height = 'calc(100vh - 200px)'; //폼 닫히면 높이 원상복구
    } else {
        form.style.display = 'block';
        wikiContent.style.height = 'calc(100vh - 430px)'; //폼 열리면 위키 높이 줄이기
    }
});

// 위키 내용 로드
async function getWiki() {
    try {
        const res = await axios.get('/wikis');
        const wikis = res.data;
        console.log(wikis);

        // 위키 날짜 표시
        const wikiDateElement = document.getElementById('wikiDate');
        wikiDateElement.innerHTML = '';

        // 첫 번째 위키 내용을 textarea에 로드
        if (wikis.length > 0) {
            const firstWiki = wikis[0];
            const wikiTextarea = document.getElementById('wiki');
            wikiTextarea.value = firstWiki.content;
        }

        // 위키 내용 표시
        const wikiContentDiv = document.getElementById('wiki-content');
        wikiContentDiv.innerHTML = '';
        wikis.forEach(function (wiki) {
            const contentDiv = document.createElement('div');
            const dateDiv = document.createElement('p');
            contentDiv.innerHTML = marked.parse(wiki.content);

            // 'created-at'을 올바르게 참조하고, 날짜 객체를 생성합니다.
            const date = new Date(wiki.created_at); // 수정된 부분
            dateDiv.textContent = `작성 날짜: ${date.toLocaleDateString()}`;
            contentDiv.appendChild(dateDiv); // dateDiv를 contentDiv에 추가
            wikiContentDiv.appendChild(contentDiv);
        });
    } catch (err) {
        console.error(err);
    }
}

// 페이지 로드 시 위키 내용 로딩
window.onload = getWiki;

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
        window.location.reload();
    } catch (err) {
        console.error(err);
    }
    e.target.wiki.value = '';
});
