// webapp behavior
const joinRoomButton = document.getElementById("room-button")
const messageInput = document.getElementById("message-input")
const messageContainer = document.getElementById("message-container")
const roomInput = document.getElementById("room-input")
const form = document.getElementById("form")

const socket = io();
let currentRoom = "";


// listener calls displaymessage
form.addEventListener("submit", e => {
    e.preventDefault()
    const message = messageInput.value
    const roomId = roomInput.value
    
    if (message) {
        displayMessage(message, "sent-message")
        socket.emit('message', message, roomId);
        messageInput.value = ""
    }
})

joinRoomButton.addEventListener("click", e => {
    e.preventDefault()
    const roomId = roomInput.value
    console.log("Join room " + roomId)

    if (roomId) {
        socket.emit('join-room', roomId);
    }
})

function displayMessage(message, message_class) {
    const div = document.createElement("div");
    div.classList.add(message_class);
    div.textContent = message;
    messageContainer.append(div);
}

socket.on('message-recieve', (message) => {
    displayMessage(message, "recieved-message");
});

socket.on('join-room', (roomId) => {
    currentRoom = roomId;
    displayMessage("Joined Chat Room: " + roomId, "notification");
})
