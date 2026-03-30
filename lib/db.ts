import fs from 'fs';
import path from 'path';

export type Patient = {
  id: string;
  code: string;
  name: string;
  age: number;
  dob?: string;
  city?: string;
  condition: string;
  day: number;
  totalDays: number;
  status: "good" | "mild" | "critical";
  painLevel: number;
  lastCheckin: string;
  caregiver: string;
  temp: string;
  qsofa: number;
  adherence: number;
  trend: "improving" | "stable" | "worsening";
  doctorName: string;
};

export type Alert = {
  id: number;
  patientId: string;
  patient: string;
  type: "critical" | "moderate" | "mild";
  message: string;
  time: string;
  resolved: boolean;
};

export type Checkin = {
  id: number;
  patientId: string;
  date: string;
  painLevel: number;
  temp: string;
  status: string;
  notes: string;
  symptoms: string[];
  qsofaScore: number;
};

export type Medication = {
  name: string;
  time: string;
  taken: boolean;
  icon: string;
};

export type Task = {
  task: string;
  done: boolean;
  category: string;
};

export type WoundPhoto = {
  day: string;
  status: string;
  color: string;
  notes?: string;
};

export type Database = {
  patients: Patient[];
  alerts: Alert[];
  checkins: Checkin[];
  medications: Record<string, Medication[]>;
  tasks: Record<string, Task[]>;
  wounds: Record<string, WoundPhoto[]>;
};

const DB_PATH = path.join(process.cwd(), 'data.json');

const INITIAL_DB: Database = {
  patients: [
    { id: "HM-001", code: "1234", name: "Rajesh Patel", age: 54, condition: "Post Cardiac Surgery", day: 10, totalDays: 21, status: "good", painLevel: 3, lastCheckin: "2 hrs ago", caregiver: "Sunita Patel", temp: "98.4°F", qsofa: 0, adherence: 85, trend: "improving", doctorName: "Dr. Meera Shah" },
    { id: "HM-002", code: "2345", name: "Priya Sharma", age: 42, condition: "Post Appendectomy", day: 5, totalDays: 14, status: "mild", painLevel: 6, lastCheckin: "5 hrs ago", caregiver: "Rohit Sharma", temp: "99.8°F", qsofa: 1, adherence: 72, trend: "stable", doctorName: "Dr. Meera Shah" },
    { id: "HM-003", code: "3456", name: "Mohan Das", age: 67, condition: "Hip Replacement", day: 14, totalDays: 30, status: "critical", painLevel: 8, lastCheckin: "8 hrs ago", caregiver: "Kavita Das", temp: "101.2°F", qsofa: 2, adherence: 45, trend: "worsening", doctorName: "Dr. Meera Shah" }
  ],
  alerts: [
    { id: 1, patientId: "HM-003", patient: "Mohan Das", type: "critical", message: "qSOFA score 2/3 — High sepsis risk. Immediate review needed.", time: "15 min ago", resolved: false },
    { id: 2, patientId: "HM-002", patient: "Priya Sharma", type: "moderate", message: "Pain level jumped from 4 to 6 in last 24 hours.", time: "5 hrs ago", resolved: false }
  ],
  checkins: [
    { id: 1, patientId: "HM-001", date: "Today", painLevel: 3, temp: "98.4°F", status: "good", notes: "Feeling better", symptoms: [], qsofaScore: 0 }
  ],
  medications: {
    "HM-001": [
      { name: "Aspirin 75mg", time: "8:00 AM", taken: true, icon: "💊" },
      { name: "Metoprolol 25mg", time: "2:00 PM", taken: true, icon: "💊" },
      { name: "Atorvastatin 40mg", time: "9:00 PM", taken: false, icon: "💊" }
    ]
  },
  tasks: {
    "HM-001": [
      { task: "10-min morning walk", done: true, category: "Exercise" },
      { task: "Breathing exercises (3 sets)", done: true, category: "Exercise" },
      { task: "Wound dressing check", done: false, category: "Wound Care" }
    ]
  },
  wounds: {
    "HM-001": [
      { day: "Day 1", status: "Baseline", color: "#94a3b8" },
      { day: "Day 5", status: "Improving", color: "#f59e0b" }
    ]
  }
};

// In-memory cache for serverless environments (will reset on cold starts)
let memoryDb: Database | null = null;


export function getDb(): Database {
  // 1. Try memory cache first (for serverless speed)
  if (memoryDb) return memoryDb;

  try {
    // 2. Try filesystem (local dev)
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      memoryDb = JSON.parse(data);
      return memoryDb!;
    }
  } catch (error) {
    console.warn('FS Read Failed (Normal on Vercel):', error);
  }

  // 3. Fallback to Initial Data
  memoryDb = INITIAL_DB;
  return INITIAL_DB;
}

export function writeDb(db: Database) {
  memoryDb = db; // Always update memory cache
  
  try {
    // Only attempt write in environments where FS is available
    if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
       fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    }
  } catch (error) {
    // Silently fail on Vercel - memoryDb handles short-term persistence
    console.warn('FS Write Failed (Normal on Vercel):', error);
  }
}
