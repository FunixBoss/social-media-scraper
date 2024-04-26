import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstagramConsoleComponent } from './instagram-console.component';

describe('InstagramConsoleComponent', () => {
  let component: InstagramConsoleComponent;
  let fixture: ComponentFixture<InstagramConsoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstagramConsoleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstagramConsoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
