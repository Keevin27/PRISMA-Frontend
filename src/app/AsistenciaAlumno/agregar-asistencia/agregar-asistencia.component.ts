import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Alumno } from '../../Alumno/alumno';
import { AlumnoService } from '../../Alumno/alumno.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Grado } from '../../Models/grado';
import { GradoService } from '../../Services/grado.service';

import { AsistenciaAlumno } from '../asistencia-alumno';
import { AsistenciaAlumnoService } from '../asistencia-alumno.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-agregar-asistencia',
  standalone: true,
  imports: [RouterModule, HttpClientModule, FormsModule, CommonModule],
  templateUrl: './agregar-asistencia.component.html',
  styleUrl: './agregar-asistencia.component.css'
})
export class AgregarAsistenciaComponent {
  alumnos: (Alumno & { estadoSeleccionado?: string })[] = []; // Extensión temporal
  grados: Grado[] = [];
  asistencias: AsistenciaAlumno[] = [];
  idGradoSeleccionado: string = '';
  anioActual: number = new Date().getFullYear();
  fechaAsistencia: string = '';
  yaTieneAsistencia: boolean = false;

  constructor(
    private AsistenciaServicio: AsistenciaAlumnoService,
    private alumnoServicio: AlumnoService,
    private gradoServicio: GradoService
  ) { }

  //Se carga al iniciar, trae todos los grados del anyo actual
  private obtenerGradosAnyoActual(anioActual: number) {
    this.gradoServicio.obtenerGradosPorAnyo(anioActual).subscribe(dato => {
      this.grados = dato;
    });
  }

  // Ejecutado al seleccionar grado y trae los alumnos de ese grado
  GradoSeleccionado() {
    this.alumnoServicio.obtenerListaDeAlumnosPorGrado(this.idGradoSeleccionado).subscribe(datto => {
      this.alumnos = datto;
    })
    this.fechaAsistencia='';
    this.asistencias = [];
  }

  mensajeError: string = '';
  mensajeValido: string = '';
  buscarAsistencia() {
    if (!this.fechaAsistencia || isNaN(Date.parse(this.fechaAsistencia))) {
      this.asistencias = [];
      this.mensajeError = 'Seleccione una fecha correcta.'
      setTimeout(() => {
        this.mensajeError = '';
      }, 3000);
      return;
    }
    this.AsistenciaServicio.obtenerAsistenciasPorGradoFecha(this.idGradoSeleccionado, this.fechaAsistencia).subscribe({
      next: (dato) => {
        if (!dato || dato.length === 0) {

          console.log("NO HAY");
          this.asistencias = [];
          this.mensajeError = 'No hay asistencias registradas para esta fecha en esta seccion.'
          setTimeout(() => {
            this.mensajeError = '';
          }, 3000);
          this.yaTieneAsistencia = false;

        } else {
          this.asistencias = dato;
          this.mensajeValido = 'Asistencias cargadas correctamente.'
          setTimeout(() => {
            this.mensajeValido = '';
          }, 3000);
          this.yaTieneAsistencia = true;
        }
      },
      error: (err) => {
        console.error('Error al obtener asistencias', err);
      }
    });

  }

  generarAsistencias() {
    const fechaCapturada = this.formatearFechaConHoraSegura(this.fechaAsistencia);
    console.log(fechaCapturada);
    const nuevasAsistencias = this.alumnos.map(alumno => {
      return this.AsistenciaServicio.agregarAsistenciaAlumno({
        alumno: { idAlumno: alumno.idAlumno } as Alumno,
        estado_asistencia: 'Asistencia',
        fecha_asistencia: fechaCapturada
      });
    });
    forkJoin(nuevasAsistencias).subscribe({
      next: res => {
        console.log("Pausa para volver a cargar asistencia", res);
        this.buscarAsistencia();
      },
      error: err => {
        console.error("Error al crear asignaciones", err);
      }
    });
  }

  buscarAsistenciaAlumno(alumno: Alumno): AsistenciaAlumno | undefined {
    console.log("llegamso");
    return this.asistencias.find(a =>
      a.alumno.idAlumno === alumno.idAlumno
    );
  }

  actualizarEstadoAsistencia(asistencia: AsistenciaAlumno) {
    this.AsistenciaServicio.actualizarEstadoAsistencia(asistencia).subscribe({
      next: res => {
        console.log('Estado actualizado:', res);
      },
      error: err => {
        console.error('Error al actualizar estado', err);
      }
    });
  }

  ngOnInit() {
    this.obtenerGradosAnyoActual(this.anioActual);
  }

  //Anadir hora para que se guarde el dia real en la basedatos 
  formatearFechaConHoraSegura(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaConHora = new Date(year, month - 1, day, 12, 0, 0);
    return fechaConHora.toISOString();
  }
  esFechaValida(): boolean {
    return this.fechaAsistencia !== '' && !isNaN(Date.parse(this.fechaAsistencia));
  }
}
