import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestLoaderComponent } from './request-loader.component';

describe('RequestLoaderComponent', () => {
  let component: RequestLoaderComponent;
  let fixture: ComponentFixture<RequestLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RequestLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
