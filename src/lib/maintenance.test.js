import { describe, test, expect } from "vitest";
import {
  nextServiceDate, daysUntilService, serviceStatus, describeDue, sortByUrgency, countByStatus, toText,
} from "./maintenance";

const today = new Date("2026-11-17T15:30:00Z");

const pump = { id: "P-1", lastService: "2026-06-01", intervalDays: 180 }; // due 2026-11-28
const tank = { id: "T-1", lastService: "2025-10-01", intervalDays: 365 }; // due 2026-10-01
const valve = { id: "V-1", lastService: "2026-09-01", intervalDays: 365 }; // due 2027-09-01

describe("next service", () => {
  test("adds the interval to the last service date", () => {
    expect(toText(nextServiceDate(pump))).toBe("2026-11-28");
  });

  test("counts whole days, ignoring the time of day", () => {
    expect(daysUntilService(pump, today)).toBe(11);
  });

  test("is negative when the service is late", () => {
    expect(daysUntilService(tank, today)).toBe(-47);
  });
});

describe("status", () => {
  test("late is overdue", () => {
    expect(serviceStatus(tank, today)).toBe("overdue");
  });

  test("within 30 days is due soon", () => {
    expect(serviceStatus(pump, today)).toBe("soon");
  });

  test("exactly 30 days away is still due soon, 31 is ok", () => {
    const in30 = { lastService: "2026-11-17", intervalDays: 30 };
    const in31 = { lastService: "2026-11-17", intervalDays: 31 };
    expect(serviceStatus(in30, today)).toBe("soon");
    expect(serviceStatus(in31, today)).toBe("ok");
  });

  test("due today is due soon, not overdue", () => {
    const dueToday = { lastService: "2026-10-18", intervalDays: 30 };
    expect(serviceStatus(dueToday, today)).toBe("soon");
  });

  test("far away is ok", () => {
    expect(serviceStatus(valve, today)).toBe("ok");
  });
});

describe("list helpers", () => {
  test("describes the days in plain words", () => {
    expect(describeDue(0)).toBe("due today");
    expect(describeDue(1)).toBe("due in 1 day");
    expect(describeDue(12)).toBe("due in 12 days");
    expect(describeDue(-1)).toBe("1 day late");
    expect(describeDue(-47)).toBe("47 days late");
  });

  test("sorts the most urgent first, without changing the original list", () => {
    const items = [valve, pump, tank];
    expect(sortByUrgency(items, today).map((i) => i.id)).toEqual(["T-1", "P-1", "V-1"]);
    expect(items.map((i) => i.id)).toEqual(["V-1", "P-1", "T-1"]);
  });

  test("counts items per status", () => {
    expect(countByStatus([pump, tank, valve], today)).toEqual({ overdue: 1, soon: 1, ok: 1 });
  });
});
