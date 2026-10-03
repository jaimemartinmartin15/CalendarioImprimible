import { NgClass, NgStyle } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { intervalArray, MONTHS } from "@jaimemartinmartin15/jei-devkit-angular-shared";
import { Moon } from "./models";

@Component({
  selector: "app-calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
  imports: [NgStyle, NgClass],
})
export class CalendarComponent implements OnInit {
  public year = 2026;

  public holidayEvents: any[] = [
    { month: 0, day: 6, name: "Día de la constitución" },
    { month: 0, day: 18, name: "Día de la constitución" },
  ];
  public personalEvents: any[] = [
    { month: 0, day: 6, emoji: "🥳", name: "Cumple tía Araceli" },
    { month: 0, day: 11, emoji: "🥳", name: "Cumple tía Araceli" },
    { month: 0, day: 18, emoji: "🥳", name: "Cumple tía Araceli" },
  ];
  public moons: Moon[] = [
    { month: 0, day: 6, phase: "🌑" },
    { month: 0, day: 18, phase: "🌒" },
    { month: 0, day: 19, phase: "🌘" },
    { month: 0, day: 26, phase: "🌕" },
  ];

  public calendar = MONTHS.map((_, i) => ({
    previousMonth: {
      month: i === 0 ? 11 : i - 1,
      year: i === 0 ? this.year - 1 : this.year,
    },
    nextMonth: {
      month: i === 11 ? 0 : i + 1,
      year: i === 11 ? this.year + 1 : this.year,
    },
    month: i,
    year: this.year,
  }));

  public ngOnInit() {
    // TODO
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
          moon: this.moons.find((m) => m.month === month && m.day === number && !fueraDeMes)?.phase,
        };
        week.days.push(dayData);
      }
    }

    return weeks;
  }
}
