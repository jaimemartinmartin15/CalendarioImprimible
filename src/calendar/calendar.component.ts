import { NgClass, NgStyle } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { CollapsibleModule, intervalArray, MONTHS } from "@jaimemartinmartin15/jei-devkit-angular-shared";
import { ChevronSvgComponent } from "../svg-output/chevron.component";
import { PlusSvgComponent } from "../svg-output/plus.component";
import { CalendarEvent, CalendarPage, DayBox, HolidayEvent, PersonalEvent, Week } from "./models";

//#region utils
const LOCAL_STORAGE_PREFIX = "calendario-imprimible";
const LOCAL_STORAGE_KEYS = {
  HOLIDAY_EVENTS: `${LOCAL_STORAGE_PREFIX}:holiday-events`,
  PERSONAL_EVENTS: `${LOCAL_STORAGE_PREFIX}:personal-events`,
  CALENDAR_EVENTS: `${LOCAL_STORAGE_PREFIX}:calendar-events`,
};

const dateSorter = (a: { day: number; month: number }, b: { day: number; month: number }) => {
  if (a.month < b.month) return -1;
  if (a.month > b.month) return 1;
  if (a.day < b.day) return -1;
  if (a.day > b.day) return 1;
  return 0;
};
//#endregion

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
  imports: [NgStyle, NgClass, ReactiveFormsModule, CollapsibleModule, ChevronSvgComponent, PlusSvgComponent],
})
export class CalendarComponent implements OnInit {
  public availableYears: number[] = [];
  public selectYearControl = new FormControl<number>(0); // initiated in ngOnInit

  public holidayEvents: HolidayEvent[] = [];
  public holidayListIsExpanded: boolean = true;
  public personalEvents: PersonalEvent[] = [];
  public personalListIsExpanded: boolean = true;
  public calendarEvents: CalendarEvent[] = [];
  public calendarListIsExpanded: boolean = true;

  public calendar: CalendarPage[];

  public ngOnInit() {
    this.loadLocalStorage();

    const currentYear = new Date().getFullYear();
    this.availableYears = intervalArray(5).map((n) => currentYear + n - 2);
    this.selectYearControl.valueChanges.subscribe((year) => {
      year ??= currentYear;
      this.calendar = MONTHS.map((_, month) => {
        const previousMonth = month === 0 ? 11 : month - 1;
        const previousYear = month === 0 ? year - 1 : year;
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;
        return {
          previousMonth: {
            month: previousMonth,
            year: previousYear,
            days: this.getMiniMonthDays(previousYear, previousMonth),
            dayStartOffset: this.getDayStartOffset(previousYear, previousMonth),
            monthName: this.getMonthName(previousMonth),
          },
          nextMonth: {
            month: nextMonth,
            year: nextYear,
            days: this.getMiniMonthDays(nextYear, nextMonth),
            dayStartOffset: this.getDayStartOffset(nextYear, nextMonth),
            monthName: this.getMonthName(nextMonth),
          },
          month,
          year,
          monthName: this.getMonthName(month),
          weeks: this.getWeeksForMonth(year, month),
        };
      });
    });
    this.selectYearControl.setValue(currentYear + 1);
  }

  private loadLocalStorage() {
    this.holidayEvents = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_EVENTS) ?? "[]");
    this.personalEvents = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.PERSONAL_EVENTS) ?? "[]");
    this.calendarEvents = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.CALENDAR_EVENTS) ?? "[]");
  }

  private getMonthName(month: number): string {
    return MONTHS[month].toLowerCase();
  }

  private getMiniMonthDays(year: number, month: number): number[] {
    // by adding 1 to the month and using 0 as day, the result is the last day of desired month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return intervalArray(daysInMonth);
  }

  private getDayStartOffset(year: number, month: number): number {
    // getDay(): 0 -> Sunday, 1 -> Monday, ... , 6 -> Saturday
    return new Date(year, month, 1).getDay() || 7; // for css, index starts with 1
  }

  private getISOWeek(year: number, month: number, day: number): number {
    const date = new Date(Date.UTC(year, month, day));

    // first week is of the year is that one that contains the first Thursday (+4) (ISO rule)
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  private getWeeksForMonth(year: number, month: number): Week[] {
    const weeks: Week[] = [];

    const offset = this.getDayStartOffset(year, month) - 1;
    const numberOfDaysInMonth = new Date(year, month + 1, 0).getDate();
    const numberOfDaysInPreviousMonth = new Date(year, month, 0).getDate();

    const rows = Math.ceil((offset + numberOfDaysInMonth) / 7);
    for (let row = 0; row < rows; row++) {
      const mondayIndex = row * 7 - offset + 1; // +1 because day can't be 0
      const week: Week = {
        weekNumberOfTheYear: this.getISOWeek(year, month, mondayIndex),
        days: [],
      };
      weeks.push(week);

      for (let day = 0; day < 7; day++) {
        let dayNumber = row * 7 + day - offset + 1; // +1 because day can't be 0
        const isOtherMonth = dayNumber < 1 || dayNumber > numberOfDaysInMonth;
        dayNumber = isOtherMonth ? (dayNumber < 1 ? numberOfDaysInPreviousMonth + dayNumber : dayNumber - numberOfDaysInMonth) : dayNumber;

        const dayData: DayBox = {
          dayNumber,
          isWeekend: day >= 5,
          isFromOtherMonth: isOtherMonth,
          isSunday: day === 6,
          holidays: this.holidayEvents.filter((e) => e.month === month && e.day === dayNumber && !isOtherMonth),
          personalEvents: this.personalEvents.filter((e) => e.month === month && e.day === dayNumber && !isOtherMonth),
          calendarEvents: this.calendarEvents.filter((m) => m.month === month && m.day === dayNumber && !isOtherMonth),
        };
        week.days.push(dayData);
      }
    }

    return weeks;
  }

  public scrollToMonth(month: number) {
    document.getElementById("page-" + month)?.scrollIntoView({ behavior: "smooth" });
  }

  private updateView() {
    this.selectYearControl.setValue(this.selectYearControl.value);
  }

  //#region holidays
  public addNewHoliday(): void {
    this.holidayEvents.unshift({ month: 0, day: 1, name: "" });
    localStorage.setItem(LOCAL_STORAGE_KEYS.HOLIDAY_EVENTS, JSON.stringify(this.holidayEvents));
    this.updateView();
  }

  public saveHolidayDay(newValue: number, item: HolidayEvent): void {
    item.day = +newValue;
    this.holidayEvents = this.holidayEvents.sort(dateSorter);
    localStorage.setItem(LOCAL_STORAGE_KEYS.HOLIDAY_EVENTS, JSON.stringify(this.holidayEvents));
    this.updateView();
  }

  public saveHolidayMonth(newValue: number, item: HolidayEvent): void {
    item.month = +newValue;
    this.holidayEvents = this.holidayEvents.sort(dateSorter);
    localStorage.setItem(LOCAL_STORAGE_KEYS.HOLIDAY_EVENTS, JSON.stringify(this.holidayEvents));
    this.updateView();
  }

  public saveHolidayName(newValue: string, item: HolidayEvent): void {
    item.name = newValue;
    localStorage.setItem(LOCAL_STORAGE_KEYS.HOLIDAY_EVENTS, JSON.stringify(this.holidayEvents));
    this.updateView();
  }

  public removeHoliday(item: HolidayEvent): void {
    this.holidayEvents.splice(this.holidayEvents.indexOf(item), 1);
    localStorage.setItem(LOCAL_STORAGE_KEYS.HOLIDAY_EVENTS, JSON.stringify(this.holidayEvents));
    this.updateView();
  }
  //#endregion

  //#region personal
  public addNewPersonalEvent(): void {
    this.personalEvents.unshift({ month: 0, day: 1, emoji: "", name: "" });
    localStorage.setItem(LOCAL_STORAGE_KEYS.PERSONAL_EVENTS, JSON.stringify(this.personalEvents));
    this.updateView();
  }

  public savePersonalEventDay(newValue: number, item: PersonalEvent): void {
    item.day = +newValue;
    this.personalEvents = this.personalEvents.sort(dateSorter);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PERSONAL_EVENTS, JSON.stringify(this.personalEvents));
    this.updateView();
  }
  public savePersonalEventMonth(newValue: number, item: PersonalEvent): void {
    item.month = +newValue;
    this.personalEvents = this.personalEvents.sort(dateSorter);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PERSONAL_EVENTS, JSON.stringify(this.personalEvents));
    this.updateView();
  }

  public savePersonalEventEmoji(newValue: string, item: PersonalEvent): void {
    item.emoji = newValue;
    localStorage.setItem(LOCAL_STORAGE_KEYS.PERSONAL_EVENTS, JSON.stringify(this.personalEvents));
    this.updateView();
  }

  public savePersonalEventName(newValue: string, item: PersonalEvent): void {
    item.name = newValue;
    localStorage.setItem(LOCAL_STORAGE_KEYS.PERSONAL_EVENTS, JSON.stringify(this.personalEvents));
    this.updateView();
  }

  public removePersonalEvent(item: PersonalEvent): void {
    this.personalEvents.splice(this.personalEvents.indexOf(item), 1);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PERSONAL_EVENTS, JSON.stringify(this.personalEvents));
    this.updateView();
  }
  //#endregion

  //#region calendar
  public addNewCalendarEvent(): void {
    this.calendarEvents.unshift({ month: 0, day: 1, emoji: "" });
    localStorage.setItem(LOCAL_STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(this.calendarEvents));
    this.updateView();
  }

  public saveCalendarEventDay(newValue: number, item: CalendarEvent): void {
    item.day = +newValue;
    this.calendarEvents = this.calendarEvents.sort(dateSorter);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(this.calendarEvents));
    this.updateView();
  }
  public saveCalendarEventMonth(newValue: number, item: CalendarEvent): void {
    item.month = +newValue;
    this.calendarEvents = this.calendarEvents.sort(dateSorter);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(this.calendarEvents));
    this.updateView();
  }

  public saveCalendarEventEmoji(newValue: string, item: CalendarEvent): void {
    item.emoji = newValue;
    localStorage.setItem(LOCAL_STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(this.calendarEvents));
    this.updateView();
  }

  public removeCalendarEvent(item: CalendarEvent): void {
    this.calendarEvents.splice(this.calendarEvents.indexOf(item), 1);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(this.calendarEvents));
    this.updateView();
  }
  //#endregion
}
