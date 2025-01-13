import { Repeat, ScheduleEntry } from "@prisma/client";

interface Entry {
  classroomId: string;
  classroomName?: string;
  start: string;
  end: string;
}

const startsInSpan = (entry: ScheduleEntry, from: Date, to: Date): boolean => {
  const start = new Date(entry.start);
  return start >= from && start <= to;
};

const endsInSpan = (entry: ScheduleEntry, from: Date, to: Date): boolean => {
  const end = new Date(entry.end);
  return end >= from && end <= to;
};

const getEntriesWitinSpan = (entry: ScheduleEntry, from: Date, to: Date): Entry[] => {
  const entries: Entry[] = [];
  const start = entry.start;
  const end = entry.end;

  if (entry.repeat === Repeat.NONE) {
    if (startsInSpan(entry, from, to) || endsInSpan(entry, from, to)) {
      entries.push({
        classroomId: entry.classroom,
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }

    return entries;
  }

  if (!entry.repeatEnd || (entry.repeatEnd && new Date(entry.repeatEnd) > from)) {
    while (start < to) {
      entry.start = start;
      entry.end = end;
      if (startsInSpan(entry, from, to) || endsInSpan(entry, from, to)) {
        entries.push({
          classroomId: entry.classroom,
          start: start.toISOString(),
          end: end.toISOString(),
        });
      }

      if (entry.repeat === Repeat.DAILY) {
        start.setDate(start.getDate() + 1);
        end.setDate(end.getDate() + 1);
      } else if (entry.repeat === Repeat.WEEKLY) {
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
      } else if (entry.repeat === Repeat.MONTHLY) {
        start.setMonth(start.getMonth() + 1);
        end.setMonth(end.getMonth() + 1);
      } else if (entry.repeat === Repeat.YEARLY) {
        start.setFullYear(start.getFullYear() + 1);
        end.setFullYear(end.getFullYear() + 1);
      }
    }
  }

  return entries;
};

export { Entry, getEntriesWitinSpan };
