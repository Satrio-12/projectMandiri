window.TargetIpkView = {
    title: 'Simulasi Target IPK',
    
    render: function() {
        return `
        <div class="max-w-3xl mx-auto pb-12">
            
            <div class="mb-8">
                <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Kalkulator Target IPK</h3>
                <p class="text-secondary font-body-md text-body-md">Hitung rata-rata IPS yang harus Anda capai pada <span class="font-bold">sisa SKS mata kuliah Anda hingga lulus</span> untuk mencapai target IPK kelulusan.</p>
            </div>

            <!-- Target IPK Simulator Panel -->
            <div id="target-ipk-main-panel" class="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-border mb-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label class="block text-sm font-bold text-secondary uppercase mb-2">Target IPK Akhir (Lulus)</label>
                        <input type="number" id="input-target-ipk-main" class="w-full bg-surface-container border border-surface-border rounded-2xl p-5 text-2xl font-bold text-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all" placeholder="Contoh: 3.50" step="0.01" min="0" max="4.00">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-secondary uppercase mb-2">Total SKS Diperoleh</label>
                        <div class="w-full bg-surface-container-low border border-surface-border rounded-2xl p-5 flex items-center justify-between transition-all opacity-80 cursor-not-allowed">
                            <span id="display-sks-lulus" class="text-2xl font-bold text-secondary">-</span>
                            <span class="text-sm font-bold text-secondary">/ 144 SKS</span>
                        </div>
                    </div>
                </div>
                
                <div class="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex flex-col items-center justify-center min-h-[160px] text-center relative overflow-hidden">
                    <span class="material-symbols-outlined text-primary/10 text-9xl absolute -right-4 -bottom-4 pointer-events-none" data-icon="track_changes">track_changes</span>
                    <span class="text-sm font-bold text-primary uppercase tracking-widest mb-2 z-10">Target Rata-Rata IPS (Di Sisa SKS)</span>
                    <span id="target-ips-result-main" class="font-display-lg text-6xl text-primary font-bold z-10">-</span>
                    <p id="target-ipk-msg-main" class="text-sm text-secondary mt-4 max-w-lg mx-auto z-10">Masukkan target IPK untuk melihat batas minimal rata-rata IPS yang harus Anda capai di sisa studi Anda.</p>
                </div>
            </div>

            <div class="bg-surface-container-low p-6 rounded-2xl border border-surface-border">
                <h4 class="font-headline-sm text-on-surface flex items-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-secondary" data-icon="info">info</span>
                    Bagaimana ini dihitung?
                </h4>
                <p class="text-secondary text-sm leading-relaxed mb-3">
                    Sistem akan mengambil seluruh total <span class="font-bold">SKS Riwayat</span> Anda dan menambahkannya dengan <span class="font-bold">SKS Semester Aktif</span> (yang sedang Anda simulasikan di menu Kalkulator Matkul).
                </p>
                <p class="text-secondary text-sm leading-relaxed">
                    Sisa SKS menuju kelulusan akan dihitung berdasarkan (Total SKS Syarat - SKS Riwayat - SKS Aktif). Nilai yang muncul adalah <span class="font-bold font-italic">rata-rata IPS</span> yang wajib Anda pertahankan pada sisa SKS tersebut!
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
        const displaySksLulus = document.getElementById('display-sks-lulus');
        if (!targetInput || !displaySksLulus) return;
        
        // Clone to remove old listeners
        const newTargetInput = targetInput.cloneNode(true);
        targetInput.replaceWith(newTargetInput);
        
        // State parsing for Active Semester (from KRS Fixed Drafts)
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
        
        // Build mock semesters list to use centralized AcademicLogic (matches Dashboard)
        const mockSemesters = [...otherSemesters];
        if (allActiveCourses.length > 0) {
            mockSemesters.push({
                name: window.appStore.data.activeKrsSemesterName || 'Current Active',
                courses: allActiveCourses
            });
        }
        
        const ipkData = window.AcademicLogic.calculateIPKAndSKS(mockSemesters);
        let totalCurrentSks = ipkData.totalSKSPassed;
        let totalCurrentMutu = 0;
        
        ipkData.latestCourses.forEach(crs => {
            const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(crs.grade);
            if (gradeInfo && gradeInfo.gpa >= 2.00) {
                totalCurrentMutu += (gradeInfo.gpa * parseInt(crs.sks));
            }
        });

        displaySksLulus.innerText = totalCurrentSks;

        const calculateTarget = () => {
            const targetIpk = parseFloat(newTargetInput.value);
            const targetTotalSks = 144;
            
            const resEl = document.getElementById('target-ips-result-main');
            const msgEl = document.getElementById('target-ipk-msg-main');
            
            if(isNaN(targetIpk) || targetIpk <= 0 || targetIpk > 4) {
                resEl.innerText = '-';
                msgEl.innerText = "Masukkan Target IPK kelulusan untuk melihat batas minimal rata-rata IPS yang harus Anda capai.";
                msgEl.className = "text-sm text-secondary mt-4 max-w-lg mx-auto z-10";
                return;
            }

            const remainingSks = targetTotalSks - totalCurrentSks;
            
            if (remainingSks <= 0) {
                const finalIpk = totalCurrentMutu / totalCurrentSks;
                resEl.innerText = "Selesai";
                if (finalIpk >= targetIpk) {
                    msgEl.innerText = `Anda sudah menyelesaikan ${totalCurrentSks} SKS! IPK akhir Anda adalah ${finalIpk.toFixed(2)} (Berhasil mencapai target!).`;
                    msgEl.className = "text-sm font-bold text-success-green mt-4 max-w-lg mx-auto z-10";
                } else {
                    msgEl.innerText = `Anda sudah menyelesaikan ${totalCurrentSks} SKS, namun IPK akhir Anda adalah ${finalIpk.toFixed(2)} (Target ${targetIpk.toFixed(2)} tidak tercapai).`;
                    msgEl.className = "text-sm font-bold text-danger-red mt-4 max-w-lg mx-auto z-10";
                }
                return;
            }
            
            const targetTotalMutu = targetIpk * targetTotalSks;
            const requiredMutu = targetTotalMutu - totalCurrentMutu;
            const requiredAverageIps = requiredMutu / remainingSks;
            
            if (requiredAverageIps > 4.00) {
                resEl.innerText = "Mustahil";
                msgEl.innerText = `Untuk mencapai IPK ${targetIpk.toFixed(2)} pada sisa ${remainingSks} SKS, Anda butuh rata-rata IPS ${requiredAverageIps.toFixed(2)}. Sayangnya batas maksimal IPS adalah 4.00. Target ini secara matematis tidak bisa dicapai.`;
                msgEl.className = "text-sm mt-4 text-danger-red font-bold max-w-lg mx-auto z-10";
            } else if (requiredAverageIps <= 0) {
                resEl.innerText = "0.00";
                msgEl.innerText = `Luar biasa! Walaupun Anda selalu mendapat nilai terendah (E/IPS 0.00) di sisa ${remainingSks} SKS, Anda akan tetap lulus dengan IPK minimal ${targetIpk.toFixed(2)}.`;
                msgEl.className = "text-sm mt-4 text-success-green font-bold max-w-lg mx-auto z-10";
            } else {
                resEl.innerText = requiredAverageIps.toFixed(2);
                msgEl.innerText = `Sisa SKS kelulusan: ${remainingSks} SKS. Anda wajib memperoleh rata-rata IPS minimal ${requiredAverageIps.toFixed(2)} di setiap sisa semester untuk lulus dengan IPK ${targetIpk.toFixed(2)}.`;
                msgEl.className = "text-sm mt-4 text-primary font-bold max-w-lg mx-auto z-10";
            }
        };

        newTargetInput.addEventListener('input', calculateTarget);
        
        // Trigger calculation immediately
        calculateTarget();
    },

    unsubscribe: function() {
        if (this.listener) {
            window.appStore.unsubscribe(this.listener);
            this.listener = null;
        }
    }
};
