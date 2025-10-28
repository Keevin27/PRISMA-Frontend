import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarMateriaDocenteComponent } from './asignar-materia-docente.component';

describe('AsignarMateriaDocenteComponent', () => {
  let component: AsignarMateriaDocenteComponent;
  let fixture: ComponentFixture<AsignarMateriaDocenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarMateriaDocenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsignarMateriaDocenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
