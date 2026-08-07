window.KrsView = {
    title: 'Kartu Rencana Studi (KRS)',

    render: function() {
        return `
        <div class="max-w-container-max mx-auto pb-12">
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-lg">
                <div>
                    <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Kartu Rencana Studi (KRS)</h3>
                    <p class="text-secondary font-body-md text-body-md">Kelola rencana studi Anda sebelum disahkan menjadi riwayat semester.</p>
                </div>
            </div>

            <!-- Fixed KRS Section (Active Semester) -->
            <div id="krs-fixed-container" class="mb-12">
                <div class="bg-tertiary/10 border border-tertiary/20 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span class="material-symbols-outlined text-[120px]">school</span>
                    </div>
                    
                    <div class="relative z-10 flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-symbols-outlined text-tertiary">verified</span>
                            <h5 class="text-tertiary font-headline-md font-bold uppercase tracking-wider">KRS TERSIMPAN (SEMESTER AKTIF)</h5>
                        </div>
                        <p class="text-on-surface-variant font-body-sm max-w-2xl mb-4">Mata kuliah di bawah ini adalah mata kuliah yang sah sedang Anda jalani. Daftar To-do List akan mengambil referensi dari tabel ini.</p>
                        
                        <div class="flex flex-wrap items-center gap-4">
                            <button onclick="window.KrsView.cancelFixedKrs()" class="bg-surface-container-lowest text-danger-red border border-danger-red/20 px-4 py-2 rounded-lg font-label-md hover:bg-error-container transition-colors text-sm">
                                Batalkan Finalisasi
                            </button>
                            <button onclick="window.app.navigate('calculator')" class="bg-tertiary text-on-tertiary px-6 py-2 rounded-lg font-label-md flex items-center gap-2 shadow-sm hover:opacity-90 transition-all text-sm">
                                Hitung Draft Nilai Akhir
                                <span class="material-symbols-outlined text-sm">calculate</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="mt-6 bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left font-body-sm border-collapse min-w-[600px]">
                            <thead>
                                <tr class="border-b border-surface-border text-secondary font-label-md uppercase tracking-wider text-[11px] bg-surface-container-low/50">
                                    <th class="py-4 px-6 w-32">Kode</th>
                                    <th class="py-4 px-6">Nama Mata Kuliah</th>
                                    <th class="py-4 px-6 text-center w-24">SKS</th>
                                    <th class="py-4 px-6 text-center w-32">Status</th>
                                </tr>
                            </thead>
                            <tbody id="krs-fixed-list">
                                <!-- Injected -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Draft KRS Section -->
            <div id="krs-draft-container">
                <!-- SKS Quota Indicator -->
                <div class="bg-surface-container-lowest border border-surface-border p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span class="material-symbols-outlined text-[120px]">edit_document</span>
                    </div>
                    
                    <div class="relative z-10 flex-1">
                        <h5 class="text-secondary font-label-md uppercase tracking-wider mb-2">RENCANA KRS (DRAFT) - SKS Anda</h5>
                        <div class="flex items-center flex-wrap gap-2 mb-4">
                            <div class="flex items-end gap-2">
                                <span class="font-headline-xl text-headline-xl text-primary" id="krs-sks-taken">0</span>
                                <span class="font-headline-md text-secondary">/</span>
                                <span class="font-headline-md text-secondary" id="krs-sks-limit">24</span>
                                <span class="text-secondary font-bold ml-1">SKS Terencana</span>
                            </div>
                            
                            <button onclick="window.appStore.addKrsExtraSks()" class="ml-auto px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${window.appStore.data.krsExtraSks ? 'bg-surface-container text-secondary border-outline-variant hover:bg-surface-container-high' : 'bg-primary text-white border-primary shadow-sm hover:bg-primary-container'}" title="Klik untuk mengaktifkan/mematikan kuota tambahan dari Dosen PA">
                                ${window.appStore.data.krsExtraSks ? '<span class="material-symbols-outlined text-[14px]">check_circle</span> Bantuan +1 SKS Aktif' : '<span class="material-symbols-outlined text-[14px]">add_circle</span> Bantuan +1 SKS Khusus'}
                            </button>
                        </div>
                        
                        <div class="h-4 bg-surface-container-highest rounded-full overflow-hidden mt-4">
                            <div id="krs-sks-bar" class="h-full bg-primary transition-all duration-500" style="width: 0%"></div>
                        </div>
                        <p id="krs-sks-warning" class="text-danger-red font-bold text-sm mt-2 hidden flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">warning</span> Peringatan: Melebihi Jatah SKS!
                        </p>
                    </div>

                    <div class="relative z-10 flex flex-col items-end gap-3">
                        <div class="bg-surface-container-high p-4 rounded-xl border border-surface-border md:w-64 text-right">
                            <p class="text-xs text-secondary font-bold uppercase mb-1">Berdasarkan IPS Sebelumnya:</p>
                            <p class="font-headline-md text-on-surface" id="krs-prev-ips">0.00</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.KrsView.clearKrs()" class="text-danger-red px-4 py-2 rounded-lg font-label-md hover:bg-error-container transition-colors text-sm border border-danger-red/20">
                                Reset
                            </button>
                            <button onclick="window.KrsView.commitKrsToFixed()" class="bg-primary text-white px-4 py-2 rounded-lg font-label-md hover:opacity-90 transition-opacity text-sm shadow-sm flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">done_all</span> Finalisasi KRS
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Planned Courses Table -->
                <div class="bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-surface-border flex justify-between items-center bg-surface-container-lowest">
                        <h4 class="font-headline-md text-headline-md text-on-surface">Daftar Draf Matkul</h4>
                        <button onclick="window.KrsView.openCourseModal()" class="text-primary font-bold hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm border border-primary/20">
                            <span class="material-symbols-outlined text-[18px]">add</span> Tambah Matkul
                        </button>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-left font-body-sm border-collapse min-w-[600px]" id="krs-table">
                            <thead>
                                <tr class="border-b border-surface-border text-secondary font-label-md uppercase tracking-wider text-[11px] bg-surface-container-low/50">
                                    <th class="py-4 px-6 w-32">Kode</th>
                                    <th class="py-4 px-6">Nama Mata Kuliah</th>
                                    <th class="py-4 px-6 text-center w-24">SKS</th>
                                    <th class="py-4 px-6 text-right w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="krs-list">
                                <!-- Injected -->
                            </tbody>
                        </table>
                    </div>
                    <div id="krs-empty" class="hidden p-12 text-center flex flex-col items-center">
                        <div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-4">
                            <span class="material-symbols-outlined text-4xl">inbox</span>
                        </div>
                        <p class="text-secondary font-body-md mb-4">Draf KRS masih kosong.</p>
                        <button onclick="window.KrsView.openCourseModal()" class="bg-primary text-white px-6 py-2.5 rounded-lg font-label-md hover:opacity-90 transition-all">
                            Mulai Susun Draf
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Tambah Matkul KRS -->
        <div id="modal-krs-course" class="fixed inset-0 z-[100] hidden bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center">
            <div class="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
                <h3 class="font-headline-md text-primary mb-4">Tambah Draf Matkul</h3>
                
                <label class="block text-sm mb-1 text-secondary">Kode Matkul</label>
                <input type="text" id="input-krs-code" oninput="window.KrsView.handleCourseCodeInput(this)" onkeydown="if(event.key==='Enter') window.KrsView.saveCourse()" class="w-full border-outline-variant rounded-lg p-2 mb-3 focus:ring-primary focus:border-primary" placeholder="Misal: IF101"/>
                
                <label class="block text-sm mb-1 text-secondary">Nama Matkul</label>
                <input type="text" id="input-krs-name" onkeydown="if(event.key==='Enter') window.KrsView.saveCourse()" class="w-full border-outline-variant rounded-lg p-2 mb-3 focus:ring-primary focus:border-primary" placeholder="Misal: Kalkulus I"/>
                
                <label class="block text-sm mb-1 text-secondary">SKS</label>
                <input type="number" id="input-krs-sks" onkeydown="if(event.key==='Enter') window.KrsView.saveCourse()" class="w-full border-outline-variant rounded-lg p-2 mb-6 focus:ring-primary focus:border-primary" min="1" max="6" value="3"/>

                <div class="flex justify-end gap-2">
                    <button onclick="window.KrsView.closeCourseModal()" class="px-4 py-2 text-secondary hover:bg-surface-container-high rounded-lg transition-colors">Batal</button>
                    <button onclick="window.KrsView.saveCourse()" class="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">Simpan</button>
                </div>
            </div>
        </div>
        `;
    },

    init: function(container) {
        this.updateView();
        this.listener = () => this.updateView();
        window.appStore.subscribe(this.listener);

        window.KrsView.deleteCourse = (id) => {
            window.appStore.deleteKrsCourse(id);
        };
        
        window.KrsView.clearKrs = () => {
            if(window.appStore.data.krsPlan.length === 0) return;
            window.app.showConfirm("Anda yakin ingin menghapus semua draf KRS?", (res) => { 
                if(res) { 
                    window.appStore.clearKrsPlan();
                } 
            }, {isDanger: true});
        };

        window.KrsView.commitKrsToFixed = () => {
            if(window.appStore.data.krsPlan.length === 0) {
                window.app.showToast('Draf KRS masih kosong', 'error');
                return;
            }
            
            // Validasi limit SKS
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
                    }
                } 
            });
        };

        window.KrsView.cancelFixedKrs = () => {
            window.app.showConfirm("Kembalikan matkul dari KRS Tersimpan ke status Draf?", (res) => { 
                if(res) { 
                    if (window.appStore.cancelFixedKrs()) {
                        window.app.showToast('KRS dikembalikan ke draf.');
                    }
                }
            }, {isDanger: true});
        };
    },

    unsubscribe: function() {
        if (this.listener) {
            window.appStore.listeners = window.appStore.listeners.filter(l => l !== this.listener);
        }
    },

    updateView: function() {
        const krsPlan = window.appStore.data.krsPlan || [];
        const krsFixed = window.appStore.data.krsFixed || [];
        const semesters = window.appStore.data.semesters || [];
        
        // --- 1. FIXED SECTION ---
        const fixedContainer = document.getElementById('krs-fixed-container');
        if (krsFixed.length === 0) {
            fixedContainer.style.display = 'none';
        } else {
            fixedContainer.style.display = 'block';
            const fixedListEl = document.getElementById('krs-fixed-list');
            fixedListEl.innerHTML = krsFixed.map(crs => `
                <tr class="border-b border-surface-border/50 hover:bg-surface-container-low transition-colors">
                    <td class="py-4 px-6 font-bold text-secondary opacity-70">${crs.code}</td>
                    <td class="py-4 px-6 font-bold text-on-surface">${crs.name}</td>
                    <td class="py-4 px-6 text-center font-bold text-secondary">${crs.sks}</td>
                    <td class="py-4 px-6 text-center">
                        <span class="px-3 py-1 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded-full font-bold text-xs uppercase inline-block">Aktif</span>
                    </td>
                </tr>
            `).join('');
        }

        // --- 2. DRAFT SECTION ---
        const draftContainer = document.getElementById('krs-draft-container');
        // If fixed is not empty, you might want to hide draft or just keep it below.
        // We will keep it visible so they can plan next semester while currently in one, or just hide if they shouldn't.
        // Let's keep it visible.

        // Calculate limit based on previous semester IPS
        let limit = 24; // Default
        let lastIps = 0;
        const hasAnyCourse = semesters.some(s => s.courses && s.courses.length > 0);
        
        if (hasAnyCourse) {
            lastIps = window.AcademicLogic.getLastValidIps(semesters);
            limit = window.AcademicLogic.getJatahSKS(lastIps);
        }
        limit += (window.appStore.data.krsExtraSks || 0);

        const totalSksTaken = krsPlan.reduce((sum, c) => sum + parseInt(c.sks), 0);
        
        document.getElementById('krs-prev-ips').innerText = lastIps > 0 ? lastIps.toFixed(2) : '-';
        document.getElementById('krs-sks-limit').innerText = limit;
        document.getElementById('krs-sks-taken').innerText = totalSksTaken;
        
        const bar = document.getElementById('krs-sks-bar');
        const warning = document.getElementById('krs-sks-warning');
        
        let pct = (totalSksTaken / limit) * 100;
        if (pct > 100) pct = 100;
        
        bar.style.width = pct + '%';
        
        if (totalSksTaken > limit) {
            bar.classList.replace('bg-primary', 'bg-danger-red');
            document.getElementById('krs-sks-taken').classList.replace('text-primary', 'text-danger-red');
            warning.classList.remove('hidden');
        } else {
            bar.classList.replace('bg-danger-red', 'bg-primary');
            document.getElementById('krs-sks-taken').classList.replace('text-danger-red', 'text-primary');
            warning.classList.add('hidden');
        }

        const listEl = document.getElementById('krs-list');
        const emptyEl = document.getElementById('krs-empty');
        const tableEl = document.getElementById('krs-table');
        
        if (krsPlan.length === 0) {
            tableEl.classList.add('hidden');
            emptyEl.classList.remove('hidden');
        } else {
            emptyEl.classList.add('hidden');
            tableEl.classList.remove('hidden');
            
            listEl.innerHTML = krsPlan.map(crs => `
                <tr class="border-b border-surface-border/50 hover:bg-surface-container-low transition-colors">
                    <td class="py-4 px-6 font-bold text-secondary opacity-70">${crs.code}</td>
                    <td class="py-4 px-6 font-bold text-on-surface">${crs.name}</td>
                    <td class="py-4 px-6 text-center font-bold text-secondary">${crs.sks}</td>
                    <td class="py-4 px-6 text-right">
                        <button onclick="window.KrsView.deleteCourse('${crs.id}')" class="text-outline hover:text-danger-red hover:bg-error-container p-2 rounded-lg transition-colors">
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    },

    // Course Modal
    openCourseModal: function() {
        document.getElementById('input-krs-code').value = '';
        document.getElementById('input-krs-name').value = '';
        document.getElementById('input-krs-sks').value = '3';
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
        
        // Auto fill if found
        const code = inputEl.value.trim();
        const nameInput = document.getElementById('input-krs-name');
        const sksInput = document.getElementById('input-krs-sks');
        if (code.length >= 3) {
            const semesters = window.appStore.data.semesters;
            for (let sem of semesters) {
                const found = sem.courses.find(c => c.code === code);
                if (found) {
                    nameInput.value = found.name;
                    sksInput.value = found.sks;
                    nameInput.classList.add('border-primary', 'bg-primary/5');
                    setTimeout(() => nameInput.classList.remove('border-primary', 'bg-primary/5'), 1000);
                    break;
                }
            }
        }
    },
    
    saveCourse: function() {
        const code = document.getElementById('input-krs-code').value.trim();
        const name = document.getElementById('input-krs-name').value.trim();
        const sks = document.getElementById('input-krs-sks').value;

        if (code && name) {
            // Validasi limit SKS
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
            const addedSks = parseInt(sks);
            
            if (totalSksTaken + addedSks > limit) {
                window.app.showToast(`Gagal: Melebihi jatah maksimum ${limit} SKS!`, 'error');
                return;
            }

            window.appStore.addKrsCourse({ code, name, sks });
            window.KrsView.closeCourseModal();
            window.app.showToast('Mata kuliah ditambahkan ke draf KRS');
        } else {
            window.app.showAlert("Kode dan Nama mata kuliah harus diisi");
        }
    },

        // History Modal logic removed
};
