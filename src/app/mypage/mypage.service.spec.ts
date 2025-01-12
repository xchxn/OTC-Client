import { TestBed } from '@angular/core/testing';

import { MypageService } from './mypage.service';

describe('MypageService', () => {
  let service: MypageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MypageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
