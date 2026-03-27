/**
 * AI Analyst (Groq Powered) Feature - Redesigned UI
 * Handles the "Grok" style interface.
 */
import './ai-analyst.css';
import { askGroq, generateChatTitle } from './gemini-service.js';

// Global state for chat
let isFirstMessage = true;
let messageCounter = 0;
let selectedSub = null; // Currently 'active' sub for editing
let chatHistory = []; // For Undo functionality
let chatSessionId = null; // Current DB session ID
let conversationMemory = []; // Last 8 messages for AI context
window.chatHistory = chatHistory; // Expose for internal tools

let viewportResizeHandler = null;

export function openAIAnalyst() {
    let overlay = document.getElementById('ai-analyst-overlay');
    if (!overlay) {
        overlay = createAIAnalystOverlay();
    }
    overlay.classList.remove('hidden');

    // Force container to match visual viewport exactly (iOS keyboard fix)
    if (window.visualViewport) {
        const container = overlay.querySelector('.ai-analyst-container');
        viewportResizeHandler = () => {
            if (container) {
                container.style.height = `${window.visualViewport.height}px`;
                // Also bump up the container by the offsetTop so we scroll along with the page jump
                container.style.transform = `translateY(${window.visualViewport.offsetTop}px)`;
            }
        };
        window.visualViewport.addEventListener('resize', viewportResizeHandler);
        window.visualViewport.addEventListener('scroll', viewportResizeHandler);
        viewportResizeHandler(); // Initial set
    }

    // Focus input
    setTimeout(() => {
        const input = document.getElementById('ai-chat-input');
        if (input) input.focus();
    }, 400);
}

function closeAIAnalyst() {
    const overlay = document.getElementById('ai-analyst-overlay');
    if (overlay) overlay.classList.add('hidden');
    
    if (window.visualViewport && viewportResizeHandler) {
        window.visualViewport.removeEventListener('resize', viewportResizeHandler);
        window.visualViewport.removeEventListener('scroll', viewportResizeHandler);
        viewportResizeHandler = null;
    }
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
                <div class="header-actions" style="display: flex; gap: 8px;">
                    <button class="header-btn" id="download-chat-btn" title="Download Chat">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                    <button class="header-btn" id="clear-chat-btn" title="New Chat">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                </div>
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
        showNewChatConfirm();
    });

    const downloadBtn = document.getElementById('download-chat-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadChatHistory();
        });
    }

    // Load last session from DB
    loadLastChat();

    const input = document.getElementById('ai-chat-input');
    const inputField = document.getElementById('ai-chat-input');
    
    // Add selected pill zone INSIDE the wrapper for a pro inline look
    const wrapper = overlay.querySelector('.ai-input-wrapper');
    if (wrapper && !document.getElementById('ai-selected-pill-zone')) {
        const pillZone = document.createElement('div');
        pillZone.id = 'ai-selected-pill-zone';
        pillZone.className = 'ai-selected-pill-zone hidden';
        wrapper.insertBefore(pillZone, wrapper.firstChild);
    }

    inputField.addEventListener('keypress', (e) => {
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

function showNewChatConfirm() {
    // Don't show if no chat started yet
    if (isFirstMessage) return;

    const existing = document.getElementById('new-chat-confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'new-chat-confirm-overlay';
    overlay.innerHTML = `
        <div class="new-chat-confirm-box">
            <div class="new-chat-confirm-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <h3>Start New Chat?</h3>
            <p>This conversation will be permanently deleted and a fresh one will begin.</p>
            <div class="new-chat-confirm-actions">
                <button class="confirm-cancel-btn" onclick="document.getElementById('new-chat-confirm-overlay').remove()">Cancel</button>
                <button class="confirm-ok-btn" onclick="window.confirmNewChat()">Start Fresh</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
}

window.confirmNewChat = async function() {
    const overlay = document.getElementById('new-chat-confirm-overlay');
    if (overlay) overlay.remove();
    await deleteCurrentSession();
    ResetChat();
};

async function deleteCurrentSession() {
    if (!chatSessionId) return;
    const supabase = window.supabase;
    if (!supabase) return;
    await supabase.from('ai_chat_messages').delete().eq('session_id', chatSessionId);
    await supabase.from('ai_chat_sessions').delete().eq('id', chatSessionId);
    chatSessionId = null;
    conversationMemory = [];
}

async function downloadChatHistory() {
    const supabase = window.supabase;
    let chatText = "SubTrack AI Chat Export\n=======================\n\n";

    if (!chatSessionId || !supabase) {
        // Fallback: Read from DOM if not saved yet
        const msgs = document.querySelectorAll('.chat-message .message-bubble');
        if (msgs.length === 0) {
            alert("No chat history to download.");
            return;
        }
        msgs.forEach(el => {
            const isUser = el.parentElement.classList.contains('user-message');
            // innerText natively cleans up HTML
            chatText += (isUser ? "You:\n" : "SubTrack AI:\n") + el.innerText.trim() + "\n\n";
        });
    } else {
        const { data: msgs } = await supabase
            .from('ai_chat_messages')
            .select('role, content')
            .eq('session_id', chatSessionId)
            .order('created_at', { ascending: true });
            
        if (!msgs || msgs.length === 0) {
            alert("No chat history to download.");
            return;
        }
        msgs.forEach(m => {
            chatText += (m.role === 'user' ? "You:\n" : "SubTrack AI:\n") + m.content + "\n\n";
        });
    }

    const titleEl = document.getElementById('chat-title');
    const title = titleEl ? titleEl.innerText.replace(/[^a-z0-9]/gi, '_') : 'Chat';

    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SubTrack_${title}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

async function getOrCreateSession(title = 'New Chat') {
    const supabase = window.supabase;
    if (!supabase) return null;
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return null;

    if (chatSessionId) return chatSessionId;

    const { data, error } = await supabase
        .from('ai_chat_sessions')
        .insert({ user_id: userId, title })
        .select('id')
        .single();

    if (error || !data) return null;
    chatSessionId = data.id;
    return chatSessionId;
}

async function saveMsgToDb(role, content, meta = {}) {
    const supabase = window.supabase;
    if (!supabase || !chatSessionId) return;
    await supabase.from('ai_chat_messages').insert({
        session_id: chatSessionId,
        role,
        content,
        meta
    });
}

async function loadLastChat() {
    const supabase = window.supabase;
    if (!supabase) return;
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return;

    // Get the most recent session
    const { data: sessions } = await supabase
        .from('ai_chat_sessions')
        .select('id, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

    if (!sessions || sessions.length === 0) return;
    const session = sessions[0];
    chatSessionId = session.id;

    // Get messages for this session
    const { data: msgs } = await supabase
        .from('ai_chat_messages')
        .select('role, content, meta')
        .eq('session_id', chatSessionId)
        .order('created_at', { ascending: true });

    if (!msgs || msgs.length === 0) return;

    // Restore title
    const titleEl = document.getElementById('chat-title');
    if (titleEl) titleEl.innerText = session.title;

    // Restore messages to UI
    const chatMessages = document.getElementById('chat-messages');
    const initialView = document.getElementById('initial-ai-view');
    const suggestions = document.getElementById('suggestions-row');

    if (initialView) { initialView.style.opacity = '0.05'; initialView.style.position = 'fixed'; }
    if (suggestions) suggestions.classList.add('hidden');
    if (chatMessages) chatMessages.classList.remove('hidden');
    isFirstMessage = false;

    const allSubs = window.subscriptions || [];

    msgs.forEach(m => {
        const attachedSub = (m.role === 'user' && m.meta?.attachedSubId) 
            ? allSubs.find(s => s.id === m.meta.attachedSubId) 
            : null;

        let displayContent = m.content;
        if (m.role === 'assistant') {
            // Strip ALL backend tags before rendering (same logic as typeMessage)
            displayContent = displayContent.replace(/[<\[]action[>\]][\s\S]*?[<\[]\/(action)[>\]]/gi, '');
            displayContent = displayContent.replace(/[<\[](sub-preview)[>\]]\[?(.*?)\]?[<\[]\/(sub-preview)[>\]]/gi, '');
            displayContent = displayContent.replace(/\[(sub-preview|action)\][^\[]*/gi, '');
        }

        const msgId = addMessage(m.role === 'user' ? 'user' : 'assistant', m.role === 'assistant' ? renderMarkdown(displayContent) : displayContent, attachedSub);
        
        // Restore Smart Previews if they existed
        if (m.role === 'assistant' && m.meta?.previewIds && m.meta.previewIds.length > 0) {
            const container = document.getElementById(msgId);
            if (container) renderSubscriptionPreview(container, m.meta.previewIds);
        }
    });

    // Rebuild conversationMemory from last 8
    conversationMemory = msgs.slice(-8).map(m => ({
        role: m.role,
        content: m.content
    }));

    const main = document.getElementById('ai-chat-content');
    if (main) setTimeout(() => main.scrollTop = main.scrollHeight, 100);
}

function ResetChat() {
    isFirstMessage = true;
    conversationMemory = [];
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
        // Create DB session first
        await getOrCreateSession('New Chat');
        const titleEl = document.getElementById('chat-title');
        if (titleEl) {
            titleEl.classList.add('loading');
            titleEl.innerText = 'Naming...';
            generateChatTitle(query).then(async title => {
                titleEl.classList.remove('loading');
                titleEl.innerText = title;
                // Update session title in DB
                if (chatSessionId && window.supabase) {
                    await window.supabase.from('ai_chat_sessions').update({ title }).eq('id', chatSessionId);
                }
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
    const currentSelection = selectedSub; // Capture for the message bubble
    const userMsgId = addMessage('user', query, currentSelection);

    // Capture memory BEFORE pushing current query to prevent duplicated sequence breaking
    const snapshotMemory = [...conversationMemory];

    // Save user message to DB + memory (include attached sub ID if any)
    saveMsgToDb('user', query, { attachedSubId: currentSelection?.id });
    
    conversationMemory.push({ role: 'user', content: query });
    if (conversationMemory.length > 16) conversationMemory.splice(0, 2);
    
    if (window.HapticsService) window.HapticsService.light();
    if (logo) logo.classList.add('thinking');
    
    const thinkingMsgId = addMessage('assistant', "Thinking...");
    const thinkingEl = document.getElementById(thinkingMsgId);
    if (thinkingEl) thinkingEl.querySelector('.message-bubble').classList.add('thinking-pulse');

    // Call Groq Engine with conversation memory snapshot
    const subData = window.subscriptions || [];
    const response = await askGroq(query, subData, selectedSub, snapshotMemory);

    // OPTIMISTIC UPDATE: Check for actions BEFORE typing
    handleAiActions(response);

    // Render Response with Typography Animation
    if (logo) logo.classList.remove('thinking');
    await typeMessage(thinkingMsgId, response);

    // After typing, the preview IDs are known (typeMessage matches them)
    // Extract them for the DB save
    let previewIds = [];
    const previewMatches = [...response.matchAll(/<sub-preview>\[?(.*?)\]?<\/sub-preview>/g)];
    previewMatches.forEach(m => {
        previewIds.push(...m[1].split(',').map(n => parseInt(n.trim())));
    });

    // Clean response for DB (strip action tags)
    const cleanResponse = response.replace(/<action>.*?<\/action>/gs, '').replace(/<sub-preview>.*?<\/sub-preview>/gs, '').trim();
    saveMsgToDb('assistant', cleanResponse, { previewIds });
    
    conversationMemory.push({ role: 'assistant', content: cleanResponse });
    if (conversationMemory.length > 16) conversationMemory.splice(0, 2);

    if (window.HapticsService) window.HapticsService.medium();
}

async function handleAiActions(text) {
    // Hyper-robust regex: catches <action>, [action], and typo variants
    const actionMatch = text.match(/[<\[]action[>\]]([\s\S]*?)[<\[]\/(action)[>\]]/i);
    if (!actionMatch) return;

    try {
        // Clear any markdown code blocks the AI might have added
        let jsonStr = actionMatch[1].replace(/```json/g, '').replace(/```/g, '').trim();
        const action = JSON.parse(jsonStr);
        const type = action.type?.toUpperCase();

        console.log(`[Lion Agent] Executing action: ${type}`, action.payload);

        switch (type) {
            case 'UPDATE_SUB':
                await executeSubUpdate(action.payload);
                break;
            case 'TOGGLE_PAID':
                if (window.togglePaidStatus) await window.togglePaidStatus(action.payload.id);
                break;
            case 'DELETE_SUB':
                await executeSubDelete(action.payload);
                break;
            case 'SHOW_HISTORY':
                const historyBtn = document.getElementById('hist-nav-btn') || document.getElementById('history-btn');
                if (window.toggleHistoryMode && historyBtn) {
                    window.toggleHistoryMode(historyBtn);
                }
                break;
            case 'SHOW_EXPORT':
            case 'SHOWEXPORT':
                const downloadBtn = document.getElementById('hist-download-monthly');
                if (downloadBtn) {
                    const historyModal = document.getElementById('history-modal');
                    if (historyModal && historyModal.classList.contains('hidden')) {
                        // Open history first, then show export
                        const hBtn = document.getElementById('hist-nav-btn') || document.getElementById('history-btn');
                        if (window.toggleHistoryMode && hBtn) window.toggleHistoryMode(hBtn);
                    }
                    // Trigger the download logic
                    setTimeout(() => downloadBtn.click(), 300);
                }
                break;
            case 'UNDO':
                await window.undoLastAiAction();
                break;
            default:
                console.warn(`[Lion Agent] Unknown action type: ${type}`);
        }

        // --- NEW: Sync all chat previews with new state ---
        if (window.refreshAllPreviews) window.refreshAllPreviews();

    } catch (e) {
        console.error('Failed to parse AI action:', e);
    }
}

async function executeSubDelete(payload) {
    const sub = (window.subscriptions || []).find(s => s.id === payload.id);
    if (!sub) return;

    // Save for UNDO
    chatHistory.push({ type: 'DELETE', sub: JSON.parse(JSON.stringify(sub)) });

    if (window.deleteSubscription) {
        await window.deleteSubscription(payload.id);
    }
    
    showUndoToast(sub.name, "Deleted");
    if (selectedSub?.id === payload.id) deselectSub();
}

async function executeSubUpdate(payload) {
    const allSubs = window.subscriptions || [];
    const sub = allSubs.find(s => s.id == payload.id); // Loose check for string/number IDs
    if (!sub) return;

    // Save history for UNDO
    chatHistory.push({ type: 'UPDATE', sub: JSON.parse(JSON.stringify(sub)) });

    // Apply changes
    Object.assign(sub, payload.changes);
    
    // Save to DB
    if (window.saveToSupabase) {
        await window.saveToSupabase(sub);
    }
    
    // Visual Refresh
    if (window.updateStats) window.updateStats();
    if (window.renderCalendar) window.renderCalendar();
    
    showUndoToast(sub.name);
    
    // Clear selection if it was the edited one
    if (selectedSub && selectedSub.id === sub.id) {
        deselectSub();
    }
}

function showUndoToast(name, verb = 'Updated') {
    const toast = document.createElement('div');
    toast.className = 'ai-undo-toast';
    toast.innerHTML = `
        <span>${verb} ${name} successfully!</span>
        <button onclick="window.undoLastAiAction(this)">UNDO</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 6000);
}

window.undoLastAiAction = async function(btn) {
    const lastAction = chatHistory.pop();
    if (!lastAction) return;

    if (lastAction.type === 'UPDATE') {
        const sub = (window.subscriptions || []).find(s => s.id === lastAction.sub.id);
        if (sub) {
            Object.assign(sub, lastAction.sub);
            if (window.saveToSupabase) await window.saveToSupabase(sub);
            if (window.updateStats) window.updateStats();
            if (window.renderCalendar) window.renderCalendar();
            if (window.HapticsService) window.HapticsService.heavy();
        }
    }

    if (btn) btn.parentElement.remove();
};

window.selectSubForChat = function(id) {
    const sub = (window.subscriptions || []).find(s => s.id === id);
    if (!sub) return;
    
    selectedSub = sub;
    if (window.HapticsService) window.HapticsService.light();
    renderSelectedSubPill();
};

function renderSelectedSubPill() {
    const zone = document.getElementById('ai-selected-pill-zone');
    if (!zone) return;

    if (!selectedSub) {
        zone.classList.add('hidden');
        return;
    }

    zone.className = 'ai-selected-pill-zone show';
    zone.innerHTML = `
        <div class="ai-selected-pill" onclick="window.deselectSub(event)" style="cursor: pointer;">
            <img src="https://icon.horse/icon/${selectedSub.domain}" class="pill-logo">
        </div>
    `;
}

window.deselectSub = function(e) {
    if (e) e.stopPropagation();
    selectedSub = null;
    renderSelectedSubPill();
};

// === Lightweight Markdown Renderer ===
function renderMarkdown(text) {
    // Escape HTML entities first to prevent XSS
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Headings
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Horizontal Rule
    html = html.replace(/^[-*_]{3,}$/gm, '<hr>');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    // Tables (basic: | col | col |)
    html = html.replace(/((?:^\|.+\|\n?)+)/gm, (match) => {
        const rows = match.trim().split('\n').filter(r => !/^\|[-:\s|]+\|$/.test(r));
        if (rows.length === 0) return match;
        const header = rows[0];
        const body = rows.slice(1);
        const thCells = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
        const tbRows = body.map(r => {
            const cells = r.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        return `<table><thead><tr>${thCells}</tr></thead><tbody>${tbRows}</tbody></table>`;
    });

    // Numbered lists
    html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
        const items = match.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
        return `<ol>${items}</ol>`;
    });

    // Bullet lists
    html = html.replace(/((?:^[*\-+] .+\n?)+)/gm, (match) => {
        const items = match.trim().split('\n').map(l => `<li>${l.replace(/^[*\-+] /, '')}</li>`).join('');
        return `<ul>${items}</ul>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold + Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

    // Paragraphs (double newline = paragraph break)
    html = html.replace(/\n\n/g, '</p><p>');
    // Single newlines
    html = html.replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
}

async function typeMessage(id, fullText) {
    const msg = document.getElementById(id);
    if (!msg) return;
    const bubble = msg.querySelector('.message-bubble');
    bubble.classList.remove('thinking-pulse');
    bubble.innerHTML = '';

    let previewIds = [];
    let cleanText = fullText;

    // === STEALTH TAG STRIPPER (Bracket-Proof, All Variants) ===
    // Strip ALL variants of sub-preview: <sub-preview>, [sub-preview], etc.
    const subPreviewRegex = /[<\[](sub-preview)[>\]](\[?)(.*?)(\]?)[<\[]\/(sub-preview)[>\]]/gis;
    const allPreviewMatches = [...fullText.matchAll(subPreviewRegex)];
    allPreviewMatches.forEach(m => {
        const raw = m[3].replace(/\[|\]/g, '').trim();
        raw.split(',').forEach(n => {
            const num = parseInt(n.trim());
            if (!isNaN(num)) previewIds.push(num);
        });
        cleanText = cleanText.replace(m[0], '');
    });

    // Strip ALL variants of action tags: <action>, [action], etc.
    cleanText = cleanText.replace(/[<\[]action[>\]][\s\S]*?[<\[]\/(action)[>\]]/gi, '');

    // Strip any remaining orphan tags that the AI hallucinated (e.g., extra newlines after stripping)
    cleanText = cleanText.replace(/[<\[](sub-preview|action)[>\]][^<\[]*[<\[]\/\1[>\]]/gi, '');
    // Strip unclosed / broken bracket tags
    cleanText = cleanText.replace(/\[(sub-preview|action)\][^\]]*(\[\/\1\])?/gi, '');
    cleanText = cleanText.replace(/<(sub-preview|action)>[^<]*(<\/\1>)?/gi, '');

    cleanText = cleanText.trim();
    const words = cleanText.split(' ');

    // Type word-by-word as plain text first
    let typed = '';
    for (let i = 0; i < words.length; i++) {
        typed += (i === 0 ? '' : ' ') + words[i];
        bubble.innerText = typed;

        const main = document.getElementById('ai-chat-content');
        if (main) main.scrollTop = main.scrollHeight;

        const baseDelay = words.length > 50 ? 8 : 20;
        await new Promise(res => setTimeout(res, baseDelay));
    }

    // Once done typing, render full Markdown into HTML
    bubble.innerHTML = renderMarkdown(cleanText);

    const main = document.getElementById('ai-chat-content');
    if (main) main.scrollTop = main.scrollHeight;

    // Render Preview Box if IDs found
    if (previewIds.length > 0) {
        renderSubscriptionPreview(msg, previewIds);
    }
}

function renderSubscriptionPreview(container, ids) {
    const allSubs = window.subscriptions || [];
    const targetSubs = allSubs.filter(s => ids.includes(s.id));
    if (targetSubs.length === 0) return;

    const previewBox = document.createElement('div');
    previewBox.className = 'ai-sub-preview-box';
    previewBox.setAttribute('data-ids', ids.join(',')); // Store for refresh syncing
    
    let subHtml = targetSubs.map(s => {
        const domain = s.domain || 'google.com';
        const isPaid = window.isSubPaid ? window.isSubPaid(s, window.currentDate || new Date()) : false;
        const { end } = window.calculateSubTimeline ? window.calculateSubTimeline(s) : { end: 'N/A' };
        const todayStr = new Date().toISOString().split('T')[0];
        const isEnded = end !== 'N/A' && todayStr > end;
        const isStopped = s.stopped;
        
        // Premium structure like Grand Total
        const { start: displayStart, end: displayEnd } = window.calculateSubTimeline ? window.calculateSubTimeline(s) : { start: 'N/A', end: 'N/A' };
        
        return `
            <div class="ai-static-card ${isStopped || isEnded ? 'dimmed' : ''}" onclick="window.selectSubForChat(${s.id})" style="border: 1px solid #ffffff08; background: #ffffff05; border-radius: 12px; margin-bottom: 8px; cursor: pointer; padding: 10px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="detail-logo ${isPaid ? 'paid-logo' : ''}" style="width: 32px; height: 32px; background: #111; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #ffffff0a;">
                            <img src="https://icon.horse/icon/${domain}" style="width:70%; height:70%; object-fit:contain;">
                        </div>
                        <div class="detail-info">
                            <span class="detail-name" style="font-weight: 600; font-size: 0.85rem; color: #fff;">${s.name}</span>
                            <div class="tag-container" style="display: flex; gap: 4px; margin-top: 4px;">
                                <span class="status-tag" style="font-size: 0.55rem; padding: 2px 6px; background: #ffffff0a; color: #aaa; border-radius: 4px;">${s.type.toUpperCase()}</span>
                                ${isPaid ? '<span class="status-tag tag-paid">PAID</span>' : ''}
                                ${isStopped ? '<span class="status-tag tag-stopped">STOPPED</span>' : (isEnded ? '<span class="status-tag tag-ended" style="background:#ffb86c20; color:#ffb86c;">ENDED</span>' : '<span class="status-tag tag-active">ACTIVE</span>')}
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="detail-price" style="font-weight: 700; color: #fff; font-size: 0.85rem;">${s.symbol || '$'}${s.price.toFixed(2)}</div>
                        <div style="font-size: 0.6rem; color: #666; font-family: monospace; margin-top: 2px;">${displayStart} — ${displayEnd}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    previewBox.innerHTML = `
        <div class="ai-preview-header">
            <span>SHOWING ${targetSubs.length} SUBSCRIPTION${targetSubs.length > 1 ? 'S' : ''}</span>
            <div class="ai-preview-badge">SMART PREVIEW</div>
        </div>
        <div class="ai-preview-list">
            ${subHtml}
        </div>
    `;

    container.appendChild(previewBox);
    
    const main = document.getElementById('ai-chat-content');
    if (main) main.scrollTop = main.scrollHeight;

    // NO attachSwipeEvents here - keeps them static
}

function addMessage(sender, text, attachedSub = null) {
    const chatMessages = document.getElementById('chat-messages');
    messageCounter++;
    const msgId = 'msg-' + messageCounter + '-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.id = msgId;

    let subBadge = '';
    if (sender === 'user' && attachedSub) {
        subBadge = `
            <div class="user-sub-badge">
                <img src="https://icon.horse/icon/${attachedSub.domain}" class="tiny-logo">
            </div>
        `;
    }

    messageDiv.innerHTML = `
        <div class="message-bubble">
            ${subBadge}
            ${text}
        </div>
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

/**
 * Global UI Refresh: Finds all smart previews in chat and updates their tags (Paid, Stopped, etc.)
 */
window.refreshAllPreviews = function() {
    const allPreviews = document.querySelectorAll('.ai-sub-preview-box');
    allPreviews.forEach(box => {
        const idsAttr = box.getAttribute('data-ids');
        if (!idsAttr) return;

        const ids = idsAttr.split(',').map(id => parseInt(id.trim()));
        const allSubs = window.subscriptions || [];
        const targetSubs = allSubs.filter(s => ids.includes(s.id));

        const listEl = box.querySelector('.ai-preview-list');
        if (listEl && targetSubs.length > 0) {
            listEl.innerHTML = targetSubs.map(s => {
                const domain = s.domain || 'google.com';
                const isPaid = window.isSubPaid ? window.isSubPaid(s, window.currentDate || new Date()) : false;
                
                // Calculate if ended
                const { start: displayStart, end: displayEnd } = window.calculateSubTimeline ? window.calculateSubTimeline(s) : { start: 'N/A', end: 'N/A' };
                const todayStr = new Date().toISOString().split('T')[0];
                const isEnded = displayEnd !== 'N/A' && todayStr > displayEnd;
                const isStopped = s.stopped;
                
                return `
                    <div class="ai-static-card ${isStopped || isEnded ? 'dimmed' : ''}" onclick="window.selectSubForChat(${s.id})" style="border: 1px solid #ffffff08; background: #ffffff05; border-radius: 12px; margin-bottom: 8px; cursor: pointer; padding: 10px;">
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div class="detail-logo ${isPaid ? 'paid-logo' : ''}" style="width: 32px; height: 32px; background: #111; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #ffffff0a;">
                                    <img src="https://icon.horse/icon/${domain}" style="width:70%; height:70%; object-fit:contain;">
                                </div>
                                <div class="detail-info">
                                    <span class="detail-name" style="font-weight: 600; font-size: 0.85rem; color: #fff;">${s.name}</span>
                                    <div class="tag-container" style="display: flex; gap: 4px; margin-top: 4px;">
                                        <span class="status-tag" style="font-size: 0.55rem; padding: 2px 6px; background: #ffffff0a; color: #aaa; border-radius: 4px;">${s.type.toUpperCase()}</span>
                                        ${isPaid ? '<span class="status-tag tag-paid">PAID</span>' : ''}
                                        ${isStopped ? '<span class="status-tag tag-stopped">STOPPED</span>' : (isEnded ? '<span class="status-tag tag-ended" style="background:#ffb86c20; color:#ffb86c;">ENDED</span>' : '<span class="status-tag tag-active">ACTIVE</span>')}
                                    </div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div class="detail-price" style="font-weight: 700; color: #fff; font-size: 0.85rem;">${s.symbol || '$'}${s.price.toFixed(2)}</div>
                                <div style="font-size: 0.6rem; color: #666; font-family: monospace; margin-top: 2px;">${displayStart} — ${displayEnd}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    });
};
