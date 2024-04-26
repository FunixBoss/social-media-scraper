import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstagramKeywordComponent } from './instagram-keyword.component';

describe('InstagramKeywordComponent', () => {
  let component: InstagramKeywordComponent;
  let fixture: ComponentFixture<InstagramKeywordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstagramKeywordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstagramKeywordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
