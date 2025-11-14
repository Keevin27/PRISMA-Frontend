// Ubicación: src/app/Notas/components/detalle-notas-alumno/detalle-notas-alumno.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NotasService } from '../../services/notas.service';
import { AnioAcademicoService } from '../../../Services/anio-academico.service';
import { SelectorAnioComponent } from '../selector-anio/selector-anio.component';
@Component({
  selector: 'app-detalle-notas-alumno',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule, SelectorAnioComponent],
  templateUrl: './detalle-notas-alumno.component.html',
  styleUrl: './detalle-notas-alumno.component.css'
})
export class DetalleNotasAlumnoComponent implements OnInit {
  nie: number = 0;
  idGrado: number = 0;
  trimestre: number = 1;
  
  datosAlumno: any = null;
  mensaje: string = '';
  cargando: boolean = false;
  
  // Para el reporte anual
  mostrarReporteAnual: boolean = false;
  reporteAnual: any = null;
  cargandoReporte: boolean = false;

  // Variables para año académico
anioSeleccionado: number | null = null;

  constructor(
    private notasService: NotasService,
    private route: ActivatedRoute,
    private router: Router,
     private anioService: AnioAcademicoService
  ) { }

  ngOnInit(): void {
    this.nie = +this.route.snapshot.params['nie'] || 0;
    
  this.anioService.anioSeleccionado$.subscribe(anio => {
    if (anio) {
      this.anioSeleccionado = anio;
    }
  });

    this.route.queryParams.subscribe(params => {
      this.idGrado = +params['idGrado'] || 0;
      this.trimestre = +params['trimestre'] || 1;
      
      if (this.nie > 0 && this.idGrado > 0) {
        this.cargarDetalleNotas();
      } else {
        this.mensaje = 'Parámetros inválidos';
        this.mostrarMensaje();
        this.volver();
      }
    });
  }

  cargarDetalleNotas(): void {
    this.cargando = true;
    this.notasService.obtenerDetalleNotasAlumno(this.nie, this.idGrado, this.trimestre).subscribe({
      next: (data: any) => {
        this.datosAlumno = data;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar detalle:', error);
        this.mensaje = 'Error al cargar el detalle de notas';
        this.mostrarMensaje();
        this.cargando = false;
      }
    });
  }

  generarReporteAnual(): void {
      if (!this.anioSeleccionado) {
    this.mensaje = 'Debe seleccionar un año académico';
    this.mostrarMensaje();
    return;
  }
    this.cargandoReporte = true;
    this.mostrarReporteAnual = true;
    
    this.notasService.obtenerReporteAnual(this.nie, this.idGrado,this.anioSeleccionado).subscribe({
      next: (data: any) => {
        this.reporteAnual = data;
        this.cargandoReporte = false;
      },
      error: (error: any) => {
        console.error('Error al generar reporte:', error);
        this.mensaje = 'Error al generar el reporte anual';
        this.mostrarMensaje();
        this.cargandoReporte = false;
        this.mostrarReporteAnual = false;
      }
    });
  }

  cerrarReporteAnual(): void {
    this.mostrarReporteAnual = false;
    this.reporteAnual = null;
  }

  volver(): void {
    this.router.navigate(['/consultar-notas-alumno']);
  }

  private mostrarMensaje(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    }, 100);
  }

  calcularPromedioGeneral(): number {
    if (!this.datosAlumno || !this.datosAlumno.materias) return 0;
    
    const notasValidas = this.datosAlumno.materias
      .map((m: any) => m.notaFinalTrimestre)
      .filter((n: number) => n > 0);
    
    if (notasValidas.length === 0) return 0;
    
    const suma = notasValidas.reduce((acc: number, nota: number) => acc + nota, 0);
    return Math.round((suma / notasValidas.length) * 100) / 100;
  }

  contarAprobadas(): number {
    if (!this.datosAlumno || !this.datosAlumno.materias) return 0;
    return this.datosAlumno.materias.filter((m: any) => m.notaFinalTrimestre >= 6).length;
  }

  contarReprobadas(): number {
    if (!this.datosAlumno || !this.datosAlumno.materias) return 0;
    return this.datosAlumno.materias.filter((m: any) => m.notaFinalTrimestre < 6 && m.notaFinalTrimestre > 0).length;
  }
}