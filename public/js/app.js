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
            'semester': window.SemesterView,
            'tasks': window.TasksView,
            'krs': window.KrsView
        };
        
        this.init();
    }

    async init() {
        // Setup navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('data-view');
                this.navigate(view);
            });
        });

        // Setup Cloud Sync
        document.getElementById('btn-cloud-sync').addEventListener('click', () => this.handleCloudSync());

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
            this.currentViewModule.unsubscribe = null;
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
            container.innerHTML = `<div class="text-danger-red">Failed to load view.</div>`;
        }
    }

    async handleCloudSync() {
        const statusEl = document.getElementById('sync-status');
        statusEl.classList.remove('hidden');
        statusEl.innerText = 'Syncing to cloud...';
        
        try {
            await window.appStore.syncToCloud();
            this.showToast('Data synced to cloud successfully!', 'success');
            statusEl.innerText = 'Synced just now';
            setTimeout(() => statusEl.classList.add('hidden'), 3000);
        } catch (e) {
            this.showToast('Failed to sync: ' + e.message, 'error');
            statusEl.innerText = 'Sync failed';
        }
    }

    showToast(message, type = 'success') {
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
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
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
