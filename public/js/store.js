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
    krsExtraSks: 0,
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
            semester.courses.push(course);
            this.recalculateRetakes(course.code);
            this.saveLocal();
        }
    }

    deleteCourse(semesterId, courseId) {
        const semester = this.data.semesters.find(s => s.id === semesterId);
        if (semester) {
            const course = semester.courses.find(c => c.id === courseId);
            const code = course ? course.code : null;
            semester.courses = semester.courses.filter(c => c.id !== courseId);
            if (code) this.recalculateRetakes(code);
            this.saveLocal();
        }
    }

    editCourse(semesterId, courseId, updatedData) {
        const semester = this.data.semesters.find(s => s.id === semesterId);
        if (semester) {
            const courseIdx = semester.courses.findIndex(c => c.id === courseId);
            if (courseIdx !== -1) {
                const oldCode = semester.courses[courseIdx].code;
                updatedData.sks = Number(updatedData.sks);
                semester.courses[courseIdx] = { ...semester.courses[courseIdx], ...updatedData };
                
                this.recalculateRetakes(oldCode);
                if (oldCode !== updatedData.code) {
                    this.recalculateRetakes(updatedData.code);
                }
                
                this.saveLocal();
            }
        }
    }

    recalculateRetakes(courseCode) {
        if (!courseCode) return;
        const codeLower = courseCode.toLowerCase().trim();
        let lastFound = null;
        
        this.data.semesters.forEach(sem => {
            sem.courses.forEach(c => {
                if (c.code && c.code.toLowerCase().trim() === codeLower) {
                    c.isRetaken = true;
                    lastFound = c;
                }
            });
        });
        
        // Jadikan yang terakhir diambil sebagai nilai yang aktif (tidak retaken)
        if (lastFound) {
            lastFound.isRetaken = false;
        }
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
        this.data.krsExtraSks = 0;
        this.saveLocal();
    }
    
    addKrsExtraSks() {
        this.data.krsExtraSks = this.data.krsExtraSks ? 0 : 1;
        this.saveLocal();
    }

    addSemesterExtraSks(semId) {
        const sem = this.data.semesters.find(s => s.id === semId);
        if (sem) {
            sem.extraSksLimit = sem.extraSksLimit ? 0 : 1;
            this.saveLocal();
        }
    }

    _getNextEmptySemesterName() {
        const firstEmptySem = this.data.semesters.find(s => !s.courses || s.courses.length === 0);
        if (firstEmptySem) {
            return firstEmptySem.name;
        }
        return 'Semester ' + (this.data.semesters.length + 1);
    }

    commitKrsToFixed() {
        if (this.data.krsPlan.length === 0) return false;
        
        if (!this.data.activeKrsSemesterName) {
            this.data.activeKrsSemesterName = this._getNextEmptySemesterName();
        }

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

    updateFixedCourseScore(id, scoreData) {
        if (!this.data.krsFixed) return;
        const crs = this.data.krsFixed.find(c => c.id === id);
        if (crs) {
            crs.tugas = scoreData.tugas;
            crs.uts = scoreData.uts;
            crs.uas = scoreData.uas;
            crs.grade = scoreData.grade;
            if (scoreData.tugasDone !== undefined) crs.tugasDone = scoreData.tugasDone;
            if (scoreData.utsDone !== undefined) crs.utsDone = scoreData.utsDone;
            if (scoreData.uasDone !== undefined) crs.uasDone = scoreData.uasDone;
            this.saveLocal();
        }
    }

    moveFixedToSemester(semesterName) {
        if (this.data.krsFixed.length === 0) return null;
        
        let semester = this.data.semesters.find(s => s.name === semesterName);
        if (!semester) {
            semester = {
                id: 'sem_' + Date.now(),
                name: semesterName || 'Semester Baru',
                courses: [],
                extraSksLimit: this.data.krsExtraSks || 0
            };
            this.data.semesters.push(semester);
        }
        
        // Move courses
        this.data.krsFixed.forEach(crs => {
            let numericScore = 0;
            if (crs.uts !== undefined && crs.tugas !== undefined && crs.uas !== undefined) {
                numericScore = window.AcademicLogic.calculateFinalScore(crs.uts, crs.tugas, crs.uas);
                numericScore = Math.round(numericScore * 100) / 100;
            } else if (crs.grade) {
                const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(crs.grade);
                if (gradeInfo) numericScore = gradeInfo.min;
            }

            const newCourse = {
                id: 'crs_' + Math.random().toString(36).substring(2, 9),
                code: crs.code,
                name: crs.name,
                sks: crs.sks,
                grade: crs.grade || 'A', // Use drafted grade if exists
                score: numericScore
            };
            semester.courses.push(newCourse);
            this.recalculateRetakes(newCourse.code);
        });
        
        this.data.krsFixed = [];
        this.data.krsExtraSks = 0;
        this.data.activeKrsSemesterName = null;
        this.saveLocal();
        return semester;
    }

    moveSingleCourseToSemester(courseId, semesterId) {
        const courseIndex = this.data.krsFixed.findIndex(c => c.id === courseId);
        if (courseIndex === -1) return null;
        
        const crs = this.data.krsFixed[courseIndex];
        
        let numericScore = 0;
        if (crs.uts !== undefined && crs.tugas !== undefined && crs.uas !== undefined) {
            numericScore = window.AcademicLogic.calculateFinalScore(crs.uts, crs.tugas, crs.uas);
            numericScore = Math.round(numericScore * 100) / 100;
        } else if (crs.grade) {
            const gradeInfo = window.AcademicLogic.getGradeInfoFromLetter(crs.grade);
            if (gradeInfo) numericScore = gradeInfo.min;
        }

        const newCourse = {
            id: 'crs_' + Math.random().toString(36).substring(2, 9),
            code: crs.code,
            name: crs.name,
            sks: crs.sks,
            grade: crs.grade || 'A',
            score: numericScore
        };

        if (semesterId === 'active') {
            if (!this.data.activeKrsSemesterName) {
                this.data.activeKrsSemesterName = this._getNextEmptySemesterName();
            }
            const targetName = this.data.activeKrsSemesterName;
            let sem = this.data.semesters.find(s => s.name === targetName);
            if (!sem) {
                sem = {
                    id: 'sem_' + Date.now(),
                    name: targetName,
                    courses: [],
                    extraSksLimit: 0
                };
                this.data.semesters.push(sem);
            }
            if (!sem.courses) sem.courses = [];
            sem.courses.push(newCourse);
        } else if (semesterId === 'new') {
            const semester = {
                id: 'sem_' + Date.now(),
                name: 'Semester ' + (this.data.semesters.length + 1),
                courses: [newCourse],
                extraSksLimit: 0
            };
            this.data.semesters.push(semester);
        } else {
            const sem = this.data.semesters.find(s => s.id === semesterId);
            if (sem) {
                if (!sem.courses) sem.courses = [];
                sem.courses.push(newCourse);
            } else {
                return null;
            }
        }
        
        this.data.krsFixed.splice(courseIndex, 1);
        if (this.data.krsFixed.length === 0) {
            this.data.activeKrsSemesterName = null;
        }
        this.recalculateRetakes(newCourse.code);
        this.saveLocal();
        return true;
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
