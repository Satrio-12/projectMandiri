window.TranscriptView = {
    title: 'Transkrip Nilai',

    render: function() {
        return `
        <div class="mb-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h3 class="font-headline-xl text-[36px] text-text-main font-bold mb-2">Transkrip Nilai Sementara</h3>
                <p class="text-text-muted font-body-lg">Daftar seluruh mata kuliah yang telah lulus (Grade C ke atas).</p>
            </div>
            <button onclick="window.print()" class="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors shadow-sm font-label-md font-bold">
                <span class="material-symbols-outlined">print</span>
                Cetak Transkrip
            </button>
        </div>

        <div class="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-border overflow-hidden mb-6">
            <div class="p-6 border-b border-surface-border bg-surface-bright flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="text-center md:text-left">
                    <p class="text-sm text-secondary font-bold uppercase tracking-wider mb-1">Total SKS Lulus</p>
                    <p class="text-4xl font-headline-xl text-primary font-bold" id="transcript-total-sks">0</p>
                </div>
                <div class="w-full h-px md:w-px md:h-12 bg-outline-variant"></div>
                <div class="text-center md:text-right">
                    <p class="text-sm text-secondary font-bold uppercase tracking-wider mb-1">Indeks Prestasi Kumulatif (IPK)</p>
                    <p class="text-4xl font-headline-xl text-tertiary font-bold" id="transcript-ipk">0.00</p>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-surface-container-low text-secondary font-label-md text-sm border-b border-surface-border">
                            <th class="py-4 px-6 w-16 text-center">No</th>
                            <th class="py-4 px-4 w-32">Kode</th>
                            <th class="py-4 px-4">Nama Mata Kuliah</th>
                            <th class="py-4 px-4 text-center w-24">SKS</th>
                            <th class="py-4 px-4 text-center w-24">Grade</th>
                            <th class="py-4 px-4 text-center w-24">Bobot</th>
                        </tr>
                    </thead>
                    <tbody id="transcript-table-body">
                        <!-- Injected via JS -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <style>
            @media print {
                nav, header, #sidebar, #sidebar-overlay, button, .nav-link { display: none !important; }
                main { padding: 0 !important; margin: 0 !important; }
                body { background: white; }
                .shadow-sm { box-shadow: none !important; }
                .border-surface-border { border-color: #ccc !important; }
                .bg-surface-container-low { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
                .bg-surface-bright { background-color: #fff !important; }
                .text-primary, .text-tertiary { color: #000 !important; }
            }
        </style>
        `;
    },

    init: function(container) {
        this.updateView();
        this.listener = () => this.updateView();
        window.appStore.subscribe(this.listener);
    },

    unsubscribe: function() {
        if (this.listener) {
            window.appStore.listeners = window.appStore.listeners.filter(l => l !== this.listener);
        }
    },

    updateView: function() {
        const data = window.appStore.data;
        const stats = window.AcademicLogic.calculateIPKAndSKS(data.semesters);
        
        document.getElementById('transcript-total-sks').innerText = stats.totalSKSPassed;
        document.getElementById('transcript-ipk').innerText = stats.ipk.toFixed(2);

        // Filter only passed courses (C to A)
        const passedCourses = stats.latestCourses.filter(c => {
            const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(c.grade);
            return gradeInfo && gradeInfo.gpa >= 2.0;
        });

        // Sort alphabetically by code
        passedCourses.sort((a, b) => (a.code || '').localeCompare(b.code || ''));

        const tbody = document.getElementById('transcript-table-body');
        
        if (passedCourses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-text-muted italic">Belum ada data mata kuliah yang lulus.</td></tr>';
            return;
        }

        tbody.innerHTML = passedCourses.map((crs, idx) => {
            const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(crs.grade);
            const bobot = gradeInfo ? (gradeInfo.gpa * crs.sks).toFixed(2) : '0.00';
            
            return `
                <tr class="border-b border-surface-border hover:bg-surface-container-lowest transition-colors">
                    <td class="py-4 px-6 text-center text-secondary">${idx + 1}</td>
                    <td class="py-4 px-4 font-bold text-primary">${crs.code}</td>
                    <td class="py-4 px-4 text-text-main font-bold">${crs.name}</td>
                    <td class="py-4 px-4 text-center text-secondary">${crs.sks}</td>
                    <td class="py-4 px-4 text-center font-bold text-on-surface">${crs.grade}</td>
                    <td class="py-4 px-4 text-center text-secondary">${bobot}</td>
                </tr>
            `;
        }).join('');
    }
};
