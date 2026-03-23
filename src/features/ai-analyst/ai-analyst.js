/**
 * AI Analyst (Groq Powered) Feature - Redesigned UI
 * Handles the "Grok" style interface.
 */
import './ai-analyst.css';
import { askGroq, generateChatTitle } from './gemini-service.js';

// Global state for chat
let isFirstMessage = true;

export function openAIAnalyst() {
    let overlay = document.getElementById('ai-analyst-overlay');
    if (!overlay) {
        overlay = createAIAnalystOverlay();
    }
    document.body.classList.add('ai-analyst-open');
    overlay.classList.remove('hidden');

    // Prevent the browser from yanking the entire overlay up (Natural feel)
    overlay.addEventListener('touchmove', (e) => {
        if (!e.target.closest('.ai-content') && !e.target.closest('.ai-chat-input')) {
            e.preventDefault();
        }
    }, { passive: false });

    // Focus input
    setTimeout(() => {
        const input = document.getElementById('ai-chat-input');
        if (input) input.focus();
    }, 400);
}

function closeAIAnalyst() {
    const overlay = document.getElementById('ai-analyst-overlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.classList.remove('ai-analyst-open');
}

function createAIAnalystOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'ai-analyst-overlay';
    overlay.className = 'ai-analyst-overlay hidden';

    const logoUrl = "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/LOGOS/ChatGPT%20Image%20Mar%2017,%202026,%2010_36_13%20PM.png";

    overlay.innerHTML = `
        <div class="ai-analyst-container">
            <header class="ai-header">
                <button class="back-btn" id="close-ai-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    <span>Back</span>
                </button>
                <div class="ai-chat-title" id="chat-title">New Chat</div>
                <button class="header-btn" id="clear-chat-btn">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 4 5s2.5 3 2.5 5v2"/><path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-4 5s-2.5 3-2.5 5v2"/><path d="M9 14c-2 1-4 3-4 6 0 2 2 2 2 2"/><path d="M15 14c2 1 4 3 4 6 0 2-2 2-2 2"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/></svg>
                </button>
            </header>

            <main class="ai-content" id="ai-chat-content">
                <div class="initial-view" id="initial-ai-view">
                    <img src="${logoUrl}" class="ai-center-logo" id="main-ai-logo" alt="AI Logo" />
                </div>
                <div id="chat-messages" class="chat-messages hidden"></div>
            </main>

            <footer class="ai-footer">
                <div class="ai-suggestions-row" id="suggestions-row">
                    <button class="suggestion-pill blue" onclick="document.getElementById('ai-chat-input').value='Analyze my spending'; document.getElementById('ai-chat-input').dispatchEvent(new KeyboardEvent('keypress', {'key':'Enter'}));">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                        Try AI Analyst
                    </button>
                    <button class="suggestion-pill" onclick="document.getElementById('ai-chat-input').value='Show my active subscriptions'; document.getElementById('ai-chat-input').dispatchEvent(new KeyboardEvent('keypress', {'key':'Enter'}));">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                        List Subs
                    </button>
                </div>

                <div class="ai-input-box">
                    <div class="ai-input-wrapper">
                        <input type="text" class="ai-chat-input" id="ai-chat-input" placeholder="Ask Anything" autocomplete="off">
                    </div>
                    <div class="input-toolbar">
                        <div class="toolbar-left">
                            <button class="tool-icon-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                            </button>
                            <button class="tool-pill-btn">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                Fast
                            </button>
                        </div>
                        <div class="toolbar-right">
                            <button class="tool-icon-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                            </button>
                            <button class="cute-send-btn" id="send-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('close-ai-btn');
    closeBtn.addEventListener('click', () => {
        closeAIAnalyst();
    });

    const clearBtn = document.getElementById('clear-chat-btn');
    clearBtn.addEventListener('click', () => {
        ResetChat();
    });

    const input = document.getElementById('ai-chat-input');
    const sendBtn = document.getElementById('send-btn');

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleChatSubmission(input.value);
            input.value = '';
        }
    });

    sendBtn.addEventListener('click', () => {
        if (input.value.trim().length > 0) {
            handleChatSubmission(input.value);
            input.value = '';
        }
    });

    return overlay;
}

function ResetChat() {
    isFirstMessage = true;
    const initialView = document.getElementById('initial-ai-view');
    const messages = document.getElementById('chat-messages');
    const suggestions = document.getElementById('suggestions-row');
    const logo = document.getElementById('main-ai-logo');
    const titleEl = document.getElementById('chat-title');

    if (titleEl) {
        titleEl.innerText = 'New Chat';
        titleEl.classList.remove('loading');
    }

    if (initialView) {
        initialView.classList.remove('hidden');
        initialView.style.opacity = '1';
        initialView.style.position = 'absolute';
    }
    if (logo) logo.classList.remove('thinking');
    if (suggestions) suggestions.classList.remove('hidden');
    if (messages) {
        messages.classList.add('hidden');
        messages.innerHTML = '';
    }
}

async function handleChatSubmission(query) {
    if (!query.trim()) return;

    if (isFirstMessage) {
        isFirstMessage = false;
        const titleEl = document.getElementById('chat-title');
        if (titleEl) {
            titleEl.classList.add('loading');
            titleEl.innerText = 'Naming...';
            generateChatTitle(query).then(title => {
                titleEl.classList.remove('loading');
                titleEl.innerText = title;
            });
        }
    }

    const initialView = document.getElementById('initial-ai-view');
    const chatMessages = document.getElementById('chat-messages');
    const logo = document.getElementById('main-ai-logo');
    const suggestions = document.getElementById('suggestions-row');

    // Hide suggestions
    if (suggestions) suggestions.classList.add('hidden');

    // Make initial view act as a background watermark instead of leaving DOM
    if (initialView) {
        initialView.style.position = 'fixed';
        initialView.style.opacity = '0.05'; 
        // We move it to fixed so it stays behind scrolling text
    }

    if (chatMessages) chatMessages.classList.remove('hidden');

    // Render User Message
    addMessage('user', query);

    // Thinking State
    if (window.HapticsService) window.HapticsService.light();
    if (logo) logo.classList.add('thinking');
    
    const thinkingMsgId = addMessage('assistant', "Thinking...");

    // Call Groq Engine
    const subData = window.subscriptions || [];
    const response = await askGroq(query, subData);

    // Render Response
    updateMessage(thinkingMsgId, response);
    if (logo) logo.classList.remove('thinking');
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
