import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DmService } from './dm.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-dm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    FormsModule, RouterOutlet, RouterLink, RouterLinkActive, MatDividerModule
  ],
  providers: [CookieService],
  templateUrl: './dm.component.html',
  styleUrl: './dm.component.scss'
})
export class DmComponent {
  messageForm!: FormGroup;

  // 대상 유저와의 메시지 기록
  messages: Array<{ senderId: string, message: string }> = [];
  messageSubscription!: Subscription;
  fetchMessagesSubscription!: Subscription;

  // 디엠 유저 목록
  // dmList: Set<string> = new Set();
  dmList: Array<{ userId: string, username?: string }> = [];
  dmList$: BehaviorSubject<Array<{ userId: string, username?: string }>> = new BehaviorSubject<{ userId: string; username?: string; }[]>([]);

  selectedReceiverId!: string;
  userId!: any;

  isInitialLoad: boolean = true;

  @ViewChild('messageListContainer') messageListContainer!: ElementRef;

  constructor(
    private dmService: DmService,
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private router: Router,

  ) { }

  ngOnInit() {
    this.userId = localStorage.getItem('userId');

    if (!this.userId) {
      alert("Please Login!");
      this.router.navigate([`/auth`]);
    }

    this.route.queryParams.subscribe(params => {
      this.selectedReceiverId = params['userId'];

      // user query param이 존재하면 selectDm 자동 호출
      if (this.selectedReceiverId) {
        this.selectDm(this.selectedReceiverId);
      }
    });

    this.messageForm = this.formBuilder.group({
      message: this.formBuilder.control('', Validators.required)
    });

    const idData = { senderId: this.userId };

    // DM 리스트 가져오기
    this.dmService.getReceivers(idData);

    this.dmService.onReceivers().subscribe((receivers: Array<{ userId: string }>) => {
      // this.dmList = new Set(receivers); // 배열을 Set으로 변환하여 할당
      this.dmList = receivers;
      this.dmList$.next(this.dmList);
    });

    // 새로운 메시지 수신 구독
    this.messageSubscription = this.dmService.onMessage().subscribe((message) => {
      this.messages.push(message); // 새 메시지 추가

      this.dmService.fetchMessages(this.userId, this.selectedReceiverId);

      if (!this.dmList.find(dm => dm.userId === message.senderId)) {
        this.dmList.push({ userId: message.senderId });
        this.dmList$.next(this.dmList);
      }
    });
  }

  // Dm리스트에서 하나를 선택했을 때 소켓 연결?
  // receiverId: string
  selectDm(receiver: string): void {
    this.isInitialLoad = true;
    this.selectedReceiverId = receiver;

    // 기존 구독 해제
    if (this.fetchMessagesSubscription) {
      this.fetchMessagesSubscription.unsubscribe();
    }

    // 서버로부터 선택된 수신자와의 메시지 기록을 요청
    this.dmService.fetchMessages(this.userId, this.selectedReceiverId);

    // 서버로부터 받은 메시지 기록 구독
    this.fetchMessagesSubscription = this.dmService.onFetchMessages().subscribe({
      next: (messages) => {
        this.messages = messages; // 기존 메시지 기록으로 업데이트
        
        // Only scroll to bottom on initial load
        if (this.isInitialLoad) {
          setTimeout(() => {
            this.scrollToBottom();
            this.isInitialLoad = false;
          });
        }
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
      }
    });
  }

  private scrollToBottom(): void {
    if (this.messageListContainer) {
      const element = this.messageListContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  send(): void {
    if (this.messageForm.invalid || !this.selectedReceiverId) {
      return;
    }

    const message = {
      senderId: this.userId,
      receiverId: this.selectedReceiverId,
      message: this.messageForm.value.message
    };

    this.dmService.sendMessage(message);
    this.messageForm.reset();

    // 새 메시지를 보낸 후 메시지 목록을 다시 가져옴
    setTimeout(() => {
      this.dmService.fetchMessages(this.userId, this.selectedReceiverId);
      this.scrollToBottom(); // Scroll to bottom after sending a new message
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.fetchMessagesSubscription) {
      this.fetchMessagesSubscription.unsubscribe();
    }
  }
}