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
import { forkJoin } from 'rxjs';

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

  paqueteSeleccionado: PaqueteEscolar | null = null;
  idGradoSeleccionado: string = '';
  anioActual: number = new Date().getFullYear();

  constructor(private paqueteServicio: PaqueteEscolarService,
    private alumnoServicio: AlumnoService, private gradoServicio: GradoService,
    private alumnopaqueteServicio: AlumnopaqueteService) { }

  ngOnInit(): void {
    this.obtenerPaquetesActivos();
    this.obtenerGradosAnyoActual(this.anioActual);
  }
  //Obtener lista de paquetes activos
  private obtenerPaquetesActivos() {
    this.paqueteServicio.obtenerListaDePaquetesActivos().subscribe(dato => {
      this.paquetesescolares = dato;
    })
  }
  //Obtener grados del anyo actual
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
    this.paqueteSeleccionado = null;

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
    if (!this.paqueteSeleccionado) return;
    const asignaciones = this.alumnos.map(alumno => {
      return this.alumnopaqueteServicio.agregarAlumnoPaquete({
        paquete_entregado: false,
        alumno: { idAlumno: alumno.idAlumno } as Alumno,
        paqueteEscolar: { id_paquete_e: this.paqueteSeleccionado!.id_paquete_e } as PaqueteEscolar
      });
    });
    //Porcion de codigo que da la "pausa" para refrescar la tabla con las nuevas asignaciones
    forkJoin(asignaciones).subscribe({
      next: res => {
        console.log("Todas las asignaciones creadas", res);
        this.obtenerAsignaciones();
        this.paqueteSeleccionado = null;
      },
      error: err => {
        console.error("Error al crear asignaciones", err);
      }
    });
  }
  //Actualizar estado de la asignacion
  cambiarvalor(a: Alumno, p: PaqueteEscolar) {
    const asignacion = this.buscarAsignacion(a, p);
    if (!asignacion) {
      console.error('No se encontró asignación');
      return;
    }
    asignacion.paquete_entregado = !asignacion.paquete_entregado;
    this.alumnopaqueteServicio.actualizarAlumnoPaquete(asignacion.id_asignacion!, asignacion)
      .subscribe({
        next: res => {
          console.log("Asignación actualizada correctamente", res);
        },
        error: err => {
          console.error("Error al actualizar asignación", err);
        }
      });
  }
  buscarAsignacion(alumno: Alumno, paquete: PaqueteEscolar): Alumnopaquete | undefined {
    console.log("llegamso");
    return this.asignaciones.find(a =>
      a.alumno.idAlumno === alumno.idAlumno &&
      a.paqueteEscolar.id_paquete_e === paquete.id_paquete_e
    );

  }


  imprimirTabla() {
  const tablaHTML = document.querySelector('.table')?.outerHTML;

  if (!tablaHTML) {
    console.error('No se encontro la tabla para imprimir');
    return;
  }

  const ventana = window.open('', '_blank', 'width=900,height=600');

  if (ventana) {
    ventana.document.write(`
      <html>
        <head>
          <title>Listado de alumnos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background-color: #eee; }
          </style>
        </head>
        <body>
          <h2>Listado de alumnos</h2>
          ${tablaHTML}
        </body>
      </html>
    `);
    ventana.document.close();
    ventana.print();
  } else {
    alert("No se pudo abrir la ventana de impresion");
  }
}


}
