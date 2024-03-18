import { dateTime } from '@Tools/dateTime';

const { extractTime, timeStringMinutes } = dateTime;

export function matchUpScheduleSort(a: any, b: any): number {
  const scheduleA = a.schedule ?? {};
  const scheduleB = b.schedule ?? {};
  if (scheduleA.scheduledDate && !scheduleB.scheduledDate) return 1;
  if (scheduleB.scheduledDate && !scheduleA.scheduledDate) return -1;
  if (scheduleA.scheduledDate && scheduleB.scheduledDate) {
    if (scheduleA.scheduledDate === scheduleB.scheduledDate) {
      if (scheduleA.scheduledTime && !scheduleB.scheduledTime) return 1;
      if (scheduleB.scheduledTime && !scheduleA.scheduledTime) return -1;
      if (scheduleA.scheduledTime && scheduleB.scheduledTime) {
        const timeA = timeStringMinutes(extractTime(scheduleA.scheduledTime));
        const timeB = timeStringMinutes(extractTime(scheduleB.scheduledTime));
        return timeA - timeB;
      }
    }
    return new Date(scheduleA.scheduledDate).getTime() - new Date(scheduleB.scheduledDate).getTime();
  }
  return 0;
}
