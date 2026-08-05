window.TasksView = {
    title: 'Task Tracker',
    
    render: function() {
        return `
        <div class="max-w-7xl mx-auto pb-12">
            <!-- Header & Filters -->
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <p class="text-secondary font-label-md mb-1">To-do Tracker</p>
                    <h3 class="font-headline-xl text-headline-xl text-on-surface">Manage Deadlines</h3>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                    <div class="bg-surface-container-high p-1 rounded-xl flex gap-1 w-full sm:w-auto">
                        <button id="view-mode-time" onclick="window.TasksView.setMode('time')" class="flex-1 sm:flex-none px-4 py-2 rounded-lg font-label-md transition-all bg-surface-container-lowest text-primary shadow-sm">
                            Urutkan Waktu
                        </button>
                        <button id="view-mode-course" onclick="window.TasksView.setMode('course')" class="flex-1 sm:flex-none px-4 py-2 rounded-lg font-label-md transition-all text-secondary hover:bg-surface-container-low">
                            Berdasarkan Matkul
                        </button>
                    </div>
                    <button onclick="window.TasksView.openTaskModal()" class="w-full sm:w-auto justify-center bg-primary text-white px-6 py-2.5 rounded-lg font-label-md flex items-center gap-2 shadow-md hover:opacity-90 active:scale-95 transition-all">
                        <span class="material-symbols-outlined">add</span>
                        Tambah Tugas
                    </button>
                </div>
            </div>

            <!-- Task Groups: By Time -->
            <div id="tasks-by-time" class="space-y-12">
                <!-- Group: Overdue / Urgent -->
                <section id="tasks-urgent-section">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-2 h-8 bg-danger-red rounded-full"></div>
                        <h4 class="font-headline-md text-headline-md text-on-surface">Mendesak / Lewat Tenggat</h4>
                        <span id="badge-urgent" class="px-2 py-0.5 bg-error-container text-on-error-container rounded text-xs font-bold">0 TUGAS</span>
                    </div>
                    <div class="grid grid-cols-1 gap-4" id="tasks-urgent-list">
                        <!-- Injected -->
                    </div>
                </section>

                <!-- Group: Ongoing / Normal -->
                <section id="tasks-normal-section">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-2 h-8 bg-warning-amber rounded-full"></div>
                        <h4 class="font-headline-md text-headline-md text-on-surface">Mendatang</h4>
                        <span id="badge-normal" class="px-2 py-0.5 bg-surface-container-highest text-secondary rounded text-xs font-bold">0 TUGAS</span>
                    </div>
                    <div class="grid grid-cols-1 gap-4" id="tasks-normal-list">
                        <!-- Injected -->
                    </div>
                </section>

                <!-- Group: Done -->
                <section id="tasks-done-section">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-2 h-8 bg-success-green rounded-full"></div>
                        <h4 class="font-headline-md text-headline-md text-on-surface">Selesai</h4>
                        <span id="badge-done" class="px-2 py-0.5 bg-surface-container-highest text-secondary rounded text-xs font-bold">0 TUGAS</span>
                    </div>
                    <div class="grid grid-cols-1 gap-4 opacity-75" id="tasks-done-list">
                        <!-- Injected -->
                    </div>
                </section>
            </div>

            <!-- Task Groups: By Course -->
            <div id="tasks-by-course" class="hidden space-y-12">
                <div id="tasks-by-course-list" class="space-y-8">
                    <!-- Injected -->
                </div>
            </div>
        </div>

        <!-- Modal: Tambah Tugas -->
        <div id="modal-task" class="fixed inset-0 z-[100] hidden bg-inverse-surface/50 backdrop-blur-sm flex items-center justify-center">
            <div class="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
                <h3 class="font-headline-md text-primary mb-4">Tambah Tugas Baru</h3>
                
                <label class="block text-sm mb-1 text-secondary">Judul Tugas</label>
                <input type="text" id="input-task-title" class="w-full border-outline-variant rounded-lg p-2 mb-3" placeholder="Misal: Laporan Praktikum"/>
                
                <label class="block text-sm mb-1 text-secondary">Mata Kuliah</label>
                <select id="input-task-course" class="w-full border-outline-variant rounded-lg p-2 mb-3">
                    <!-- Populated by JS from KRS Plan -->
                </select>
                
                <label class="block text-sm mb-1 text-secondary">Tenggat Waktu (Deadline)</label>
                <input type="datetime-local" id="input-task-deadline" class="w-full border-outline-variant rounded-lg p-2 mb-4"/>
                
                <div class="flex justify-end gap-2">
                    <button onclick="window.TasksView.closeTaskModal()" class="px-4 py-2 text-secondary hover:bg-surface-container-high rounded-lg">Batal</button>
                    <button onclick="window.TasksView.saveTask()" class="px-4 py-2 bg-primary text-white rounded-lg">Simpan</button>
                </div>
            </div>
        </div>
        `;
    },

    init: function(container) {
        this.currentMode = 'time';
        
        this.updateView();
        this.listener = () => this.updateView();
        window.appStore.subscribe(this.listener);

        window.TasksView.setMode = (mode) => {
            this.currentMode = mode;
            
            const btnTime = document.getElementById('view-mode-time');
            const btnCourse = document.getElementById('view-mode-course');
            
            if (mode === 'time') {
                btnTime.className = 'flex-1 sm:flex-none px-4 py-2 rounded-lg font-label-md transition-all bg-surface-container-lowest text-primary shadow-sm';
                btnCourse.className = 'flex-1 sm:flex-none px-4 py-2 rounded-lg font-label-md transition-all text-secondary hover:bg-surface-container-low';
            } else {
                btnCourse.className = 'flex-1 sm:flex-none px-4 py-2 rounded-lg font-label-md transition-all bg-surface-container-lowest text-primary shadow-sm';
                btnTime.className = 'flex-1 sm:flex-none px-4 py-2 rounded-lg font-label-md transition-all text-secondary hover:bg-surface-container-low';
            }
            
            this.updateView();
        };

        window.TasksView.toggleTaskStatus = (id, isChecked) => {
            window.appStore.updateTaskStatus(id, isChecked ? 'done' : 'pending');
        };

        window.TasksView.deleteTask = (id) => {
            window.app.showConfirm("Hapus tugas ini?", (res) => { if(res) { 
                window.appStore.deleteTask(id);
             } }, {isDanger: true})
        };
    },

    unsubscribe: function() {
        if (this.listener) {
            window.appStore.listeners = window.appStore.listeners.filter(l => l !== this.listener);
        }
    },

    updateView: function() {
        const tasks = window.appStore.data.tasks;
        const now = new Date();
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

        if (this.currentMode === 'time') {
            document.getElementById('tasks-by-time').classList.remove('hidden');
            document.getElementById('tasks-by-course').classList.add('hidden');

            const doneTasks = [];
            const urgentTasks = [];
            const normalTasks = [];

            tasks.forEach(task => {
                if (task.status === 'done') {
                    doneTasks.push(task);
                } else {
                    const deadline = new Date(task.deadline);
                    const timeDiff = deadline - now;
                    if (timeDiff < threeDaysMs) {
                        urgentTasks.push(task);
                    } else {
                        normalTasks.push(task);
                    }
                }
            });

            // Sort pending tasks by closest deadline
            urgentTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            normalTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            // Sort done tasks by recently added (id has timestamp)
            doneTasks.sort((a, b) => b.id.localeCompare(a.id));

            document.getElementById('badge-urgent').innerText = `${urgentTasks.length} TUGAS`;
            document.getElementById('badge-normal').innerText = `${normalTasks.length} TUGAS`;
            document.getElementById('badge-done').innerText = `${doneTasks.length} TUGAS`;

            document.getElementById('tasks-urgent-section').style.display = urgentTasks.length > 0 ? 'block' : 'none';
            document.getElementById('tasks-normal-section').style.display = normalTasks.length > 0 ? 'block' : 'none';
            document.getElementById('tasks-done-section').style.display = doneTasks.length > 0 ? 'block' : 'none';

            if (tasks.length === 0) {
                document.getElementById('tasks-normal-section').style.display = 'block';
                document.getElementById('tasks-normal-list').innerHTML = '<div class="text-center p-8 border-2 border-dashed border-surface-border rounded-xl text-secondary">Belum ada tugas. Klik Tambah Tugas untuk mulai.</div>';
            } else {
                document.getElementById('tasks-urgent-list').innerHTML = this.renderTaskList(urgentTasks, 'urgent');
                document.getElementById('tasks-normal-list').innerHTML = this.renderTaskList(normalTasks, 'normal');
                document.getElementById('tasks-done-list').innerHTML = this.renderTaskList(doneTasks, 'done');
            }

        } else if (this.currentMode === 'course') {
            document.getElementById('tasks-by-time').classList.add('hidden');
            document.getElementById('tasks-by-course').classList.remove('hidden');

            const courseGroups = {};
            tasks.forEach(task => {
                const course = task.course || 'Lain-lain';
                if (!courseGroups[course]) courseGroups[course] = [];
                courseGroups[course].push(task);
            });

            let html = '';
            if (Object.keys(courseGroups).length === 0) {
                html = '<div class="text-center p-8 border-2 border-dashed border-surface-border rounded-xl text-secondary">Belum ada tugas. Klik Tambah Tugas untuk mulai.</div>';
            } else {
                // Sort courses alphabetically
                const sortedCourses = Object.keys(courseGroups).sort();
                
                sortedCourses.forEach(courseName => {
                    const cTasks = courseGroups[courseName];
                    // Sort tasks inside course: pending first, then by deadline
                    cTasks.sort((a, b) => {
                        if (a.status !== b.status) {
                            return a.status === 'pending' ? -1 : 1;
                        }
                        return new Date(a.deadline) - new Date(b.deadline);
                    });
                    
                    const pendingCount = cTasks.filter(t => t.status === 'pending').length;

                    html += `
                    <section class="mb-8">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-2 h-8 bg-tertiary rounded-full"></div>
                            <h4 class="font-headline-md text-headline-md text-on-surface">${courseName}</h4>
                            <span class="px-2 py-0.5 bg-surface-container-highest text-secondary rounded text-xs font-bold">${pendingCount} BELUM SELESAI</span>
                        </div>
                        <div class="grid grid-cols-1 gap-4 ${cTasks.every(t => t.status === 'done') ? 'opacity-75' : ''}">
                            ${this.renderTaskList(cTasks, 'course')}
                        </div>
                    </section>
                    `;
                });
            }
            document.getElementById('tasks-by-course-list').innerHTML = html;
        }
    },

    renderTaskList: function(tasksList, type) {
        return tasksList.map(task => {
            const isDone = task.status === 'done';
            const deadline = new Date(task.deadline);
            const isOverdue = !isDone && deadline < new Date();
            
            let borderClass = 'border-surface-border';
            if (!isDone) {
                borderClass = isOverdue ? 'border-l-danger-red border-l-4' : 'border-l-primary border-l-4';
            }

            return `
            <div class="group bg-surface-container-lowest border ${borderClass} rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex gap-4 items-start flex-1">
                    <div class="mt-1">
                        <input onchange="window.TasksView.toggleTaskStatus('${task.id}', this.checked)" type="checkbox" ${isDone ? 'checked' : ''} class="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"/>
                    </div>
                    <div>
                        <h5 class="text-body-lg font-bold text-on-surface mb-1 ${isDone ? 'line-through text-secondary' : 'group-hover:text-primary'} transition-colors">${task.title}</h5>
                        <div class="flex flex-wrap items-center gap-4 text-sm">
                            <span class="flex items-center gap-1 text-secondary">
                                <span class="material-symbols-outlined text-[18px]">school</span>
                                ${task.course}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-4 md:gap-8 min-w-fit">
                    <div class="text-right">
                        <p class="text-xs font-bold ${isOverdue ? 'text-danger-red' : 'text-secondary'} uppercase tracking-wider mb-1">
                            ${isDone ? 'Diselesaikan' : 'Batas Waktu'}
                        </p>
                        <div class="flex items-center justify-end gap-2 ${isOverdue ? 'text-danger-red' : 'text-on-surface'}">
                            <span class="material-symbols-outlined text-[20px]">${isDone ? 'check_circle' : 'schedule'}</span>
                            <span class="font-label-md font-bold">${deadline.toLocaleString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                    <button onclick="window.TasksView.deleteTask('${task.id}')" class="p-2 text-danger-red hover:bg-error-container rounded-lg transition-colors">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
            `;
        }).join('');
    },

    openTaskModal: function() {
        document.getElementById('input-task-title').value = '';
        document.getElementById('input-task-course').value = '';
        
        // Populate select with courses from krsFixed
        const selectEl = document.getElementById('input-task-course');
        const krsFixed = window.appStore.data.krsFixed || [];
        
        if (krsFixed.length === 0) {
            selectEl.innerHTML = '<option value="Lain-lain">Lain-lain (Belum ada KRS Aktif)</option>';
        } else {
            let optionsHtml = '<option value="Lain-lain">Lain-lain (Umum)</option>';
            optionsHtml += krsFixed.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
            selectEl.innerHTML = optionsHtml;
        }
        
        // Default deadline to tomorrow 23:59
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 0, 0);
        // Format for datetime-local: YYYY-MM-DDTHH:mm
        const offset = tomorrow.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(tomorrow - offset)).toISOString().slice(0, 16);
        document.getElementById('input-task-deadline').value = localISOTime;

        document.getElementById('modal-task').classList.remove('hidden');
    },

    closeTaskModal: function() {
        document.getElementById('modal-task').classList.add('hidden');
    },

    saveTask: function() {
        const title = document.getElementById('input-task-title').value.trim();
        const course = document.getElementById('input-task-course').value.trim();
        const deadline = document.getElementById('input-task-deadline').value;

        if (title && course && deadline) {
            window.appStore.addTask({ title, course, deadline });
            this.closeTaskModal();
            window.app.showToast('Tugas berhasil ditambahkan');
        } else {
            window.app.showAlert("Semua field harus diisi");
        }
    }
};
