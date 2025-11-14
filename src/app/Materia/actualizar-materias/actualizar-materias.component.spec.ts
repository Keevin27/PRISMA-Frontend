import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualizarMateriasComponent } from './actualizar-materias.component';

describe('ActualizarMateriasComponent', () => {
  let component: ActualizarMateriasComponent;
  let fixture: ComponentFixture<ActualizarMateriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualizarMateriasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActualizarMateriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
