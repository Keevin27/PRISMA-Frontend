import { Component, OnInit } from '@angular/core';
import { Alumno } from '../alumno';
import { AlumnoService } from '../alumno.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-alumnos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-alumnos.component.html',
  styleUrls: ['./lista-alumnos.component.css']
})
export class ListaAlumnosComponent implements OnInit {
  alumnos: Alumno[];

  constructor(private alumnoServicio: AlumnoService) {}

  ngOnInit(): void {
    this.obtenerAlumnos();
  }

  private obtenerAlumnos() {
    this.alumnoServicio.obtenerListaDeAlumnos().subscribe(dato => {
      this.alumnos = dato;
    });
  }

  eliminarAlumno(id: number) {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.alumnoServicio.eliminarAlumno(id).subscribe(() => {
        this.obtenerAlumnos(); // Recargar la lista después de eliminar
      });
    }
  }
}
