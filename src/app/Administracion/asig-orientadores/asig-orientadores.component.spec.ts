import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsigOrientadoresComponent } from './asig-orientadores.component';

describe('AsigOrientadoresComponent', () => {
  let component: AsigOrientadoresComponent;
  let fixture: ComponentFixture<AsigOrientadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsigOrientadoresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsigOrientadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
