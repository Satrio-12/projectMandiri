window.StatisticsView = {
    title: 'Statistik Akademik',
    charts: [], // store chart instances to destroy them later
    
    render: function() {
        return `
        <div class="max-w-container-max mx-auto pb-12">
            <div class="mb-8">
                <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Statistik Akademik</h3>
                <p class="text-secondary font-body-md text-body-md">Pantau perkembangan performa IPK, IPS, dan beban SKS Anda dari waktu ke waktu.</p>
            </div>
            
            <!-- IPK Chart (Full Width) -->
            <div id="container-chart-ipk" class="bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm p-6 mb-8">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h4 class="font-headline-md text-on-surface">Tren IPK Kumulatif</h4>
                        <p class="text-sm text-text-muted">Pergerakan Indeks Prestasi Kumulatif Anda.</p>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
                        <span class="material-symbols-outlined">moving</span>
                    </div>
                </div>
                <div class="h-72 w-full relative">
                    <canvas id="chart-ipk"></canvas>
                </div>
            </div>

            <!-- Bottom Row: IPS & SKS -->
            <div id="container-chart-bottom" class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- IPS Chart -->
                <div class="bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm p-6">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h4 class="font-headline-md text-on-surface">Indeks Prestasi Semester (IPS)</h4>
                            <p class="text-sm text-text-muted">Performa akademik tiap semester.</p>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <span class="material-symbols-outlined">bar_chart</span>
                        </div>
                    </div>
                    <div class="h-64 w-full relative">
                        <canvas id="chart-ips"></canvas>
                    </div>
                </div>

                <!-- SKS Chart -->
                <div class="bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm p-6">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h4 class="font-headline-md text-on-surface">Beban SKS</h4>
                            <p class="text-sm text-text-muted">Jumlah SKS yang diambil per semester.</p>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center">
                            <span class="material-symbols-outlined">stacked_bar_chart</span>
                        </div>
                    </div>
                    <div class="h-64 w-full relative">
                        <canvas id="chart-sks"></canvas>
                    </div>
                </div>
            </div>

            <!-- Radar Skill Chart (Full Width) -->
            <div id="container-chart-radar" class="bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm p-6">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h4 class="font-headline-md text-on-surface">Peta Keahlian (Skill Radar)</h4>
                        <p class="text-sm text-text-muted">Distribusi nilai rata-rata berdasarkan kategori mata kuliah yang telah diselesaikan.</p>
                    </div>
                    <div class="w-12 h-12 rounded-full bg-warning-amber/10 text-warning-amber flex items-center justify-center">
                        <span class="material-symbols-outlined">radar</span>
                    </div>
                </div>
                <div class="h-[400px] w-full relative flex justify-center">
                    <canvas id="chart-radar"></canvas>
                </div>
            </div>
            
            <!-- Empty State (Hidden by default) -->
            <div id="stat-empty-state" class="hidden text-center py-16 bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm">
                <span class="material-symbols-outlined text-6xl text-outline mb-4">monitoring</span>
                <h4 class="font-headline-md text-on-surface mb-2">Data Belum Cukup</h4>
                <p class="text-secondary mb-6">Tambahkan riwayat semester Anda terlebih dahulu untuk melihat statistik grafik.</p>
                <button onclick="window.app.navigate('semester')" class="bg-primary text-white px-6 py-2 rounded-lg">Kelola Semester</button>
            </div>
        </div>
        `;
    },

    init: function(container) {
        this.renderCharts();
    },

    unsubscribe: function() {
        this.charts.forEach(chart => chart.destroy());
        this.charts = [];
    },

    renderCharts: function() {
        // Destroy existing if any
        this.charts.forEach(chart => chart.destroy());
        this.charts = [];

        let semesters = window.appStore.data.semesters || [];
        
        // Show empty state if no semesters
        if (semesters.length === 0) {
            document.getElementById('stat-empty-state').classList.remove('hidden');
            document.getElementById('container-chart-ipk').classList.add('hidden');
            document.getElementById('container-chart-bottom').classList.add('hidden');
            return;
        } else {
            document.getElementById('stat-empty-state').classList.add('hidden');
            document.getElementById('container-chart-ipk').classList.remove('hidden');
            document.getElementById('container-chart-bottom').classList.remove('hidden');
        }

        const labels = [];
        const ipkData = [];
        const ipsData = [];
        const sksData = [];

        // Build data points
        // We have to calculate IPK cumulatively for each semester
        for (let i = 0; i < semesters.length; i++) {
            const sem = semesters[i];
            labels.push(sem.name || `Semester ${i+1}`);
            
            // Calculate IPS for this semester specifically
            const ips = window.AcademicLogic.calculateIPS(sem.courses);
            ipsData.push(ips);
            
            // Calculate SKS taken this semester
            let totalSks = 0;
            if(sem.courses) {
                sem.courses.forEach(crs => totalSks += crs.sks);
            }
            sksData.push(totalSks);
            
            // Calculate cumulative IPK up to this semester
            const historicalSlice = semesters.slice(0, i + 1);
            const cumulativeInfo = window.AcademicLogic.calculateIPKAndSKS(historicalSlice);
            ipkData.push(cumulativeInfo.ipk);
        }

        // --- Render IPK Chart (Line) ---
        const ctxIpk = document.getElementById('chart-ipk');
        if(ctxIpk) {
            const chartIpk = new Chart(ctxIpk.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'IPK Kumulatif',
                        data: ipkData,
                        borderColor: '#004565', // tertiary
                        backgroundColor: 'rgba(0, 69, 101, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#004565',
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            min: 0,
                            max: 4.0,
                            ticks: { stepSize: 0.5 }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) { return ' IPK: ' + context.parsed.y.toFixed(2); }
                            }
                        }
                    }
                }
            });
            this.charts.push(chartIpk);
        }

        // --- Render IPS Chart (Bar) ---
        const ctxIps = document.getElementById('chart-ips');
        if (ctxIps) {
            const chartIps = new Chart(ctxIps.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'IPS',
                        data: ipsData,
                        backgroundColor: '#004370', // primary
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            min: 0,
                            max: 4.0,
                            ticks: { stepSize: 0.5 }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) { return ' IPS: ' + context.parsed.y.toFixed(2); }
                            }
                        }
                    }
                }
            });
            this.charts.push(chartIps);
        }

        // --- Render SKS Chart (Bar) ---
        const ctxSks = document.getElementById('chart-sks');
        if (ctxSks) {
            const chartSks = new Chart(ctxSks.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'SKS Diambil',
                        data: sksData,
                        backgroundColor: '#10B981', // success-green
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 5 }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) { return ' SKS: ' + context.parsed.y; }
                            }
                        }
                    }
                }
            });
            this.charts.push(chartSks);
        }

        // --- Render Radar Skill Chart ---
        const ctxRadar = document.getElementById('chart-radar');
        if (ctxRadar) {
            // Heuristic Parsing Logic
            const skillCategories = {
                'Logika & Pemrograman': { keywords: ['algoritma', 'pemrograman', 'web', 'data', 'sistem', 'kecerdasan', 'software', 'logika', 'ai'], totalMutu: 0, count: 0 },
                'Matematika & Analisis': { keywords: ['kalkulus', 'aljabar', 'matematika', 'diskrit', 'statistika', 'numerik'], totalMutu: 0, count: 0 },
                'Jaringan & Hardware': { keywords: ['sirkuit', 'elektronik', 'jaringan', 'hardware', 'komputer', 'keamanan', 'arsitektur'], totalMutu: 0, count: 0 },
                'Desain & Interaksi': { keywords: ['desain', 'interaksi', 'ui', 'ux', 'grafika', 'multimedia', 'animasi'], totalMutu: 0, count: 0 },
                'Soft Skill & Umum': { keywords: ['agama', 'pancasila', 'bahasa', 'kewarganegaraan', 'etika', 'manajemen', 'komunikasi'], totalMutu: 0, count: 0 },
                'Lain-Lain': { keywords: [], totalMutu: 0, count: 0 }
            };

            semesters.forEach(sem => {
                if (sem.courses) {
                    sem.courses.forEach(crs => {
                        if (!crs.grade || crs.grade === '-') return;
                        const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(crs.grade);
                        if (!gradeInfo) return;

                        const nameLower = crs.name.toLowerCase();
                        let categorized = false;

                        for (const [catName, catData] of Object.entries(skillCategories)) {
                            if (catName === 'Lain-Lain') continue;
                            if (catData.keywords.some(kw => nameLower.includes(kw))) {
                                catData.totalMutu += gradeInfo.gpa;
                                catData.count++;
                                categorized = true;
                                break;
                            }
                        }

                        if (!categorized) {
                            skillCategories['Lain-Lain'].totalMutu += gradeInfo.gpa;
                            skillCategories['Lain-Lain'].count++;
                        }
                    });
                }
            });

            // Extract labels and data
            const radarLabels = [];
            const radarData = [];
            
            for (const [catName, catData] of Object.entries(skillCategories)) {
                if (catName !== 'Lain-Lain' || catData.count > 0) { // Only show 'Lain-Lain' if it has data, but always show the others to maintain the pentagon shape
                    radarLabels.push(catName);
                    const avg = catData.count > 0 ? (catData.totalMutu / catData.count).toFixed(2) : 0;
                    radarData.push(parseFloat(avg));
                }
            }

            const chartRadar = new Chart(ctxRadar.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: radarLabels,
                    datasets: [{
                        label: 'Nilai Rata-Rata',
                        data: radarData,
                        backgroundColor: 'rgba(125, 82, 96, 0.2)', // warning-amberish (tertiary)
                        borderColor: '#7D5260', // tertiary-container or a distinct color
                        pointBackgroundColor: '#7D5260',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#7D5260',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            suggestedMin: 0,
                            suggestedMax: 4.0,
                            ticks: {
                                stepSize: 1,
                                backdropColor: 'transparent'
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ' Rata-rata IP: ' + context.parsed.r.toFixed(2);
                                }
                            }
                        }
                    }
                }
            });
            this.charts.push(chartRadar);
        }
    }
};
