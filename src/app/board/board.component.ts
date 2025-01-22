import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { BoardService } from './board.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PostService } from '../post/post.service';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../auth/auth.service';

interface Posting {
  posting_id: number;
  posting_title: string;
  posting_userId: string;
  auth_username: string;
  posting_content: string;
  posting_objekts: {
    have: number[];
    want: number[];
  };
  thumbnails: {
    have: any[];
    want: any[];
  };
  posting_comment: Comment[];
  commentCount: number;
}

interface Comment {
  comment_id: number;
  comment_content: string;
  comment_userId: string;
  auth_username: string;
  comment_postingId: number;
  comment_replyTargetCommentId: number;
  comment_createdAt: Date;
  comment_updatedAt: Date;
} 


interface objektFilter {
  season: Array<string>;
  member: Array<string>;
  collectionNo: Array<string>;
  classes: Array<string>;
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule,
    FormsModule],
  providers: [CookieService],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BoardComponent {
  userId: string | any = '';
  updateMode: boolean = false;
  showMenuId: number | null = null;  // Add this for user menu
  showPostActionsId: number | null = null;  // Add this for post actions menu
  toggleCommentsId: number | null = null;

  postings: Posting[] = [];
  searchForm!: FormGroup;
  objektFilter!: objektFilter;
  objektFilterForm!: FormGroup;

  commentForm!: FormGroup;
  replyTargetCommentId: number | null = null;

  constructor(
    private boardService: BoardService,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private router: Router
  ) { this.loadData(); }

  ngOnInit() {
    this.userId = localStorage.getItem('userId');
    this.updateMode = false;

    this.searchForm = this.formBuilder.group({
      objekt: this.formBuilder.group({
        have: this.formBuilder.array([]),
        want: this.formBuilder.array([])
      })
    });

    this.commentForm = this.formBuilder.group({
      comment: ['', Validators.required],
    });

    this.objektFilter = {
      season: [],
      member: [],
      collectionNo: [],
      classes: []
    };

    this.objektFilterForm = this.formBuilder.group({
      season: [''],
      member: [''],
      collectionNo: [''],
      classes: ['']
    });
  }

  loadData(): void {
    this.boardService.getPostingList().subscribe({
      next: (data) => {
        this.postings = data.map((posting: any) => ({
          ...posting,
          thumbnails: {
            have: [],
            want: []
          }
        }));
        this.getThumbnail();
      },
      error: (err) => console.error(err),
      complete: () => console.log('Data loading complete')
    });

    // 검색 용 오브젝트 필터
    this.postService.getSelectOption().subscribe({
      next: (data) => {
        this.objektFilter = data;
        console.log(this.objektFilter);
      },
      error: (err) => {
        console.error(err);
        alert('An unknown error occurred:');
      },
      complete: () => {
        console.log('Data loading complete');
        this.objektFilterForm.reset();
      }
    });
  }

  getMyPost(): void {
    const user = localStorage.getItem('userId');

    this.boardService.getMyPost(user).subscribe({
      next: (data) => {
        this.postings = data.map((posting: any) => ({
          ...posting,
          thumbnails: {
            have: [],
            want: []
          }
        }));
        this.getThumbnail();
      },
      error: (err) => {
        if (err.status === 404) {
          console.log('No data found');
        } else {
          console.error('Error fetching data', err);
          alert('An unknown error occurred:');
        } 
      },
      complete: () => console.log('Data loading complete')
    });
  }

  addObjektToHaveArray(): void {
    const objektFormValue = this.objektFilterForm.value;

    this.postService.getTargetObjekt(objektFormValue).subscribe({
      next: (data) => {
        const haveArray = this.searchForm.get('objekt.have') as FormArray;
        haveArray.push(this.formBuilder.control(data));
      },
      error: (err) => {
        console.error(err);
        alert('objekt가 존재하지 않음');
      },
      complete: () => console.log('Data loading complete')
    });
  }

  addObjektToWantArray(): void {
    const objektFormValue = this.objektFilterForm.value;

    this.postService.getTargetObjekt(objektFormValue).subscribe({
      next: (data) => {
        const wantArray = this.searchForm.get('objekt.want') as FormArray;
        wantArray.push(this.formBuilder.control(data));
      },
      error: (err) => {
        console.error(err);
        alert('objekt가 존재하지 않음');
      },
      complete: () => console.log('Data loading complete')
    });
  }

  getThumbnail(): void {
    this.postings.forEach(posting => {
      const haveArr = posting.posting_objekts.have;
      const wantArr = posting.posting_objekts.want;

      haveArr.forEach(cont => {
        const haveValue = {
          id: cont
        }
        this.postService.getThumbnail(haveValue).subscribe({
          next: (data) => {
            // 썸네일 주소 배열에 data 추가
            console.log(data);
            posting.thumbnails.have.push(data);
          },
          error: (err) => console.error(err),
          complete: () => console.log('Thumbnail loading complete')
        });
      });

      wantArr.forEach(cont => {
        const wantValue = {
          id: cont
        }
        this.postService.getThumbnail(wantValue).subscribe({
          next: (data) => {
            // 썸네일 주소 배열에 data 추가
            posting.thumbnails.want.push(data);
          },
          error: (err) => console.error(err),
          complete: () => console.log('Thumbnail loading complete')
        });
      });
    });
  }

  searchObjekt(): void {
    // 필터로 추가해서 찾기
    const target = this.searchForm.value.objekt;
    if(this.searchForm.get('objekt.have')?.value.length === 0 && this.searchForm.get('objekt.want')?.value.length === 0) {
      alert("Objekt Array is empty");
      return;
    }
    this.boardService.searchObjekt(target).subscribe({
      next: (data) => {
        // 포스팅 배열 재생성
        this.postings = data.map((posting: any) => ({
          ...posting,
          thumbnails: {
            have: [],
            want: []
          }
        }));
        this.getThumbnail();
      },
      error: (err) => console.error(err),
      complete: () => console.log('Thumbnail loading complete')
    });
  }

  searchWithPosting(): void {
    const user = localStorage.getItem('userId');
    this.boardService.searchWithPosting(user).subscribe({
      next: (data) => {
        // 포스팅 배열 재생성
        this.postings = data.map((posting: any) => ({
          ...posting,
          thumbnails: {
            have: [],
            want: []
          }
        }));
        this.getThumbnail();
      },
      error: (err) => {
        if (err.status === 400) {
          alert('You have postings more than one, please make your posting one');
        } else {
          console.error('An error occurred:', err);
          alert('An unknown error occurred:');
        }
      },
      complete: () => console.log('Thumbnail loading complete')
    });
  }

  resetOptions(): void {
    const haveArray = this.searchForm.get('objekt.have') as FormArray;
    const wantArray = this.searchForm.get('objekt.want') as FormArray;

    wantArray.clear();
    haveArray.clear();

    this.loadData();
  }

  updatePosting(posting_id: any): void {
    const postingToUpdate = this.postings.find(posting => posting.posting_id === posting_id);

    if (postingToUpdate) {
      // 서버로 업데이트할 데이터를 준비합니다.
      const updatedData = {
        posting_id: postingToUpdate.posting_id,
        posting_title: postingToUpdate.posting_title,
        posting_content: postingToUpdate.posting_content,
        posting_objekts: postingToUpdate.posting_objekts,
        // thumbnails: postingToUpdate.thumbnails
      };

      // 서버에 업데이트 요청
      this.boardService.updatePosting(updatedData).subscribe({
        next: (response) => {
          console.log('Posting updated successfully:', response);
          this.changeUpdateMode(); // 업데이트 모드를 비활성화
          // window.location.reload();
          this.loadData();
        },
        error: (err) => {
          console.error('Error updating posting:', err);
        },
        complete: () => {
          console.log('Update complete');
        }
      });
    }
  }

  popHaveObjekt(posting_id: any, thumb: any): void {
    if (!this.updateMode) {
      return; // updateMode가 활성화되지 않은 경우 작업을 중단
    }

    // 해당 posting_id에 일치하는 포스팅을 찾기
    const posting = this.postings.find(post => post.posting_id === posting_id);
    if (!posting) {
      console.error('Posting not found');
      return; // 해당 포스팅이 없으면 함수 종료
    }

    // 'Have' 배열에서 해당 요소를 찾고 삭제
    const haveIndex = posting.thumbnails.have.findIndex((item: any) => item.id === thumb.id);
    if (haveIndex !== -1) {
      // Thumbnails 배열에서 제거
      posting.thumbnails.have.splice(haveIndex, 1);

      // Posting_objekts의 'have'에서도 해당 ID 제거
      const objektHaveIndex = posting.posting_objekts.have.indexOf(thumb.id);
      if (objektHaveIndex !== -1) {
        posting.posting_objekts.have.splice(objektHaveIndex, 1);
      }
      return; // 'have'에서 삭제가 완료되면 함수 종료
    }
  }

  popWantObjekt(posting_id: any, thumb: any): void {
    if (!this.updateMode) {
      return; // updateMode가 활성화되지 않은 경우 작업을 중단
    }

    // 해당 posting_id에 일치하는 포스팅을 찾기
    const posting = this.postings.find(post => post.posting_id === posting_id);
    if (!posting) {
      console.error('Posting not found');
      return; // 해당 포스팅이 없으면 함수 종료
    }

    // 'Want' 배열에서 해당 요소를 찾고 삭제
    const wantIndex = posting.thumbnails.want.findIndex((item: any) => item.id === thumb.id);
    if (wantIndex !== -1) {
      // Thumbnails 배열에서 제거
      posting.thumbnails.want.splice(wantIndex, 1);

      // Posting_objekts의 'want'에서도 해당 ID 제거
      const objektWantIndex = posting.posting_objekts.want.indexOf(thumb.id);
      if (objektWantIndex !== -1) {
        posting.posting_objekts.want.splice(objektWantIndex, 1);
      }
      return;
    }
  }

  deletePosting(posting_id: any): void {
    // html에서 포스트 id 가져와서 전달하면 서버가 삭제
    const id = {
      id: posting_id
    }
    this.boardService.deletePosting(id).subscribe({
      next: (data) => {
        console.log('Posting delete successfully:', data);
      },
      error: (err) => {
        if(err.status === 404) {
          console.log('No data found');
        } else {
          console.error('Error deleting posting:', err);
          alert('An unknown error occurred:');
        }
      },
      complete: () => {
        console.log('Delete complete');
        this.loadData();
      }
    });
  }

  changeUpdateMode() {
    this.updateMode = !this.updateMode;
    if (!this.updateMode) {
      this.loadData();
    }
  }

  // goDM(userId: string): void {
  //   if( userId === localStorage.getItem('userId') ){
  //     alert('You cannot chat with yourself.');
  //     return;
  //   }
  //   this.dmService.setSelectedReceiver(userId);
  //   this.router.navigate(['/dm']);
  // }

  showComments(posting:Posting) {
    this.boardService.getComment({ 
      posting_id: posting.posting_id,
    }).subscribe({
      next: (data) => {
        if(data.length > 0) {
          posting.posting_comment = data;
        }
      },
      error: (err) => {
        if(err.status === 401) {
          console.log('No Authorization');
        } else {
          alert('An unknown error occurred.');
        }
      },
    });

    // this.toggleCommentId = this.toggleCommentId === posting.posting_id ? null : posting.posting_id;
  }

  createComment(posting: Posting) {
    if(!this.replyTargetCommentId){
      this.boardService.createComment({ 
        posting_id: posting.posting_id, 
        userId: localStorage.getItem('userId'), 
        content: this.commentForm.value.comment
      }).subscribe({
        next: (data) => {
          this.commentForm.reset();
          this.showComments(posting);
        },
        error: (err) => {
          if(err.status === 401) {
            console.log('No Authorization');
          } else {
            alert('An unknown error occurred:');
          }
        },
      });
    } else this.createReply(this.replyTargetCommentId, posting);
  }

  createReply(comment_id:number, posting:Posting) {
    console.log("target reply comment id",comment_id);
    this.boardService.createReply({ 
      posting_id: posting.posting_id,
      replyTargetCommentId: comment_id,
      userId: localStorage.getItem('userId'), 
      content: this.commentForm.value.comment
    }).subscribe({
      next: (data) => {
        this.commentForm.reset();
        this.replyTargetCommentId = null;
        this.showComments(posting);
      },
      error: (err) => {
        if(err.status === 401) {
          console.log('No Authorization');
        } else {
          alert('An unknown error occurred:');
        }
      },
    });
  }

  deleteComment(posting: Posting, comment_id:any) {
    this.boardService.deleteComment({ 
      comment_id: comment_id,
    }).subscribe({
      next: (data) => {
        console.log('Comment delete successfully:', data);
        this.showComments(posting);
      },
      error: (err) => {
        if(err.status === 401) {
          console.log('No Authorization');
        } else {
          alert('An unknown error occurred.');
        }
      },
    });
  }

  updateComment(comment_id:any, posting: Posting) {
    this.boardService.updateComment({ 
      comment_id: comment_id,
      content: this.commentForm.value.comment
    }).subscribe({
      next: (data) => {
        this.commentForm.reset();
        this.showComments(posting);
      },
      error: (err) => {
        if(err.status === 401) {
          console.log('No Authorization');
        } else {
          alert('An unknown error occurred.');
        }
      },
    });
  }

  // Add new functions for menu handling
  showMenu(posting: Posting): void {
    this.showMenuId = this.showMenuId === posting.posting_id ? null : posting.posting_id;
  }

  showPostActions(posting: Posting): void {
    this.showPostActionsId = this.showPostActionsId === posting.posting_id ? null : posting.posting_id;
  }

  closeMenus(): void {
    this.showMenuId = null;
    this.showPostActionsId = null;
  }

  toggleComments(posting: Posting): void {
    this.showComments(posting);

    this.toggleCommentsId = this.toggleCommentsId === posting.posting_id ? null : posting.posting_id;
  }

  setReplyTarget(commentId: number | null) {
    this.replyTargetCommentId = commentId;
  }

  resetReplyTarget() {
    this.replyTargetCommentId = null;
  }
}
