import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtspHlsComponent } from './rtsp-hls.component';

describe('RtspHlsComponent', () => {
  let component: RtspHlsComponent;
  let fixture: ComponentFixture<RtspHlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RtspHlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RtspHlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
