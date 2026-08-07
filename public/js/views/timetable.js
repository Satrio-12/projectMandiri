window.TimetableView = {
    title: 'Jadwal Mingguan',
    render: function() {
        return `
        <div class="max-w-container-max mx-auto pb-12">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-lg">
                <div>
                    <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Jadwal Mingguan</h3>
                    <p class="text-secondary font-body-md text-body-md">Visualisasi jadwal perkuliahan Anda berdasarkan KRS Tersimpan.</p>
                </div>
            </div>

            <!-- Visual Schedule Grid Section -->
            <div id="krs-schedule-container" class="bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm overflow-hidden mb-12">
                <div class="p-6 border-b border-surface-border bg-surface-container-lowest">
                    <h4 class="font-headline-md text-headline-md text-on-surface">Papan Jadwal</h4>
                    <p class="text-sm text-secondary mt-1">Jadwal ini diambil dari KRS Tersimpan (Fix).</p>
                </div>
                
                <div class="overflow-x-auto">
                    <div class="min-w-[800px] p-6 relative" id="timetable-wrapper">
                        <!-- Timetable grid will be injected here -->
                    </div>
                </div>
            </div>
        </div>
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
        this.renderTimetable();
    },

    renderTimetable: function() {
        const wrapper = document.getElementById('timetable-wrapper');
        if (!wrapper) return;

        // Use krsFixed as the source of truth for the schedule
        const courses = window.appStore.data.krsFixed || [];
        
        const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
        const startHour = 7;
        const endHour = 18;
        const totalHours = endHour - startHour;
        
        let html = `
            <div class="grid" style="grid-template-columns: 60px repeat(5, 1fr); gap: 1px; background-color: var(--color-surface-border);">
                <!-- Header: Days -->
                <div class="bg-surface-container-lowest p-2"></div>
                ${days.map(d => `<div class="bg-surface-container-low text-center font-bold text-sm py-3 text-secondary uppercase tracking-wider">${d}</div>`).join('')}
        `;

        for (let h = startHour; h < endHour; h++) {
            // Time column
            html += `<div class="bg-surface-container-lowest p-2 text-xs text-outline text-right pr-3 relative"><span class="-mt-2 block">${h}:00</span></div>`;
            
            // Grid cells for each day
            for (let d = 0; d < 5; d++) {
                html += `<div class="bg-surface-container-lowest h-16 border-t border-surface-border/30 relative"></div>`;
            }
        }
        
        html += `</div>`;

        const scheduledCourses = courses.filter(c => c.day && c.timeStart && c.timeEnd);
        
        if (scheduledCourses.length > 0) {
            // Add absolute positioned course blocks
            html += `<div class="absolute top-[60px] left-[84px] right-6 bottom-6 pointer-events-none">`;
            
            // Calculate column width percentages
            const colWidth = 100 / 5;
            
            scheduledCourses.forEach((c, index) => {
                const dayIndex = days.indexOf(c.day);
                if (dayIndex === -1) return;
                
                const parseTime = (timeStr) => {
                    const [h, m] = timeStr.split(':').map(Number);
                    return h + (m / 60);
                };
                
                const start = parseTime(c.timeStart);
                const end = parseTime(c.timeEnd);
                
                if (start < startHour || start >= endHour || end <= startHour || end > endHour) return; // Out of bounds
                
                const top = ((start - startHour) / totalHours) * 100;
                const height = ((end - start) / totalHours) * 100;
                const left = dayIndex * colWidth;
                
                // Colors based on index
                const colors = [
                    'bg-primary text-white border-primary-container',
                    'bg-tertiary text-white border-tertiary-container',
                    'bg-[#0ea5e9] text-white border-[#e0f2fe]',
                    'bg-[#8b5cf6] text-white border-[#ede9fe]',
                    'bg-[#f59e0b] text-white border-[#fef3c7]',
                    'bg-[#10b981] text-white border-[#d1fae5]'
                ];
                const colorClass = colors[index % colors.length];

                // Detect overlaps (naive approach for visual stacking)
                let zIndex = 10;
                let width = colWidth - 0.5; // default 99% of column
                let leftOffset = left;
                
                // Very basic collision shift
                const colliding = scheduledCourses.some((other, oIndex) => {
                    if (oIndex >= index || other.day !== c.day) return false;
                    const oStart = parseTime(other.timeStart);
                    const oEnd = parseTime(other.timeEnd);
                    return (start < oEnd && end > oStart);
                });
                
                if (colliding) {
                    width = (colWidth / 2) - 0.25;
                    leftOffset = left + width + 0.25;
                    zIndex = 20;
                }
                
                html += `
                    <div class="absolute rounded-lg p-2 overflow-hidden border-2 pointer-events-auto hover:scale-[1.02] transition-transform shadow-sm ${colorClass}" 
                         style="top: ${top}%; height: ${height}%; left: ${leftOffset}%; width: ${width}%; z-index: ${zIndex};">
                        <div class="text-xs font-bold truncate leading-tight">${c.code}</div>
                        <div class="text-[10px] leading-tight truncate opacity-90">${c.name}</div>
                        <div class="text-[9px] mt-1 opacity-80">${c.timeStart} - ${c.timeEnd}</div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }

        wrapper.innerHTML = html;
        
        if (scheduledCourses.length === 0) {
            wrapper.innerHTML += `
                <div class="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-lowest/80 backdrop-blur-[1px] z-30">
                    <span class="material-symbols-outlined text-4xl text-outline mb-2">event_busy</span>
                    <p class="text-secondary font-label-md">Belum ada jadwal</p>
                    <p class="text-xs text-outline mt-1 max-w-sm text-center">Jadwal mingguan akan muncul otomatis setelah KRS Draf Anda di-finalisasi dan memiliki jam kuliah.</p>
                </div>
            `;
        }
    }
};
