/**
 * Academic Control System - Main App Logic (SPA Router & Global UI)
 */

class App {
    constructor() {
        this.currentView = '';
        this.currentViewModule = null;
        this.views = {
            'dashboard': window.DashboardView,
            'calculator': window.CalculatorView,
            'targetipk': window.TargetIpkView,
            'semester': window.SemesterView,
            'transcript': window.TranscriptView,
            'tasks': window.TasksView,
            'krs': window.KrsView,
            'statistics': window.StatisticsView
        };
        
        this.init();
    }

    async init() {
        this.createGlobalModals();
        
        // Setup navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('data-view');
                this.navigate(view);
                
                // Hide sidebar on mobile after clicking
                if (window.innerWidth < 1024) {
                    this.toggleSidebar();
                }
            });
        });

        // Cloud Sync now uses inline onclick in HTML to open modal

        // Handle initial route
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        this.navigate(hash);
        
        // Setup topbar avatar listener to keep initials updated
        this.updateAvatar();
        window.appStore.subscribe(() => this.updateAvatar());
    }

    updateAvatar() {
        const initials = window.appStore.data.profile.initials || 'SK';
        document.getElementById('topbar-avatar').innerText = initials;
    }

    async navigate(viewName) {
        if (!this.views[viewName]) {
            viewName = 'dashboard';
        }

        // Update active nav state
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-view') === viewName) {
                link.classList.add('bg-secondary-container', 'text-primary');
                link.classList.remove('text-secondary');
            } else {
                link.classList.remove('bg-secondary-container', 'text-primary');
                link.classList.add('text-secondary');
            }
        });

        // Update URL hash
        window.location.hash = viewName;
        this.currentView = viewName;

        // Fetch and render view
        await this.renderView(viewName);
    }

    async renderView(viewName) {
        // Unsubscribe previous view to prevent memory leaks and DOM errors
        if (this.currentViewModule && typeof this.currentViewModule.unsubscribe === 'function') {
            this.currentViewModule.unsubscribe();
        }

        const container = document.getElementById('app-content');
        container.innerHTML = '<div class="flex justify-center items-center h-64"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>';

        try {
            const viewModule = this.views[viewName];
            if (viewModule && viewModule.render) {
                container.innerHTML = viewModule.render();
                if (viewModule.init) {
                    viewModule.init(container);
                }
                
                this.currentViewModule = viewModule;
                
                // Update topbar title
                if (viewModule.title) {
                    document.getElementById('topbar-title').innerText = viewModule.title;
                }
            } else {
                container.innerHTML = `<div class="text-danger-red">Error: View module ${viewName} not found or invalid.</div>`;
            }
        } catch (error) {
            console.error("View rendering error", error);
            container.innerHTML = `
                <div class="text-danger-red p-4 border border-danger-red rounded bg-danger-red/10 overflow-auto">
                    <h3 class="font-bold mb-2">Failed to load view.</h3>
                    <p class="font-mono text-sm">${error.message}</p>
                    <pre class="text-[10px] whitespace-pre-wrap mt-2">${error.stack}</pre>
                </div>
            `;
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            if (sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            } else {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            }
        }
    }

    openCloudSyncModal() {
        const modal = document.getElementById('modal-cloud-sync');
        if (modal) modal.classList.remove('hidden');
    }

    closeCloudSyncModal() {
        const modal = document.getElementById('modal-cloud-sync');
        if (modal) modal.classList.add('hidden');
    }

    async handleBackup() {
        console.log("Tombol Backup diklik!");
        this.closeCloudSyncModal();
        const statusEl = document.getElementById('sync-status');
        if (statusEl) {
            statusEl.classList.remove('hidden');
            statusEl.innerText = 'Backing up...';
        }
        
        try {
            await window.appStore.syncToCloud();
            this.showToast('Data berhasil di-backup ke Cloud!', 'success');
            if (statusEl) {
                statusEl.innerText = 'Backed up just now';
                setTimeout(() => statusEl.classList.add('hidden'), 3000);
            }
        } catch (e) {
            console.error('Backup fail trace:', e);
            this.showToast('Gagal mem-backup: ' + (e.message || 'Error tidak diketahui'), 'error');
            if (statusEl) statusEl.innerText = 'Backup failed';
        }
    }

    async handleRestore() {
        this.closeCloudSyncModal();
        const statusEl = document.getElementById('sync-status');
        if (statusEl) {
            statusEl.classList.remove('hidden');
            statusEl.innerText = 'Restoring...';
        }
        
        try {
            await window.appStore.syncFromCloud();
            this.showToast('Data berhasil di-restore dari Cloud!', 'success');
            if (statusEl) {
                statusEl.innerText = 'Restored just now';
                setTimeout(() => statusEl.classList.add('hidden'), 3000);
            }
            
            // Re-render view to reflect new data
            this.updateAvatar();
            this.renderView(this.currentView);
        } catch (e) {
            this.showToast('Gagal me-restore: ' + e.message, 'error');
            if (statusEl) statusEl.innerText = 'Restore failed';
        }
    }

    showToast(message, type = 'success') {
        console.log("Notifikasi Toast:", message);
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const bgColor = type === 'success' ? 'bg-success-green' : (type === 'error' ? 'bg-danger-red' : 'bg-secondary');
        
        toast.className = `toast px-4 py-3 rounded shadow-lg text-white font-label-md flex items-center gap-2 ${bgColor}`;
        toast.innerHTML = `
            <span class="material-symbols-outlined text-sm" data-icon="${type === 'success' ? 'check_circle' : 'error'}">
                ${type === 'success' ? 'check_circle' : 'error'}
            </span>
            ${message}
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    createGlobalModals() {
        if (!document.getElementById('global-modal-container')) {
            const container = document.createElement('div');
            container.id = 'global-modal-container';
            container.innerHTML = `
                <!-- Global Confirm Modal -->
                <div id="modal-global-confirm" class="fixed inset-0 z-[999] hidden bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
                    <div class="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4 transform scale-95 transition-transform duration-300">
                        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 mx-auto" id="global-confirm-icon-bg">
                            <span class="material-symbols-outlined text-2xl" id="global-confirm-icon">help</span>
                        </div>
                        <h3 class="font-headline-md text-on-surface text-center mb-2" id="global-confirm-title">Konfirmasi</h3>
                        <p class="text-secondary text-sm text-center mb-6" id="global-confirm-msg">Apakah Anda yakin?</p>
                        
                        <div class="flex gap-3">
                            <button id="btn-global-confirm-cancel" class="flex-1 py-2 text-secondary font-label-md bg-surface-container hover:bg-surface-container-high rounded-xl transition-colors">Batal</button>
                            <button id="btn-global-confirm-ok" class="flex-1 py-2 bg-primary text-white font-label-md rounded-xl hover:opacity-90 transition-opacity shadow-sm">Ya</button>
                        </div>
                    </div>
                </div>

                <!-- Global Alert Modal -->
                <div id="modal-global-alert" class="fixed inset-0 z-[1000] hidden bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none">
                    <div class="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4 transform scale-95 transition-transform duration-300">
                        <div class="flex items-center justify-center w-12 h-12 rounded-full bg-danger-red/10 text-danger-red mb-4 mx-auto" id="global-alert-icon-bg">
                            <span class="material-symbols-outlined text-2xl" id="global-alert-icon">info</span>
                        </div>
                        <h3 class="font-headline-md text-on-surface text-center mb-2" id="global-alert-title">Perhatian</h3>
                        <p class="text-secondary text-sm text-center mb-6" id="global-alert-msg">Pesan peringatan.</p>
                        
                        <div class="flex justify-center">
                            <button id="btn-global-alert-ok" class="w-full py-2 bg-primary text-white font-label-md rounded-xl hover:opacity-90 transition-opacity shadow-sm">Tutup</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(container);
        }
    }

    showConfirm(message, callback, options = {}) {
        const modal = document.getElementById('modal-global-confirm');
        document.getElementById('global-confirm-msg').innerText = message;
        document.getElementById('global-confirm-title').innerText = options.title || 'Konfirmasi';
        
        const btnCancel = document.getElementById('btn-global-confirm-cancel');
        const btnOk = document.getElementById('btn-global-confirm-ok');
        
        const newBtnCancel = btnCancel.cloneNode(true);
        const newBtnOk = btnOk.cloneNode(true);
        btnCancel.replaceWith(newBtnCancel);
        btnOk.replaceWith(newBtnOk);
        
        if (options.isDanger) {
            newBtnOk.className = "flex-1 py-2 bg-danger-red text-white font-label-md rounded-xl hover:opacity-90 transition-opacity shadow-sm";
            document.getElementById('global-confirm-icon-bg').className = "flex items-center justify-center w-12 h-12 rounded-full bg-danger-red/10 text-danger-red mb-4 mx-auto";
            document.getElementById('global-confirm-icon').innerText = 'warning';
        } else {
            newBtnOk.className = "flex-1 py-2 bg-primary text-white font-label-md rounded-xl hover:opacity-90 transition-opacity shadow-sm";
            document.getElementById('global-confirm-icon-bg').className = "flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 mx-auto";
            document.getElementById('global-confirm-icon').innerText = 'help';
        }

        const closeModal = () => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.querySelector('.bg-surface-container-lowest').classList.remove('scale-100');
            modal.querySelector('.bg-surface-container-lowest').classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden'), 300);
        };

        newBtnCancel.addEventListener('click', () => {
            closeModal();
            if(callback) callback(false);
        });
        
        newBtnOk.addEventListener('click', () => {
            closeModal();
            if(callback) callback(true);
        });

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.querySelector('.bg-surface-container-lowest').classList.remove('scale-95');
            modal.querySelector('.bg-surface-container-lowest').classList.add('scale-100');
        }, 10);
    }

    showAlert(message, options = {}) {
        const modal = document.getElementById('modal-global-alert');
        document.getElementById('global-alert-msg').innerText = message;
        document.getElementById('global-alert-title').innerText = options.title || 'Perhatian';
        
        const btnOk = document.getElementById('btn-global-alert-ok');
        const newBtnOk = btnOk.cloneNode(true);
        btnOk.replaceWith(newBtnOk);

        const closeModal = () => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.querySelector('.bg-surface-container-lowest').classList.remove('scale-100');
            modal.querySelector('.bg-surface-container-lowest').classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden'), 300);
        };
        
        newBtnOk.addEventListener('click', closeModal);

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.querySelector('.bg-surface-container-lowest').classList.remove('scale-95');
            modal.querySelector('.bg-surface-container-lowest').classList.add('scale-100');
        }, 10);
    }

    // Profile Methods
    openProfileModal() {
        const profile = window.appStore.data.profile;
        document.getElementById('input-profile-name').value = profile.name || '';
        document.getElementById('input-profile-initials').value = profile.initials || '';
        document.getElementById('input-profile-jurusan').value = profile.jurusan || '';
        document.getElementById('modal-profile').classList.remove('hidden');
    }

    closeProfileModal() {
        document.getElementById('modal-profile').classList.add('hidden');
    }

    saveProfile() {
        const name = document.getElementById('input-profile-name').value.trim();
        const initials = document.getElementById('input-profile-initials').value.trim().toUpperCase();
        const jurusan = document.getElementById('input-profile-jurusan').value.trim();

        if (!name || !initials || !jurusan) {
            this.showToast('Mohon lengkapi semua data profil dengan benar.', 'error');
            return;
        }

        window.appStore.data.profile = {
            name: name,
            initials: initials,
            jurusan: jurusan
        };
        window.appStore.saveLocal();
        this.closeProfileModal();
        this.showToast('Profil berhasil disimpan!', 'success');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
