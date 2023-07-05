import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebSdkComponent } from './web-sdk.component';

describe('WebSdkComponent', () => {
  let component: WebSdkComponent;
  let fixture: ComponentFixture<WebSdkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebSdkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebSdkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
