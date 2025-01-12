import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class DmService {
  private socket!: Socket;
  apiUrl = environment.apiUrl;
  
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {
    this.connect(this.cookieService.get('userId'));
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    })
  };

  private connect(userId: string): void {
    this.socket = io(
      'rediss://otp-cache-q9koki.serverless.apn2.cache.amazonaws.com:6379', 
      {
        autoConnect: false,
        transports: [ "websocket" ],
        secure: true,
        rejectUnauthorized: false
      }
    );
    this.socket.connect();
    const channelName = 'valkey-channel';

    // 연결 상태 확인
    this.socket.on('connect', () => {
      console.log('Connected to websocket server');
      this.socket.emit('connectUser', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from websocket server');
    });
  }

  getReceivers(data : { senderId: string}): void {
    this.socket.emit('getReceivers', data);
  }

  // 특정 사용자와의 메시지 기록을 서버에 요청
  fetchMessages(senderId: string, receiverId: string): void {
    this.socket.emit('fetchMessages', { senderId, receiverId });
  }

  // 서버로부터 받은 메시지 기록을 구독
  onFetchMessages(): Observable<any[]> {
    return new Observable((observer) => {
      this.socket.on('dm', (messages: any[]) => {
        observer.next(messages);
      });
    });
  }
  
  // 서버로부터 수신자 목록 수신
  onReceivers(): Observable<Array<{ userId: string }>> {
    return new Observable((observer) => {
      this.socket.on('receivers', (receivers: Array<{ userId: string }>) => {
        observer.next(receivers);
      });
    });
  }

  // 메시지 보내기
  sendMessage(message: { senderId: string, receiverId: string, message: string }): void {
    this.socket.emit('dm', message);
  }

  // 메시지 수신 대기
  onMessage(): Observable<{ senderId: string, message: string }> {
    return new Observable<{ senderId: string, message: string }>(observer => {
      this.socket.on('dm', (data) => {
        observer.next(data);
      });
    });
  }
}