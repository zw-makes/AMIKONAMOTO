/**
 * AI Analyst (Gemini Powered) Feature
 * Handles the "Chat" style interface for premium subscription insights.
 */
import './ai-analyst.css';
import { askGroq } from './gemini-service.js';

export function openAIAnalyst() {
    let overlay = document.getElementById('ai-analyst-overlay');
    if (!overlay) {
        overlay = createAIAnalystOverlay();
    }
    overlay.classList.remove('hidden');

    // Focus input
    setTimeout(() => {
        const input = document.getElementById('ai-chat-input');
        if (input) input.focus();
    }, 400);
}

function createAIAnalystOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'ai-analyst-overlay';
    overlay.className = 'ai-analyst-overlay hidden';

    // Get User Name
    let userName = 'User';
    
    // 1. Try Window Global (Most reliable)
    if (window.userProfile && window.userProfile.name) {
        userName = window.userProfile.name;
    } 
    // 2. Try LocalStorage (Fallbacks)
    else {
        const rawUser = localStorage.getItem('user_profile') || 
                       localStorage.getItem('profile_' + (window.currentUser?.id || ''));
        try {
            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                userName = parsed.name || 'User';
            }
        } catch (e) { console.warn('Failed to parse user profile for AI greeting', e); }
    }

    const firstWord = userName.split(' ')[0];
    console.log('AI Analyst: Greeting user', firstWord);

    overlay.innerHTML = `
        <div class="ai-analyst-container">
            <header class="ai-header">
                <button class="header-action-btn" id="close-ai-btn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div class="header-right">
                    <button class="header-action-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                    </button>
                    <button class="header-action-btn" id="clear-chat-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </button>
                </div>
            </header>

            <main class="ai-content" id="ai-chat-content">
                <section class="ai-greeting" id="initial-ai-view">
                    <h1>Hello <span class="user-name">${firstWord}</span></h1>
                    <div class="ai-question">How can I help<br>you today?</div>
                    <p class="ai-subtitle">I'm your SubTrack AI assistant. I can analyze your spending, find better deals, or remind you of upcoming trials.</p>
                    
                    <section class="ai-suggestions">
                        <div class="suggestion-card" onclick="document.getElementById('ai-chat-input').value='Summarize my monthly spending'; document.getElementById('ai-chat-input').dispatchEvent(new KeyboardEvent('keypress', {'key':'Enter'}));">
                            <div class="suggestion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M17 5H7M17 19H7M22 12H2"/></svg>
                            </div>
                            <div class="suggestion-text">
                                <div class="suggestion-label">Review my<br>spending</div>
                            </div>
                        </div>
                        
                        <div class="suggestion-card" onclick="document.getElementById('ai-chat-input').value='Find upcoming renewals'; document.getElementById('ai-chat-input').dispatchEvent(new KeyboardEvent('keypress', {'key':'Enter'}));">
                            <div class="suggestion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
                            </div>
                            <div class="suggestion-text">
                                <div class="suggestion-label">Check upcoming<br>renewals</div>
                            </div>
                        </div>

                        <div class="suggestion-card" onclick="document.getElementById('ai-chat-input').value='Help me save money'; document.getElementById('ai-chat-input').dispatchEvent(new KeyboardEvent('keypress', {'key':'Enter'}));">
                            <div class="suggestion-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
                            </div>
                            <div class="suggestion-text">
                                <div class="suggestion-label">Optimize my<br>portfolio</div>
                            </div>
                        </div>
                    </section>
                </section>

                <div id="chat-messages" class="chat-messages hidden"></div>
            </main>

            <footer class="ai-footer">
                <div class="ai-input-pill">
                    <div class="gemini-orb" id="orb-status"></div>
                    <input type="text" id="ai-chat-input" placeholder="Ask or Type Something..." autocomplete="off">
                    <div class="ai-input-actions">
                        <button class="ai-action-btn mic-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                        </button>
                        <button class="ai-action-btn magic-btn" id="send-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m12 3 1.912 5.886L20.243 9l-5.115 4.316L17.033 21 12 16.718 6.967 21l1.905-7.684L3.757 9l6.331-.114L12 3z"/></svg>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('close-ai-btn');
    closeBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
    });

    const clearBtn = document.getElementById('clear-chat-btn');
    clearBtn.addEventListener('click', () => {
        ResetChat();
    });

    const input = document.getElementById('ai-chat-input');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleChatSubmission(input.value);
            input.value = '';
        }
    });

    const sendBtn = document.getElementById('send-btn');
    sendBtn.addEventListener('click', () => {
        handleChatSubmission(input.value);
        input.value = '';
    });

    return overlay;
}

function ResetChat() {
    const greeting = document.getElementById('initial-ai-view');
    const messages = document.getElementById('chat-messages');
    if (greeting) greeting.classList.remove('hidden');
    if (messages) {
        messages.classList.add('hidden');
        messages.innerHTML = '';
    }
}

async function handleChatSubmission(query) {
    if (!query.trim()) return;

    const initialView = document.getElementById('initial-ai-view');
    const chatMessages = document.getElementById('chat-messages');
    const orb = document.getElementById('orb-status');

    // 1. Enter Chat Mode
    if (initialView) initialView.classList.add('hidden');
    if (chatMessages) chatMessages.classList.remove('hidden');

    // 2. Render User Message
    addMessage('user', query);

    // 3. Thinking State
    if (window.HapticsService) window.HapticsService.light();
    if (orb) orb.style.animation = 'rotateOrb 1s linear infinite, thinkingPulse 1s ease-in-out infinite alternate';
    
    const thinkingMsgId = addMessage('assistant', "Thinking...");

    // 4. Call Gemini
    const subData = window.subscriptions || [];
    const response = await askGroq(query, subData);

    // 5. Render Response
    updateMessage(thinkingMsgId, response);
    if (orb) orb.style.animation = 'rotateOrb 10s linear infinite';
    if (window.HapticsService) window.HapticsService.medium();
}

function addMessage(sender, text) {
    const chatMessages = document.getElementById('chat-messages');
    const msgId = 'msg-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.id = msgId;
    messageDiv.innerHTML = `
        <div class="message-bubble">${text}</div>
    `;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    const main = document.getElementById('ai-chat-content');
    if (main) main.scrollTop = main.scrollHeight;
    
    return msgId;
}

function updateMessage(id, newText) {
    const msg = document.getElementById(id);
    if (msg) {
        msg.querySelector('.message-bubble').innerText = newText;
        const main = document.getElementById('ai-chat-content');
        if (main) main.scrollTop = main.scrollHeight;
    }
}
