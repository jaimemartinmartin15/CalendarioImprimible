import { NgStyle } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { intervalArray, MONTHS } from "@jaimemartinmartin15/jei-devkit-angular-shared";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
  imports: [NgStyle],
})
export class CalendarComponent implements OnInit {
  public calendar = MONTHS.map((month) => ({
    previousMonth: {
      monthName: "marzo",
      year: 2026,
    },
    nextMonth: {
      monthName: "febrero",
      year: 2027,
    },
    monthName: month.toLowerCase(),
    year: 2027,
  }));

  public ngOnInit() {
    // TODO
  }

  public getMiniMonthDays(month: string, year: number): number[] {
    // month: 1 = january, 12 = december
    const daysInMonth = new Date(year, MONTHS.map((m) => m.toLowerCase()).indexOf(month.toLowerCase()) + 1, 0).getDate();

    return intervalArray(daysInMonth);
  }

  public getDayStartOffset(month: string, year: number): number {
    const monthIndex = MONTHS.map((m) => m.toLowerCase()).indexOf(month.toLowerCase());
    // getDay(): 0 -> Sunday, 1 -> Monday, ... , 6 -> Saturday
    return new Date(year, monthIndex, 1).getDay() || 7;
  }
}
