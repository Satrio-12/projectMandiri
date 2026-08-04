/**
 * Academic Control System - Core Logic
 */

const GradeScale = [
    { min: 85, max: 100, letter: 'A', gpa: 4.00, status: 'Lulus' },
    { min: 80, max: 84.99, letter: 'A-', gpa: 3.67, status: 'Lulus' },
    { min: 75, max: 79.99, letter: 'B+', gpa: 3.33, status: 'Lulus' },
    { min: 70, max: 74.99, letter: 'B', gpa: 3.00, status: 'Lulus' },
    { min: 65, max: 69.99, letter: 'B-', gpa: 2.67, status: 'Lulus' },
    { min: 60, max: 64.99, letter: 'C+', gpa: 2.33, status: 'Lulus' },
    { min: 50, max: 59.99, letter: 'C', gpa: 2.00, status: 'Lulus (minimal)' },
    { min: 45, max: 49.99, letter: 'D', gpa: 1.00, status: 'Tidak Lulus' },
    { min: 0, max: 44.99, letter: 'E', gpa: 0.00, status: 'Tidak Lulus' }
];

const Weights = {
    uts: 0.3,
    tugas: 0.3,
    uas: 0.4
};

const SKS_TOTAL_TARGET = 144;

class AcademicLogic {
    static getGradeInfoFromScore(score) {
        // Clamp score to 0-100
        const clampedScore = Math.max(0, Math.min(100, score));
        return GradeScale.find(g => clampedScore >= g.min && clampedScore <= (g.max === 100 ? 100.1 : g.max + 0.009)); // Handle float boundaries
    }

    static getGradeInfoFromLetter(letter) {
        return GradeScale.find(g => g.letter === letter);
    }

    static calculateFinalScore(uts, tugas, uas) {
        return (uts * Weights.uts) + (tugas * Weights.tugas) + (uas * Weights.uas);
    }

    static calculateRequiredUAS(uts, tugas, targetLetter) {
        const targetGrade = this.getGradeInfoFromLetter(targetLetter);
        if (!targetGrade) return null;

        const targetScore = targetGrade.min;
        const currentScore = (uts * Weights.uts) + (tugas * Weights.tugas);
        const requiredUas = (targetScore - currentScore) / Weights.uas;

        return requiredUas;
    }

    static calculateIPS(courses) {
        if (!courses || courses.length === 0) return 0;
        
        let totalMutu = 0;
        let totalSKS = 0;

        courses.forEach(course => {
            const gradeInfo = this.getGradeInfoFromLetter(course.grade);
            const gpa = gradeInfo ? gradeInfo.gpa : 0;
            totalMutu += (gpa * course.sks);
            totalSKS += course.sks;
        });

        return totalSKS === 0 ? 0 : Number((totalMutu / totalSKS).toFixed(2));
    }

    static getLastValidIps(semesters, upToIndex = -1) {
        if (!semesters || semesters.length === 0) return 0;
        const maxIndex = upToIndex === -1 ? semesters.length - 1 : upToIndex;
        
        for (let i = maxIndex; i >= 0; i--) {
            if (semesters[i].courses && semesters[i].courses.length > 0) {
                return this.calculateIPS(semesters[i].courses);
            }
        }
        return 0; // Jika tidak ada riwayat sama sekali
    }

    static getJatahSKS(ips) {
        if (ips < 1.50) return 12;
        if (ips < 2.00) return 15;
        if (ips < 2.50) return 18;
        if (ips < 3.00) return 20;
        if (ips < 3.50) return 22;
        return 24;
    }

    // Pass an array of all courses taken historically.
    // Must handle retakes (mengulang). Only the latest course instance (highest or just latest, PRD says "nilai mutu terbaru (hasil mengulang) yang dipakai")
    static calculateIPKAndSKS(allSemesters) {
        let allCourses = [];
        allSemesters.forEach(sem => {
            if(sem.courses) {
                allCourses = allCourses.concat(sem.courses);
            }
        });

        // Map to keep track of the latest grade for each course code
        const latestCoursesMap = new Map();
        
        // Assuming semesters are chronologically ordered, we iterate through all.
        // Actually, to handle "nilai terbaru", we just override in the map using course.code
        allCourses.forEach(course => {
            if(course.code && course.code.trim() !== '') {
                // If it already exists, mark the old one as retaken? The PRD says old is marked inactive.
                // We will handle that marking when adding a course, but for calculation, just use the latest.
                latestCoursesMap.set(course.code.toLowerCase().trim(), course);
            }
        });

        let totalMutu = 0;
        let totalSKSTaken = 0; // Total SKS yang pernah diambil
        let totalSKSForIPK = 0; // Total SKS khusus untuk perhitungan IPK (hanya yang lulus)
        let totalSKSPassed = 0; // >= C

        latestCoursesMap.forEach((course) => {
            const gradeInfo = this.getGradeInfoFromLetter(course.grade);
            if (gradeInfo) {
                totalSKSTaken += course.sks;
                
                // Sesuai permintaan: IPK hanya dihitung dari nilai yang LULUS (C sampai A)
                if (gradeInfo.gpa >= 2.00) { // C is 2.00
                    totalMutu += (gradeInfo.gpa * course.sks);
                    totalSKSForIPK += course.sks;
                    totalSKSPassed += course.sks;
                }
            }
        });

        const ipk = totalSKSForIPK === 0 ? 0 : Number((totalMutu / totalSKSForIPK).toFixed(2));

        return {
            ipk,
            totalSKSTaken,
            totalSKSPassed,
            latestCourses: Array.from(latestCoursesMap.values())
        };
    }
}

window.AcademicLogic = AcademicLogic;
