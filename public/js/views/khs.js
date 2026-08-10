window.KhsView = {
    title: 'Kartu Hasil Studi',
    
    render: function() {
        return `
        <div class="max-w-container-max mx-auto pb-12">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-lg">
                <div>
                    <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Kartu Hasil Studi (KHS)</h3>
                    <p class="text-secondary font-body-md text-body-md">Lihat rincian nilai, bobot, dan Indeks Prestasi Semester (IPS) Anda.</p>
                </div>
                
                <div class="min-w-[250px]">
                    <label class="block text-sm mb-1 text-secondary font-bold">Pilih Semester</label>
                    <select id="khs-semester-select" onchange="window.KhsView.updateTable()" class="w-full border border-outline-variant bg-surface-container-lowest rounded-lg p-3 text-on-surface font-label-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm cursor-pointer appearance-none">
                        <!-- Options populated by js -->
                    </select>
                </div>
            </div>

            <div class="bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm overflow-hidden mb-12">
                <div class="overflow-x-auto">
                    <table class="w-full text-left font-body-sm border-collapse min-w-[800px]">
                        <thead>
                            <tr class="bg-surface-container-low border-b border-surface-border text-on-surface font-bold text-[13px]">
                                <th class="py-4 px-4 w-12 text-center">No</th>
                                <th class="py-4 px-4 w-28">Kode</th>
                                <th class="py-4 px-4">Nama Mata Kuliah</th>
                                <th class="py-4 px-4 w-20 text-center">SKS</th>
                                <th class="py-4 px-4 w-24 text-center">Nilai Mutu</th>
                                <th class="py-4 px-4 w-20 text-center">Bobot</th>
                                <th class="py-4 px-4 w-20 text-center">Nilai</th>
                            </tr>
                        </thead>
                        <tbody id="khs-table-body">
                            <!-- Injected via js -->
                        </tbody>
                        <tfoot id="khs-table-foot" class="bg-surface-container-lowest border-t-2 border-surface-border">
                            <!-- Injected via js -->
                        </tfoot>
                    </table>
                </div>
                
                <div id="khs-empty" class="hidden p-12 text-center flex flex-col items-center">
                    <div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-4">
                        <span class="material-symbols-outlined text-4xl">folder_off</span>
                    </div>
                    <p class="text-secondary font-body-md">Tidak ada data untuk semester ini.</p>
                </div>
            </div>
        </div>
        `;
    },

    init: function(container) {
        this.populateDropdown();
        this.updateTable();
        
        this.listener = () => {
            this.populateDropdown();
            this.updateTable();
        };
        window.appStore.subscribe(this.listener);
    },

    unsubscribe: function() {
        if (this.listener) {
            window.appStore.listeners = window.appStore.listeners.filter(l => l !== this.listener);
        }
    },

    populateDropdown: function() {
        const select = document.getElementById('khs-semester-select');
        if (!select) return;

        const currentVal = select.value;
        const data = window.appStore.data;
        let optionsHtml = '';
        
        // Add all historical semesters
        data.semesters.forEach(sem => {
            optionsHtml += `<option value="${sem.id}">${sem.name}</option>`;
        });

        // Add Active Semester if not empty
        if (data.krsFixed && data.krsFixed.length > 0) {
            optionsHtml += `<option value="active">Semester Berjalan (KRS Fix)</option>`;
        }

        if (optionsHtml === '') {
            optionsHtml = '<option value="">Belum ada semester</option>';
        }

        select.innerHTML = optionsHtml;
        
        // Retain selection if possible, otherwise default to the last available option (most recent semester)
        if (currentVal && select.querySelector(`option[value="${currentVal}"]`)) {
            select.value = currentVal;
        } else {
            // Select the last option (most recent)
            select.selectedIndex = select.options.length - 1;
        }
    },

    updateTable: function() {
        const select = document.getElementById('khs-semester-select');
        const tbody = document.getElementById('khs-table-body');
        const tfoot = document.getElementById('khs-table-foot');
        const emptyDiv = document.getElementById('khs-empty');
        const table = tbody ? tbody.parentElement : null;

        if (!select || !tbody || !tfoot) return;

        const val = select.value;
        if (!val) {
            table.classList.add('hidden');
            emptyDiv.classList.remove('hidden');
            return;
        }

        const data = window.appStore.data;
        let courses = [];
        
        if (val === 'active') {
            courses = data.krsFixed || [];
        } else {
            const sem = data.semesters.find(s => s.id === val);
            if (sem) courses = sem.courses || [];
        }

        if (courses.length === 0) {
            table.classList.add('hidden');
            emptyDiv.classList.remove('hidden');
            return;
        }

        emptyDiv.classList.add('hidden');
        table.classList.remove('hidden');

        let totalSks = 0;
        let totalBobot = 0;
        
        tbody.innerHTML = courses.map((crs, idx) => {
            const sksNum = parseInt(crs.sks) || 0;
            totalSks += sksNum;
            
            // Default logic if it's active semester or un-graded
            let grade = crs.grade || '-';
            if (val === 'active') grade = '-'; // Active semester has not received final grades yet
            
            let nilaiMutu = '-';
            let bobot = '-';
            
            if (grade !== '-' && !crs.isRetaken) {
                const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(grade);
                if (gradeInfo) {
                    nilaiMutuNum = gradeInfo.gpa;
                    nilaiMutu = nilaiMutuNum.toFixed(2);
                    bobotNum = sksNum * nilaiMutuNum;
                    bobot = bobotNum;
                    totalBobot += bobotNum;
                }
            }

            let retakeHtml = '';
            if (crs.isRetaken) {
                retakeHtml = '<br><span class="inline-block mt-1 px-2 py-0.5 bg-warning-amber/10 text-warning-amber text-[10px] font-bold rounded-full border border-warning-amber/20">MENGULANG (DIGANTIKAN)</span>';
                // Remove from total SKS
                totalSks -= sksNum;
                grade = '-';
                nilaiMutu = '-';
                bobot = '-';
            }

            return `
                <tr class="border-b border-surface-border/50 hover:bg-surface-container-lowest transition-colors text-[13px] ${crs.isRetaken ? 'opacity-50' : ''}">
                    <td class="py-3 px-4 text-center text-secondary">${idx + 1}</td>
                    <td class="py-3 px-4 font-bold text-secondary">${crs.code}</td>
                    <td class="py-3 px-4 text-on-surface">
                        <span class="${crs.isRetaken ? 'line-through text-outline' : ''}">${crs.name}</span>
                        ${retakeHtml}
                    </td>
                    <td class="py-3 px-4 text-center font-bold">${sksNum}</td>
                    <td class="py-3 px-4 text-center text-secondary">${nilaiMutu}</td>
                    <td class="py-3 px-4 text-center text-secondary">${bobot}</td>
                    <td class="py-3 px-4 text-center font-bold">${grade}</td>
                </tr>
            `;
        }).join('');

        const ips = totalSks > 0 ? (totalBobot / totalSks) : 0;
        const ipsStr = totalSks > 0 ? ips.toFixed(2) : '-';

        tfoot.innerHTML = `
            <tr class="text-[13px]">
                <td colspan="3" class="py-4 px-4 font-bold text-on-surface">Total SKS</td>
                <td class="py-4 px-4 text-center font-bold text-on-surface">${totalSks}</td>
                <td class="py-4 px-4"></td>
                <td class="py-4 px-4 text-center font-bold text-on-surface">${totalBobot.toFixed(0) === '0' && totalBobot !== 0 ? totalBobot.toFixed(2) : totalBobot}</td>
                <td class="py-4 px-4"></td>
            </tr>
            <tr class="text-[13px] border-t border-surface-border">
                <td colspan="3" class="py-4 px-4 font-bold text-on-surface">Indeks Prestasi Semester</td>
                <td colspan="4" class="py-4 px-4 font-bold text-on-surface">${ipsStr}</td>
            </tr>
        `;
    }
};
