window.KrsDraftView = {
    title: 'Draf KRS',
    render: function() {
        return `
        <div class="max-w-container-max mx-auto pb-12">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-lg">
                <div>
                    <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Draf KRS</h3>
                    <p class="text-secondary font-body-md text-body-md">Susun dan simulasikan rencana studi Anda di sini.</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div class="lg:col-span-1 flex flex-col gap-6 relative">
                    <!-- Info Box IPS -->
                    <div class="relative z-10 flex flex-col gap-3">
                        <div class="bg-surface-container-high p-4 rounded-xl border border-surface-border text-center md:text-left">
                            <p class="text-xs text-secondary font-bold uppercase mb-1">Berdasarkan IPS Sebelumnya:</p>
                            <p class="font-headline-md text-on-surface" id="krs-prev-ips">0.00</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.KrsDraftView.clearKrs()" class="text-danger-red px-4 py-2 rounded-lg font-label-md hover:bg-error-container transition-colors text-sm border border-danger-red/20 flex-1">
                                Reset
                            </button>
                            <button onclick="window.KrsDraftView.commitKrsToFixed()" class="bg-primary text-white px-4 py-2 rounded-lg font-label-md hover:opacity-90 transition-opacity text-sm shadow-sm flex items-center justify-center gap-1 flex-[2]">
                                <span class="material-symbols-outlined text-sm">done_all</span> Finalisasi
                            </button>
                        </div>
                    </div>

                    <!-- Limit SKS Box -->
                    <div class="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-surface-border">
                        <div class="flex items-center justify-between mb-4">
                            <h4 class="font-label-md text-on-surface uppercase tracking-wider font-bold">Batas SKS</h4>
                            <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <span class="material-symbols-outlined text-[18px]">speed</span>
                            </div>
                        </div>
                        
                        <div class="flex items-end justify-between mb-2">
                            <div class="flex items-baseline gap-1">
                                <span id="krs-sks-taken" class="text-4xl font-headline-lg font-bold text-primary">0</span>
                                <span class="text-secondary font-body-md">/ <span id="krs-sks-limit">24</span></span>
                            </div>
                            <button id="krs-extra-sks-btn" onclick="window.KrsDraftView.toggleExtraSks()" class="ml-auto px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 bg-primary text-white border-primary shadow-sm hover:bg-primary-container">
                                <span class="material-symbols-outlined text-[14px]">add_circle</span> Bantuan +1 SKS Khusus
                            </button>
                        </div>
                        
                        <div class="h-4 bg-surface-container-highest rounded-full overflow-hidden mt-4">
                            <div id="krs-sks-bar" class="h-full bg-primary transition-all duration-500" style="width: 0%"></div>
                        </div>
                        <p id="krs-sks-warning" class="text-danger-red font-bold text-sm mt-2 hidden flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">warning</span> Peringatan: Melebihi Jatah SKS!
                        </p>
                    </div>
                </div>

                <!-- Planned Courses Table -->
                <div class="lg:col-span-2 bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
                    <div class="p-6 border-b border-surface-border flex justify-between items-center bg-surface-container-lowest">
                        <h4 class="font-headline-md text-headline-md text-on-surface">Daftar Draf Matkul</h4>
                        <button onclick="window.KrsDraftView.openCourseModal()" class="text-primary font-bold hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm border border-primary/20">
                            <span class="material-symbols-outlined text-[18px]">add</span> Tambah Matkul
                        </button>
                    </div>
                    
                    <div class="overflow-x-auto flex-1">
                        <table class="w-full text-left font-body-sm border-collapse min-w-[600px]" id="krs-table">
                            <thead>
                                <tr class="border-b border-surface-border text-secondary font-label-md uppercase tracking-wider text-[11px] bg-surface-container-low/50">
                                    <th class="py-4 px-6 w-32">Kode</th>
                                    <th class="py-4 px-6">Nama Mata Kuliah</th>
                                    <th class="py-4 px-6 w-40">Jadwal</th>
                                    <th class="py-4 px-6 text-center w-24">SKS</th>
                                    <th class="py-4 px-6 text-right w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="krs-list">
                            </tbody>
                        </table>
                        <div id="krs-empty" class="hidden p-12 text-center flex flex-col items-center justify-center h-full">
                            <div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-4">
                                <span class="material-symbols-outlined text-4xl">inbox</span>
                            </div>
                            <p class="text-secondary font-body-md mb-4">Draf KRS masih kosong.</p>
                            <button onclick="window.KrsDraftView.openCourseModal()" class="bg-primary text-white px-6 py-2.5 rounded-lg font-label-md hover:opacity-90 transition-all">
                                Mulai Susun Draf
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Tambah Matkul KRS -->
        <div id="modal-krs-course" class="fixed inset-0 z-[100] hidden bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center">
            <div class="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
                <h3 class="font-headline-md text-primary mb-4">Tambah Draf Matkul</h3>
                
                <label class="block text-sm mb-1 text-secondary">Kode Matkul</label>
                <input type="text" id="input-krs-code" oninput="window.KrsDraftView.handleCourseCodeInput(this)" onkeydown="if(event.key==='Enter') window.KrsDraftView.saveCourse()" class="w-full border-outline-variant rounded-lg p-2 mb-3 focus:ring-primary focus:border-primary" placeholder="Misal: IF101"/>
                
                <label class="block text-sm mb-1 text-secondary">Nama Matkul</label>
                <input type="text" id="input-krs-name" onkeydown="if(event.key==='Enter') window.KrsDraftView.saveCourse()" class="w-full border-outline-variant rounded-lg p-2 mb-3 focus:ring-primary focus:border-primary" placeholder="Misal: Kalkulus I"/>
                
                <label class="block text-sm mb-1 text-secondary">SKS</label>
                <input type="number" id="input-krs-sks" onkeydown="if(event.key==='Enter') window.KrsDraftView.saveCourse()" class="w-full border-outline-variant rounded-lg p-2 mb-4 focus:ring-primary focus:border-primary" min="1" max="6" value="3"/>
                
                <h4 class="font-label-md text-primary border-t border-surface-border pt-3 mb-2">Jadwal Kuliah (Opsional)</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    <div>
                        <label class="block text-xs mb-1 text-secondary">Hari</label>
                        <select id="input-krs-day" class="w-full border-outline-variant rounded-lg p-2 focus:ring-primary focus:border-primary">
                            <option value="">- Pilih Hari -</option>
                            <option value="Senin">Senin</option>
                            <option value="Selasa">Selasa</option>
                            <option value="Rabu">Rabu</option>
                            <option value="Kamis">Kamis</option>
                            <option value="Jumat">Jumat</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs mb-1 text-secondary">Mulai</label>
                        <input type="time" id="input-krs-start" class="w-full border-outline-variant rounded-lg p-2 focus:ring-primary focus:border-primary"/>
                    </div>
                    <div>
                        <label class="block text-xs mb-1 text-secondary">Selesai</label>
                        <input type="time" id="input-krs-end" class="w-full border-outline-variant rounded-lg p-2 focus:ring-primary focus:border-primary"/>
                    </div>
                </div>

                <div class="flex justify-end gap-2">
                    <button onclick="window.KrsDraftView.closeCourseModal()" class="px-4 py-2 text-secondary hover:bg-surface-container-high rounded-lg transition-colors">Batal</button>
                    <button onclick="window.KrsDraftView.saveCourse()" class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">Simpan</button>
                </div>
            </div>
        </div>
        `;
    },

    init: function(container) {
        this.updateView();
        this.listener = () => this.updateView();
        window.appStore.subscribe(this.listener);

        window.KrsDraftView.deleteCourse = (id) => window.appStore.deleteKrsCourse(id);
        
        window.KrsDraftView.clearKrs = () => {
            if(window.appStore.data.krsPlan.length === 0) return;
            window.app.showConfirm("Anda yakin ingin menghapus semua draf KRS?", (res) => { 
                if(res) window.appStore.clearKrsPlan();
            }, {isDanger: true});
        };

        window.KrsDraftView.commitKrsToFixed = () => {
            if(window.appStore.data.krsPlan.length === 0) {
                window.app.showToast('Draf KRS masih kosong', 'error');
                return;
            }
            const krsPlan = window.appStore.data.krsPlan || [];
            const semesters = window.appStore.data.semesters || [];
            let limit = 24;
            const hasAnyCourse = semesters.some(s => s.courses && s.courses.length > 0);
            if (hasAnyCourse) {
                const lastIps = window.AcademicLogic.getLastValidIps(semesters);
                limit = window.AcademicLogic.getJatahSKS(lastIps);
            }
            limit += (window.appStore.data.krsExtraSks || 0);
            const totalSksTaken = krsPlan.reduce((sum, c) => sum + parseInt(c.sks), 0);
            
            if (totalSksTaken > limit) {
                window.app.showToast(`Gagal Finalisasi: Total SKS (${totalSksTaken}) melebihi jatah maksimum (${limit} SKS)!`, 'error');
                return;
            }

            window.app.showConfirm("Sah-kan draf KRS ini menjadi Semester Aktif? Matkul akan dipindah ke KRS Tersimpan.", (res) => { 
                if(res) { 
                    if (window.appStore.commitKrsToFixed()) {
                        window.app.showToast('KRS berhasil di-finalisasi!');
                        window.app.navigate('krs-fixed');
                    }
                } 
            });
        };
    },

    unsubscribe: function() {
        if (this.listener) {
            window.appStore.listeners = window.appStore.listeners.filter(l => l !== this.listener);
        }
    },

    updateView: function() {
        const krsPlan = window.appStore.data.krsPlan || [];
        const semesters = window.appStore.data.semesters || [];
        
        // SKS Limit calculations
        let limit = 24;
        let lastIps = 0;
        
        const hasAnyCourse = semesters.some(s => s.courses && s.courses.length > 0);
        if (hasAnyCourse) {
            lastIps = window.AcademicLogic.getLastValidIps(semesters);
            limit = window.AcademicLogic.getJatahSKS(lastIps);
        }
        
        const ipsEl = document.getElementById('krs-prev-ips');
        if (ipsEl) ipsEl.innerText = lastIps.toFixed(2);
        
        limit += (window.appStore.data.krsExtraSks || 0);
        const limitEl = document.getElementById('krs-sks-limit');
        if (limitEl) limitEl.innerText = limit;
        
        const totalSksTaken = krsPlan.reduce((sum, crs) => sum + parseInt(crs.sks), 0);
        const takenEl = document.getElementById('krs-sks-taken');
        if (takenEl) takenEl.innerText = totalSksTaken;

        const bar = document.getElementById('krs-sks-bar');
        const warning = document.getElementById('krs-sks-warning');

        // Extra SKS button
        const extraBtn = document.getElementById('krs-extra-sks-btn');
        if (extraBtn) {
            if (window.appStore.data.krsExtraSks) {
                extraBtn.className = 'ml-auto px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 bg-surface-container text-secondary border-outline-variant hover:bg-surface-container-high';
                extraBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">check_circle</span> Bantuan +1 SKS Aktif';
            } else {
                extraBtn.className = 'ml-auto px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 bg-primary text-white border-primary shadow-sm hover:bg-primary-container';
                extraBtn.innerHTML = '<span class="material-symbols-outlined text-[14px]">add_circle</span> Bantuan +1 SKS Khusus';
            }
        }
        
        if (bar) {
            let pct = (totalSksTaken / limit) * 100;
            if (pct > 100) pct = 100;
            bar.style.width = pct + '%';
            
            if (totalSksTaken > limit) {
                bar.classList.replace('bg-primary', 'bg-danger-red');
                if (takenEl) takenEl.classList.replace('text-primary', 'text-danger-red');
                if (warning) warning.classList.remove('hidden');
            } else {
                bar.classList.replace('bg-danger-red', 'bg-primary');
                if (takenEl) takenEl.classList.replace('text-danger-red', 'text-primary');
                if (warning) warning.classList.add('hidden');
            }
        }

        const listEl = document.getElementById('krs-list');
        const emptyEl = document.getElementById('krs-empty');
        const tableEl = document.getElementById('krs-table');
        
        if (listEl && emptyEl && tableEl) {
            if (krsPlan.length === 0) {
                tableEl.classList.add('hidden');
                emptyEl.classList.remove('hidden');
            } else {
                emptyEl.classList.add('hidden');
                tableEl.classList.remove('hidden');
                listEl.innerHTML = krsPlan.map(crs => {
                    const scheduleText = crs.day && crs.timeStart && crs.timeEnd ? `${crs.day}, ${crs.timeStart}-${crs.timeEnd}` : '<span class="italic text-outline">Belum diatur</span>';
                    return `
                    <tr class="border-b border-surface-border/50 hover:bg-surface-container-low transition-colors">
                        <td class="py-4 px-6 font-bold text-secondary opacity-70">${crs.code}</td>
                        <td class="py-4 px-6 font-bold text-on-surface">${crs.name}</td>
                        <td class="py-4 px-6 text-sm text-secondary">${scheduleText}</td>
                        <td class="py-4 px-6 text-center font-bold text-secondary">${crs.sks}</td>
                        <td class="py-4 px-6 text-right">
                            <button onclick="window.KrsDraftView.editCourse('${crs.id}')" class="text-outline hover:text-primary hover:bg-primary-container p-2 rounded-lg transition-colors mr-1">
                                <span class="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button onclick="window.KrsDraftView.deleteCourse('${crs.id}')" class="text-outline hover:text-danger-red hover:bg-error-container p-2 rounded-lg transition-colors">
                                <span class="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                        </td>
                    </tr>
                `}).join('');
            }
        }
    },

    editCourseId: null,

    editCourse: function(id) {
        const course = window.appStore.data.krsPlan.find(c => c.id === id);
        if (course) {
            this.editCourseId = id;
            document.getElementById('input-krs-code').value = course.code;
            document.getElementById('input-krs-name').value = course.name;
            document.getElementById('input-krs-sks').value = course.sks;
            document.getElementById('input-krs-day').value = course.day || '';
            document.getElementById('input-krs-start').value = course.timeStart || '';
            document.getElementById('input-krs-end').value = course.timeEnd || '';
            document.getElementById('modal-krs-course').classList.remove('hidden');
        }
    },

    openCourseModal: function() {
        this.editCourseId = null;
        document.getElementById('input-krs-code').value = '';
        document.getElementById('input-krs-name').value = '';
        document.getElementById('input-krs-sks').value = '3';
        document.getElementById('input-krs-day').value = '';
        document.getElementById('input-krs-start').value = '';
        document.getElementById('input-krs-end').value = '';
        document.getElementById('modal-krs-course').classList.remove('hidden');
    },
    
    closeCourseModal: function() {
        document.getElementById('modal-krs-course').classList.add('hidden');
    },

    handleCourseCodeInput: function(inputEl) {
        const start = inputEl.selectionStart;
        const end = inputEl.selectionEnd;
        inputEl.value = inputEl.value.toUpperCase();
        inputEl.setSelectionRange(start, end);
    },

    saveCourse: function() {
        const code = document.getElementById('input-krs-code').value.trim();
        const name = document.getElementById('input-krs-name').value.trim();
        const sks = document.getElementById('input-krs-sks').value;
        const day = document.getElementById('input-krs-day').value;
        const timeStart = document.getElementById('input-krs-start').value;
        const timeEnd = document.getElementById('input-krs-end').value;

        if (code && name) {
            const krsPlan = window.appStore.data.krsPlan || [];
            const semesters = window.appStore.data.semesters || [];
            let limit = 24;
            const hasAnyCourse = semesters.some(s => s.courses && s.courses.length > 0);
            if (hasAnyCourse) {
                const lastIps = window.AcademicLogic.getLastValidIps(semesters);
                limit = window.AcademicLogic.getJatahSKS(lastIps);
            }
            limit += (window.appStore.data.krsExtraSks || 0);
            
            const isEditing = !!this.editCourseId;
            const originalCourse = isEditing ? krsPlan.find(c => c.id === this.editCourseId) : null;
            const originalSks = originalCourse ? parseInt(originalCourse.sks) : 0;
            
            let totalSksTaken = krsPlan.reduce((sum, c) => sum + parseInt(c.sks), 0);
            if (isEditing) totalSksTaken -= originalSks;
            const addedSks = parseInt(sks);
            
            if (totalSksTaken + addedSks > limit) {
                window.app.showToast(`Gagal: Melebihi jatah maksimum ${limit} SKS!`, 'error');
                return;
            }

            if (isEditing) {
                window.appStore.updateKrsCourse(this.editCourseId, { code, name, sks, day, timeStart, timeEnd });
                window.app.showToast('Mata kuliah berhasil diperbarui');
            } else {
                window.appStore.addKrsCourse({ code, name, sks, day, timeStart, timeEnd });
                window.app.showToast('Mata kuliah ditambahkan ke draf KRS');
            }
            window.KrsDraftView.closeCourseModal();
        } else {
            window.app.showAlert("Kode dan Nama mata kuliah harus diisi");
        }
    },

    toggleExtraSks: function() {
        const current = window.appStore.data.krsExtraSks || 0;
        if (current > 0) {
            window.appStore.data.krsExtraSks = 0;
            window.appStore.saveLocal();
            this.updateView();
            window.app.showToast('Bantuan SKS dinonaktifkan.');
        } else {
            window.app.showConfirm(
                "Apakah Anda yakin? Opsi ini biasanya digunakan jika Anda mendapatkan dispensasi untuk mengambil +1 SKS lebih banyak dari jatah normal IPS.",
                (res) => {
                    if (res) {
                        window.appStore.data.krsExtraSks = 1;
                        window.appStore.saveLocal();
                        this.updateView();
                        window.app.showToast('Bantuan +1 SKS diaktifkan!');
                    }
                }
            );
        }
    }
};
