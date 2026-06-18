import type { DataProvider, Employee, Week } from "./types";

const STORAGE_KEY = "tendup_demo_employees";

function uid(): string {
  return crypto.randomUUID?.() ?? String(Date.now() + Math.random());
}

function readAll(): Employee[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeAll(list: Employee[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage indisponível (ex.: modo privado) - falha silenciosa, como hoje
  }
}

export function createLocalDataProvider(): DataProvider {
  return {
    async fetchEmployees() {
      return readAll();
    },

    async createEmployee(name) {
      const list = readAll();
      const employee: Employee = { id: uid(), name, meta: 100, weeks: [] };
      list.push(employee);
      writeAll(list);
      return employee;
    },

    async updateEmployeeName(employeeId, name) {
      const list = readAll();
      const employee = list.find((e) => e.id === employeeId);
      if (employee) {
        employee.name = name;
        writeAll(list);
      }
    },

    async updateEmployeeMeta(employeeId, meta) {
      const list = readAll();
      const employee = list.find((e) => e.id === employeeId);
      if (employee) {
        employee.meta = meta;
        writeAll(list);
      }
    },

    async deleteEmployee(employeeId) {
      const list = readAll();
      const next = list.filter((e) => e.id !== employeeId);
      writeAll(next);
      return next.length !== list.length;
    },

    async insertWeek(employeeId, week) {
      const list = readAll();
      const employee = list.find((e) => e.id === employeeId);
      if (!employee) return null;
      const saved: Week = { id: uid(), name: week.name, days: week.days, values: week.values };
      employee.weeks.push(saved);
      writeAll(list);
      return saved;
    },

    async updateWeek(week) {
      const list = readAll();
      for (const employee of list) {
        const found = employee.weeks.find((w) => w.id === week.id);
        if (found) {
          found.name = week.name;
          found.days = week.days;
          found.values = week.values;
          writeAll(list);
          return;
        }
      }
    },
  };
}
