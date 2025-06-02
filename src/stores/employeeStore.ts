import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export enum SalaryType {
  Hourly = '時給',
  DailyMonthly = '日給月給',
  Fixed = '固定給'
}

export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  salaryType: SalaryType;
  baseSalary: number; // Hourly rate, daily rate, or monthly salary
  transportationAllowance: number;
  allowances: {
    name: string;
    amount: number;
  }[];
  dependents: number;
  healthInsurance: number;
  nursingInsurance: number;
  pensionInsurance: number;
  residentTax: {
    june: number;
    other: number;
  };
  paidLeaveRemaining: number;
}

interface EmployeeState {
  employees: Employee[];
  getEmployee: (id: string) => Employee | undefined;
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  searchEmployees: (query: string) => Employee[];
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set, get) => ({
      employees: [],
      
      getEmployee: (id) => {
        return get().employees.find(employee => employee.id === id);
      },
      
      addEmployee: (employee) => {
        const id = Date.now().toString();
        const newEmployee = { ...employee, id };
        set(state => ({
          employees: [...state.employees, newEmployee]
        }));
        return newEmployee;
      },
      
      updateEmployee: (id, updatedEmployee) => {
        set(state => ({
          employees: state.employees.map(employee => 
            employee.id === id 
              ? { ...employee, ...updatedEmployee } 
              : employee
          )
        }));
      },
      
      deleteEmployee: (id) => {
        set(state => ({
          employees: state.employees.filter(employee => employee.id !== id)
        }));
      },
      
      searchEmployees: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().employees.filter(
          employee => 
            employee.name.toLowerCase().includes(lowerQuery) || 
            employee.employeeNumber.includes(query)
        );
      }
    }),
    {
      name: 'employee-storage'
    }
  )
);