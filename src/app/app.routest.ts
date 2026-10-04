import { Routes } from '@angular/router';
import { CalendarComponent } from '../calendar/calendar.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CalendarComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
