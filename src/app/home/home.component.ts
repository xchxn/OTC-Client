import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from './home.service';

interface Notice {
  id: number;
  title: string;
  content: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent {
  notices: Notice[] = [];

  constructor(
    private homeService: HomeService,
  ) {
    this.loadData();
  }

  loadData(): void {
    this.homeService.getNoticeList().subscribe({
      next: (data) => {
        this.notices = data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
