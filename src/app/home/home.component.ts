import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  important: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  notices: Notice[] = [
    {
      id: 1,
      title: '시스템 점검 안내',
      content: '2025년 1월 5일 새벽 2시부터 4시까지 시스템 점검이 있을 예정입니다.',
      date: '2025-01-01',
      important: true
    },
    {
      id: 2,
      title: 'Objekt Trade Platform Update',
      content: 'Its testing version is available now.',
      date: '2025-01-01',
      important: false
    }
  ];
}
