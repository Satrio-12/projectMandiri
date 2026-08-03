/**
 * Academic Control System - Data Store & Cloud Sync
 */

const STORAGE_KEY = 'academic_control_data';

const DefaultData = {
    profile: {
        name: 'Fulan',
        initials: 'FL',
        jurusan: 'Teknik Informatika'
    },
    semesters: [
        { id: 'sem_1', name: 'Semester 1', courses: [] },
        { id: 'sem_2', name: 'Semester 2', courses: [] },
        { id: 'sem_3', name: 'Semester 3', courses: [] },
        { id: 'sem_4', name: 'Semester 4', courses: [] },
        { id: 'sem_5', name: 'Semester 5', courses: [] },
        { id: 'sem_6', name: 'Semester 6', courses: [] },
        { id: 'sem_7', name: 'Semester 7', courses: [] },
        { id: 'sem_9', name: 'Semester 9', courses: [] }
    ],
    krsPlan: [], // { id, code, name, sks }
    krsFixed: [], // { id, code, name, sks, grade }
    tasks: [], // { id, title, course, deadline, status: 'pending'|'done' }
    lastSynced: null
};

class Store {
    constructor() {
        this.data = this.loadLocal();
        this.listeners = [];
        
        // Auto-populate semesters 1-9 if completely empty
        if (!this.data.semesters || this.data.semesters.length === 0) {
            this.data.semesters = JSON.parse(JSON.stringify(DefaultData.semesters));
        }
        // Ensure krsPlan and krsFixed exist
        if (!this.data.krsPlan) {
            this.data.krsPlan = [];
        }
        if (!this.data.krsFixed) {
            this.data.krsFixed = [];
        }
        this.saveLocal();
    }

    loadLocal() {
        const str = localStorage.getItem(STORAGE_KEY);
        if (str) {
            try {
                return JSON.parse(str);
            } catch (e) {
                console.error("Failed to parse local storage", e);
            }
        }
        return JSON.parse(JSON.stringify(DefaultData));
    }

    saveLocal() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        this.notifyListeners();
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.data));
    }

    // -- Semesters & Courses --
    
    addSemester(name) {
        const semester = {
            id: 'sem_' + Date.now(),
            name: name,
            courses: []
        };
        this.data.semesters.push(semester);
        this.saveLocal();
        return semester;
    }

    deleteSemester(id) {
        this.data.semesters = this.data.semesters.filter(s => s.id !== id);
        this.saveLocal();
    }

    addCourse(semesterId, course) {
        const semester = this.data.semesters.find(s => s.id === semesterId);
        if (semester) {
            course.id = 'crs_' + Date.now();
            course.sks = Number(course.sks);
            
            // Check if this course code already exists in previous semesters
            // and mark the old ones as isRetaken = true
            this.markPreviousCoursesAsRetaken(course.code);

            semester.courses.push(course);
            this.saveLocal();
        }
    }

    deleteCourse(semesterId, courseId) {
        const semester = this.data.semesters.find(s => s.id === semesterId);
        if (semester) {
            semester.courses = semester.courses.filter(c => c.id !== courseId);
            this.saveLocal();
        }
    }

    markPreviousCoursesAsRetaken(courseCode) {
        if (!courseCode) return;
        const codeLower = courseCode.toLowerCase().trim();
        
        this.data.semesters.forEach(sem => {
            sem.courses.forEach(c => {
                if (c.code && c.code.toLowerCase().trim() === codeLower) {
                    c.isRetaken = true;
                }
            });
        });
    }

    // -- KRS (Study Plan) --
    addKrsCourse(course) {
        course.id = 'krs_' + Date.now();
        course.sks = Number(course.sks);
        this.data.krsPlan.push(course);
        this.saveLocal();
    }

    deleteKrsCourse(id) {
        this.data.krsPlan = this.data.krsPlan.filter(c => c.id !== id);
        this.saveLocal();
    }

    clearKrsPlan() {
        this.data.krsPlan = [];
        this.saveLocal();
    }

    commitKrsToFixed() {
        if (this.data.krsPlan.length === 0) return false;
        
        // Move courses from draft to fixed
        this.data.krsPlan.forEach(crs => {
            const newCourse = {
                id: 'krsf_' + Math.random().toString(36).substring(2, 9),
                code: crs.code,
                name: crs.name,
                sks: crs.sks,
                grade: 'A' // Temp grade
            };
            this.data.krsFixed.push(newCourse);
        });
        
        this.data.krsPlan = [];
        this.saveLocal();
        return true;
    }

    cancelFixedKrs() {
        if (this.data.krsFixed.length === 0) return false;
        // Move them back to draft
        this.data.krsFixed.forEach(crs => {
            this.data.krsPlan.push({
                id: 'krs_' + Math.random().toString(36).substring(2, 9),
                code: crs.code,
                name: crs.name,
                sks: crs.sks
            });
        });
        this.data.krsFixed = [];
        this.saveLocal();
        return true;
    }

    updateFixedCourseScore(courseId, scoreData) {
        const idx = this.data.krsFixed.findIndex(c => c.id === courseId);
        if (idx !== -1) {
            this.data.krsFixed[idx] = {
                ...this.data.krsFixed[idx],
                ...scoreData
            };
            this.saveLocal();
            return true;
        }
        return false;
    }

    moveFixedToSemester(semesterName) {
        if (this.data.krsFixed.length === 0) return null;
        
        // Create new semester
        const semester = {
            id: 'sem_' + Date.now(),
            name: semesterName || 'Semester Baru',
            courses: []
        };
        
        // Move courses
        this.data.krsFixed.forEach(crs => {
            const newCourse = {
                id: 'crs_' + Math.random().toString(36).substring(2, 9),
                code: crs.code,
                name: crs.name,
                sks: crs.sks,
                grade: crs.grade || 'A' // Use drafted grade if exists
            };
            this.markPreviousCoursesAsRetaken(newCourse.code);
            semester.courses.push(newCourse);
        });
        
        this.data.semesters.push(semester);
        this.data.krsFixed = [];
        this.saveLocal();
        return semester;
    }

    // -- Tasks --
    
    addTask(task) {
        task.id = 'tsk_' + Date.now();
        task.status = task.status || 'pending';
        this.data.tasks.push(task);
        this.saveLocal();
    }

    updateTaskStatus(id, status) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            task.status = status;
            this.saveLocal();
        }
    }

    deleteTask(id) {
        this.data.tasks = this.data.tasks.filter(t => t.id !== id);
        this.saveLocal();
    }

    // -- Cloud Sync --

    async syncToCloud() {
        try {
            const res = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: this.data })
            });
            const result = await res.json();
            if (result.success) {
                this.data.lastSynced = new Date().toISOString();
                this.saveLocal();
                return true;
            } else {
                throw new Error(result.message);
            }
        } catch (e) {
            console.error("Cloud Sync Error", e);
            throw e;
        }
    }

    async syncFromCloud() {
        try {
            const res = await fetch('/api/sync', {
                method: 'GET'
            });
            const result = await res.json();
            if (result.success && result.data) {
                this.data = result.data;
                this.saveLocal();
                return true;
            } else {
                throw new Error(result.message || "No data found");
            }
        } catch (e) {
            console.error("Cloud Sync Fetch Error", e);
            throw e;
        }
    }
}

window.appStore = new Store();
