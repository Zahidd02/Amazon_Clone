import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtotalComponent } from './subtotal.component';

describe('SubtotalComponent', () => {
  let component: SubtotalComponent;
  let fixture: ComponentFixture<SubtotalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubtotalComponent]
    });
    fixture = TestBed.createComponent(SubtotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
