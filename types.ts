export type DateFormat = "d MMMM yyyy" | "dd/mm/yyyy" | "dd-mm-yyyy";

export interface ReportData {
  unitName: string; // e.g., Kelab Komputer, BSMM
  date: string;
  dateFormat: DateFormat;
  startTime: string;
  endTime: string;
  meetingNumber: string;
  venue: string;
  studentsPresent: number;
  studentsTotal: number;
  attendancePercentage?: number; // New field for Google Sheet
  teachersPresent: string; // List of names or count
  activityTopic: string; // Main topic for AI generation
  activities: string[]; // Detailed steps
  values: string[]; // Nilai Murni
  pikebmTitle: string; // Sisipan PiKeBM
  pikebmSummary: string; // Ringkasan Aktiviti PiKeBM
  kbat: string; // KBAT / HOTS
  advisorNote: string;
}

export const INITIAL_REPORT_DATA: ReportData = {
  unitName: "",
  date: new Date().toISOString().split("T")[0],
  dateFormat: "d MMMM yyyy",
  startTime: "14:00",
  endTime: "16:00",
  meetingNumber: "1",
  venue: "Dewan Sekolah",
  studentsPresent: 0,
  studentsTotal: 0,
  attendancePercentage: 0,
  teachersPresent: "",
  activityTopic: "",
  activities: [],
  values: [],
  pikebmTitle: "",
  pikebmSummary: "",
  kbat: "",
  advisorNote: "",
};