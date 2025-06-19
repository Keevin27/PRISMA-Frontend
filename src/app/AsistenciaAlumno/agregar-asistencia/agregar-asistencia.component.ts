import { Component } from '@angular/core';
import { AsistenciaAlumno } from '../asistencia-alumno';
import { AsistenciaAlumnoService } from '../asistencia-alumno.service';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agregar-asistencia',
  standalone: true,
  imports: [RouterModule,HttpClientModule,FormsModule,CommonModule],
  templateUrl: './agregar-asistencia.component.html',
  styleUrl: './agregar-asistencia.component.css'
})
export class AgregarAsistenciaComponent {
onSubmit() {
throw new Error('Method not implemented.');
}

    asistenciaAlumnos: AsistenciaAlumno[];
model: any;

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
