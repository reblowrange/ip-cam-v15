import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IpCamComponent } from './ip-cam.component';

describe('IpCamComponent', () => {
  let component: IpCamComponent;
  let fixture: ComponentFixture<IpCamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IpCamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IpCamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
