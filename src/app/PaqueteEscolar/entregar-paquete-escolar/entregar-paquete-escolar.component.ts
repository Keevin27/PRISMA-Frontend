import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Alumno } from '../../Alumno/alumno';
import { PaqueteEscolarService } from '../paquete-escolar.service';
import { AlumnoService } from '../../Alumno/alumno.service';
import { PaqueteEscolar } from '../paquete-escolar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Grado } from '../../Models/grado';
import { GradoService } from '../../Services/grado.service';
import { AlumnopaqueteService } from '../alumnopaquete.service';
import { Alumnopaquete } from '../alumnopaquete';

@Component({
  selector: 'app-entregar-paquete-escolar',
  standalone: true,
  imports: [RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './entregar-paquete-escolar.component.html',
  styleUrl: './entregar-paquete-escolar.component.css'
})
export class EntregarPaqueteEscolarComponent {
  alumnos: Alumno[] = []; //Almancena la lista de alumnos de un grado que se seleccione
  paquetesescolares: PaqueteEscolar[] = []; //Almacenara la lista de paquetes escolares activos
  grados: Grado[] = []; //Lista de grados de anyo actual
  asignaciones: Alumnopaquete[] = []; //Lista de asignaciones, si a algun alumno se la entregado o no cierto paquete
  paquetesEntregados: PaqueteEscolar[] = [];//Aqui se guardan los paquetes que ya fueron entregados en la seccion
  paquetesaEntregar: PaqueteEscolar[] = [];//Paquetes a entregar, se cargaran en el select

  paqueteSeleccionado!: PaqueteEscolar;
  idGradoSeleccionado: string = '';
  anioActual: number = new Date().getFullYear();

  constructor(private paqueteServicio: PaqueteEscolarService,
    private alumnoServicio: AlumnoService, private gradoServicio: GradoService,
    private alumnopaqueteServicio: AlumnopaqueteService) { }

  ngOnInit(): void {
    this.obtenerPaquetesActivos();
    this.obtenerGradosAnyoActual(this.anioActual);
  }

  private obtenerPaquetesActivos() {
    this.paqueteServicio.obtenerListaDePaquetesActivos().subscribe(dato => {
      this.paquetesescolares = dato;
    })
  }

  private obtenerGradosAnyoActual(anioActual: number) {
    this.gradoServicio.obtenerGradosPorAnyo(anioActual).subscribe(dato => {
      this.grados = dato;
    });
  }
  //Este metodo se ejecuta cuando se selecciona un grado en la vista, entonces se cargan los alumnos 
  GradoSeleccionado() {
    this.alumnoServicio.obtenerListaDeAlumnosPorGrado(this.idGradoSeleccionado).subscribe(dato => {
      this.alumnos = dato;
    })
    this.obtenerAsignaciones();

  }
  //Metodo para traer las asginaciones de AlumnoPaquete del grado seleccionado
  obtenerAsignaciones() {
    this.alumnopaqueteServicio.obtenerAsignacionesDePaquetes(this.idGradoSeleccionado).subscribe(dato => {
      this.asignaciones = dato;
      this.obtenerPaquetesEntregados();
    })

  }
  //Metodo que en base a las asignaciones y los paquetes activos determina que paquetes se han entregado a los alumnos de ese grado
  private obtenerPaquetesEntregados() {
    const idsEntregados = new Set<number>();

    const entregados = this.asignaciones
      .map(a => a.paqueteEscolar)
      .filter(p => {
        if (!idsEntregados.has(p.id_paquete_e)) {
          idsEntregados.add(p.id_paquete_e);
          return true;
        }
        return false;
      });

    this.paquetesEntregados = entregados;

    this.paquetesaEntregar = this.paquetesescolares.filter(p => !idsEntregados.has(p.id_paquete_e));
  }

  //Verificar si a ese alumno se le ha entregado ese paquete
  tieneAsignacion(alumno: Alumno, paquete: PaqueteEscolar): boolean {
    return this.asignaciones.some(a =>
      a.alumno.idAlumno === alumno.idAlumno &&
      a.paqueteEscolar.id_paquete_e === paquete.id_paquete_e &&
      a.paquete_entregado === true);
  }
  //Se ejecuta para generar nuevas asignaciones para un paquete escolar
  generarListaEntrega() {
    this.alumnos.forEach(alumno => {
      const asignacion: Alumnopaquete = {
        paquete_entregado: false,
        alumno: { idAlumno: alumno.idAlumno } as Alumno,
        paqueteEscolar: { id_paquete_e: this.paqueteSeleccionado.id_paquete_e } as PaqueteEscolar

      }
      this.alumnopaqueteServicio.agregarAlumnoPaquete(asignacion).subscribe({
        next: res => {
          console.log("Asignación creada", res);
        },
        error: err => {
          console.error("Error al crear asignación", err);
        }
      })
    });
    this.obtenerAsignaciones();
    console.log("llegueee");
  }
}
