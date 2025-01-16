import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'any'
})
export class MypageService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    })
  };

  getMyInfo(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mypage/myInfo`, body, this.httpOptions);
  }

  updateMyInfo(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mypage/myUpdate`, body, this.httpOptions);
  }

  deleteMyInfo(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mypage/myDelete`, { userId: body }, this.httpOptions);
  }
}
