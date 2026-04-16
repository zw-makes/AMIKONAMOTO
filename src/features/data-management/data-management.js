import { supabase } from '../../supabase.js';

export function initDataManagement() {
    console.log('[DataManagement] Initializing...');

    const dataModal = document.getElementById('data-modal');
    const closeDataBtn = document.getElementById('close-data-modal');
    const deleteSubsBtn = document.getElementById('delete-subs-permanently-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    // New Confirmation Modal Elements
    const subsDeleteConfirmModal = document.getElementById('delete-subs-confirm-modal');
    const closeSubsDeleteConfirm = document.getElementById('close-subs-delete-confirm');
    const subsDeleteConfirmEmailInput = document.getElementById('subs-delete-confirm-email');
    const subsDeleteEmailError = document.getElementById('subs-delete-email-error');
    const finalDeleteSubsBtn = document.getElementById('final-delete-subs-btn');

    // Global toggle function
    window.showDataModal = function(show = true) {
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
        deleteSubsBtn.addEventListener('click', () => {
            // Reset and show verification modal
            subsDeleteConfirmEmailInput.value = '';
            subsDeleteEmailError.classList.add('hidden');
            finalDeleteSubsBtn.disabled = false;
            finalDeleteSubsBtn.innerText = 'Wipe Subscriptions Permanently';
            
            subsDeleteConfirmModal.classList.remove('hidden');
            if (window.HapticsService) window.HapticsService.light();
        });
    }

    if (closeSubsDeleteConfirm) {
        closeSubsDeleteConfirm.addEventListener('click', () => {
            subsDeleteConfirmModal.classList.add('hidden');
        });
    }

    if (finalDeleteSubsBtn) {
        finalDeleteSubsBtn.addEventListener('click', async () => {
            const enteredEmail = subsDeleteConfirmEmailInput.value.trim().toLowerCase();
            const userEmail = window.currentUser?.email?.toLowerCase();

            if (enteredEmail !== userEmail) {
                subsDeleteEmailError.classList.remove('hidden');
                subsDeleteConfirmEmailInput.focus();
                if (window.HapticsService) window.HapticsService.error();
                return;
            }

            subsDeleteEmailError.classList.add('hidden');
            await deleteSubscriptionsPermanently();
        });
    }


}

async function deleteSubscriptionsPermanently() {
    const finalBtn = document.getElementById('final-delete-subs-btn');
    const subsDeleteConfirmModal = document.getElementById('delete-subs-confirm-modal');
    
    try {
        finalBtn.innerText = 'WIPING RECORDS...';
        finalBtn.disabled = true;

        const currentUser = window.currentUser;
        if (!currentUser) throw new Error('No active user found');

        // 1. Database Delete
        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('user_id', currentUser.id);

        if (error) throw error;

        // 2. Local Cleanup
        localStorage.removeItem('subscriptions');
        window.subscriptions = [];

        // 3. Success Feedback
        if (window.HapticsService) window.HapticsService.success();
        if (window.showToast) window.showToast('All subscriptions deleted successfully! 🧹');

        // 4. Update UI
        if (window.renderCalendar) window.renderCalendar();
        if (window.updateStats) window.updateStats();
        
        // Finalize
        setTimeout(() => {
            subsDeleteConfirmModal.classList.add('hidden');
            window.showDataModal(false);
        }, 1000);

    } catch (err) {
        console.error('[DataManagement] Error deleting subscriptions:', err);
        if (window.showToast) window.showToast('Failed to delete subscriptions. ❌', 'error');
        if (window.HapticsService) window.HapticsService.error();
        
        finalBtn.innerText = 'Try Again';
        finalBtn.disabled = false;
    }
}
