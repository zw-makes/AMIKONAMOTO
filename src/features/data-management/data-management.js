import { supabase } from '../../supabase.js';

export function initDataManagement() {
    console.log('[DataManagement] Initializing...');

    const dataModal = document.getElementById('data-modal');
    const closeDataBtn = document.getElementById('close-data-modal');
    const deleteSubsBtn = document.getElementById('delete-subs-permanently-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    // Global toggle function
    window.showDataModal = function(show = true) {
        if (window.HapticsService) window.HapticsService.medium();
        if (show) {
            dataModal.classList.remove('hidden');
        } else {
            dataModal.classList.add('hidden');
        }
    };

    if (closeDataBtn) {
        closeDataBtn.addEventListener('click', () => window.showDataModal(false));
    }

    if (deleteSubsBtn) {
        deleteSubsBtn.addEventListener('click', () => showWipeSubscriptionsSheet());
    }

    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => showDestroyAccountSheet());
    }
}

function showWipeSubscriptionsSheet() {
    const existing = document.getElementById('nexus-wipe-subs-sheet');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'nexus-wipe-subs-sheet';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 10005;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
        animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
        <div class="category-sheet-inner" style="
            width: 100%; max-width: 450px;
            background: #111;
            border-top: 1px solid rgba(255,255,255,0.08);
            border-radius: 28px 28px 0 0;
            padding-bottom: 34px;
            animation: nexusSlideIn 0.35s cubic-bezier(0.32, 0.72, 0, 1);
            position: relative;
        ">
            <!-- Drag Area -->
            <div id="wipe-drag-area" style="cursor: grab; display: flex; flex-direction: column; width: 100%; padding-top: 10px;">
                <div style="padding: 14px 0 4px; display: flex; justify-content: center;">
                    <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 10px;"></div>
                </div>

                <div style="display: flex; align-items: center; padding: 8px 20px 20px; gap: 16px;">
                    <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                            <path d="M10 11v6"></path><path d="M14 11v6"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 style="margin: 0 0 2px; font-size: 1.05rem; font-weight: 700; letter-spacing: -0.02em; color: #fff;">Wipe Subscriptions</h2>
                        <p style="margin: 0; font-size: 0.75rem; color: rgba(255,69,58,0.7); font-weight: 600;">This action cannot be undone.</p>
                    </div>
                </div>
            </div>

            <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 0 20px 20px;"></div>

            <div style="padding: 0 20px;">
                <p style="font-size: 0.85rem; color: rgba(255,255,255,0.45); line-height: 1.6; margin-bottom: 24px;">
                    Confirm your email to permanently delete all subscription records and history.
                </p>

                <div style="margin-bottom: 24px;">
                    <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); font-weight: 600; display: block; margin-bottom: 12px;">Verify Email</label>
                    <input type="email" id="subs-wipe-verify-email" placeholder="Enter your email address" autocomplete="off" style="
                        width: 100%; padding: 16px 18px; background: rgba(255,255,255,0.04);
                        border: 1px solid rgba(255,255,255,0.1); border-radius: 14px;
                        color: #fff; font-size: 0.95rem; outline: none; box-sizing: border-box;
                    ">
                    <p id="subs-wipe-email-error" style="color: #ff453a; font-size: 0.75rem; font-weight: 600; margin-top: 8px; display: none;">Email mismatch. Please try again.</p>
                </div>

                <button id="final-wipe-subs-btn" style="
                    width: 100%; padding: 17px; border-radius: 18px;
                    background: rgba(255, 69, 58, 0.12); border: 1px solid rgba(255, 69, 58, 0.25);
                    color: #ff453a; font-size: 1rem; font-weight: 800; cursor: pointer;
                ">Destroy All Records</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setupSheetDrag(modal, '#wipe-drag-area');

    const emailInput = modal.querySelector('#subs-wipe-verify-email');
    const wipeBtn = modal.querySelector('#final-wipe-subs-btn');
    const errorMsg = modal.querySelector('#subs-wipe-email-error');

    wipeBtn.onclick = async () => {
        const enteredEmail = emailInput.value.trim().toLowerCase();
        const userEmail = window.currentUser?.email?.toLowerCase();

        if (enteredEmail !== userEmail) {
            errorMsg.style.display = 'block';
            emailInput.focus();
            if (window.HapticsService) window.HapticsService.error();
            return;
        }

        errorMsg.style.display = 'none';
        await deleteSubscriptionsPermanently(wipeBtn, modal);
    };
}

function showDestroyAccountSheet() {
    const existing = document.getElementById('nexus-destroy-account-sheet');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'nexus-destroy-account-sheet';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 10005;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
        animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
        <div class="category-sheet-inner" style="
            width: 100%; max-width: 450px;
            background: #111;
            border-top: 1px solid rgba(255,255,255,0.08);
            border-radius: 28px 28px 0 0;
            padding-bottom: 34px;
            animation: nexusSlideIn 0.35s cubic-bezier(0.32, 0.72, 0, 1);
            position: relative;
        ">
            <!-- Drag Area -->
            <div id="destroy-drag-area" style="cursor: grab; display: flex; flex-direction: column; width: 100%; padding-top: 10px;">
                <div style="padding: 14px 0 4px; display: flex; justify-content: center;">
                    <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 10px;"></div>
                </div>

                <div style="display: flex; align-items: center; padding: 8px 20px 20px; gap: 16px;">
                    <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(255, 69, 58, 0.15); border: 1px solid rgba(255, 69, 58, 0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div>
                        <h2 style="margin: 0 0 2px; font-size: 1.05rem; font-weight: 700; letter-spacing: -0.02em; color: #fff;">Destroy Account</h2>
                        <p style="margin: 0; font-size: 0.75rem; color: #ff453a; font-weight: 800; text-transform: uppercase;">Final Warning</p>
                    </div>
                </div>
            </div>

            <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 0 20px 20px;"></div>

            <div style="padding: 0 20px;">
                <p style="font-size: 0.85rem; color: rgba(255,255,255,0.45); line-height: 1.6; margin-bottom: 24px;">
                    This will permanently delete your profile, credit cards, and all data. This cannot be reversed.
                </p>

                <div style="margin-bottom: 24px;">
                    <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); font-weight: 600; display: block; margin-bottom: 12px;">Confirm Email</label>
                    <input type="email" id="account-destroy-verify-email" placeholder="Confirm your account email" autocomplete="off" style="
                        width: 100%; padding: 16px 18px; background: rgba(255,255,255,0.04);
                        border: 1px solid rgba(255,255,255,0.1); border-radius: 14px;
                        color: #fff; font-size: 0.95rem; outline: none; box-sizing: border-box;
                    ">
                    <p id="account-destroy-email-error" style="color: #ff453a; font-size: 0.75rem; font-weight: 600; margin-top: 8px; display: none;">Incorrect email entry.</p>
                </div>

                <button id="final-destroy-account-btn" style="
                    width: 100%; padding: 17px; border-radius: 18px;
                    background: #ff453a; border: none;
                    color: #fff; font-size: 1rem; font-weight: 800; cursor: pointer;
                    box-shadow: 0 10px 25px rgba(255, 69, 58, 0.25);
                ">Delete Account Permanently</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setupSheetDrag(modal, '#destroy-drag-area');

    const emailInput = modal.querySelector('#account-destroy-verify-email');
    const destroyBtn = modal.querySelector('#final-destroy-account-btn');
    const errorMsg = modal.querySelector('#account-destroy-email-error');

    destroyBtn.onclick = async () => {
        const enteredEmail = emailInput.value.trim().toLowerCase();
        const userEmail = window.currentUser?.email?.toLowerCase();

        if (enteredEmail !== userEmail) {
            errorMsg.style.display = 'block';
            emailInput.focus();
            if (window.HapticsService) window.HapticsService.error();
            return;
        }

        errorMsg.style.display = 'none';
        await executeAccountDestruction(destroyBtn, modal);
    };
}

function setupSheetDrag(modal, handleSelector) {
    const sheet = modal.querySelector('.category-sheet-inner');
    const handle = modal.querySelector(handleSelector);
    let startY = 0, currentY = 0, isDragging = false;

    const onStart = (e) => {
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        isDragging = true;
        sheet.style.transition = 'none';
        document.activeElement?.blur();
    };

    const onMove = (e) => {
        if (!isDragging) return;
        const nowY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        currentY = Math.max(0, nowY - startY);
        sheet.style.transform = `translateY(${currentY}px)`;
        modal.style.background = `rgba(0,0,0,${Math.max(0, 0.6 - currentY / 450)})`;
        if (e.cancelable) e.preventDefault();
    };

    const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        if (currentY > 120) {
            sheet.style.transition = 'transform 0.25s ease-out';
            sheet.style.transform = 'translateY(110%)';
            setTimeout(() => modal.remove(), 250);
        } else {
            sheet.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
            sheet.style.transform = 'translateY(0)';
            modal.style.background = 'rgba(0,0,0,0.6)';
        }
    };

    if (handle) {
       handle.addEventListener('mousedown', onStart);
       handle.addEventListener('touchstart', onStart, { passive: true });
       window.addEventListener('mousemove', onMove);
       window.addEventListener('touchmove', onMove, { passive: false });
       window.addEventListener('mouseup', onEnd);
       window.addEventListener('touchend', onEnd);
    }
}

async function deleteSubscriptionsPermanently(btn, modal) {
    try {
        btn.innerText = 'WIPING RECORDS...';
        btn.disabled = true;

        const currentUser = window.currentUser;
        if (!currentUser) throw new Error('No active user found');

        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('user_id', currentUser.id);

        if (error) throw error;

        localStorage.removeItem('subscriptions');
        window.subscriptions = [];

        if (window.HapticsService) window.HapticsService.success();
        btn.innerText = '🧹 WIPED';
        if (window.showToast) window.showToast('All subscriptions deleted successfully! 🧹');

        if (window.renderCalendar) window.renderCalendar();
        if (window.updateStats) window.updateStats();
        
        setTimeout(() => {
            modal.querySelector('.category-sheet-inner').style.transform = 'translateY(110%)';
            setTimeout(() => {
                modal.remove();
                window.showDataModal(false);
            }, 250);
        }, 1000);

    } catch (err) {
        console.error('[DataManagement] Error deleting subscriptions:', err);
        if (window.showToast) window.showToast('Failed to delete subscriptions. ❌', 'error');
        if (window.HapticsService) window.HapticsService.error();
        
        btn.innerText = 'RETRY ERROR';
        btn.disabled = false;
    }
}

async function executeAccountDestruction(btn, modal) {
    try {
        btn.innerText = 'ERASING EVERYTHING...';
        btn.disabled = true;
        const currentUser = window.currentUser;

        await supabase.from('notifications').delete().eq('user_id', currentUser.id);
        
        const { error: deleteError } = await supabase.rpc('delete_user_permanently');
        if (deleteError) throw deleteError;

        localStorage.clear();

        if (window.HapticsService) window.HapticsService.success();
        btn.innerText = 'DONE';
        
        setTimeout(() => window.location.reload(), 800);
    } catch (err) {
        console.error('[Destruction] Failed:', err);
        btn.innerText = 'RETRY ERROR';
        btn.disabled = false;
        if (window.HapticsService) window.HapticsService.error();
    }
}
