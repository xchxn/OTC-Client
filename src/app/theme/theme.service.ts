import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkMode: boolean = false;

  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode)); // 상태 저장
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
  
  loadTheme() {
    const savedTheme = localStorage.getItem('darkMode');
    this.darkMode = savedTheme ? JSON.parse(savedTheme) : false;
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    }
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }
}
