import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'any'
})
export class HomeService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    })
  };

  getNoticeList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/manage/getNotice`, this.httpOptions);
  }
}
