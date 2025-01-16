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
    return this.http.post<any>(`${this.apiUrl}/board/create`, body, this.httpOptions);
  }
}
