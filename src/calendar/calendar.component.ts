import { NgClass, NgStyle } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { intervalArray, MONTHS } from "@jaimemartinmartin15/jei-devkit-angular-shared";
import { CalendarEvent, HolidayEvent, PersonalEvent } from "./models";

//#region local storage
const LOCAL_STORAGE_PREFIX = "calendario-imprimible";
const LOCAL_STORAGE_KEYS = {
  HOLIDAY_EVENTS: `${LOCAL_STORAGE_PREFIX}:holiday-events`,
  PERSONAL_EVENTS: `${LOCAL_STORAGE_PREFIX}:personal-events`,
  CALENDAR_EVENTS: `${LOCAL_STORAGE_PREFIX}:calendar-events`,
};
//#endregion

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
  imports: [NgStyle, NgClass, ReactiveFormsModule],
})
export class CalendarComponent implements OnInit {
  public availableYears: number[] = [];
  public selectYearControl = new FormControl<number>(0); // initiated in ngOnInit

  public holidayEvents: HolidayEvent[] = [];
  public personalEvents: PersonalEvent[] = [];
  public calendarEvents: CalendarEvent[] = [];

  public calendar: any[]; // TODO typing

  public ngOnInit() {
    this.loadLocalStorage();

    const currentYear = new Date().getFullYear();
    this.availableYears = intervalArray(5).map((n) => currentYear + n - 2);
    this.selectYearControl.valueChanges.subscribe((year) => {
      // TODO add events and calculate weeks and others directly here
      this.calendar = MONTHS.map((_, i) => ({
        previousMonth: {
          month: i === 0 ? 11 : i - 1,
          year: i === 0 ? year! - 1 : year,
        },
        nextMonth: {
          month: i === 11 ? 0 : i + 1,
          year: i === 11 ? year! + 1 : year,
        },
        month: i,
        year,
      }));
    });
    this.selectYearControl.setValue(currentYear + 1);
  }

  private loadLocalStorage() {
    this.holidayEvents = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.HOLIDAY_EVENTS) ?? "[]");
    this.personalEvents = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.PERSONAL_EVENTS) ?? "[]");
    this.calendarEvents = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.CALENDAR_EVENTS) ?? "[]");
  }

  public getMonthName(month: number): string {
    return MONTHS[month].toLowerCase();
  }

  public getMiniMonthDays(year: number, month: number): number[] {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return intervalArray(daysInMonth);
  }

  public getDayStartOffset(year: number, month: number): number {
    // getDay(): 0 -> Sunday, 1 -> Monday, ... , 6 -> Saturday
    return new Date(year, month, 1).getDay() || 7;
  }

  private getISOWeek(year: number, month: number, day: number): number {
    const date = new Date(Date.UTC(year, month, day));

    // first week is of the year is that one that contains the first Thursday (+4) (ISO rule)
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));

    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  // TODO typing
  public weeksForMonth(year: number, month: number): any[] {
    const weeks: any[] = [];

    const offset = this.getDayStartOffset(month, year) - 1;
    const numberOfDaysInMonth = new Date(year, month + 1, 0).getDate();
    const numberOfDaysInPreviousMonth = new Date(year, month, 0).getDate();

    const rows = Math.ceil((offset + numberOfDaysInMonth) / 7);
    for (let row = 0; row < rows; row++) {
      const week: any = { days: [] };
      weeks.push(week);

      const mondayIndex = row * 7 - offset + 1;
      week.number = this.getISOWeek(year, month, mondayIndex);

      for (let day = 0; day < 7; day++) {
        const indice = row * 7 + day - offset + 1;
        const fueraDeMes = indice < 1 || indice > numberOfDaysInMonth;
        const number = fueraDeMes ? (indice < 1 ? numberOfDaysInPreviousMonth + indice : indice - numberOfDaysInMonth) : indice;

        const clases = ["celda"];
        if (fueraDeMes) clases.push("otro-mes");
        if (day >= 5) clases.push("finde");
        if (day === 6) clases.push("domingo");

        const dayData = {
          number,
          isWeekend: day >= 5,
          isFromOtherMonth: fueraDeMes,
          isSunday: day === 6,
          holidays: this.holidayEvents.filter((e) => e.month === month && e.day === number && !fueraDeMes),
          personalEvents: this.personalEvents.filter((e) => e.month === month && e.day === number && !fueraDeMes),
          calendarEvents: this.calendarEvents.filter((m) => m.month === month && m.day === number && !fueraDeMes),
        };
        week.days.push(dayData);
      }
    }

    return weeks;
  }
}
