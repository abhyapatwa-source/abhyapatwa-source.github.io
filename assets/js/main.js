import { CONFIG } from './config.js';
import { checkAuth, logout, toggleTheme } from './utils.js';
import { streamBizliReply } from './api.js';
import {
  initTheme, toggleSidebar, toggleMenu,
  addStaticMessage, showTypingIndicator, updateBubbleText,
  renderHistory, saveChatToHistory, chatBox
} from './ui.js';

// STATE
let currentChat = [];

// AUTH CHECK
checkAuth();
initTheme();
renderHistory(loadChat);

// GLOBAL FUNCTIONS FOR HTML BUTTONS
window.toggleSidebar = toggleSidebar;
window.toggleMenu = toggleMenu;
window.toggleTheme = () => { toggleTheme(); toggleMenu(); };
window.logout = logout;
window.sendMsg = sendMessage;
window.newChat = startNewChat;

// SEND MESSAGE FLOW: User -> Typing Delay -> Stream -> Save
async function sendMessage() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  // 1. Add user bubble
  addStaticMessage(text, 'user');
  currentChat.push({ role: 'user', parts: [{ text }] });

  // 2. Show "Bizli is typing..." for 3-6s, then get empty AI bubble
  const aiBubble = await showTypingIndicator(text);

  // 3. Stream reply word-by-word into that bubble
  await streamBizliReply(
    currentChat,
    (partialText) => updateBubbleText(aiBubble, partialText), // onWord
    (fullText) => { // onDone
      currentChat.push({ role: 'model', parts: [{ text: fullText }] });
      saveChatToHistory(currentChat);
    },
    (error) => updateBubbleText(aiBubble, error) // onError
  );
}

// NEW CHAT
function startNewChat() {
  saveChatToHistory(currentChat);
  currentChat = [];
  chatBox.innerHTML = '';
  renderHistory(loadChat);
}

// LOAD OLD CHAT
function loadChat(id) {
  const history = JSON.parse(localStorage.getItem(CONFIG.HISTORY_KEY) || '[]');
  const chat = history.find(h => h.id === id);
  if (!chat) return;
  currentChat = chat.msgs;
  chatBox.innerHTML = '';
  currentChat.forEach(m => addStaticMessage(m.parts[0].text, m.role === 'user'? 'user' : 'ai'));
  if (window.innerWidth < 768) toggleSidebar();
}

// ENTER KEY TO SEND
document.getElementById('msgInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
