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

  resumenAsistencias: { //Etsructura a recorrer en la tabla
    alumno: {
      nombre: string;
      apellido: string;
      nie: number;
    };
    total: number;
    asistencia: number;
    inasistencia: number;
    permiso: number;
  }[] = [];


  constructor(
    private AsistenciaServicio: AsistenciaAlumnoService,
    private alumnoServicio: AlumnoService,
    private gradoServicio: GradoService
  ) { }

  private obtenerGradosAnyoActual(anioActual: number) {
    this.gradoServicio.obtenerGradosPorAnyo(anioActual).subscribe(dato => {
      this.grados = dato;
    });
  }

  // Método que se llama para filtrar asistencias por grado y fechas
  mensajeError: string = '';
  mensajeValido: string = '';
  buscarAsistenciasPorGradoYFechas() {
    if (!this.idGradoSeleccionado || !this.fechaInicio || isNaN(Date.parse(this.fechaInicio)) ||
      !this.fechaFin || isNaN(Date.parse(this.fechaInicio))) {
      return;
    }

    this.AsistenciaServicio.obtenerAsistenciasPorGradoYFechas(this.idGradoSeleccionado,
      this.fechaInicio, this.fechaFin).subscribe(dato => {
        this.asistencias = dato;
        this.generarResumen();
      })

  }


  ngOnInit() {
    this.obtenerGradosAnyoActual(this.anioActual);
  }
  //Verificar que las fechas de los select sean validas
  sonFechasValidas(): boolean {
    if (!this.fechaInicio || !this.fechaFin) return false;

    const inicio = Date.parse(this.fechaInicio);
    const fin = Date.parse(this.fechaFin);

    return !isNaN(inicio) && !isNaN(fin) && inicio <= fin;
  }

  get gradoSeleccionado(): Grado | undefined {
    return this.grados.find(g => g.id_grado === +this.idGradoSeleccionado);
  }

  generarResumen() {
    const resumenMap = new Map<number, any>();

    for (const asistencia of this.asistencias) {
      const id = asistencia.alumno.idAlumno;
      const nombre = asistencia.alumno.nombre_alumno;
      const apellido = asistencia.alumno.apellido_alumno;
      const nie = asistencia.alumno.nie;

      if (!resumenMap.has(id)) {
        resumenMap.set(id, {
          alumno: { nombre, apellido, nie },
          total: 0,
          asistencia: 0,
          inasistencia: 0,
          permiso: 0
        });
      }

      const resumen = resumenMap.get(id);
      resumen.total++;

      switch (asistencia.estado_asistencia) {
        case 'Asistencia':
          resumen.asistencia++;
          break;
        case 'Inasistencia':
          resumen.inasistencia++;
          break;
        case 'Permiso':
          resumen.permiso++;
          break;
      }
    }

    // Convertir a array para mostrar en HTML
    this.resumenAsistencias = Array.from(resumenMap.values());
    this.mensajeValido = 'Asistencias cargadas correctamente.'
      setTimeout(() => {
        this.mensajeValido = '';
      }, 3000);
  }

  //Funcion que da formato a la impresion de tabla
  imprimirTabla() {
    const tablaOriginal = document.querySelector('.table') as HTMLElement;

    if (!tablaOriginal) {
      console.error('No se encontro la tabla para imprimir');
      return;
    }

    const tablaClonada = tablaOriginal.cloneNode(true) as HTMLElement;

    const checkboxesOriginal = tablaOriginal.querySelectorAll('input[type="checkbox"]');
    const checkboxesClonados = tablaClonada.querySelectorAll('input[type="checkbox"]');

    checkboxesOriginal.forEach((checkboxOriginal, i) => {
      const checkboxClonado = checkboxesClonados[i] as HTMLInputElement;
      if (checkboxOriginal instanceof HTMLInputElement && checkboxClonado) {
        checkboxClonado.checked = checkboxOriginal.checked;
        if (checkboxOriginal.checked) {
          checkboxClonado.setAttribute('checked', 'true');
        } else {
          checkboxClonado.removeAttribute('checked');
        }
      }
    });

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
          ${tablaClonada.outerHTML}
        </body>
      </html>
    `);
      ventana.document.close();
      ventana.print();
    } else {
      alert("No se pudo abrir la ventana de impresión");
    }
  }
}
