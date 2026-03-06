// Notifications Feature Module
import './notifications.css';
import { supabase } from '../../supabase.js';

let notifications = [];
let currentUser = null;

// Initial sync
async function syncUser() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;
    if (currentUser) {
        await loadNotifications();
    }
}

async function loadNotifications() {
    if (!currentUser) return;
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(20);

    if (!error && data) {
        notifications = data.map(n => ({
            ...n,
            time: formatTime(n.created_at)
        }));
        renderNotifications();
    }
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

let notifList = null;

export function initNotifications() {
    const notifBtn = document.getElementById('notif-btn');
    const notifModal = document.getElementById('notif-modal');
    const closeNotifBtn = document.getElementById('close-notif');
    notifList = document.getElementById('notif-list');
    const markReadAllBtn = document.getElementById('notif-mark-read');
    const deleteAllBtn = document.getElementById('notif-delete-all');

    if (!notifBtn || !notifModal || !closeNotifBtn) return;

    // Start sync
    syncUser();

    // Open Modal
    notifBtn.addEventListener('click', async () => {
        await loadNotifications();
        notifModal.classList.remove('hidden');
        document.getElementById('notif-badge')?.classList.add('hidden');
    });

    // Bulk Actions
    markReadAllBtn?.addEventListener('click', async () => {
        if (!currentUser) return;
        notifications.forEach(n => n.read = true);
        renderNotifications();

        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', currentUser.id)
            .eq('read', false);
    });

    deleteAllBtn?.addEventListener('click', async () => {
        if (!currentUser) return;
        notifications = [];
        renderNotifications();

        // Prevent auto-reminders from re-populating immediately
        sessionStorage.setItem('notifs_cleared', 'true');

        await supabase
            .from('notifications')
            .update({ is_hidden: true })
            .eq('user_id', currentUser.id);
    });

    // Close Modal
    closeNotifBtn.addEventListener('click', () => {
        notifModal.classList.add('hidden');
    });

    // Close on outside click
    notifModal.addEventListener('click', (e) => {
        if (e.target === notifModal) {
            notifModal.classList.add('hidden');
        }
    });
}

function renderNotifications() {
    if (!notifList) return;

    if (notifications.length === 0) {
        notifList.innerHTML = `
            <div class="notif-empty">
                <div class="notif-empty-icon">🔔</div>
                <p class="notif-empty-text">No notifications yet.</p>
            </div>
        `;
        return;
    }

    notifList.innerHTML = notifications.map(n => `
        <div class="notif-item ${!n.read ? 'unread-notif' : ''}" data-id="${n.id}">
            <div class="notif-logo-container">
                ${n.domain
            ? `<img src="https://icon.horse/icon/${n.domain}" class="notif-logo">`
            : `<div class="notif-icon ${n.type}">${getIcon(n.type)}</div>`
        }
            </div>
            <div class="notif-content">
                <span class="notif-title">${n.title}</span>
                <span class="notif-text">${n.text}</span>
                <span class="notif-time">${n.time}</span>
            </div>
        </div>
    `).join('');

    // Attach item click listeners
    notifList.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', async () => {
            const id = item.dataset.id;
            const notif = notifications.find(n => n.id == id);
            if (notif && !notif.read) {
                notif.read = true;
                renderNotifications();
                await supabase
                    .from('notifications')
                    .update({ read: true })
                    .eq('id', id);
            }
        });
    });
}

function getIcon(type) {
    switch (type) {
        case 'success':
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;
        case 'warning':
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        default:
            return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }
}

// Global helper to add notifications from main.js if needed
window.addNotification = async function (notif) {
    if (!currentUser) {
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
    }
    if (!currentUser) return;

    // 1. Prevent exact duplicates in local memory
    if (notif.key && notifications.some(n => n.key === notif.key)) return;

    // 2. Persistent check: If it has a key, check if it already exists in DB to prevent refresh-spam
    if (notif.key) {
        const { data: existing } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('key', notif.key)
            .maybeSingle();
        if (existing) return;
    }

    const dbNotif = {
        user_id: currentUser.id,
        title: notif.title,
        text: notif.text,
        type: notif.type || 'info',
        read: false,
        key: notif.key || null,
        domain: notif.domain || null
    };

    const { data, error } = await supabase
        .from('notifications')
        .insert([dbNotif])
        .select();

    if (!error && data) {
        notifications.unshift({
            ...data[0],
            time: "Just now"
        });
        document.getElementById('notif-badge')?.classList.remove('hidden');
        renderNotifications();
    }

    if (notifications.length > 20) notifications.pop();
};

// Helper to clear existing reminders (warnings) to refresh them
export function clearReminders() {
    notifications = notifications.filter(n => n.type !== 'warning' || n.title === "Subscription Stopped");
}
