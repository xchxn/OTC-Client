import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environments';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  apiUrl = environment.apiUrl;
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    })
  };  

  // 오브젝트 옵션
  getSelectOption(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/board/option`);
  }

  getTargetObjekt(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/objekt`, body);
  }

  getThumbnail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/thumbnail`, body);
  }

  createPosting(body: any): Observable<any> {
    const token = localStorage.getItem('accessToken');
    console.log(token);
    return this.http
      .post<any>(`${this.apiUrl}/board/create`, body, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.log(error.error.message);
          if (error.status === 401 && error.error.message === 'jwt expired' ) {
            // 토큰 만료 에러가 발생했을 경우, 토큰 갱신을 시도
            console.log("토큰 갱신");
            return this.handleTokenExpiration().pipe(
              switchMap(() => {
                // 토큰이 갱신되면 동일한 요청을 재시도
                return this.http.post<any>(
                  `${this.apiUrl}/board/create`,
                  body,
                  this.httpOptions,
                );
              }),
            );
          } else {
            return throwError(error); // 다른 에러는 그대로 전달
          }
        }),
      );
  }

  private handleTokenExpiration(): Observable<any> {
    // AuthService를 통해 갱신 API 호출
    return this.authService.refreshToken().pipe(
      catchError((error) => {
        console.error('토큰 갱신 실패', error);
        return throwError(error); // 갱신 실패 시 에러 반환
      }),
    );
  }
}
