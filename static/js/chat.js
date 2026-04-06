// static/js/chat.js

// 1. Auth Guard: Redirect if not logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        document.getElementById('user-display').innerText = user.email;
    } else {
        window.location.href = "/login";
    }
});

// 2. Handle Logout
document.getElementById('logout-btn').onclick = () => {
    firebase.auth().signOut().then(() => {
        window.location.href = "/";
    });
};

// 3. Handle PDF Upload
document.getElementById('file-upload').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const chatWindow = document.getElementById('chat-window');
    const docList = document.getElementById('document-list');
    const docNameDisplay = document.getElementById('active-doc-name');

    docNameDisplay.innerText = "Processing " + file.name + "...";
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.message) {
            docNameDisplay.innerText = file.name;
            docList.innerHTML = `<div class="bg-slate-800 p-2 rounded text-sm text-blue-400 border border-blue-900/30">
                <i class="far fa-file-pdf mr-2"></i> ${file.name}
            </div>`;
            addMessage("System", `Successfully indexed ${file.name}. You can now ask questions!`, 'ai');
        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        console.error(err);
        alert("Upload failed.");
    }
};

// --- NEW SEND LOGIC STARTS HERE ---

// 4. Function to send message to Flask /ask
async function handleSendMessage() {
    const input = document.getElementById('user-input');
    const query = input.value.trim();

    if (!query) return; // Don't send empty text

    // Add user bubble to UI
    addMessage("You", query, 'user');
    input.value = ""; // Clear input

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });

        const data = await response.json();

        if (data.answer) {
            addMessage("AI", data.answer, 'ai');
        } else {
            addMessage("AI", "Error: " + data.error, 'ai');
        }
    } catch (err) {
        console.error("Fetch error:", err);
        addMessage("AI", "Could not connect to server.", 'ai');
    }
}

// 5. Listen for Button Click
document.getElementById('send-btn').onclick = handleSendMessage;

// 6. Listen for "Enter" Key
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// --- NEW SEND LOGIC ENDS HERE ---

// Helper function to add bubbles
function addMessage(sender, text, type) {
    const chatWindow = document.getElementById('chat-window');
    // const bubbleClass = type === 'ai' ? 'chat-bubble-ai bg-slate-900 border-slate-800' : 'chat-bubble-user bg-blue-600 text-white ml-auto';
    const bubbleClass = type === 'ai' ? 'chat-bubble-ai bg-slate-900 border-slate-800 whitespace-pre-wrap' : 'chat-bubble-user bg-blue-600 text-white ml-auto';
    const alignClass = type === 'ai' ? '' : 'justify-end';
    const avatar = type === 'ai' ? `<div class="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-[10px]">AI</div>` : '';

    const html = `
        <div class="flex gap-4 max-w-3xl ${alignClass}">
            ${avatar}
            <div class="${bubbleClass} p-4 text-sm leading-relaxed shadow-sm">
                ${text}
            </div>
        </div>
    `;
    chatWindow.insertAdjacentHTML('beforeend', html);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}