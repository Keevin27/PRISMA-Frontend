// Ubicación: src/app/Notas/components/reporte-anual-alumno/reporte-anual-alumno.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NotasService } from '../../services/notas.service';
import { GradoService } from '../../../Services/grado.service';

@Component({
  selector: 'app-reporte-anual-alumno',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './reporte-anual-alumno.component.html',
  styleUrl: './reporte-anual-alumno.component.css'
})
export class ReporteAnualAlumnoComponent implements OnInit {
  grados: any[] = [];
  gradoSeleccionado: any = null;
  
  alumnos: any[] = [];
  mensaje: string = '';
  cargando: boolean = false;
  
  // Modal de reporte
  mostrarReporte: boolean = false;
  reporteAlumno: any = null;
  cargandoReporte: boolean = false;

  anioActual: number = new Date().getFullYear();

  constructor(
    private notasService: NotasService,
    private gradoService: GradoService
  ) { }

  ngOnInit(): void {
    this.cargarGrados();
  }

  cargarGrados(): void {
    this.gradoService.obtenerGradosPorAnyo(this.anioActual).subscribe({
      next: (data: any[]) => {
        this.grados = data;
      },
      error: (error: any) => {
        console.error('Error al cargar grados:', error);
        this.mensaje = 'Error al cargar grados';
        this.mostrarMensaje();
      }
    });
  }

  consultarAlumnos(): void {
    if (!this.gradoSeleccionado) {
      this.mensaje = 'Debe seleccionar un grado';
      this.mostrarMensaje();
      return;
    }

    this.cargando = true;
    // Usar el endpoint que ya existe para obtener alumnos
    this.notasService.obtenerAlumnosPorGrado(this.gradoSeleccionado, 1).subscribe({
      next: (data: any) => {
        this.alumnos = data.alumnos;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al consultar alumnos:', error);
        this.mensaje = 'Error al consultar los alumnos';
        this.mostrarMensaje();
        this.cargando = false;
      }
    });
  }

  verReporteAnual(nie: number): void {
    this.cargandoReporte = true;
    this.mostrarReporte = true;
    
    this.notasService.obtenerReporteAnual(nie, this.gradoSeleccionado).subscribe({
      next: (data: any) => {
        console.log('Reporte recibido:', data); // Debug
        this.reporteAlumno = data;
        this.cargandoReporte = false;
      },
      error: (error: any) => {
        console.error('Error al generar reporte:', error);
        this.mensaje = 'Error al generar el reporte anual';
        this.mostrarMensaje();
        this.cargandoReporte = false;
        this.mostrarReporte = false;
      }
    });
  }

  cerrarReporte(): void {
    this.mostrarReporte = false;
    this.reporteAlumno = null;
  }

  imprimirReporte(): void {
    window.print();
  }

  limpiarConsulta(): void {
    this.gradoSeleccionado = null;
    this.alumnos = [];
  }

  private mostrarMensaje(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    }, 100);
  }

  // Métodos auxiliares para el reporte
  calcularPromedioGeneral(materias: any[]): number {
    if (!materias || materias.length === 0) return 0;
    
    const notasValidas = materias
      .map((m: any) => m.notaFinal)
      .filter((n: number) => n !== null && n !== undefined);
    
    if (notasValidas.length === 0) return 0;
    
    const suma = notasValidas.reduce((acc: number, nota: number) => acc + nota, 0);
    return Math.round((suma / notasValidas.length) * 100) / 100;
  }

  getEstadoFinal(): string {
    if (!this.reporteAlumno || !this.reporteAlumno.materias) return '';
    
    const materiasConNota = this.reporteAlumno.materias.filter((m: any) => m.notaFinal !== null);
    const aprobadas = materiasConNota.filter((m: any) => m.aprobado === true);
    
    if (materiasConNota.length === 0) return 'Sin Notas';
    if (aprobadas.length === materiasConNota.length) return 'PROMOVIDO';
    return 'NO PROMOVIDO';
  }

  getColorEstado(): string {
    const estado = this.getEstadoFinal();
    if (estado === 'PROMOVIDO') return 'success';
    if (estado === 'NO PROMOVIDO') return 'danger';
    return 'warning';
  }
}