import type { SupabaseClient } from "@supabase/supabase-js";
import { emptyWeekValues } from "@/lib/constants";
import type { DataProvider, Employee, Week } from "./types";

interface WeekRow {
  id: string;
  name: string;
  days: string[] | null;
  values: string[][] | null;
}

export function createSupabaseDataProvider(
  supabase: SupabaseClient,
  userId: string,
): DataProvider {
  return {
    async fetchEmployees() {
      const { data, error } = await supabase
        .from("employees")
        .select("id,name,meta,weeks:weeks(id,name,days,values)")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        return [];
      }

      return (data ?? []).map((row): Employee => ({
        id: row.id,
        name: row.name,
        meta: row.meta ?? 100,
        weeks: ((row.weeks ?? []) as WeekRow[]).map((w): Week => ({
          id: w.id,
          name: w.name,
          days: w.days ?? ["", "", "", "", ""],
          values: w.values ?? emptyWeekValues(),
        })),
      }));
    },

    async createEmployee(name) {
      const { data, error } = await supabase
        .from("employees")
        .insert({ user_id: userId, name, meta: 100 })
        .select("id,name,meta")
        .single();

      if (error || !data) {
        console.error(error);
        return null;
      }
      return { id: data.id, name: data.name, meta: data.meta ?? 100, weeks: [] };
    },

    async updateEmployeeName(employeeId, name) {
      await supabase.from("employees").update({ name }).eq("id", employeeId).eq("user_id", userId);
    },

    async updateEmployeeMeta(employeeId, meta) {
      await supabase.from("employees").update({ meta }).eq("id", employeeId).eq("user_id", userId);
    },

    async deleteEmployee(employeeId) {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employeeId)
        .eq("user_id", userId);

      if (error) {
        console.error(error);
        return false;
      }
      return true;
    },

    async insertWeek(employeeId, week) {
      const { data, error } = await supabase
        .from("weeks")
        .insert({ employee_id: employeeId, name: week.name, days: week.days, values: week.values })
        .select("id,name,days,values")
        .single();

      if (error || !data) {
        console.error(error);
        return null;
      }
      return { id: data.id, name: data.name, days: data.days, values: data.values };
    },

    async updateWeek(week) {
      await supabase
        .from("weeks")
        .update({ name: week.name, days: week.days, values: week.values })
        .eq("id", week.id);
    },
  };
}
