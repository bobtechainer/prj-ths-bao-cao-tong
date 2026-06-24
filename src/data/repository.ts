import type {
  Account, ClassReport, ExamPaper, Klass, MissionDetail, PhongOverview, School, SchoolReport,
  Student, StudentExamSubmission, StudentMissionSubmission, StudentProfile, Teaching,
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
  getExamPaper(examId: string): ExamPaper;
  getStudentExamSubmission(examId: string, key: string): StudentExamSubmission;
  getMissionDetail(missionId: string): MissionDetail;
  getStudentMissionSubmission(missionId: string, studentId: string): StudentMissionSubmission;
}
