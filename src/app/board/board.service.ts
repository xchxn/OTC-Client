import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'any'
})
export class BoardService {
  apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    })
  };

  getPostingList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/board/list`, this.httpOptions);
  }

  getMyPost(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/myPost`, { userId: body },this.httpOptions);
  }

  searchObjekt(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/search/mtom`, { objekts: body }, this.httpOptions);
  }

  searchWithPosting(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/search/posting`, { user: body } , this.httpOptions);
  }

  updatePosting(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/update`, body, this.httpOptions);
  }

  deletePosting(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/delete`, body, this.httpOptions);
  }

  getComment(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/comment/get`, body, this.httpOptions);
  }

  createComment(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/comment/create`, body, this.httpOptions);
  }

  createReply(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/comment/reply`, body, this.httpOptions);
  }
  
  getCommentCount(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/comment/getCommentCount`, body, this.httpOptions);
  }

  deleteComment(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/comment/delete`, body, this.httpOptions);
  }

  updateComment(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/comment/update`, body, this.httpOptions);
  }

  deleteReply(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/board/comment/deleteReply`, body, this.httpOptions);
  }
}
