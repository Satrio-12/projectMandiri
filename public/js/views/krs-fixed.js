window.KrsFixedView = {
    title: 'KRS Tersimpan',
    render: function() {
        return `
        <div class="max-w-container-max mx-auto pb-12">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-lg">
                <div>
                    <h3 class="font-headline-lg text-headline-lg text-primary mb-2">KRS Tersimpan (Semester Aktif)</h3>
                    <p class="text-secondary font-body-md text-body-md">Mata kuliah yang telah disahkan dan menjadi riwayat semester.</p>
                </div>
            </div>

            <div id="krs-fixed-container" class="mb-12">
                <div class="bg-tertiary/10 border border-tertiary/20 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group">
                    <div class="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span class="material-symbols-outlined text-[120px]">school</span>
                    </div>
                    
                    <div class="relative z-10 flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="material-symbols-outlined text-tertiary">verified</span>
                            <h5 class="text-tertiary font-headline-md font-bold uppercase tracking-wider">KRS TERSIMPAN</h5>
                        </div>
                        <p class="text-on-surface-variant font-body-sm max-w-2xl mb-4">Mata kuliah di bawah ini adalah mata kuliah yang sah sedang Anda jalani. Daftar To-do List dan Jadwal Mingguan akan mengambil referensi dari tabel ini.</p>
                        
                        <div class="flex flex-wrap items-center gap-4">
                            <button onclick="window.KrsFixedView.cancelFixedKrs()" class="bg-surface-container-lowest text-danger-red border border-danger-red/20 px-4 py-2 rounded-lg font-label-md hover:bg-error-container transition-colors text-sm shadow-sm flex items-center gap-1">
                                <span class="material-symbols-outlined text-sm">undo</span> Batalkan Finalisasi
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 bg-surface-container-lowest border border-surface-border rounded-2xl shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left font-body-sm border-collapse min-w-[600px]">
                            <thead>
                                <tr class="border-b border-surface-border text-secondary font-label-md uppercase tracking-wider text-[11px] bg-tertiary/5">
                                    <th class="py-4 px-6 w-32">Kode</th>
                                    <th class="py-4 px-6">Nama Mata Kuliah</th>
                                    <th class="py-4 px-6 w-40">Jadwal</th>
                                    <th class="py-4 px-6 text-center w-24">SKS</th>
                                </tr>
                            </thead>
                            <tbody id="krs-fixed-list">
                            </tbody>
                        </table>
                    </div>
                    <div id="krs-fixed-empty" class="hidden p-12 text-center flex flex-col items-center">
                        <div class="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-4">
                            <span class="material-symbols-outlined text-4xl">inbox</span>
                        </div>
                        <p class="text-secondary font-body-md">KRS Tersimpan masih kosong.</p>
                        <p class="text-sm text-outline mt-1">Gunakan fitur Draf KRS untuk menyusun matkul lalu lakukan finalisasi.</p>
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

        window.KrsFixedView.cancelFixedKrs = () => {
            window.app.showConfirm("Kembalikan matkul dari KRS Tersimpan ke status Draf?", (res) => { 
                if(res) { 
                    if (window.appStore.cancelFixedKrs()) {
                        window.app.showToast('KRS dikembalikan ke draf.');
                        window.app.navigate('krs-draft');
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
        const krsFixed = window.appStore.data.krsFixed || [];
        
        const listEl = document.getElementById('krs-fixed-list');
        const emptyEl = document.getElementById('krs-fixed-empty');
        const tableEl = listEl ? listEl.parentElement.parentElement : null;
        
        if (listEl && emptyEl && tableEl) {
            if (krsFixed.length === 0) {
                tableEl.classList.add('hidden');
                emptyEl.classList.remove('hidden');
            } else {
                emptyEl.classList.add('hidden');
                tableEl.classList.remove('hidden');
                
                listEl.innerHTML = krsFixed.map(crs => {
                    const scheduleText = crs.day && crs.timeStart && crs.timeEnd ? `${crs.day}, ${crs.timeStart}-${crs.timeEnd}` : '<span class="italic text-outline">Belum diatur</span>';
                    return `
                    <tr class="border-b border-surface-border/50 hover:bg-surface-container-low transition-colors">
                        <td class="py-4 px-6 font-bold text-secondary opacity-70">${crs.code}</td>
                        <td class="py-4 px-6 font-bold text-on-surface">${crs.name}</td>
                        <td class="py-4 px-6 text-sm text-secondary">${scheduleText}</td>
                        <td class="py-4 px-6 text-center font-bold text-tertiary">${crs.sks}</td>
                    </tr>
                `}).join('');
            }
        }
    }
};
