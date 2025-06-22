import { Component } from '@angular/core';
import { AsistenciaAlumno } from '../asistencia-alumno';
import { AsistenciaAlumnoService } from '../asistencia-alumno.service';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Alumno } from '../../Alumno/alumno';
import { AlumnoService } from '../../Alumno/alumno.service';
import { Grado } from '../../Models/grado';
import { GradoService } from '../../Services/grado.service';

@Component({
  selector: 'app-asistencia-lista',
  standalone: true,
  imports: [RouterModule, HttpClientModule, FormsModule, CommonModule],
  templateUrl: './asistencia-lista.component.html',
  styleUrl: './asistencia-lista.component.css'
})
export class AsistenciaListaComponent {
  alumnos: Alumno[] = [];
  grados: Grado[] = [];
  asistencias: AsistenciaAlumno[] = [];

  idGradoSeleccionado: string = '';
  anioActual: number = new Date().getFullYear();
  fechaInicio: string = '';
  fechaFin: string = '';

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

  // Método que se llama para filtrar asistencias por grado y fechas
  buscarAsistenciasPorGradoYFechas() {
    if (!this.idGradoSeleccionado || !this.fechaInicio || !this.fechaFin) {
      alert('Por favor, seleccione un grado y un rango de fechas.');
      return;
    }

    this.AsistenciaServicio.obtenerAsistenciasPorGradoYFechas(
      this.idGradoSeleccionado,
      this.fechaInicio,
      this.fechaFin
    ).subscribe(dato => {
      this.asistencias = dato;
    });
  }
    trackById(index: number, item: AsistenciaAlumno) {
  return item.id_asistencia;
}


  ngOnInit() {
    this.obtenerGradosAnyoActual(this.anioActual);
  }
}
