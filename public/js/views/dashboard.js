window.DashboardView = {
    title: 'Dashboard Overview',
    dashboardCharts: [],
    
    render: function() {
        return `
        <!-- Welcome Header -->
        <div class="mb-lg">
            <h3 class="font-headline-xl text-[36px] text-text-main font-bold mb-4" id="dash-welcome">Selamat pagi</h3>
            
            <div class="flex flex-wrap items-center gap-3 mb-4">
                <!-- Semester Badge -->
                <div class="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 shadow-sm">
                    <span class="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
                    <span class="font-label-md text-primary font-bold tracking-wider uppercase" id="dash-current-sem">Semester 1</span>
                </div>
                
                <!-- Jurusan Badge -->
                <div class="hidden items-center gap-2 px-4 py-2 bg-surface-container-high rounded-lg border border-outline-variant shadow-sm" id="dash-jurusan-container">
                    <span class="material-symbols-outlined text-[18px] text-secondary">school</span>
                    <span class="font-label-md text-secondary font-bold tracking-wider uppercase" id="dash-jurusan">Mahasiswa Jurusan</span>
                </div>
            </div>
            
            <p class="text-text-muted font-body-lg">Berikut adalah ringkasan performa akademik Anda secara keseluruhan.</p>
        </div>

        <!-- Bento Grid Layout -->
        <div class="grid grid-cols-12 gap-gutter">
            
            <!-- KPI Card: GPA (IPK) -->
            <div onclick="window.app.navigate('transcript')" class="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border relative overflow-hidden group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
                    <span class="material-symbols-outlined text-[80px]" data-icon="school">school</span>
                </div>
                <p class="font-label-md text-label-md text-secondary uppercase tracking-widest mb-2 flex items-center gap-1 group-hover:text-primary transition-colors">IPK Total <span class="material-symbols-outlined text-[14px]">open_in_new</span></p>
                <div class="flex items-baseline gap-2">
                    <h4 class="font-headline-xl text-[48px] text-primary" id="dash-ipk">0.00</h4>
                </div>
                <div class="mt-4 flex gap-2" id="dash-ipk-badges">
                    <!-- Badges populated by js -->
                </div>
            </div>

            <!-- KPI Card: IPS (Semester Terakhir) -->
            <div onclick="window.app.navigate('khs');" class="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border relative overflow-hidden group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110">
                    <span class="material-symbols-outlined text-[80px]" data-icon="show_chart">show_chart</span>
                </div>
                <p class="font-label-md text-label-md text-secondary uppercase tracking-widest mb-2 flex items-center gap-1 group-hover:text-primary transition-colors">IPS Semester <span id="dash-ips-sem-num"></span> <span class="material-symbols-outlined text-[14px]">open_in_new</span></p>
                <div class="flex items-baseline gap-2">
                    <h4 class="font-headline-xl text-[48px] text-primary" id="dash-ips">0.00</h4>
                </div>
                <div class="mt-4 flex gap-2" id="dash-ips-badges">
                    <!-- Badges populated by js -->
                </div>
            </div>

            <!-- KPI Card: SKS Next Sem -->
            <div class="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border relative">
                <p class="font-label-md text-label-md text-secondary uppercase tracking-widest mb-2">Jatah SKS Depan</p>
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-headline-xl text-[48px] text-tertiary" id="dash-jatah-sks">24</h4>
                        <p class="font-body-sm text-body-sm text-text-muted">Maksimum SKS dapat diambil</p>
                    </div>
                    <div class="w-16 h-16 rounded-full bg-tertiary-fixed flex items-center justify-center">
                        <span class="material-symbols-outlined text-tertiary text-3xl" data-icon="event_available">event_available</span>
                    </div>
                </div>
                <div class="mt-6">
                    <button onclick="window.app.navigate('krs-draft')" class="w-full py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors shadow-sm">Rencanakan KRS</button>
                </div>
            </div>

            <!-- KPI Card: SKS Progress (Wide) -->
            <div onclick="window.app.navigate('semester')" class="col-span-12 md:col-span-6 lg:col-span-3 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border flex flex-col justify-between cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">
                <div class="flex justify-between items-start mb-4">
                    <p class="font-label-md text-label-md text-secondary uppercase tracking-widest flex items-center gap-1 group-hover:text-primary transition-colors">Progres SKS Lulus <span class="material-symbols-outlined text-[14px]">open_in_new</span></p>
                    <span class="font-label-md text-label-md text-primary font-bold" id="dash-sks-text">0 / 144</span>
                </div>
                <div class="relative h-6 bg-surface-container-highest rounded-full overflow-hidden mb-4">
                    <div id="dash-sks-bar" class="absolute top-0 left-0 h-full bg-primary transition-all duration-1000" style="width: 0%"></div>
                    <div id="dash-sks-pct" class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">0% Terpenuhi</div>
                </div>
            </div>

            <!-- Mini Charts (IPK, IPS, SKS) -->
            <div class="col-span-12 lg:col-span-4 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border">
                <div class="flex justify-between items-center mb-4">
                    <h5 class="font-headline-md text-headline-md text-text-main">Tren IPK</h5>
                    <button onclick="window.app.navigate('statistics')" class="text-primary hover:underline text-label-md font-label-md">Detail</button>
                </div>
                <div class="h-40 w-full relative">
                    <canvas id="dash-chart-ipk"></canvas>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border">
                <div class="flex justify-between items-center mb-4">
                    <h5 class="font-headline-md text-headline-md text-text-main">Tren IPS</h5>
                </div>
                <div class="h-40 w-full relative">
                    <canvas id="dash-chart-ips"></canvas>
                </div>
            </div>

            <div class="col-span-12 lg:col-span-4 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border">
                <div class="flex justify-between items-center mb-4">
                    <h5 class="font-headline-md text-headline-md text-text-main">Beban SKS</h5>
                </div>
                <div class="h-40 w-full relative">
                    <canvas id="dash-chart-sks"></canvas>
                </div>
            </div>

            <!-- Jadwal Hari Ini -->
            <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border flex flex-col mb-4 lg:mb-0">
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary" data-icon="today">today</span>
                        <h5 class="font-headline-md text-headline-md text-text-main">Jadwal Kuliah Hari Ini</h5>
                    </div>
                    <button onclick="window.app.navigate('timetable')" class="text-primary hover:underline text-label-md font-label-md">Lihat Semua</button>
                </div>
                <div class="space-y-3 overflow-y-auto max-h-[220px] custom-scrollbar pr-2" id="dash-today-schedule">
                    <!-- Schedule injected by js -->
                </div>
            </div>

            <!-- Upcoming Tasks -->
            <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border flex flex-col mb-4 lg:mb-0">
                <div class="flex justify-between items-center mb-4">
                    <h5 class="font-headline-md text-headline-md text-text-main">Tugas Mendatang</h5>
                    <button onclick="window.app.navigate('tasks')" class="text-primary hover:underline text-label-md font-label-md">Lihat Semua</button>
                </div>
                <div class="space-y-4 overflow-y-auto max-h-[220px] custom-scrollbar pr-2" id="dash-tasks">
                    <!-- Tasks injected by js -->
                </div>
            </div>

            <!-- Grade Distribution (Sebaran Nilai) -->
            <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border flex flex-col mb-4 lg:mb-0">
                <h5 class="font-headline-md text-headline-md text-text-main mb-4">Sebaran Nilai</h5>
                <div class="grid grid-cols-4 gap-2" id="dash-grade-distribution">
                    <!-- Distribution injected by JS -->
                </div>
            </div>

            <!-- Courses to Repeat (Mata Kuliah Diulang) -->
            <div class="col-span-12 lg:col-span-6 bg-surface-container-lowest p-md rounded-xl shadow-sm border border-surface-border flex flex-col">
                <div class="flex items-center gap-2 mb-6">
                    <span class="material-symbols-outlined text-danger-red" data-icon="warning">warning</span>
                    <h5 class="font-headline-md text-headline-md text-text-main">Matkul Diulang</h5>
                </div>
                <div class="grid grid-cols-1 gap-4 overflow-y-auto max-h-[220px] custom-scrollbar pr-2" id="dash-retake">
                    <!-- Retakes injected by js -->
                </div>
            </div>
        </div>

        <!-- Grade Distribution Modal -->
        <div id="dash-grade-modal" class="fixed inset-0 z-[100] hidden bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center">
            <div class="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-lg border border-surface-border overflow-hidden">
                <div class="flex justify-between items-center px-6 py-4 border-b border-surface-border">
                    <h4 class="font-headline-md text-on-surface" id="dash-grade-modal-title">Daftar Mata Kuliah</h4>
                    <button onclick="window.DashboardView.closeGradeModal()" class="text-secondary hover:bg-surface-container-high rounded-full p-1 transition-colors">
                        <span class="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
                <div class="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div id="dash-grade-modal-list" class="space-y-3">
                        <!-- List injected by JS -->
                    </div>
                </div>
                <div class="px-6 py-4 border-t border-surface-border flex justify-end">
                    <button onclick="window.DashboardView.closeGradeModal()" class="bg-primary text-white px-4 py-2 rounded-lg font-label-md hover:bg-primary-hover transition-colors">Tutup</button>
                </div>
            </div>
        </div>
        `;
    },

    init: function(container) {
        this.updateView();
        // Subscribe to store changes so dashboard updates if data changes
        
        // Define listener properly so we can remove it later
        this.listener = () => this.updateView();
        window.appStore.subscribe(this.listener);
    },
    
    unsubscribe: function() {
        if (this.listener) {
            window.appStore.listeners = window.appStore.listeners.filter(l => l !== this.listener);
        }
        if (this.dashboardCharts) {
            this.dashboardCharts.forEach(c => c.destroy());
            this.dashboardCharts = [];
        }
    },

    updateView: function() {
        try {
            const data = window.appStore.data;
            document.getElementById('dash-welcome').innerText = `Selamat pagi, ${data.profile.name}`;
            
            if (data.profile.jurusan) {
            document.getElementById('dash-jurusan').innerText = data.profile.jurusan;
            document.getElementById('dash-jurusan-container').classList.remove('hidden');
            document.getElementById('dash-jurusan-container').classList.add('flex');
        } else {
            document.getElementById('dash-jurusan-container').classList.add('hidden');
            document.getElementById('dash-jurusan-container').classList.remove('flex');
        }

        // Calculate current semester based on completed semesters (those with courses)
        const populatedSemesters = data.semesters.filter(s => s.courses && s.courses.length > 0);
        let currentSem = 1;
        if (populatedSemesters.length > 0) {
            const lastSemName = populatedSemesters[populatedSemesters.length - 1].name;
            const match = lastSemName.match(/\d+/);
            if (match) {
                currentSem = parseInt(match[0]) + 1;
            } else {
                currentSem = populatedSemesters.length + 1;
            }
        }
        document.getElementById('dash-current-sem').innerText = `Semester ${currentSem}`;

        const stats = window.AcademicLogic.calculateIPKAndSKS(data.semesters);
        
        // IPK
        document.getElementById('dash-ipk').innerText = stats.ipk.toFixed(2);
        
        let badgeHtml = '';
        if (stats.ipk >= 3.5) {
            badgeHtml = '<span class="px-2 py-1 bg-success-green/10 text-success-green text-[10px] font-bold rounded uppercase">Distinction</span>';
        } else if (stats.ipk >= 3.0) {
            badgeHtml = '<span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Good</span>';
        }
        document.getElementById('dash-ipk-badges').innerHTML = badgeHtml;

        // IPS (Semester Terakhir yang memiliki matkul)
        let lastIPS = 0;
        const activeSemesters = data.semesters.filter(s => s.courses && s.courses.length > 0);
        let ipsBadgeHtml = '';
        if (activeSemesters.length > 0) {
            const lastSem = activeSemesters[activeSemesters.length - 1];
            // Karena ini IPS, mungkin bisa pakai semua course di semester itu tanpa memandang isRetaken (tergantung aturan kampus, tapi asumsi standar: IPS dihitung per semester)
            lastIPS = window.AcademicLogic.calculateIPS(lastSem.courses);
            
            // Ambil angka dari nama semester (contoh: "Semester 3" -> "3")
            const semNum = lastSem.name.replace(/[^0-9]/g, '') || activeSemesters.length;
            document.getElementById('dash-ips-sem-num').innerText = semNum;
        } else {
            document.getElementById('dash-ips-sem-num').innerText = '-';
        }
        document.getElementById('dash-ips').innerText = lastIPS.toFixed(2);
        
        if (lastIPS >= 3.5) {
            ipsBadgeHtml = '<span class="px-2 py-1 bg-success-green/10 text-success-green text-[10px] font-bold rounded uppercase">Excellent</span>';
        } else if (lastIPS >= 3.0) {
            ipsBadgeHtml = '<span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Good</span>';
        }
        document.getElementById('dash-ips-badges').innerHTML = ipsBadgeHtml;

        // Jatah SKS (Based on last semester IPS)
        const jatahSks = window.AcademicLogic.getJatahSKS(lastIPS);
        document.getElementById('dash-jatah-sks').innerText = data.semesters.length > 0 ? jatahSks : 24; // Default to 24 if no sem

        // Progress SKS
        const target = 144; // Standard graduation SKS
        const pct = Math.min(100, (stats.totalSKSPassed / target) * 100).toFixed(1);
        document.getElementById('dash-sks-text').innerText = `${stats.totalSKSPassed} / ${target} SKS`;
        document.getElementById('dash-sks-bar').style.width = `${pct}%`;
        document.getElementById('dash-sks-pct').innerText = `${pct}% Terpenuhi (Lulus)`;
        
        // Grade Distribution
        const gradeCounts = { 'A':0, 'A-':0, 'B+':0, 'B':0, 'B-':0, 'C+':0, 'C':0 };
        data.semesters.forEach(sem => {
            if (sem.courses) {
                sem.courses.forEach(crs => {
                    if (crs.grade && gradeCounts[crs.grade] !== undefined) {
                        gradeCounts[crs.grade]++;
                    }
                });
            }
        });

        const distContainer = document.getElementById('dash-grade-distribution');
        if (distContainer) {
            const grades = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'];
            distContainer.innerHTML = grades.map(g => {
                const count = gradeCounts[g];
                let colorClass = 'bg-surface-container text-secondary opacity-50';
                let cursorClass = 'cursor-default';
                let onclick = '';
                
                if (count > 0) {
                    cursorClass = 'cursor-pointer hover:opacity-80';
                    onclick = `onclick="window.DashboardView.openGradeModal('${g}')"`;
                    
                    if (g.startsWith('A')) colorClass = 'bg-success-green text-white border-transparent';
                    else if (g.startsWith('B')) colorClass = 'bg-primary text-white border-transparent';
                    else if (g.startsWith('C')) colorClass = 'bg-tertiary text-on-tertiary border-transparent';
                }
                
                return `
                    <button ${onclick} class="flex flex-col items-center justify-center py-2 rounded-lg border border-surface-border ${colorClass} ${cursorClass} transition-all focus:outline-none">
                        <span class="font-headline-md font-bold">${g}</span>
                        <span class="font-label-sm text-[10px] uppercase opacity-90">${count} Matkul</span>
                    </button>
                `;
            }).join('');
        }

        // Jadwal Hari Ini
        const todayContainer = document.getElementById('dash-today-schedule');
        if (todayContainer) {
            const todayIndex = new Date().getDay();
            const daysMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const currentDay = daysMap[todayIndex];
            
            const krsFixed = window.appStore.data.krsFixed || [];
            const todayCourses = krsFixed.filter(c => c.day === currentDay).sort((a,b) => a.timeStart.localeCompare(b.timeStart));
            
            if (todayCourses.length === 0) {
                todayContainer.innerHTML = `<div class="text-text-muted text-sm italic p-4 text-center border border-dashed border-outline-variant rounded-lg mt-2">Tidak ada jadwal kuliah hari ini (${currentDay}).</div>`;
            } else {
                todayContainer.innerHTML = todayCourses.map(c => `
                    <div class="p-3 bg-surface-container-low rounded-lg border-l-4 border-primary flex items-center justify-between shadow-sm">
                        <div>
                            <h6 class="font-bold text-body-sm text-primary">${c.name}</h6>
                            <p class="text-[12px] text-text-muted">${c.code} • ${c.sks} SKS</p>
                        </div>
                        <div class="text-right">
                            <span class="font-bold text-body-sm">${c.timeStart}</span>
                            <p class="text-[10px] text-outline">s.d ${c.timeEnd}</p>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Upcoming Tasks (Next 5 pending)
        const pendingTasks = data.tasks.filter(t => t.status === 'pending')
            .sort((a,b) => new Date(a.deadline) - new Date(b.deadline))
            .slice(0, 5);
        
        const tasksContainer = document.getElementById('dash-tasks');
        if (pendingTasks.length === 0) {
            tasksContainer.innerHTML = '<div class="text-text-muted text-sm italic p-4 text-center">Tidak ada tugas tertunda.</div>';
        } else {
            tasksContainer.innerHTML = pendingTasks.map(t => {
                const isOverdue = new Date(t.deadline) < new Date();
                return `
                <div class="p-3 bg-surface-container-low rounded-lg border-l-4 ${isOverdue ? 'border-danger-red' : 'border-primary'} flex items-start justify-between">
                    <div>
                        <h6 class="font-bold text-body-sm">${t.title}</h6>
                        <p class="text-[12px] text-text-muted">${t.course} • ${new Date(t.deadline).toLocaleDateString()}</p>
                    </div>
                </div>
                `;
            }).join('');
        }

        // Retake Courses
        const retakeContainer = document.getElementById('dash-retake');
        const failedCourses = stats.latestCourses.filter(c => {
            const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(c.grade);
            return gradeInfo && gradeInfo.gpa < 2.0; // D or E
        });

        if (failedCourses.length === 0) {
            retakeContainer.innerHTML = `
                <div class="col-span-1 md:col-span-2 p-4 border border-surface-border border-dashed rounded-lg flex items-center justify-center text-text-muted italic text-body-sm">
                    Tidak ada mata kuliah yang perlu perbaikan.
                </div>
            `;
        } else {
            retakeContainer.innerHTML = failedCourses.map(c => `
                <div class="p-4 border border-outline-variant rounded-lg flex items-center justify-between hover:border-danger-red transition-colors group">
                    <div class="flex gap-4 items-center">
                        <div class="w-12 h-12 rounded-lg bg-danger-red/10 flex items-center justify-center text-danger-red font-bold">${c.grade}</div>
                        <div>
                            <h6 class="font-bold text-body-md text-main">${c.name}</h6>
                            <p class="text-body-sm text-text-muted">Kode: ${c.code} • ${c.sks} SKS</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Render Charts
        if (this.dashboardCharts) {
            this.dashboardCharts.forEach(c => c.destroy());
        }
        this.dashboardCharts = [];
        
        const ctxIpk = document.getElementById('dash-chart-ipk');
        const ctxIps = document.getElementById('dash-chart-ips');
        const ctxSks = document.getElementById('dash-chart-sks');
        
        if (ctxIpk && data.semesters && data.semesters.length > 0) {
            const labels = [];
            const ipkData = [];
            const ipsData = [];
            const sksData = [];
            
            // Filter semesters that have courses
            const chartSemesters = data.semesters.filter(s => s.courses && s.courses.length > 0);
            
            for (let i = 0; i < chartSemesters.length; i++) {
                const sem = chartSemesters[i];
                labels.push(sem.name || `Sem ${i+1}`);
                
                // IPK
                const historicalSlice = chartSemesters.slice(0, i + 1);
                ipkData.push(window.AcademicLogic.calculateIPKAndSKS(historicalSlice).ipk);
                
                // IPS
                ipsData.push(window.AcademicLogic.calculateIPS(sem.courses));
                
                // SKS
                let sks = 0;
                if(sem.courses) sem.courses.forEach(c => sks += c.sks);
                sksData.push(sks);
            }

            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { min: 0, max: 4.0, ticks: { stepSize: 1.0 } }
                },
                plugins: { legend: { display: false } }
            };

            this.dashboardCharts.push(new Chart(ctxIpk.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'IPK',
                        data: ipkData,
                        borderColor: '#004370', backgroundColor: 'rgba(0, 67, 112, 0.1)',
                        borderWidth: 2, pointRadius: 3, fill: true, tension: 0.3
                    }]
                },
                options: chartOptions
            }));
            
            this.dashboardCharts.push(new Chart(ctxIps.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'IPS',
                        data: ipsData,
                        backgroundColor: '#004370', borderRadius: 4
                    }]
                },
                options: chartOptions
            }));
            
            this.dashboardCharts.push(new Chart(ctxSks.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'SKS',
                        data: sksData,
                        backgroundColor: '#10B981', borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 5 } } },
                    plugins: { legend: { display: false } }
                }
            }));
        }
        } catch (err) {
            document.getElementById('dash-welcome').innerText = 'ERROR: ' + err.message;
            document.getElementById('dash-welcome').insertAdjacentHTML('afterend', '<pre class="text-danger-red text-[10px] break-words whitespace-pre-wrap max-w-full">' + err.stack + '</pre>');
            throw err; // throw it so app.js also catches it
        }
    },

    openGradeModal: function(grade) {
        const data = window.appStore.data;
        const courses = [];
        data.semesters.forEach(sem => {
            if (sem.courses) {
                sem.courses.forEach(crs => {
                    if (crs.grade === grade) {
                        courses.push({
                            ...crs,
                            semName: sem.name
                        });
                    }
                });
            }
        });
        
        document.getElementById('dash-grade-modal-title').innerText = `Mata Kuliah dengan Nilai ${grade}`;
        
        const listContainer = document.getElementById('dash-grade-modal-list');
        if (courses.length === 0) {
            listContainer.innerHTML = `<p class="text-secondary text-center italic">Tidak ada mata kuliah</p>`;
        } else {
            listContainer.innerHTML = courses.map(c => `
                <div class="flex justify-between items-center p-3 bg-surface-container-low rounded-lg border border-surface-border">
                    <div class="flex flex-col">
                        <span class="font-bold text-on-surface text-sm">${c.name}</span>
                        <span class="text-xs text-secondary">${c.code} &bull; ${c.semName}</span>
                    </div>
                    <span class="font-bold text-primary bg-primary/10 px-2 py-1 rounded text-sm">${c.sks} SKS</span>
                </div>
            `).join('');
        }
        
        document.getElementById('dash-grade-modal').classList.remove('hidden');
    },
    
    closeGradeModal: function() {
        document.getElementById('dash-grade-modal').classList.add('hidden');
    }
};
