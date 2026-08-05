window.CalculatorView = {
    title: 'Kalkulator & Draf Nilai Aktif',
    
    render: function() {
        return `
        <div class="max-w-container-max mx-auto pb-12">
            
            <!-- List View -->
            <div id="calc-list-view">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Draft Penilaian Semester Aktif</h3>
                        <p class="text-secondary font-body-md text-body-md">Input dan simulasikan nilai untuk mata kuliah yang sedang Anda ambil semester ini.</p>
                    </div>
                    <div>
                        <button onclick="window.CalculatorView.openHistoryModal()" id="btn-to-history" class="bg-tertiary text-on-tertiary px-6 py-2 rounded-lg font-label-md flex items-center gap-2 shadow-sm hover:opacity-90 transition-all">
                            Pindahkan ke Riwayat Semester
                            <span class="material-symbols-outlined text-sm">history_edu</span>
                        </button>
                    </div>
                </div>

                <div id="calc-empty-state" class="hidden text-center py-16 bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm">
                    <span class="material-symbols-outlined text-6xl text-outline mb-4">school</span>
                    <h4 class="font-headline-md text-on-surface mb-2">Belum Ada Semester Aktif</h4>
                    <p class="text-secondary mb-6">Silakan susun dan finalisasi Rencana KRS Anda terlebih dahulu.</p>
                    <button onclick="window.app.navigate('krs')" class="bg-primary text-white px-6 py-2 rounded-lg">Ke Halaman KRS</button>
                </div>

                <!-- Summary Panel -->
                <div id="calc-summary-panel" class="hidden mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                </div>

                <div id="calc-course-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Injected -->
                </div>
            </div>

            <!-- Detailed Calculator View (Hidden by default) -->
            <div id="calc-detail-view" class="hidden">
                <button onclick="window.CalculatorView.closeDetail()" class="mb-6 flex items-center gap-2 text-secondary hover:text-primary transition-colors font-label-md">
                    <span class="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Daftar Matkul
                </button>
                
                <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h3 class="font-headline-lg text-headline-lg text-text-main mb-1" id="detail-course-name">Nama Matkul</h3>
                        <p class="font-body-md text-text-muted" id="detail-course-code">Kode Matkul</p>
                    </div>
                    <div class="bg-surface-container-high p-1 rounded-xl flex gap-1 self-start md:self-auto">
                        <button class="px-4 py-2 rounded-lg font-label-md text-label-md transition-all bg-surface-container-lowest text-primary shadow-sm" id="mode-forward">
                            Mode Kalkulasi
                        </button>
                        <button class="px-4 py-2 rounded-lg font-label-md text-label-md transition-all text-secondary hover:bg-surface-container-low" id="mode-reverse">
                            Mode Target
                        </button>
                    </div>
                </div>

                <div class="flex flex-col gap-6 max-w-2xl mx-auto w-full">
                    
                    <!-- Target Grade Input (Top in Target Mode) -->
                    <div class="space-y-4 hidden bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm" id="target-container">
                        <label class="font-headline-sm text-headline-sm text-primary block text-center mb-2">Target Nilai Akhir (Huruf)</label>
                        <div class="flex flex-wrap justify-center gap-3" id="target-buttons">
                            <button class="target-btn px-6 py-2 border border-surface-border rounded-lg font-bold text-on-primary bg-primary shadow-sm" data-target="A">A</button>
                            <button class="target-btn px-6 py-2 border border-surface-border rounded-lg font-bold text-primary hover:bg-primary-container/10 shadow-sm" data-target="A-">A-</button>
                            <button class="target-btn px-6 py-2 border border-surface-border rounded-lg font-bold text-primary hover:bg-primary-container/10 shadow-sm" data-target="B+">B+</button>
                            <button class="target-btn px-6 py-2 border border-surface-border rounded-lg font-bold text-primary hover:bg-primary-container/10 shadow-sm" data-target="B">B</button>
                            <button class="target-btn px-6 py-2 border border-surface-border rounded-lg font-bold text-primary hover:bg-primary-container/10 shadow-sm" data-target="B-">B-</button>
                            <button class="target-btn px-6 py-2 border border-surface-border rounded-lg font-bold text-primary hover:bg-primary-container/10 shadow-sm" data-target="C+">C+</button>
                            <button class="target-btn px-6 py-2 border border-surface-border rounded-lg font-bold text-primary hover:bg-primary-container/10 shadow-sm" data-target="C">C</button>
                        </div>
                    </div>

                    <!-- Diagram Panel (Middle) -->
                    <div class="bg-surface-container-lowest rounded-xl border border-surface-border overflow-hidden shadow-sm flex flex-col relative py-8 px-6">
                        <div class="relative z-10 flex flex-col items-center justify-center text-center">
                            <p class="font-label-md text-label-md text-text-muted mb-6 uppercase tracking-widest" id="result-label">Prediksi Nilai Akhir</p>
                            
                            <!-- Large Circular Display -->
                            <div class="relative w-56 h-56 flex items-center justify-center mb-8">
                                <svg class="w-full h-full transform -rotate-90">
                                    <circle class="text-surface-container" cx="112" cy="112" fill="transparent" r="96" stroke="currentColor" stroke-width="12"></circle>
                                    <circle class="text-primary transition-all duration-500 ease-out" cx="112" cy="112" fill="transparent" id="progress-circle" r="96" stroke="currentColor" stroke-dasharray="603" stroke-dashoffset="120" stroke-width="12"></circle>
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span class="font-headline-xl text-headline-xl text-primary" id="result-num" style="font-size: 56px; line-height: 1;">81.5</span>
                                    <div class="h-px w-12 bg-outline-variant my-2"></div>
                                    <span class="font-headline-lg text-headline-lg text-secondary" id="result-letter">A</span>
                                </div>
                            </div>
                            
                            <!-- Status Badge -->
                            <div id="status-badge" class="bg-success-green/10 text-success-green border border-success-green/20 px-6 py-2 rounded-full flex items-center gap-2 mb-4">
                                <span class="material-symbols-outlined text-sm">check_circle</span>
                                <span class="font-label-md text-label-md uppercase tracking-wider">Status: Lulus</span>
                            </div>
                            <div id="target-breakdown" class="text-primary font-bold text-center px-4"></div>
                        </div>
                    </div>

                    <!-- Cards Panel (Bottom) -->
                    <div class="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h4 class="font-headline-md text-headline-md text-primary">Komponen Nilai</h4>
                            <span class="material-symbols-outlined text-secondary">tune</span>
                        </div>
                        
                        <div class="space-y-4" id="calculator-inputs">
                            <!-- Tugas Card -->
                            <div class="p-4 border border-surface-border rounded-xl bg-surface-container-low transition-colors group" id="card-tugas">
                                <div class="flex justify-between items-center mb-4">
                                    <label class="flex items-center gap-2 cursor-pointer group-hover:text-primary transition-colors">
                                        <input type="checkbox" id="check-tugas" class="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary focus:ring-2">
                                        <span class="font-bold">Tugas & Kuis</span>
                                        <span class="text-xs text-secondary bg-surface-container px-2 py-0.5 rounded-full font-bold">30%</span>
                                    </label>
                                    <span class="text-xs font-bold text-success-green hidden" id="badge-tugas">KELUAR</span>
                                </div>
                                <div class="flex items-center gap-4">
                                    <input type="number" id="num-tugas" class="w-20 px-3 py-2 border border-outline-variant rounded-lg text-center font-bold text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none" min="0" max="100" value="85">
                                    <input id="input-tugas" max="100" min="0" type="range" value="85" class="flex-1 accent-primary h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer"/>
                                </div>
                            </div>

                            <!-- UTS Card -->
                            <div class="p-4 border border-surface-border rounded-xl bg-surface-container-low transition-colors group" id="card-uts">
                                <div class="flex justify-between items-center mb-4">
                                    <label class="flex items-center gap-2 cursor-pointer group-hover:text-primary transition-colors">
                                        <input type="checkbox" id="check-uts" class="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary focus:ring-2">
                                        <span class="font-bold">UTS</span>
                                        <span class="text-xs text-secondary bg-surface-container px-2 py-0.5 rounded-full font-bold">30%</span>
                                    </label>
                                    <span class="text-xs font-bold text-success-green hidden" id="badge-uts">KELUAR</span>
                                </div>
                                <div class="flex items-center gap-4">
                                    <input type="number" id="num-uts" class="w-20 px-3 py-2 border border-outline-variant rounded-lg text-center font-bold text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none" min="0" max="100" value="78">
                                    <input id="input-uts" max="100" min="0" type="range" value="78" class="flex-1 accent-primary h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer"/>
                                </div>
                            </div>

                            <!-- UAS Card -->
                            <div class="p-4 border border-surface-border rounded-xl bg-surface-container-low transition-colors group" id="card-uas">
                                <div class="flex justify-between items-center mb-4">
                                    <label class="flex items-center gap-2 cursor-pointer group-hover:text-primary transition-colors">
                                        <input type="checkbox" id="check-uas" class="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary focus:ring-2">
                                        <span class="font-bold">UAS</span>
                                        <span class="text-xs text-secondary bg-surface-container px-2 py-0.5 rounded-full font-bold">40%</span>
                                    </label>
                                    <span class="text-xs font-bold text-success-green hidden" id="badge-uas">KELUAR</span>
                                </div>
                                <div class="flex items-center gap-4">
                                    <input type="number" id="num-uas" class="w-20 px-3 py-2 border border-outline-variant rounded-lg text-center font-bold text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none" min="0" max="100" value="82">
                                    <input id="input-uas" max="100" min="0" type="range" value="82" class="flex-1 accent-primary h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal: Pindahkan ke Riwayat Semester -->
        <div id="modal-calc-history" class="fixed inset-0 z-[100] hidden bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center">
            <div class="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
                <div class="flex items-center gap-3 text-tertiary mb-2">
                    <span class="material-symbols-outlined text-3xl">history_edu</span>
                    <h3 class="font-headline-md text-on-surface">Pindahkan ke Riwayat</h3>
                </div>
                <p class="text-secondary text-sm mb-6">Pastikan semua draf nilai akhir mata kuliah sudah terisi dengan benar. Matkul ini akan disalin ke menu Manajemen Semester secara permanen.</p>
                
                <label class="block text-sm mb-1 text-secondary font-bold">Beri Nama Semester Ini</label>
                <input type="text" id="input-calc-semester-name" class="w-full border-outline-variant rounded-lg p-2 mb-6 focus:ring-tertiary focus:border-tertiary" placeholder="Misal: Semester 5 (Ganjil 2024)"/>

                <div class="flex justify-end gap-2">
                    <button onclick="window.CalculatorView.closeHistoryModal()" class="px-4 py-2 text-secondary hover:bg-surface-container-high rounded-lg transition-colors">Batal</button>
                    <button onclick="window.CalculatorView.moveToHistory()" class="px-4 py-2 bg-tertiary text-on-tertiary rounded-lg hover:opacity-90 transition-opacity">Selesai & Pindahkan</button>
                </div>
            </div>
        </div>
        `;
    },

    init: function(container) {
        this.currentMode = 'forward';
        this.currentTarget = 'A';
        this.selectedCourseId = null;

        // Elements
        this.elForward = document.getElementById('mode-forward');
        this.elReverse = document.getElementById('mode-reverse');
        this.elUasContainer = document.getElementById('uas-container');
        this.elTargetContainer = document.getElementById('target-container');
        this.elResultLabel = document.getElementById('result-label');
        
        this.elInputTugas = document.getElementById('input-tugas');
        this.elInputUts = document.getElementById('input-uts');
        this.elInputUas = document.getElementById('input-uas');
        
        this.elNumTugas = document.getElementById('num-tugas');
        this.elNumUts = document.getElementById('num-uts');
        this.elNumUas = document.getElementById('num-uas');
        
        this.elCheckTugas = document.getElementById('check-tugas');
        this.elCheckUts = document.getElementById('check-uts');
        this.elCheckUas = document.getElementById('check-uas');

        // Events
        this.elForward.addEventListener('click', () => this.setMode('forward'));
        this.elReverse.addEventListener('click', () => this.setMode('reverse'));
        
        ['tugas', 'uts', 'uas'].forEach(key => {
            const num = document.getElementById('num-' + key);
            const range = document.getElementById('input-' + key);
            const chk = document.getElementById('check-' + key);
            
            num.addEventListener('input', (e) => {
                let val = parseFloat(e.target.value);
                if (isNaN(val)) val = 0;
                range.value = val;
                this.calculate(true);
            });
            
            range.addEventListener('input', (e) => {
                num.value = e.target.value;
                this.calculate(true);
            });
            
            chk.addEventListener('change', () => {
                const badge = document.getElementById('badge-' + key);
                if (chk.checked) badge.classList.remove('hidden');
                else badge.classList.add('hidden');
                
                this.setMode(this.currentMode);
                this.calculate(true);
            });
        });

        document.querySelectorAll('.target-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTarget(e.target.getAttribute('data-target'));
            });
        });

        this.updateView();
        
        // Setup history modal functions
        window.CalculatorView.openHistoryModal = () => {
            const semCount = (window.appStore.data.semesters || []).length;
            document.getElementById('input-calc-semester-name').value = `Semester ${semCount + 1}`;
            document.getElementById('modal-calc-history').classList.remove('hidden');
        };
        
        window.CalculatorView.closeHistoryModal = () => {
            document.getElementById('modal-calc-history').classList.add('hidden');
        };
        
        window.CalculatorView.moveToHistory = () => {
            const name = document.getElementById('input-calc-semester-name').value.trim();
            if (name) {
                const newSem = window.appStore.moveFixedToSemester(name);
                if (newSem) {
                    this.closeHistoryModal();
                    window.app.showToast('Berhasil dipindahkan ke Riwayat Semester!');
                    window.app.navigate('semester'); // Go to semester view
                }
            } else {
                alert("Mohon isi nama semester");
            }
        };
    },

    unsubscribe: function() {
        // No persistent listeners to clean up
    },

    updateView: function() {
        const krsFixed = window.appStore.data.krsFixed || [];
        
        if (krsFixed.length === 0) {
            document.getElementById('calc-empty-state').classList.remove('hidden');
            document.getElementById('calc-course-list').classList.add('hidden');
            document.getElementById('btn-to-history').classList.add('hidden');
            const summaryPanel = document.getElementById('calc-summary-panel');
            if(summaryPanel) summaryPanel.classList.add('hidden');
        } else {
            document.getElementById('calc-empty-state').classList.add('hidden');
            document.getElementById('calc-course-list').classList.remove('hidden');
            document.getElementById('btn-to-history').classList.remove('hidden');
            
            const summaryPanel = document.getElementById('calc-summary-panel');
            if(summaryPanel) {
                summaryPanel.classList.remove('hidden');
                
                const ips = window.AcademicLogic.calculateIPS(krsFixed);
                const tempSemesters = [...(window.appStore.data.semesters || []), { courses: krsFixed }];
                const ipkData = window.AcademicLogic.calculateIPKAndSKS(tempSemesters);
                const semesterSks = krsFixed.reduce((sum, crs) => sum + crs.sks, 0);

                summaryPanel.innerHTML = `
                    <div class="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                        <span class="text-xs font-bold text-secondary uppercase tracking-widest mb-1 text-center">Prediksi IPS</span>
                        <span class="font-headline-lg text-primary">${ips.toFixed(2)}</span>
                    </div>
                    <div class="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                        <span class="text-xs font-bold text-secondary uppercase tracking-widest mb-1 text-center">Prediksi IPK Total</span>
                        <span class="font-headline-lg text-primary">${ipkData.ipk.toFixed(2)}</span>
                    </div>
                    <div class="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                        <span class="text-xs font-bold text-secondary uppercase tracking-widest mb-1 text-center">SKS Lulus Keseluruhan</span>
                        <span class="font-headline-lg text-primary">${ipkData.totalSKSPassed}</span>
                    </div>
                    <div class="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
                        <span class="text-xs font-bold text-secondary uppercase tracking-widest mb-1 text-center">Total SKS Semester Ini</span>
                        <span class="font-headline-lg text-primary">${semesterSks}</span>
                    </div>
                `;
            }
            
            const listEl = document.getElementById('calc-course-list');
            listEl.innerHTML = krsFixed.map(crs => {
                const draftGrade = crs.grade || 'A';
                
                // Calculate numeric score
                const tugas = parseFloat(crs.tugas) || 80;
                const uts = parseFloat(crs.uts) || 80;
                const uas = parseFloat(crs.uas) || 80;
                const numericScore = window.AcademicLogic.calculateFinalScore(uts, tugas, uas).toFixed(1);
                
                const isAllLocked = crs.tugasDone && crs.utsDone && crs.uasDone;
                
                const statusHtml = isAllLocked 
                    ? `<span class="flex items-center gap-1 text-success-green font-bold"><span class="material-symbols-outlined text-[16px]">check_circle</span> Nilai Akhir: ${numericScore}</span>`
                    : `<span class="flex items-center gap-1 text-secondary"><span class="material-symbols-outlined text-[16px]">tune</span> Draf: ${numericScore}</span>`;

                return `
                <div class="bg-surface-container-lowest border border-surface-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="text-xs font-bold text-secondary tracking-widest uppercase mb-1 block">${crs.code}</span>
                            <h4 class="font-headline-md text-on-surface">${crs.name}</h4>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                            ${draftGrade}
                        </div>
                    </div>
                    <div class="flex items-center gap-4 text-sm mb-6">
                        <span class="flex items-center gap-1 text-secondary"><span class="material-symbols-outlined text-[16px]">menu_book</span> ${crs.sks} SKS</span>
                        ${statusHtml}
                    </div>
                    <button onclick="window.CalculatorView.openDetail('${crs.id}')" class="w-full py-2 bg-surface-container-high text-primary hover:bg-surface-container-highest rounded-lg transition-colors font-label-md border border-outline-variant">
                        Simulasi Nilai
                    </button>
                </div>
                `;
            }).join('');
        }
    },

    openDetail: function(id) {
        this.selectedCourseId = id;
        const krsFixed = window.appStore.data.krsFixed || [];
        const course = krsFixed.find(c => c.id === id);
        
        if (!course) return;

        document.getElementById('calc-list-view').classList.add('hidden');
        document.getElementById('calc-detail-view').classList.remove('hidden');

        document.getElementById('detail-course-name').innerText = course.name;
        document.getElementById('detail-course-code').innerText = course.code;

        // Load drafted scores or default to 80
        this.elInputTugas.value = course.tugas || 80;
        this.elInputUts.value = course.uts || 80;
        this.elInputUas.value = course.uas || 80;
        
        this.elNumTugas.value = course.tugas || 80;
        this.elNumUts.value = course.uts || 80;
        this.elNumUas.value = course.uas || 80;
        
        this.elCheckTugas.checked = !!course.tugasDone;
        this.elCheckUts.checked = !!course.utsDone;
        this.elCheckUas.checked = !!course.uasDone;
        
        ['tugas', 'uts', 'uas'].forEach(key => {
            const chk = document.getElementById('check-' + key);
            const badge = document.getElementById('badge-' + key);
            if (chk.checked) badge.classList.remove('hidden');
            else badge.classList.add('hidden');
        });

        this.setMode('forward');
        this.calculate(false); // don't save on load
    },

    closeDetail: function() {
        this.selectedCourseId = null;
        document.getElementById('calc-detail-view').classList.add('hidden');
        document.getElementById('calc-list-view').classList.remove('hidden');
        this.updateView(); // Refresh list to show updated grades
    },

    setMode: function(mode) {
        this.currentMode = mode;
        if (mode === 'forward') {
            this.elForward.className = 'px-4 py-2 rounded-lg font-label-md text-label-md transition-all bg-surface-container-lowest text-primary shadow-sm';
            this.elReverse.className = 'px-4 py-2 rounded-lg font-label-md text-label-md transition-all text-secondary hover:bg-surface-container-low';
            this.elTargetContainer.classList.add('hidden');
            this.elResultLabel.innerText = "Prediksi Nilai Akhir";
        } else {
            this.elReverse.className = 'px-4 py-2 rounded-lg font-label-md text-label-md transition-all bg-surface-container-lowest text-primary shadow-sm';
            this.elForward.className = 'px-4 py-2 rounded-lg font-label-md text-label-md transition-all text-secondary hover:bg-surface-container-low';
            this.elTargetContainer.classList.remove('hidden');
            this.elResultLabel.innerText = "Target Rata-rata Tersisa";
        }
        
        if (mode === 'reverse') {
            // Save draft values
            this.draftTugas = this.elNumTugas.value;
            this.draftUts = this.elNumUts.value;
            this.draftUas = this.elNumUas.value;
        } else {
            // Restore draft values
            if (this.draftTugas !== undefined) {
                this.elNumTugas.value = this.draftTugas;
                this.elInputTugas.value = this.draftTugas;
            }
            if (this.draftUts !== undefined) {
                this.elNumUts.value = this.draftUts;
                this.elInputUts.value = this.draftUts;
            }
            if (this.draftUas !== undefined) {
                this.elNumUas.value = this.draftUas;
                this.elInputUas.value = this.draftUas;
            }
        }

        ['tugas', 'uts', 'uas'].forEach(key => {
            const chk = document.getElementById('check-' + key);
            const card = document.getElementById('card-' + key);
            const num = document.getElementById('num-' + key);
            const range = document.getElementById('input-' + key);
            
            if (mode === 'reverse') {
                num.disabled = true;
                range.disabled = true;
                chk.disabled = true;
                
                if (!chk.checked) {
                    // Show but highlight as target
                    card.classList.remove('hidden', 'opacity-70', 'bg-surface-container');
                    card.classList.add('border-primary', 'bg-primary/5');
                    card.style.pointerEvents = 'none';
                    
                    chk.classList.add('hidden'); // hide checkbox
                    range.classList.add('hidden'); // hide slider
                } else {
                    // Show locked items dimmed
                    card.classList.remove('hidden', 'border-primary', 'bg-primary/5');
                    card.style.pointerEvents = 'none';
                    card.classList.add('opacity-70', 'bg-surface-container');
                    
                    chk.classList.remove('hidden');
                    range.classList.remove('hidden');
                }
            } else {
                // Forward mode: show all, enable all
                card.classList.remove('hidden', 'opacity-70', 'bg-surface-container', 'border-primary', 'bg-primary/5');
                card.style.pointerEvents = 'auto';
                num.disabled = false;
                range.disabled = false;
                chk.disabled = false;
                chk.classList.remove('hidden');
                range.classList.remove('hidden');
            }
        });
        
        this.calculate(false);
    },

    setTarget: function(letter) {
        this.currentTarget = letter;
        document.querySelectorAll('.target-btn').forEach(btn => {
            btn.className = 'target-btn py-2 border border-surface-border rounded-lg font-bold text-primary hover:bg-primary-container/10';
            if (btn.getAttribute('data-target') === letter) {
                btn.className = 'target-btn py-2 border border-surface-border rounded-lg font-bold text-on-primary bg-primary';
            }
        });
        this.calculate(false);
    },

    calculate: function(saveDraft = false) {
        const tugas = parseFloat(this.elNumTugas.value) || 0;
        const uts = parseFloat(this.elNumUts.value) || 0;
        const uas = parseFloat(this.elNumUas.value) || 0;

        const tugasDone = this.elCheckTugas.checked;
        const utsDone = this.elCheckUts.checked;
        const uasDone = this.elCheckUas.checked;

        const circle = document.getElementById('progress-circle');
        const radius = 96;
        const circumference = 2 * Math.PI * radius;

        if (this.currentMode === 'forward') {
            const total = window.AcademicLogic.calculateFinalScore(uts, tugas, uas);
            const percentage = Math.min(100, Math.max(0, total)) / 100;
            const offset = circumference - (percentage * circumference);
            
            circle.style.strokeDashoffset = offset;
            document.getElementById('result-num').innerText = total.toFixed(1);
            
            if (tugasDone && utsDone && uasDone) {
                document.getElementById('result-label').innerText = "Nilai Akhir Definitif";
            } else {
                document.getElementById('result-label').innerText = "Prediksi Nilai Akhir";
            }
            
            const gradeInfo = window.AcademicLogic.getGradeInfoFromScore(total);
            
            if (gradeInfo) {
                document.getElementById('result-letter').innerText = gradeInfo.letter;

                const statusBadge = document.getElementById('status-badge');
                if (gradeInfo.gpa >= 2.0) { // C and above
                    statusBadge.className = "bg-success-green/10 text-success-green border border-success-green/20 px-6 py-2 rounded-full flex items-center gap-2 mb-4";
                    statusBadge.innerHTML = `<span class="material-symbols-outlined text-sm">check_circle</span><span class="font-label-md text-label-md uppercase tracking-wider">Status: Lulus</span>`;
                } else {
                    statusBadge.className = "bg-danger-red/10 text-danger-red border border-danger-red/20 px-6 py-2 rounded-full flex items-center gap-2 mb-4";
                    statusBadge.innerHTML = `<span class="material-symbols-outlined text-sm">error</span><span class="font-label-md text-label-md uppercase tracking-wider">Status: Tidak Lulus</span>`;
                }
            }
            document.getElementById('target-breakdown').innerText = "";
        } else {
            const target = window.AcademicLogic.calculateDynamicTarget({tugas, uts, uas}, {tugasDone, utsDone, uasDone}, this.currentTarget);
            
            if (!target) return;
            const requiredAvg = target.requiredScore;
            
            const displayScore = Math.max(0, Math.min(100, requiredAvg)).toFixed(1);
            const percentage = Math.max(0, Math.min(100, requiredAvg)) / 100;
            const offset = circumference - (percentage * circumference);

            circle.style.strokeDashoffset = offset;
            
            if (target.unlockedWeight === 0) {
                document.getElementById('result-num').innerText = "-";
                document.getElementById('result-letter').innerText = "Semua Terkunci";
            } else {
                document.getElementById('result-num').innerText = displayScore;
                document.getElementById('result-letter').innerText = "Target Skor";
            }

            const statusBadge = document.getElementById('status-badge');
            let breakdownText = "";
            if (target.unlockedWeight === 0) {
                if (requiredAvg === 0) {
                    statusBadge.className = "bg-success-green/10 text-success-green border border-success-green/20 px-6 py-2 rounded-full flex items-center gap-2 mb-4";
                    statusBadge.innerHTML = `<span class="material-symbols-outlined text-sm">auto_awesome</span><span class="font-label-md text-label-md uppercase tracking-wider">Sudah Tercapai!</span>`;
                } else {
                    statusBadge.className = "bg-danger-red/10 text-danger-red border border-danger-red/20 px-6 py-2 rounded-full flex items-center gap-2 mb-4";
                    statusBadge.innerHTML = `<span class="material-symbols-outlined text-sm">error</span><span class="font-label-md text-label-md uppercase tracking-wider">Gagal Tercapai</span>`;
                }
            } else if (requiredAvg > 100) {
                statusBadge.className = "bg-danger-red/10 text-danger-red border border-danger-red/20 px-6 py-2 rounded-full flex items-center gap-2 mb-4";
                statusBadge.innerHTML = `<span class="material-symbols-outlined text-sm">warning</span><span class="font-label-md text-label-md uppercase tracking-wider">Target Mustahil</span>`;
            } else if (requiredAvg <= 0) {
                statusBadge.className = "bg-success-green/10 text-success-green border border-success-green/20 px-6 py-2 rounded-full flex items-center gap-2 mb-4";
                statusBadge.innerHTML = `<span class="material-symbols-outlined text-sm">auto_awesome</span><span class="font-label-md text-label-md uppercase tracking-wider">Sudah Aman</span>`;
            } else {
                statusBadge.className = "bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-full flex items-center gap-2 mb-4";
                statusBadge.innerHTML = `<span class="material-symbols-outlined text-sm">flag</span><span class="font-label-md text-label-md uppercase tracking-wider">Mungkin Dicapai</span>`;
                
                let needed = [];
                if (!tugasDone) {
                    needed.push("Tugas");
                    this.elNumTugas.value = displayScore;
                    this.elInputTugas.value = displayScore;
                }
                if (!utsDone) {
                    needed.push("UTS");
                    this.elNumUts.value = displayScore;
                    this.elInputUts.value = displayScore;
                }
                if (!uasDone) {
                    needed.push("UAS");
                    this.elNumUas.value = displayScore;
                    this.elInputUas.value = displayScore;
                }
                breakdownText = `Butuh masing-masing ${displayScore} di ${needed.join(" dan ")}`;
            }
            
            document.getElementById('target-breakdown').innerText = breakdownText;
        }
        
        if (saveDraft && this.selectedCourseId) {
            const total = window.AcademicLogic.calculateFinalScore(uts, tugas, uas);
            const gradeInfo = window.AcademicLogic.getGradeInfoFromScore(total);
            
            window.appStore.updateFixedCourseScore(this.selectedCourseId, {
                tugas: tugas,
                uts: uts,
                uas: uas,
                tugasDone: tugasDone,
                utsDone: utsDone,
                uasDone: uasDone,
                grade: gradeInfo ? gradeInfo.letter : 'E'
            });
        }
    }
};
