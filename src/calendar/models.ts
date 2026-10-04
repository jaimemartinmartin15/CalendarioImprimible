export interface HolidayEvent {
  month: number;
  day: number;
  name: string;
}

export interface PersonalEvent {
  month: number;
  day: number;
  emoji: string;
  name: string;
}

export interface CalendarEvent {
  month: number;
  day: number;
  emoji: string;
}

interface MiniMonth {
  days: number[];
  month: number;
  year: number;
  dayStartOffset: number;
  monthName: string;
}

export interface DayBox {
  dayNumber: number;

  isWeekend: boolean;
  isFromOtherMonth: boolean;
  isSunday: boolean;

  holidays: HolidayEvent[];
  personalEvents: PersonalEvent[];
  calendarEvents: CalendarEvent[];
}

export interface Week {
  weekNumberOfTheYear: number;
  days: DayBox[];
}

export interface CalendarPage {
  previousMonth: MiniMonth;
  nextMonth: MiniMonth;
  month: number;
  year: number;
  monthName: string;
  weeks: Week[];
}
