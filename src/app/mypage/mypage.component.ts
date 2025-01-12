import { Component } from '@angular/core';
import { MypageService } from './mypage.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-mypage',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule,
    FormsModule],
  providers: [MypageService],
  templateUrl: './mypage.component.html',
  styleUrl: './mypage.component.scss'
})
export class MypageComponent {
  userId: string | any = '';
  updateForm: any;

  constructor(
    private mypageService: MypageService,
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem('userId');

    if (!this.userId) {
      alert("Please Login!");
      this.router.navigate([`/auth`]);
    }

    this.updateForm = this.formBuilder.group({
      username: [''],
    });

    this.loadData();
  }

  loadData(): void {
    this.userId = localStorage.getItem('userId');
    this.mypageService.getMyInfo(JSON.stringify({ userId: this.userId })).subscribe({
      next: (data) => {
        this.updateForm.patchValue(data);
      },
      error: (err) => {
        if (err.status === 404) {
          alert('Cannot find user.');
        } else if (err.status === 401) {
          alert('Need authorization.');
          this.router.navigate(['/auth']);
        } else {
          alert('Failed to load user information.');
        }
      },
      complete: () => console.log('Data loading complete')
    });
  }

  updateMyinfo(): void {
    const updateFormValue = this.updateForm.value;

    this.mypageService.updateMyInfo(JSON.stringify({ userId: this.userId, ...updateFormValue })).subscribe({
      next: (data) => {
        console.log(data);
        alert('Successfully updated my info.');
      },
      error: (err) => {
        if (err.status === 409) {
          alert('Already exists username.');
        } else if (err.status === 404) {
          alert('Not found user.');
        } else {
          alert('Failed to update my info.');
        }
      },
      complete: () => {
        console.log('Update complete');
        this.loadData();
        this.router.navigate(['/'])
      }
    });
  }

  deleteMyInfo(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.mypageService.deleteMyInfo(this.userId).subscribe({
        next: (data) => {
          console.log('Delete successful:', data);
          localStorage.removeItem('userId');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          alert('Successfully deleted my info.');
          this.router.navigate(['/auth']);
        },
        error: (err) => {
          if (err.status === 404) {
            alert('Cannot find user to delete.');
          } else {
            alert('Failed to delete my info, please try again.');
          }
        },
        complete: () => {
          console.log('Delete complete');
          this.router.navigate(['/auth']);
        }
      });
    }
  }
}
