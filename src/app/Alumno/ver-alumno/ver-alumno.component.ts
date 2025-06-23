import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Alumno } from '../alumno';
import { AlumnoService } from '../alumno.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ver-alumno',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ver-alumno.component.html',
  styleUrl: './ver-alumno.component.css'
})
export class VerAlumnoComponent implements OnInit {
  alumno: Alumno = new Alumno();
  id: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alumnoService: AlumnoService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.alumnoService.obtenerAlumnoPorId(this.id).subscribe(dato => {
      this.alumno = dato;
    });
  }

  volver(): void {
    this.router.navigate(['/alumnos']);
  }
}
