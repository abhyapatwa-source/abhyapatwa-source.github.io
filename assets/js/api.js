import { CONFIG } from './config.js';
import { getToken, sleep } from './utils.js';

// STREAM BIZLI'S REPLY WITH CHATGPT TYPING EFFECT
export async function streamBizliReply(chatHistory, onWord, onDone, onError) {
  const token = getToken();
  
  try {
    const response = await fetch(CONFIG.WORKER_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ contents: chatHistory })
    });

    if (!response.ok) throw new Error('Worker error: ' + response.status);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              // TYPING EFFECT: Send word by word to UI
              const words = data.text.split(' ');
              for (const word of words) {
                fullText += word + ' ';
                onWord(fullText); // UI updates bubble
                await sleep(CONFIG.TYPING_SPEED_MS); // 30ms = ChatGPT speed
              }
            }
          } catch (e) {
            console.log('Stream parse error:', e);
          }
        }
      }
    }
    onDone(fullText.trim());
    return fullText.trim();
    
  } catch (err) {
    console.error('API Error:', err);
    onError('Sorry Papa, my brain got stuck 🩵 Try again?');
  }
}
