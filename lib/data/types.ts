export interface Week {
  id: string;
  name: string;
  days: string[];
  values: string[][];
}

export interface Employee {
  id: string;
  name: string;
  meta: number;
  weeks: Week[];
}

export interface DataProvider {
  fetchEmployees(): Promise<Employee[]>;
  createEmployee(name: string): Promise<Employee | null>;
  updateEmployeeName(employeeId: string, name: string): Promise<void>;
  updateEmployeeMeta(employeeId: string, meta: number): Promise<void>;
  deleteEmployee(employeeId: string): Promise<boolean>;
  insertWeek(employeeId: string, week: Omit<Week, "id">): Promise<Week | null>;
  updateWeek(week: Week): Promise<void>;
}
