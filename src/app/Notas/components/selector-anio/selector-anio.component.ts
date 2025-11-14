import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnioAcademicoService } from '../../../Services/anio-academico.service';
import { AnioAcademico } from '../../../Models/anio-academico';

@Component({
  selector: 'app-selector-anio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card mb-3 border-primary">
      <div class="card-body py-2">
        <div class="row align-items-center">
          
          <div class="col-md-3">
            <label class="form-label mb-0 fw-bold">
              <i class="fas fa-calendar-alt me-2"></i>Año Académico:
            </label>
          </div>

          <div class="col-md-3">
            <select class="form-select form-select-sm" 
                    [(ngModel)]="anioSeleccionado" 
                    (change)="aplicarCambio()"
                    [disabled]="cargando">

              <option [ngValue]="null">Seleccione un año</option>

              <option *ngFor="let anio of anios" 
                      [ngValue]="anio.anio">
                {{ anio.anio }}
                {{ anio.anio_activo ? '(Activo)' : (anio.anio_cerrado ? '(Cerrado)' : '') }}
              </option>

            </select>
          </div>



          <div class="col-md-4">
            <div *ngIf="anioEsActivo" class="badge bg-success">
              <i class="fas fa-check-circle me-1"></i>Año Activo - Edición Habilitada
            </div>
            <div *ngIf="!anioEsActivo && anioSeleccionado" class="badge bg-warning text-dark">
              <i class="fas fa-lock me-1"></i>Año Inactivo - Solo Lectura
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class SelectorAnioComponent implements OnInit {
  anios: AnioAcademico[] = [];
  anioSeleccionado: number | null = null;
  anioEsActivo: boolean = false;
  cargando: boolean = false;

  constructor(private anioService: AnioAcademicoService) {}

  ngOnInit(): void {
    this.cargarAnios();

    // Cuando otro componente cambia el año -> refrescamos estado
    this.anioService.anioSeleccionado$.subscribe(anio => {
      this.anioSeleccionado = anio;
      this.verificarSiEsActivo();
    });
  }

cargarAnios(): void {
  this.cargando = true;

  this.anioService.obtenerTodos().subscribe({
    next: (data: AnioAcademico[]) => {
      this.anios = data.sort((a, b) => b.anio - a.anio);
      this.cargando = false;

      const current = this.anioService.getAnioSeleccionado();
      if (current && typeof current === 'number') {
        this.anioSeleccionado = current;
      } else {
        const activo = this.anios.find(a => a.anio_activo === true);
        if (activo) {
          this.anioService.setAnioSeleccionado(activo.anio);
        }
      }
    },
    error: () => this.cargando = false
  });
}


  aplicarCambio(): void {
    if (this.anioSeleccionado !== null) {
      this.anioService.setAnioSeleccionado(this.anioSeleccionado);
    }
  }

  private verificarSiEsActivo(): void {
    if (!this.anioSeleccionado) {
      this.anioEsActivo = false;
      return;
    }

    this.anioService.esAnioActivo(this.anioSeleccionado).subscribe(esActivo => {
      this.anioEsActivo = esActivo;
    });
  }
}
