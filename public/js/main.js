const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const roomNameMobile = document.getElementById('room-name-mobile');
const userList = document.getElementById('users');
const userListMobile = document.getElementById('users-mobile');
const userCount = document.getElementById('user-count');
const userCountMobile = document.getElementById('user-count-mobile');
const sidebarToggle = document.getElementById('sidebar-toggle');
const mobileSidebar = document.getElementById('mobile-sidebar');
const closeSidebar = document.getElementById('close-sidebar');

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Smooth scroll to bottom
    chatMessages.scrollTo({
        top: chatMessages.scrollHeight,
        behavior: 'smooth'
    });
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Mobile sidebar toggle functionality
sidebarToggle.addEventListener('click', () => {
    mobileSidebar.classList.remove('-translate-x-full');
});

closeSidebar.addEventListener('click', () => {
    mobileSidebar.classList.add('-translate-x-full');
});

// Close sidebar when clicking outside
mobileSidebar.addEventListener('click', (e) => {
    if (e.target === mobileSidebar) {
        mobileSidebar.classList.add('-translate-x-full');
    }
});

function outputMessage(message) {
    const div = document.createElement('div');

    // Determine message type and apply Tailwind classes
    let messageClasses = 'message flex flex-col mb-4 animate-fade-in-up max-w-[85%]';
    let bubbleClasses = 'px-4 py-2 rounded-2xl leading-relaxed';
    let metaClasses = 'flex items-center gap-1 mb-1 text-xs font-medium text-slate-500';

    if (message.username === 'ChatCord Bot') {
        // System/bot message
        messageClasses += ' mr-auto';
        bubbleClasses += ' bg-slate-100 border border-slate-200 rounded-tl-sm text-slate-800';
    } else if (message.username === username) {
        // Current user message
        messageClasses += ' ml-auto';
        bubbleClasses += ' bg-emerald-600 text-white rounded-tr-sm';
        metaClasses = 'flex items-center gap-1 justify-end mb-1 text-xs font-medium text-emerald-100';
    } else {
        // Other user message
        messageClasses += ' mr-auto';
        bubbleClasses += ' bg-slate-50 rounded-tl-sm text-slate-800';
    }

    div.className = messageClasses;
    div.innerHTML = `
        <div class="${metaClasses}">
            <span class="username">${escapeHtml(message.username)}</span>
            <span class="time">${message.time}</span>
        </div>
        <div class="${bubbleClasses} hover:shadow-sm transition-shadow">
            ${escapeHtml(message.text)}
        </div>
    `;

    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
    roomName.innerText = room;
    roomNameMobile.innerText = room;
}

function outputUsers(users) {
    // Update desktop user list
    userList.innerHTML = `
        ${users.map(user => {
            const isCurrentUser = user.username === username;
            const userClass = isCurrentUser
                ? 'flex items-center gap-2 px-3 py-2 text-emerald-800 font-semibold bg-emerald-50 rounded-lg cursor-pointer transition-colors'
                : 'flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors';
            const indicator = isCurrentUser ? '★' : '•';

            return `<li class="${userClass}">
                <span class="text-emerald-500 text-lg">${indicator}</span>
                <span>${escapeHtml(user.username)}</span>
            </li>`;
        }).join('')}
    `;

    // Update mobile user list
    userListMobile.innerHTML = `
        ${users.map(user => {
            const isCurrentUser = user.username === username;
            const userClass = isCurrentUser
                ? 'flex items-center gap-2 px-3 py-2 text-emerald-800 font-semibold bg-emerald-50 rounded-lg cursor-pointer transition-colors'
                : 'flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors';
            const indicator = isCurrentUser ? '★' : '•';

            return `<li class="${userClass}">
                <span class="text-emerald-500 text-lg">${indicator}</span>
                <span>${escapeHtml(user.username)}</span>
            </li>`;
        }).join('')}
    `;

    // Update user count
    userCount.innerText = users.length;
    userCountMobile.innerText = users.length;
}

// Security: Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}