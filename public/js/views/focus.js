window.FocusView = {
    title: 'Focus Mode',
    timerId: null,
    timeLeft: 25 * 60,
    totalTime: 25 * 60,
    isRunning: false,
    currentMode: 'pomodoro',

    modes: {
        pomodoro: { time: 25 * 60, color: 'text-primary', label: 'Pomodoro (25m)' },
        shortBreak: { time: 5 * 60, color: 'text-success', label: 'Short Break (5m)' },
        longBreak: { time: 15 * 60, color: 'text-info', label: 'Long Break (15m)' }
    },

    render: function() {
        return `
        <div class="max-w-container-max mx-auto pb-12">
            <div class="mb-8">
                <h3 class="font-headline-lg text-headline-lg text-primary mb-2">Focus Mode</h3>
                <p class="text-secondary font-body-md text-body-md">Teknik Pomodoro untuk menjaga konsentrasi belajar Anda.</p>
            </div>

            <div class="bg-surface-container-lowest border border-surface-border rounded-2xl p-8 max-w-xl mx-auto shadow-sm flex flex-col items-center">
                <!-- Mode Selectors -->
                <div class="flex gap-2 mb-8 bg-surface-container-low p-1 rounded-xl w-full max-w-sm">
                    <button onclick="window.FocusView.setMode('pomodoro')" id="btn-mode-pomodoro" class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors bg-primary text-white shadow-sm">Pomodoro</button>
                    <button onclick="window.FocusView.setMode('shortBreak')" id="btn-mode-shortBreak" class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors text-secondary hover:bg-surface-container-high">Short Break</button>
                    <button onclick="window.FocusView.setMode('longBreak')" id="btn-mode-longBreak" class="flex-1 py-2 text-sm font-bold rounded-lg transition-colors text-secondary hover:bg-surface-container-high">Long Break</button>
                </div>

                <!-- Timer Animation (Circular Progress) -->
                <div class="relative w-64 h-64 mb-10 flex items-center justify-center">
                    <!-- Background Circle -->
                    <svg class="w-full h-full transform -rotate-90 absolute inset-0" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="6" class="text-surface-container-highest" />
                        <!-- Progress Circle -->
                        <circle id="timer-progress" cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="text-primary transition-all duration-1000 ease-linear" stroke-dasharray="283" stroke-dashoffset="0" />
                    </svg>
                    
                    <!-- Time Display -->
                    <div class="z-10 flex flex-col items-center">
                        <div id="timer-display" class="font-headline-lg text-[3.5rem] leading-none text-on-surface font-bold tracking-tight mb-2">25:00</div>
                        <div id="timer-status" class="text-sm font-label-md text-secondary uppercase tracking-wider">Fokus Belajar</div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="flex gap-4 w-full justify-center">
                    <button id="btn-reset" onclick="window.FocusView.resetTimer()" class="p-4 rounded-full bg-surface-container-high text-secondary hover:bg-surface-border transition-colors">
                        <span class="material-symbols-outlined text-[28px]">replay</span>
                    </button>
                    <button id="btn-toggle" onclick="window.FocusView.toggleTimer()" class="px-10 py-4 rounded-full bg-primary text-white font-bold text-lg hover:opacity-90 shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                        <span id="toggle-icon" class="material-symbols-outlined text-[28px]">play_arrow</span>
                        <span id="toggle-text">MULAI</span>
                    </button>
                </div>
                
                <!-- Adjust Time Controls -->
                <div class="flex gap-4 w-full justify-center mt-6">
                    <button onclick="window.FocusView.adjustTime(-5)" class="px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-secondary font-bold text-sm transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-[18px]">remove</span> 5 Min
                    </button>
                    <button onclick="window.FocusView.adjustTime(5)" class="px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-lg text-secondary font-bold text-sm transition-colors flex items-center gap-1">
                        <span class="material-symbols-outlined text-[18px]">add</span> 5 Min
                    </button>
                </div>
            </div>
        </div>
        `;
    },

    init: function(container) {
        this.resetTimer();
    },

    setMode: function(mode) {
        if (this.isRunning) {
            window.app.showConfirm('Timer sedang berjalan, apakah Anda yakin ingin mengganti mode?', (res) => {
                if (res) this.applyMode(mode);
            });
        } else {
            this.applyMode(mode);
        }
    },

    applyMode: function(mode) {
        this.currentMode = mode;
        this.totalTime = this.modes[mode].time;
        
        ['pomodoro', 'shortBreak', 'longBreak'].forEach(m => {
            const btn = document.getElementById('btn-mode-' + m);
            if (m === mode) {
                btn.className = 'flex-1 py-2 text-sm font-bold rounded-lg transition-colors bg-primary text-white shadow-sm';
            } else {
                btn.className = 'flex-1 py-2 text-sm font-bold rounded-lg transition-colors text-secondary hover:bg-surface-container-high';
            }
        });

        const progressCircle = document.getElementById('timer-progress');
        progressCircle.classList.remove('text-primary', 'text-success', 'text-info');
        progressCircle.classList.add(this.modes[mode].color);

        let statusText = 'Fokus Belajar';
        if (mode === 'shortBreak') statusText = 'Istirahat Singkat';
        if (mode === 'longBreak') statusText = 'Istirahat Panjang';
        document.getElementById('timer-status').innerText = statusText;

        this.resetTimer();
    },

    toggleTimer: function() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    },

    startTimer: function() {
        if (this.timeLeft <= 0) return;
        
        this.isRunning = true;
        const toggleBtn = document.getElementById('btn-toggle');
        const icon = document.getElementById('toggle-icon');
        const text = document.getElementById('toggle-text');
        
        toggleBtn.classList.remove('bg-primary');
        toggleBtn.classList.add('bg-secondary');
        icon.innerText = 'pause';
        text.innerText = 'JEDA';

        this.timerId = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();

            if (this.timeLeft <= 0) {
                this.timerComplete();
            }
        }, 1000);
    },

    pauseTimer: function() {
        this.isRunning = false;
        clearInterval(this.timerId);
        
        const toggleBtn = document.getElementById('btn-toggle');
        const icon = document.getElementById('toggle-icon');
        const text = document.getElementById('toggle-text');
        
        toggleBtn.classList.remove('bg-secondary');
        toggleBtn.classList.add('bg-primary');
        icon.innerText = 'play_arrow';
        text.innerText = 'LANJUT';
    },

    resetTimer: function() {
        this.pauseTimer();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        
        const text = document.getElementById('toggle-text');
        text.innerText = 'MULAI';
    },

    adjustTime: function(minutes) {
        const changeInSeconds = minutes * 60;
        this.totalTime += changeInSeconds;
        this.timeLeft += changeInSeconds;
        
        // Prevent negative time
        if (this.totalTime < 60) this.totalTime = 60;
        if (this.timeLeft < 0) this.timeLeft = 0;
        
        this.updateDisplay();
    },

    updateDisplay: function() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer-display').innerText = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const progressCircle = document.getElementById('timer-progress');
        const dashOffset = 283 - (this.timeLeft / this.totalTime) * 283;
        progressCircle.style.strokeDashoffset = dashOffset;
    },

    timerComplete: function() {
        this.pauseTimer();
        this.updateDisplay();
        window.app.showToast('Waktu Habis! Kerja bagus.', 'success');
        
        const timerContainer = document.getElementById('timer-display').parentElement;
        timerContainer.classList.add('animate-pulse');
        setTimeout(() => timerContainer.classList.remove('animate-pulse'), 3000);
    }
};
