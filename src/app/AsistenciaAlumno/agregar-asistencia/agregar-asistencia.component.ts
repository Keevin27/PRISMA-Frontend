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

  constructor(
    private AsistenciaServicio: AsistenciaAlumnoService,
    private alumnoServicio: AlumnoService,
    private gradoServicio: GradoService
  ) {}

  private obtenerGradosAnyoActual(anioActual: number) {
    this.gradoServicio.obtenerGradosPorAnyo(anioActual).subscribe(dato => {
      this.grados = dato;
    });
  }

  // Ejecutado al seleccionar grado → carga alumnos y les asigna campo temporal
  GradoSeleccionado() {
    this.alumnoServicio.obtenerListaDeAlumnosPorGrado(this.idGradoSeleccionado).subscribe(dato => {
      this.alumnos = dato.map(alumno => ({
        ...alumno,
        estadoSeleccionado: '' // inicializamos el estado (puede ser 'Asistencia', etc.)
      }));
    });
  }

  // Se ejecuta para generar nuevas asistencias
  generarListaAsistencia() {
    this.alumnos.forEach(alumno => {
      // Validación solo enviar si tiene estado seleccionado
      if (!alumno.estadoSeleccionado) {
        console.warn(`Alumno ${alumno.nombre_alumno} no tiene estado seleccionado`);
        return;
      }

      const asistencia: AsistenciaAlumno = {
        alumno: { idAlumno: alumno.idAlumno } as Alumno,
        estado_asistencia: alumno.estadoSeleccionado,
        fecha_asistencia: new Date()
      };

      this.AsistenciaServicio.agregarAsistenciaAlumno(asistencia).subscribe({
        next: res => {
          console.log("Asistencia creada", res);
           location.reload();
        },
        error: err => {
          console.error("Error al crear asistencia", err);
        }
      });
    });
  }

  ngOnInit() {
    this.obtenerGradosAnyoActual(this.anioActual);
  }
}
