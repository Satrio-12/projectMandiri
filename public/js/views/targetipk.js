window.TargetIpkView = {
    title: 'Simulasi Target IPK',
    
    render: function() {
        return `
        <div class="max-w-3xl mx-auto pb-12">
            
            <div class="mb-8">
                <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Kalkulator Target IPK</h3>
                <p class="text-secondary font-body-md text-body-md">Simulasikan dan hitung batas minimal Indeks Prestasi Semester (IPS) yang harus Anda raih semester ini untuk mencapai target IPK kelulusan Anda secara realistis.</p>
            </div>

            <!-- Target IPK Simulator Panel -->
            <div id="target-ipk-main-panel" class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-border mb-8">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div class="flex-1 w-full">
                        <label class="block text-sm font-bold text-secondary uppercase mb-2">Target IPK Akhir (Mimpi Anda)</label>
                        <input type="number" id="input-target-ipk-main" class="w-full bg-surface-container border border-surface-border rounded-2xl p-5 text-2xl font-bold text-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all" placeholder="Contoh: 3.50" step="0.01" min="0" max="4.00">
                        <p class="text-xs text-secondary mt-2">IPK maksimal adalah 4.00</p>
                    </div>
                </div>
                
                <div class="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden">
                    <span class="material-symbols-outlined text-primary/10 text-9xl absolute -right-4 -bottom-4 pointer-events-none" data-icon="track_changes">track_changes</span>
                    <span class="text-sm font-bold text-primary uppercase tracking-widest mb-2 z-10">Target IPS Semester Ini</span>
                    <span id="target-ips-result-main" class="font-display-lg text-6xl text-primary font-bold z-10">-</span>
                    <p id="target-ipk-msg-main" class="text-sm text-secondary mt-4 max-w-lg mx-auto z-10">Masukkan target IPK untuk melihat batas minimal IPS yang harus Anda capai berdasarkan data SKS historis Anda.</p>
                </div>
            </div>

            <div class="bg-surface-container-low p-6 rounded-2xl border border-surface-border">
                <h4 class="font-headline-sm text-on-surface flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-secondary" data-icon="info">info</span>
                    Bagaimana ini dihitung?
                </h4>
                <p class="text-secondary text-sm leading-relaxed">
                    Sistem akan mengambil seluruh riwayat nilai mutu Anda sebelumnya (IPK historis) dan menggabungkannya dengan bobot SKS yang sedang Anda rencanakan pada <span class="font-bold">Kalkulator Nilai (Simulasi Matkul)</span> saat ini. Dari sana, sistem dapat memproyeksikan secara matematis apakah target IPK akhir yang Anda masukkan di atas mungkin untuk diraih atau tidak.
                </p>
            </div>
            
        </div>
        `;
    },

    init: function() {
        this.updateView();
        
        // Listen to store changes
        this.listener = () => this.updateView();
        window.appStore.subscribe(this.listener);
    },
    
    updateView: function() {
        const targetInput = document.getElementById('input-target-ipk-main');
        if (!targetInput) return;
        
        // Ensure event listener is updated correctly
        const newTargetInput = targetInput.cloneNode(true);
        targetInput.replaceWith(newTargetInput);
        
        // State parsing
        const krsFixed = window.appStore.data.krsFixed || [];
        const accumulatedKrsFixed = krsFixed.map(crs => {
            const isFinalized = crs.tugasDone && crs.utsDone && crs.uasDone;
            return {
                ...crs,
                grade: isFinalized ? crs.grade : 'E'
            };
        });
        
        let activeSemCourses = [];
        let otherSemesters = window.appStore.data.semesters || [];
        
        if (window.appStore.data.activeKrsSemesterName) {
            const activeSem = otherSemesters.find(s => s.name === window.appStore.data.activeKrsSemesterName);
            if (activeSem && activeSem.courses) {
                activeSemCourses = activeSem.courses;
            }
            // Filter out the active semester from otherSemesters because we'll combine it manually
            otherSemesters = otherSemesters.filter(s => s.name !== window.appStore.data.activeKrsSemesterName);
        }

        const allActiveCourses = [...activeSemCourses, ...accumulatedKrsFixed];
        
        newTargetInput.addEventListener('input', () => {
            const targetIpk = parseFloat(newTargetInput.value);
            const resEl = document.getElementById('target-ips-result-main');
            const msgEl = document.getElementById('target-ipk-msg-main');
            
            if(isNaN(targetIpk) || targetIpk <= 0 || targetIpk > 4) {
                resEl.innerText = '-';
                msgEl.innerText = "Masukkan target IPK untuk melihat batas minimal IPS yang harus Anda capai berdasarkan data SKS historis Anda.";
                msgEl.className = "text-sm text-secondary mt-4 max-w-lg mx-auto z-10";
                return;
            }

            // Get all completely historical semesters (excluding the active one if any)
            let pastSks = 0;
            let pastMutu = 0;
            
            window.appStore.data.semesters.forEach(sem => {
                if (sem.name === window.appStore.data.activeKrsSemesterName) return; 
                
                sem.courses.forEach(crs => {
                    const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(crs.grade);
                    if (gradeInfo) {
                        pastSks += parseInt(crs.sks);
                        pastMutu += (gradeInfo.gpa * parseInt(crs.sks));
                    }
                });
            });
            
            const activeSemSks = allActiveCourses.reduce((sum, c) => sum + parseInt(c.sks), 0);
            
            if (activeSemSks === 0) {
                resEl.innerText = '-';
                msgEl.innerText = "Anda belum merencanakan KRS semester ini (0 SKS Aktif). Silakan tambah matkul di Rencana KRS terlebih dahulu.";
                msgEl.className = "text-sm font-bold text-danger-red mt-4 max-w-lg mx-auto z-10";
                return;
            }
            
            const targetTotalMutu = targetIpk * (pastSks + activeSemSks);
            const requiredMutu = targetTotalMutu - pastMutu;
            const requiredIps = requiredMutu / activeSemSks;
            
            if (requiredIps > 4.00) {
                resEl.innerText = "Mustahil";
                msgEl.innerText = `Secara matematis, Anda tidak bisa mencapai target IPK ${targetIpk.toFixed(2)} karena IPS yang dibutuhkan (${requiredIps.toFixed(2)}) melebihi batas maksimal 4.00 pada semester ini.`;
                msgEl.className = "text-sm mt-4 text-danger-red font-bold max-w-lg mx-auto z-10";
            } else if (requiredIps <= 0) {
                resEl.innerText = "0.00";
                msgEl.innerText = `Anda sudah aman! Bahkan jika seluruh matkul semester ini mendapat nilai terendah (E/IPS 0.00), Anda akan tetap mencapai IPK ${targetIpk.toFixed(2)}.`;
                msgEl.className = "text-sm mt-4 text-success-green font-bold max-w-lg mx-auto z-10";
            } else {
                resEl.innerText = requiredIps.toFixed(2);
                msgEl.innerText = `Anda harus meraih minimal IPS ${requiredIps.toFixed(2)} pada semester ini (dengan asumsi beban total ${activeSemSks} SKS Aktif).`;
                msgEl.className = "text-sm mt-4 text-primary font-bold max-w-lg mx-auto z-10";
            }
        });
        
        // Trigger calculation if there's an existing value
        if (newTargetInput.value) {
            newTargetInput.dispatchEvent(new Event('input'));
        }
    },

    unsubscribe: function() {
        if (this.listener) {
            window.appStore.unsubscribe(this.listener);
            this.listener = null;
        }
    }
};
