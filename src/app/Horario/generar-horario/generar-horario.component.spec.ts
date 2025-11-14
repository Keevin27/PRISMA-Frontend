import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarHorarioComponent } from './generar-horario.component';

describe('GenerarHorarioComponent', () => {
  let component: GenerarHorarioComponent;
  let fixture: ComponentFixture<GenerarHorarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarHorarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerarHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
