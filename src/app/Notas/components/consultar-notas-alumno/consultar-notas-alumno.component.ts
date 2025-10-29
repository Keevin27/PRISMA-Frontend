// Ubicación: src/app/Notas/components/consultar-notas-alumno/consultar-notas-alumno.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NotasService } from '../../services/notas.service';
import { GradoService } from '../../../Services/grado.service';

@Component({
  selector: 'app-consultar-notas-alumno',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './consultar-notas-alumno.component.html',
  styleUrl: './consultar-notas-alumno.component.css'
})
export class ConsultarNotasAlumnoComponent implements OnInit {
  grados: any[] = [];
  gradoSeleccionado: any = null;
  trimestreSeleccionado: number = 1;
  
  alumnos: any[] = [];
  mensaje: string = '';
  cargando: boolean = false;

  trimestres = [
    { value: 1, label: 'Primer Trimestre' },
    { value: 2, label: 'Segundo Trimestre' },
    { value: 3, label: 'Tercer Trimestre' }
  ];

  anioActual: number = new Date().getFullYear();

  constructor(
    private notasService: NotasService,
    private gradoService: GradoService,
    private router: Router
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
    if (!this.gradoSeleccionado || !this.trimestreSeleccionado) {
      this.mensaje = 'Debe seleccionar un grado y un trimestre';
      this.mostrarMensaje();
      return;
    }

    this.cargando = true;
    this.notasService.obtenerAlumnosPorGrado(this.gradoSeleccionado, this.trimestreSeleccionado).subscribe({
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

  verDetalleAlumno(nie: number): void {
    this.router.navigate(['/detalle-notas-alumno', nie], {
      queryParams: {
        idGrado: this.gradoSeleccionado,
        trimestre: this.trimestreSeleccionado
      }
    });
  }

  limpiarConsulta(): void {
    this.gradoSeleccionado = null;
    this.trimestreSeleccionado = 1;
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
}