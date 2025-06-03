import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AttendanceRecord {
  id: string;
  employeeNumber: string;
  employeeName: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  date: string; // 'yyyy-MM-dd' 形式
}

interface AttendanceStore {
  records: AttendanceRecord[];
  addRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  getRecordsByEmployee: (employeeNumber: string) => AttendanceRecord[];
  getRecordsByDate: (date: string) => AttendanceRecord[];
  getRecordsByMonth: (yearMonth: string) => AttendanceRecord[];
  getTodayRecord: (employeeNumber: string) => AttendanceRecord | undefined;
  getWorkDaysInMonth: (employeeNumber: string, yearMonth: string) => number;
  clearAllRecords: () => void;
}

export const useAttendanceStore = create<AttendanceStore>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (record) => {
        const newRecord: AttendanceRecord = {
          ...record,
          id: Date.now().toString(),
        };
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
      },

      updateRecord: (id, updates) => {
        set((state) => ({
          records: state.records.map((record) =>
            record.id === id ? { ...record, ...updates } : record
          ),
        }));
      },

      getRecordsByEmployee: (employeeNumber) => {
        return get().records.filter(
          (record) => record.employeeNumber === employeeNumber
        );
      },

      getRecordsByDate: (date) => {
        return get().records.filter((record) => record.date === date);
      },

      getRecordsByMonth: (yearMonth) => {
        return get().records.filter((record) =>
          record.date.startsWith(yearMonth)
        );
      },

      getTodayRecord: (employeeNumber) => {
        const today = new Date().toISOString().split('T')[0]; // 'yyyy-MM-dd'
        return get().records.find(
          (record) =>
            record.employeeNumber === employeeNumber && record.date === today
        );
      },

      getWorkDaysInMonth: (employeeNumber, yearMonth) => {
        const records = get().getRecordsByMonth(yearMonth);
        const employeeRecords = records.filter(
          (record) => record.employeeNumber === employeeNumber
        );
        
        // 出勤記録がある日（clockInTimeがnullでない）をカウント
        return employeeRecords.filter(
          (record) => record.clockInTime !== null
        ).length;
      },

      clearAllRecords: () => {
        set({ records: [] });
      },
    }),
    {
      name: 'attendance-storage', // localStorage key
    }
  )
);
