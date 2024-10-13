const socket = io();

window.onload = main;

function main() {
    const messageContainer = document.getElementById('message-container');
    const messageInput = document.getElementById('message-input');
    const roomInput = document.getElementById('room-input');
    const joinRoomButton = document.getElementById('room-button');
    const form = document.getElementById('form');

    let roomId = '';

    function displayMessage(message, message_class) {
        const div = document.createElement('div');
        div.classList.add(message_class);
        div.textContent = message;
        messageContainer.append(div);
    }

    function joinRoom(newRoomId) {
        roomId = newRoomId;

        messageContainer.innerHTML = '';
        displayMessage('Connected with id: ' + socket.id, 'notification');
        displayMessage('Joined Chat Room: ' + roomId, 'notification');
        roomInput.value = roomId;
    }

    socket.on('connect', () => {
        displayMessage('Connected with id: ' + socket.id, 'notification');
    });

    socket.on('message:recieve', (message) => {
        displayMessage(message, 'recieved-message');
    });

    socket.on('room:new_member', (userId) => {
        displayMessage(userId + ' has joined the chatroom', 'notification');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = messageInput.value;

        if (!socket.connected) {
            displayMessage(
                'Not connected to server yet. Please wait...',
                'notification',
            );
            return;
        }

        if (!roomId) {
            displayMessage(
                'You are not connected to a chatroom. Please join a chatroom.',
                'error',
            );
            return;
        }

        if (message) {
            displayMessage(message, 'sent-message');
            socket.emit('message:sent', message, roomId);
            messageInput.value = '';
        }
    });

    joinRoomButton.addEventListener('click', (e) => {
        e.preventDefault();
        const newRoomId = roomInput.value;
        if (newRoomId) {
            socket.emit('room:join', newRoomId, (response) => {
                if (response.status === 'ok') {
                    joinRoom(newRoomId);
                } else {
                    displayMessage(
                        'Failed to connect to room ' + newRoomId,
                        'notification',
                    );
                }
            });
        }
    });
}
