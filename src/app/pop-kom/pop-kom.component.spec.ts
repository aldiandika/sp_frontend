import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopKomComponent } from './pop-kom.component';

describe('PopKomComponent', () => {
  let component: PopKomComponent;
  let fixture: ComponentFixture<PopKomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopKomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopKomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
