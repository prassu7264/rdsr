import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  today: number = Date.now();
  
  // Mock Calendar Days (Just for visual demo)
  calendarDays = Array(30).fill(0).map((x,i)=>i+1); 
}