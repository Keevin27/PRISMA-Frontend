import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Alumno } from '../alumno';
import { AlumnoService } from '../alumno.service';
import { CommonModule } from '@angular/common';
import { MatriculaService } from '../../Services/matricula.service';
import { Matricula } from '../../Models/matricula';

@Component({
  selector: 'app-ver-alumno',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ver-alumno.component.html',
  styleUrl: './ver-alumno.component.css'
})
export class VerAlumnoComponent implements OnInit {
  matricula: Matricula = new Matricula();
  id: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alumnoService: AlumnoService,
    private matriculaService: MatriculaService,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.matriculaService.findMatriculaByIdAlumno(this.id).subscribe(dato => {

      this.matricula = dato;
    });
    // this.alumnoService.obtenerAlumnoPorId(this.id).subscribe(dato => {
    //   this.alumno = dato;
    // });
  }

  volver(): void {
    this.router.navigate(['/alumnos']);
  }
}
