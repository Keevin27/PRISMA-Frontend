import { Component } from '@angular/core';
import { AsistenciaAlumno } from '../asistencia-alumno';
import { AsistenciaAlumnoService } from '../asistencia-alumno.service';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-asistencia-lista',
  standalone: true,
  imports: [RouterModule,HttpClientModule,FormsModule,CommonModule],
  templateUrl: './asistencia-lista.component.html',
  styleUrl: './asistencia-lista.component.css'
})
export class AsistenciaListaComponent {

  asistenciaAlumnos: AsistenciaAlumno[];

  constructor(private AsistenciaServicio: AsistenciaAlumnoService){

  }

  ngOnInit(){
    this.obtenerAsistencia();
  }

  private obtenerAsistencia(){
    this.AsistenciaServicio.obtenerAsistenciaAlumnos().subscribe(
      (datos => {
        this.asistenciaAlumnos = datos;
      })
    );
  } 

}
