const currentUser = document.body.getAttribute('data-user');
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const form = document.getElementById('chat-form');
    const input = document.getElementById('m');
    const messages = document.getElementById('messages');
    const messageEnd = document.getElementById('message-end'); // 스크롤 위치를 위한 요소

    const scrollToBottom = () => {
        messageEnd.scrollIntoView({ behavior: 'smooth' });
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const msg = { color: currentUser, message: input.value };

        if (input.value) {
            socket.emit('chat-msg', msg);
            axios.post('/community', {
                color: currentUser,
                chat: input.value,
            });
        }

        input.value = '';

        // 메시지가 추가된 후 스크롤을 맨 아래로 이동
        scrollToBottom();
    });

    socket.on('chat-msg', (msg) => {
        // 새 메시지를 위한 div 요소 생성
        const messageDiv = document.createElement('div');
        const messageContent = document.createElement('div');
        messageContent.textContent = msg.message;

        // msg.color가 현재 사용자의 색상과 동일한지 여부에 따라 클래스와 스타일 지정
        if (msg.color === currentUser) {
            messageDiv.className = 'mine';
        } else {
            messageDiv.className = 'other';
        }
        messageDiv.style.color = msg.color;
        messageDiv.appendChild(messageContent);

        // 메시지 목록에 새 메시지 추가
        messages.appendChild(messageDiv);

        // 메시지가 추가된 후 스크롤을 맨 아래로 이동
        scrollToBottom();
    });

    // 초기 로드 시 스크롤을 맨 아래로 이동
    scrollToBottom();
});
