import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapboComponent } from './mapbo.component';

describe('MapboComponent', () => {
  let component: MapboComponent;
  let fixture: ComponentFixture<MapboComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapboComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
