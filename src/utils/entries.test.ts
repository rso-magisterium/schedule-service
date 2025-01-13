import { ScheduleEntry } from "@prisma/client";
import { Entry, getEntriesWitinSpan } from "./entries";
import { describe, expect, test } from "@jest/globals";

describe("getEntriesWitinSpan", () => {
  test("entry is not in span", () => {
    const entry: ScheduleEntry = {
      id: "1",
      tenantId: "1",
      classroom: "1",
      start: new Date("2025-01-01T12:00:00Z"),
      end: new Date("2025-01-01T13:00:00Z"),
      repeat: "NONE",
      repeatEnd: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z"),
    };
    const from = new Date("2025-02-01T00:00:00Z");
    const to = new Date("2025-02-02T00:00:00Z");

    expect(getEntriesWitinSpan(entry, from, to)).toEqual([]);
  });

  test("entry is in span", () => {
    const entry: ScheduleEntry = {
      id: "1",
      tenantId: "1",
      classroom: "1",
      start: new Date("2025-02-01T12:00:00Z"),
      end: new Date("2025-02-01T13:00:00Z"),
      repeat: "NONE",
      repeatEnd: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z"),
    };
    const from = new Date("2025-02-01T00:00:00Z");
    const to = new Date("2025-02-02T00:00:00Z");

    expect(getEntriesWitinSpan(entry, from, to)).toEqual([
      {
        classroomId: "1",
        start: "2025-02-01T12:00:00.000Z",
        end: "2025-02-01T13:00:00.000Z",
      },
    ]);
  });

  test("daily entry starting before span", () => {
    const entry: ScheduleEntry = {
      id: "1",
      tenantId: "1",
      classroom: "1",
      start: new Date("2025-01-04T12:00:00Z"),
      end: new Date("2025-01-04T13:00:00Z"),
      repeat: "DAILY",
      repeatEnd: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z"),
    };
    const from = new Date("2025-02-01T00:00:00Z");
    const to = new Date("2025-02-03T00:00:00Z");

    expect(getEntriesWitinSpan(entry, from, to)).toEqual([
      {
        classroomId: "1",
        start: "2025-02-01T12:00:00.000Z",
        end: "2025-02-01T13:00:00.000Z",
      },
      {
        classroomId: "1",
        start: "2025-02-02T12:00:00.000Z",
        end: "2025-02-02T13:00:00.000Z",
      },
    ]);
  });

  test("weekly entry starting before span", () => {
    const entry: ScheduleEntry = {
      id: "1",
      tenantId: "1",
      classroom: "1",
      start: new Date("2025-01-04T12:00:00Z"),
      end: new Date("2025-01-04T13:00:00Z"),
      repeat: "WEEKLY",
      repeatEnd: null,
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z"),
    };
    const from = new Date("2025-02-01T00:00:00Z");
    const to = new Date("2025-02-02T00:00:00Z");

    expect(getEntriesWitinSpan(entry, from, to)).toEqual([
      {
        classroomId: "1",
        start: "2025-02-01T12:00:00.000Z",
        end: "2025-02-01T13:00:00.000Z",
      },
    ]);
  });

  test("weekly entry ending before span", () => {
    const entry: ScheduleEntry = {
      id: "1",
      tenantId: "1",
      classroom: "1",
      start: new Date("2025-01-04T12:00:00Z"),
      end: new Date("2025-01-04T13:00:00Z"),
      repeat: "WEEKLY",
      repeatEnd: new Date("2025-02-01T00:00:00Z"),
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z"),
    };
    const from = new Date("2025-02-01T00:00:00Z");
    const to = new Date("2025-02-02T00:00:00Z");

    expect(getEntriesWitinSpan(entry, from, to)).toEqual([]);
  });

  test("monthly entry starting before span and ending after", () => {
    const entry: ScheduleEntry = {
      id: "1",
      tenantId: "1",
      classroom: "1",
      start: new Date("2025-01-01T12:00:00Z"),
      end: new Date("2025-01-01T13:00:00Z"),
      repeat: "MONTHLY",
      repeatEnd: new Date("2025-03-05T00:00:00Z"),
      createdAt: new Date("2025-01-01T00:00:00Z"),
      updatedAt: new Date("2025-01-01T00:00:00Z"),
    };
    const from = new Date("2025-02-01T00:00:00Z");
    const to = new Date("2025-02-25T00:00:00Z");

    expect(getEntriesWitinSpan(entry, from, to)).toEqual([
      {
        classroomId: "1",
        start: "2025-02-01T12:00:00.000Z",
        end: "2025-02-01T13:00:00.000Z",
      },
    ]);
  });

  test("yearly entry starting before span", () => {
    const entry: ScheduleEntry = {
      id: "1",
      tenantId: "1",
      classroom: "1",
      start: new Date("2020-01-01T12:00:00Z"),
      end: new Date("2020-01-01T13:00:00Z"),
      repeat: "YEARLY",
      repeatEnd: null,
      createdAt: new Date("2020-01-01T00:00:00Z"),
      updatedAt: new Date("2020-01-01T00:00:00Z"),
    };
    const from = new Date("2025-01-01T00:00:00Z");
    const to = new Date("2027-01-01T00:00:00Z");

    expect(getEntriesWitinSpan(entry, from, to)).toEqual([
      {
        classroomId: "1",
        start: "2025-01-01T12:00:00.000Z",
        end: "2025-01-01T13:00:00.000Z",
      },
      {
        classroomId: "1",
        start: "2026-01-01T12:00:00.000Z",
        end: "2026-01-01T13:00:00.000Z",
      },
    ]);
  });
});
