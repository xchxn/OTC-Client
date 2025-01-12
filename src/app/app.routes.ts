import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { BoardComponent } from './board/board.component';
import { DmComponent } from './dm/dm.component';
import { PostComponent } from './post/post.component';
import { HomeComponent } from './home/home.component';
import { MypageComponent } from './mypage/mypage.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'board', component: BoardComponent },
  { path: 'dm', component: DmComponent },
  { path: 'post', component: PostComponent },
  { path: 'mypage', component: MypageComponent },
  { path: '**', redirectTo: '' },
];
