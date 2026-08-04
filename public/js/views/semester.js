window.SemesterView = {
    title: 'Riwayat KRS & Semester',
    
    render: function() {
        return `
        <div class="max-w-container-max mx-auto pb-12">
            <!-- Header Section -->
            <div class="flex justify-between items-end mb-lg">
                <div>
                    <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Riwayat Semester & Kartu Hasil Studi</h3>
                    <p class="text-secondary font-body-md text-body-md">Kelola nilai mata kuliah Anda per semester.</p>
                </div>
                <button onclick="window.SemesterView.openSemesterModal()" class="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all">
                    <span class="material-symbols-outlined text-sm">add</span>
                    Tambah Semester Baru
                </button>
            </div>

            <!-- Semester Cards Container -->
            <div class="space-y-8" id="semesters-list">
                <!-- Injected via JS -->
            </div>
            
            <div id="semesters-empty" class="hidden mt-lg border-2 border-dashed border-outline-variant rounded-xl p-xl text-center flex flex-col items-center">
                <div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-4">
                    <span class="material-symbols-outlined text-4xl">auto_stories</span>
                </div>
                <h5 class="font-headline-md text-headline-md text-on-surface mb-2">Belum ada riwayat semester</h5>
                <p class="text-body-md text-secondary max-w-md mx-auto mb-6">Tambahkan riwayat semester Anda untuk mulai menghitung IPS dan IPK.</p>
                <button onclick="window.SemesterView.openSemesterModal()" class="bg-surface-container-highest text-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                    TAMBAH SEMESTER BARU
                </button>
            </div>
        </div>
        
        <!-- Modal: Tambah Semester -->
        <div id="modal-semester" class="fixed inset-0 z-[100] hidden bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center">
            <div class="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 class="font-headline-md text-primary mb-4">Tambah Semester</h3>
                <input type="text" id="input-sem-name" class="w-full border-outline-variant rounded-lg p-2 mb-4" placeholder="Misal: Semester 10"/>
                <div class="flex justify-end gap-2">
                    <button onclick="window.SemesterView.closeSemesterModal()" class="px-4 py-2 text-secondary hover:bg-surface-container-high rounded-lg">Batal</button>
                    <button onclick="window.SemesterView.saveSemester()" class="px-4 py-2 bg-primary text-white rounded-lg">Simpan</button>
                </div>
            </div>
        </div>

        <!-- Modal: Tambah Matkul -->
        <div id="modal-course" class="fixed inset-0 z-[100] hidden bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center">
            <div class="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-6">
                <h3 id="modal-course-title" class="font-headline-md text-primary mb-4">Tambah Mata Kuliah</h3>
                <input type="hidden" id="input-crs-semid"/>
                <input type="hidden" id="input-crs-id"/>
                
                <label class="block text-sm mb-1 text-secondary">Kode Matkul</label>
                <input type="text" id="input-crs-code" oninput="window.SemesterView.handleCourseCodeInput(this)" class="w-full border-outline-variant rounded-lg p-2 mb-3" placeholder="Misal: IF101"/>
                
                <label class="block text-sm mb-1 text-secondary">Nama Matkul</label>
                <input type="text" id="input-crs-name" class="w-full border-outline-variant rounded-lg p-2 mb-3" placeholder="Misal: Kalkulus I"/>
                
                <div class="flex gap-4 mb-4">
                    <div class="w-1/4">
                        <label class="block text-sm mb-1 text-secondary">SKS</label>
                        <input type="number" id="input-crs-sks" class="w-full border-outline-variant rounded-lg p-2" min="1" max="6" value="3"/>
                    </div>
                    <div class="w-1/3">
                        <label class="block text-sm mb-1 text-secondary whitespace-nowrap">Skor (0-100)</label>
                        <input type="number" step="0.01" id="input-crs-score" oninput="window.SemesterView.handleScoreInput(this)" class="w-full border-outline-variant rounded-lg p-2" min="0" max="100" placeholder="0-100"/>
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm mb-1 text-secondary">Grade</label>
                        <input type="text" id="input-crs-grade" class="w-full border-outline-variant rounded-lg p-2 bg-surface-container-high opacity-70 cursor-not-allowed font-bold text-center text-primary" readonly value="E"/>
                    </div>
                </div>

                <div class="flex justify-end gap-2">
                    <button onclick="window.SemesterView.closeCourseModal()" class="px-4 py-2 text-secondary hover:bg-surface-container-high rounded-lg">Batal</button>
                    <button onclick="window.SemesterView.saveCourse()" class="px-4 py-2 bg-primary text-white rounded-lg">Simpan</button>
                </div>
            </div>
        </div>
        `;
    },

    init: function(container) {
        this.updateView();
        
        this.listener = () => this.updateView();
        window.appStore.subscribe(this.listener);

        window.SemesterView.deleteCourse = (semId, crsId) => {
            if (confirm("Hapus mata kuliah ini?")) {
                window.appStore.deleteCourse(semId, crsId);
            }
        };

        window.SemesterView.deleteSemester = (semId) => {
            if (confirm("Hapus semester beserta semua mata kuliah di dalamnya?")) {
                window.appStore.deleteSemester(semId);
            }
        };
    },

    unsubscribe: function() {
        if (this.listener) {
            window.appStore.listeners = window.appStore.listeners.filter(l => l !== this.listener);
        }
    },

    updateView: function() {
        const semesters = window.appStore.data.semesters;
        const listContainer = document.getElementById('semesters-list');
        const emptyContainer = document.getElementById('semesters-empty');

        if (semesters.length === 0) {
            listContainer.innerHTML = '';
            emptyContainer.classList.remove('hidden');
        } else {
            emptyContainer.classList.add('hidden');
            
            // We use original chronological order
            listContainer.innerHTML = semesters.map((sem, index) => {
                const ips = window.AcademicLogic.calculateIPS(sem.courses);
                
                // Calculate Jatah SKS for CURRENT semester (based on previous semester IPS)
                let currentSksLimit = 24; // Default if first semester or no limit defined
                if (index > 0) {
                    const prevIps = window.AcademicLogic.calculateIPS(semesters[index - 1].courses);
                    currentSksLimit = window.AcademicLogic.getJatahSKS(prevIps);
                }

                // Calculate Jatah SKS DEPAN (based on this semester IPS)
                const nextSksLimit = window.AcademicLogic.getJatahSKS(ips);

                const currentSksTotal = sem.courses.reduce((sum, c) => sum + parseInt(c.sks), 0);
                const isOverLimit = currentSksTotal > currentSksLimit;
                
                let coursesHtml = '';
                if (sem.courses.length === 0) {
                    coursesHtml = '<div class="p-md text-center text-secondary italic font-body-sm">Belum ada mata kuliah.</div>';
                } else {
                    coursesHtml = `
                    <div class="overflow-x-auto">
                        <table class="w-full text-left font-body-sm text-body-sm border-collapse min-w-[600px]">
                            <thead>
                                <tr class="border-b border-surface-border text-secondary font-label-md uppercase tracking-wider text-[11px]">
                                    <th class="py-4 px-4 w-32">Kode</th>
                                    <th class="py-4 px-4">Nama Mata Kuliah</th>
                                    <th class="py-4 px-4 text-center w-20">SKS</th>
                                    <th class="py-4 px-4 text-center w-24">SKOR</th>
                                    <th class="py-4 px-4 text-center w-24">GRADE</th>
                                    <th class="py-4 px-4 text-center w-24">BOBOT</th>
                                    <th class="py-4 px-4 text-right w-24"></th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sem.courses.map(crs => {
                                    const isFailed = crs.grade === 'D' || crs.grade === 'E';
                                    const badgeColor = isFailed ? 'bg-danger-red/10 text-danger-red border-danger-red/20' : (crs.grade.startsWith('A') ? 'bg-success-green/10 text-success-green border-success-green/20' : 'bg-primary/10 text-primary border-primary/20');
                                    
                                    const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(crs.grade);
                                    const bobot = gradeInfo ? gradeInfo.gpa.toFixed(2) : '0.00';
                                    
                                    let retakeHtml = '';
                                    if (crs.isRetaken) {
                                        retakeHtml = '<span class="inline-block mt-1 px-2 py-0.5 bg-warning-amber/10 text-warning-amber text-[10px] font-bold rounded-full border border-warning-amber/20">MENGULANG (DIGANTIKAN)</span>';
                                    }

                                    return `
                                    <tr class="border-b border-surface-border/50 hover:bg-surface-container-lowest transition-colors">
                                        <td class="py-4 px-4 font-bold text-secondary opacity-70 flex items-center gap-2">
                                            ${crs.code}
                                        </td>
                                        <td class="py-4 px-4">
                                            <span class="block ${crs.isRetaken ? 'line-through text-outline' : 'font-bold text-on-surface'}">${crs.name}</span>
                                            ${retakeHtml}
                                        </td>
                                        <td class="py-4 px-4 text-center font-bold text-secondary">${crs.sks}</td>
                                        <td class="py-4 px-4 text-center font-bold text-on-surface">${crs.score !== undefined ? crs.score : '-'}</td>
                                        <td class="py-4 px-4 text-center">
                                            <span class="px-3 py-1 ${badgeColor} border rounded-full font-bold inline-block min-w-[32px] text-center">${crs.grade}</span>
                                        </td>
                                        <td class="py-4 px-4 text-center font-bold text-secondary">${bobot}</td>
                                        <td class="py-4 px-4">
                                            <div class="flex items-center justify-end gap-1">
                                                <button onclick="window.SemesterView.editCourseModal('${sem.id}', '${crs.id}')" class="text-outline hover:text-primary hover:bg-primary/10 p-1 rounded transition-colors" title="Edit">
                                                    <span class="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button onclick="window.SemesterView.deleteCourse('${sem.id}', '${crs.id}')" class="text-outline hover:text-danger-red hover:bg-error-container p-1 rounded transition-colors" title="Hapus">
                                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>`
                                }).join('')}
                            </tbody>
                        </table>
                    </div>`;
                }

                return `
                <div class="bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm overflow-hidden">
                    <!-- Custom Header Layout -->
                    <div class="p-6 border-b border-surface-border flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div class="flex flex-wrap items-center gap-3 md:gap-6">
                            <h4 class="font-headline-md text-headline-md text-on-surface font-bold min-w-[120px]">${sem.name}</h4>
                            
                            <!-- Current SKS Badge -->
                            <div class="px-3 py-1 ${isOverLimit ? 'bg-danger-red/10 text-danger-red border-danger-red/20' : 'bg-primary/10 text-primary border-primary/20'} rounded-full text-[11px] font-bold border whitespace-nowrap">
                                ${currentSksTotal} / ${currentSksLimit} SKS
                            </div>
                            
                            <!-- IPS Text -->
                            <div class="flex items-center gap-2 text-sm whitespace-nowrap">
                                <span class="text-secondary font-bold uppercase tracking-wider text-[11px]">IPS</span>
                                <span class="font-bold text-on-surface">${ips > 0 ? ips.toFixed(2) : '0.00'}</span>
                            </div>

                            <!-- Next Jatah Badge -->
                            <div class="px-3 py-1 bg-surface-container-highest text-secondary rounded-full text-[11px] font-bold border border-outline-variant whitespace-nowrap">
                                JATAH SKS DEPAN &nbsp;<span class="text-on-surface">${nextSksLimit}</span>
                            </div>
                        </div>

                        <!-- Delete Button -->
                        <button onclick="window.SemesterView.deleteSemester('${sem.id}')" class="text-danger-red hover:bg-error-container p-2 rounded-full transition-colors flex items-center justify-center self-end xl:self-auto" title="Hapus Semester">
                            <span class="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                    
                    <div class="p-2 md:p-6 pb-4">
                        ${coursesHtml}
                        
                        <!-- Inline Add Course Button -->
                        <div class="mt-4 border-t-2 border-primary/20 pt-4 px-4 inline-block">
                            <button onclick="window.SemesterView.openCourseModal('${sem.id}')" class="flex items-center gap-2 text-primary font-bold hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors text-sm">
                                <span class="material-symbols-outlined text-[18px]">add</span>
                                Tambah Mata Kuliah
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }
    },

    // Modal Handlers
    openSemesterModal: function() {
        document.getElementById('input-sem-name').value = '';
        document.getElementById('modal-semester').classList.remove('hidden');
    },
    closeSemesterModal: function() {
        document.getElementById('modal-semester').classList.add('hidden');
    },
    saveSemester: function() {
        const name = document.getElementById('input-sem-name').value.trim();
        if (name) {
            window.appStore.addSemester(name);
            this.closeSemesterModal();
            window.app.showToast('Semester ditambahkan');
        }
    },

    handleCourseCodeInput: function(inputEl) {
        // 1. Otomatis jadikan huruf besar (Capslock)
        inputEl.value = inputEl.value.toUpperCase();
        
        const code = inputEl.value.trim();
        const nameInput = document.getElementById('input-crs-name');
        const sksInput = document.getElementById('input-crs-sks');

        // Jika kode dihapus sampai kosong, bersihkan juga nama matkulnya
        if (code.length === 0) {
            if (!nameInput.dataset.manualEdit) {
                nameInput.value = '';
                sksInput.value = '3';
            }
            return;
        }

        // 2. Cari matkul yang sama dari riwayat sebelumnya
        if (code.length >= 3) {
            const semesters = window.appStore.data.semesters;
            for (let sem of semesters) {
                const found = sem.courses.find(c => c.code === code);
                if (found) {
                    // Auto-fill jika nama matkul belum diubah manual
                    if (!nameInput.dataset.manualEdit) {
                        nameInput.value = found.name;
                        sksInput.value = found.sks;
                        
                        // Efek visual sukses
                        nameInput.classList.add('border-primary', 'bg-primary/5');
                        setTimeout(() => nameInput.classList.remove('border-primary', 'bg-primary/5'), 1000);
                    }
                    break;
                }
            }
        }
    },

    handleScoreInput: function(inputEl) {
        if(inputEl.value === '') return;
        const score = parseFloat(inputEl.value);
        if(!isNaN(score)) {
            const gradeInfo = window.AcademicLogic.getGradeInfoFromScore(score);
            if(gradeInfo) {
                const selectEl = document.getElementById('input-crs-grade');
                selectEl.value = gradeInfo.letter;
                
                // Efek visual menandakan auto-select
                selectEl.classList.add('border-primary', 'bg-primary/5');
                setTimeout(() => selectEl.classList.remove('border-primary', 'bg-primary/5'), 1000);
            }
        }
    },

    openCourseModal: function(semId) {
        document.getElementById('modal-course-title').innerText = 'Tambah Mata Kuliah';
        document.getElementById('input-crs-semid').value = semId;
        document.getElementById('input-crs-id').value = '';
        document.getElementById('input-crs-code').value = '';
        document.getElementById('input-crs-name').value = '';
        document.getElementById('input-crs-name').dataset.manualEdit = '';
        document.getElementById('input-crs-name').oninput = function() { this.dataset.manualEdit = 'true'; };
        document.getElementById('input-crs-sks').value = '3';
        document.getElementById('input-crs-score').value = '';
        document.getElementById('input-crs-grade').value = 'E'; // Default kosong/E
        document.getElementById('modal-course').classList.remove('hidden');
    },
    editCourseModal: function(semId, crsId) {
        const semester = window.appStore.data.semesters.find(s => s.id === semId);
        if (semester) {
            const crs = semester.courses.find(c => c.id === crsId);
            if (crs) {
                document.getElementById('modal-course-title').innerText = 'Edit Mata Kuliah';
                document.getElementById('input-crs-semid').value = semId;
                document.getElementById('input-crs-id').value = crs.id;
                document.getElementById('input-crs-code').value = crs.code;
                document.getElementById('input-crs-name').value = crs.name;
                document.getElementById('input-crs-name').dataset.manualEdit = 'true';
                document.getElementById('input-crs-sks').value = crs.sks;
                document.getElementById('input-crs-score').value = crs.score || '';
                document.getElementById('input-crs-grade').value = crs.grade;
                document.getElementById('modal-course').classList.remove('hidden');
            }
        }
    },
    closeCourseModal: function() {
        document.getElementById('modal-course').classList.add('hidden');
    },
    saveCourse: function() {
        const semId = document.getElementById('input-crs-semid').value;
        const crsId = document.getElementById('input-crs-id').value;
        const code = document.getElementById('input-crs-code').value.trim();
        const name = document.getElementById('input-crs-name').value.trim();
        const sks = document.getElementById('input-crs-sks').value;
        const score = document.getElementById('input-crs-score').value;

        if (semId && code && name && score !== '') {
            const numericScore = parseFloat(score);
            const gradeInfo = window.AcademicLogic.getGradeInfoFromScore(numericScore);
            const grade = gradeInfo ? gradeInfo.letter : 'E'; // Kalkulasi paksa dari angka

            const courseData = { code, name, sks, grade, score: numericScore };

            if (crsId) {
                window.appStore.editCourse(semId, crsId, courseData);
                window.app.showToast('Mata kuliah diperbarui');
            } else {
                window.appStore.addCourse(semId, courseData);
                window.app.showToast('Mata kuliah ditambahkan');
            }
            this.closeCourseModal();
        } else {
            alert("Kode, Nama, dan Nilai Akhir mata kuliah harus diisi dengan lengkap");
        }
    }
};
