import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs';
import { ThemeService } from './theme/theme.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  isLoggedIn = false;
  userId!: any;
  username!: any;
  isDarkMode = true;

  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    private router: Router,
    private themeService: ThemeService
  ) {
    this.themeService.loadTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }
  // 로그아웃 함수
  logout() {
    this.authService.logout();
    // this.router.navigate(['/auth']); // 로그아웃 후 로그인 페이지로 이동
  }

  ngOnInit() {
    // 로그인 상태를 구독
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    // 토큰 만료 확인
    this.authService.requestAccessToken().subscribe({
      next: (response) => {
        console.log('Access token refreshed successfully!');
      },
      error: (error) => {
        console.error('Failed to refresh access token:', error);
      },
      complete: () => {
        console.log('Access token refresh complete!');
      }
    });

    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    this.userId = localStorage.getItem('userId');

    const data = {
      accessToken : accessToken,
      refreshToken : refreshToken,
      userId : this.userId,
    }
    if (accessToken) {
      // JWT 토큰을 localStorage에 저장
      this.authService.isLogin(data);
      // this.router.navigate(['/board']);
    }

    this.setupRouterEvents();
  }

  setupRouterEvents() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        filter((event: NavigationEnd) => event.url.startsWith('/?accessToken'))
    )
      .subscribe((event: NavigationEnd) => {
        console.log('Route changed, do something:', event.url);
        // 현재 URL에서 토큰 추출
        const data = this.getTokenFromUrl();
        if (data) {
          // JWT 토큰을 localStorage에 저장
          this.authService.isLogin(data);

          // 인증된 사용자가 갈 수 있는 경로로 리다이렉트
          this.router.navigate(['/board']);
        } else {
          // 토큰이 없으면 로그인 페이지로 다시 리다이렉트
          this.router.navigate(['/auth']);
        }
      });
  }

  // URL에서 토큰 추출 함수
  getTokenFromUrl(): any {
    const urlParams = new URLSearchParams(window.location.search);

    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userId = urlParams.get('userId');

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: userId,
    };
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }
}
