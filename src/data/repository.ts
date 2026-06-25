import type {
  Account, ClassJourney, ClassReport, ExamPaper, Klass, Ky, MissionDetail, PhongOverview, School, SchoolReport,
  Student, StudentExamSubmission, StudentJourney, StudentMissionSubmission, StudentProfile, StudentOverview,
  Subject, TeacherProfile, Teaching,
} from "./types";

export interface ReportRepository {
  getAccounts(): Account[];
  getAccount(id: string): Account | undefined;
  getSchools(): School[];
  getClassesOfSchool(schoolId: string): Klass[];
  getStudentsOfClass(classId: string): Student[];
  getClass(classId: string): Klass | undefined;
  getSchool(schoolId: string): School | undefined;
  getPhongOverview(): PhongOverview;
  getSchoolReport(schoolId: string): SchoolReport;
  getClassReport(classId: string): ClassReport;
  getStudentProfile(studentId: string): StudentProfile;
  getTeaching(): Teaching;
  getTeacherProfile(teacherId: string): TeacherProfile;
  getExamPaper(examId: string): ExamPaper;
  getStudentExamSubmission(examId: string, key: string): StudentExamSubmission;
  getMissionDetail(missionId: string): MissionDetail;
  getStudentMissionSubmission(missionId: string, studentId: string): StudentMissionSubmission;
  getStudentJourney(studentId: string, term: Ky, subject: Subject): StudentJourney;
  getClassJourney(classId: string, term: Ky, subject: Subject): ClassJourney;
  getStudentOverview(studentId: string, term: Ky): StudentOverview;
}
