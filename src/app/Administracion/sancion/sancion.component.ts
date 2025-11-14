import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { SancionService } from '../../Services/sancion.service';
import { AlumnoService } from '../../Alumno/alumno.service';
import { GradoService } from '../../Services/grado.service';
import { MatriculaService } from '../../Alumno/matricula.service';
import { AnioAcademicoService } from '../../Services/anio-academico.service';

import { Sancion } from '../../Models/sancion';
import { Alumno } from '../../Alumno/alumno';
import { Grado } from '../../Models/grado';
import { Matricula } from '../../Models/matricula';
import { AnioAcademico } from '../../Models/anio-academico';

@Component({
  selector: 'app-sancion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sancion.component.html',
  styleUrls: ['./sancion.component.css']
})
export class SancionComponent implements OnInit {
  
  // PASO 1: Año Académico
  anioAcademicoActivo: AnioAcademico | null = null;
  cargandoAnio: boolean = false;

  // PASO 2: Grados
  grados: Grado[] = [];
  gradoSeleccionado: Grado | null = null;
  cargandoGrados: boolean = false;

  // PASO 3: Alumnos
  alumnos: Alumno[] = [];
  alumnosFiltrados: Alumno[] = [];
  alumnoSeleccionado: Alumno | null = null;
  busquedaAlumno: string = '';
  cargandoAlumnos: boolean = false;

  // PASO 4: Sanciones
  sanciones: Sancion[] = [];
  cargandoSanciones: boolean = false;
  mostrarFormularioSancion: boolean = false;
  modoEdicion: boolean = false;
  sancionEditando: Sancion | null = null;

  // Modelo para nueva sanción
  nuevaSancion = {
    tipoSancion: 'Leve',
    fechaSancion: new Date().toISOString().split('T')[0],
    descripcionSancion: ''
  };

  // Mensajes
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  private alertTimer: any = null;

  constructor(
    private anioAcademicoService: AnioAcademicoService,
    private gradoService: GradoService,
    private matriculaService: MatriculaService,
    private alumnoService: AlumnoService,
    private sancionService: SancionService
  ) {}

  ngOnInit(): void {
    this.cargarAnioAcademicoActivo();
  }

  // ==================== PASO 1: AÑO ACADÉMICO ====================
  cargarAnioAcademicoActivo(): void {
    this.cargandoAnio = true;
    this.anioAcademicoService.obtenerAniosAcademicos().subscribe({
      next: (anios: AnioAcademico[]) => {
        this.anioAcademicoActivo = anios.find((a: AnioAcademico) => a.anio_activo) || null;
        this.cargandoAnio = false;
        
        if (this.anioAcademicoActivo) {
          console.log('Año académico activo:', this.anioAcademicoActivo);
          this.cargarGradosDelAnio();
        } else {
          this.mostrarMensaje('error', 'No hay un año académico activo configurado.');
        }
      },
      error: (err: any) => {
        console.error('Error al cargar año académico:', err);
        this.mostrarMensaje('error', 'Error al cargar el año académico.');
        this.cargandoAnio = false;
      }
    });
  }

  // ==================== PASO 2: GRADOS ====================
  cargarGradosDelAnio(): void {
    if (!this.anioAcademicoActivo) return;
    
    this.cargandoGrados = true;
    this.gradoService.obtenerGradosPorAnyo(this.anioAcademicoActivo.anio).subscribe({
      next: (grados: Grado[]) => {
        this.grados = grados.filter((g: Grado) => g.estadoGrado);
        this.cargandoGrados = false;
        console.log('Grados cargados:', this.grados.length);
      },
      error: (err: any) => {
        console.error('Error al cargar grados:', err);
        this.mostrarMensaje('error', 'Error al cargar los grados.');
        this.cargandoGrados = false;
      }
    });
  }

  seleccionarGrado(grado: Grado): void {
    this.gradoSeleccionado = grado;
    this.alumnoSeleccionado = null;
    this.sanciones = [];
    this.mostrarFormularioSancion = false;
    this.busquedaAlumno = '';
    console.log('Grado seleccionado:', grado);
    this.cargarAlumnosDelGrado();
  }

  // ==================== PASO 3: ALUMNOS ====================
  cargarAlumnosDelGrado(): void {
    if (!this.gradoSeleccionado || !this.anioAcademicoActivo) return;
    
    this.cargandoAlumnos = true;
    this.matriculaService.obtenerMatriculasPorGrado(this.gradoSeleccionado.id_grado).subscribe({
      next: (matriculas: Matricula[]) => {
        this.alumnos = matriculas
          .filter((m: Matricula) => m.alumno && m.alumno.estado_alumno)
          .map((m: Matricula) => m.alumno);
        
        this.alumnosFiltrados = [...this.alumnos];
        this.cargandoAlumnos = false;
        console.log('Alumnos cargados:', this.alumnos.length);
      },
      error: (err: any) => {
        console.error('Error al cargar alumnos:', err);
        this.mostrarMensaje('error', 'Error al cargar los alumnos del grado.');
        this.cargandoAlumnos = false;
      }
    });
  }

  filtrarAlumnos(): void {
    const termino = this.busquedaAlumno.toLowerCase().trim();
    
    if (!termino) {
      this.alumnosFiltrados = [...this.alumnos];
      return;
    }

    this.alumnosFiltrados = this.alumnos.filter((alumno: Alumno) => {
      const nombreCompleto = `${alumno.nombre_alumno} ${alumno.apellido_alumno}`.toLowerCase();
      const nie = alumno.nie?.toString() || '';
      return nombreCompleto.includes(termino) || nie.includes(termino);
    });
  }

  seleccionarAlumno(alumno: Alumno): void {
    this.alumnoSeleccionado = alumno;
    this.mostrarFormularioSancion = false;
    console.log('Alumno seleccionado:', alumno);
    this.cargarSancionesDelAlumno();
  }

  // ==================== PASO 4: SANCIONES ====================
  cargarSancionesDelAlumno(): void {
    if (!this.alumnoSeleccionado || !this.anioAcademicoActivo) {
      console.error('No hay alumno o año académico seleccionado');
      return;
    }
    
    console.log('Cargando sanciones para:', {
      idAlumno: this.alumnoSeleccionado.idAlumno,
      anio: this.anioAcademicoActivo.anio
    });
    
    this.cargandoSanciones = true;
    this.sanciones = []; // Limpiar array antes de cargar
    
    this.sancionService.obtenerSancionesPorAlumno(
      this.alumnoSeleccionado.idAlumno,
      this.anioAcademicoActivo.anio
    ).subscribe({
      next: (sanciones: Sancion[]) => {
        console.log('Sanciones recibidas del servidor:', sanciones);
        this.sanciones = sanciones || [];
        this.cargandoSanciones = false;
        
        if (this.sanciones.length === 0) {
          console.log('No hay sanciones para este alumno en el año', this.anioAcademicoActivo?.anio);
        } else {
          console.log('Total de sanciones cargadas:', this.sanciones.length);
        }
      },
      error: (err: any) => {
        console.error('Error al cargar sanciones:', err);
        console.error('Detalles del error:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        this.mostrarMensaje('error', 'Error al cargar las sanciones.');
        this.cargandoSanciones = false;
        this.sanciones = [];
      }
    });
  }

  toggleFormularioSancion(): void {
    this.mostrarFormularioSancion = !this.mostrarFormularioSancion;
    if (this.mostrarFormularioSancion) {
      this.modoEdicion = false;
      this.sancionEditando = null;
      this.resetFormulario();
    }
  }

  registrarSancion(): void {
    this.limpiarMensajes();
    
    if (!this.alumnoSeleccionado) {
      this.mostrarMensaje('error', 'No hay un alumno seleccionado.');
      return;
    }

    if (!this.nuevaSancion.descripcionSancion.trim()) {
      this.mostrarMensaje('error', 'La descripción no puede estar vacía.');
      return;
    }

    // IMPORTANTE: Normalizar la descripción para evitar problemas con saltos de línea
    const descripcionNormalizada = this.nuevaSancion.descripcionSancion
      .trim()
      .replace(/\r\n/g, '\n') // Normalizar saltos de línea
      .replace(/\n+/g, '\n');  // Eliminar saltos múltiples

    const payload = {
      idAlumno: this.alumnoSeleccionado.idAlumno,
      tipoSancion: this.nuevaSancion.tipoSancion,
      descripcionSancion: descripcionNormalizada,
      fechaSancion: this.nuevaSancion.fechaSancion
    };

    console.log('Enviando sanción:', payload);

    const tituloAccion = this.modoEdicion ? 'Actualizar' : 'Confirmar';
    const textoAccion = this.modoEdicion 
      ? 'Se actualizará la sanción ' + payload.tipoSancion + '.'
      : 'Se registrará una sanción ' + payload.tipoSancion + ' para ' + this.alumnoSeleccionado.nombre_alumno + ' ' + this.alumnoSeleccionado.apellido_alumno + '.';

    Swal.fire({
      title: '¿' + tituloAccion + ' Sanción?',
      text: textoAccion,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${this.modoEdicion ? 'actualizar' : 'registrar'}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si está en modo edición, usa PUT; si no, usa POST
        const operacion = this.modoEdicion && this.sancionEditando
          ? this.sancionService.actualizarSancion(this.sancionEditando.idSancion, payload)
          : this.sancionService.crearSancion(payload);

        operacion.subscribe({
          next: (response: Sancion) => {
            console.log('Operación exitosa:', response);
            const mensaje = this.modoEdicion 
              ? 'Sanción actualizada correctamente.' 
              : 'Sanción registrada correctamente.';
            this.mostrarMensaje('exito', mensaje);
            
            // Recargar sanciones después de crear/actualizar
            this.cargarSancionesDelAlumno();
            
            this.mostrarFormularioSancion = false;
            this.modoEdicion = false;
            this.sancionEditando = null;
            this.resetFormulario();
          },
          error: (err: any) => {
            console.error('Error en operación:', err);
            this.mostrarMensaje('error', 'No se pudo procesar la sanción.');
          }
        });
      }
    });
  }

  confirmarEliminacion(sancion: Sancion): void {
    this.limpiarMensajes();
    
    Swal.fire({
      title: '¿Eliminar Sanción?',
      text: 'Se eliminará la sanción ' + sancion.tipoSancion + ' del ' + sancion.fechaSancion + '. Esta acción no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.eliminarSancion(sancion.idSancion);
      }
    });
  }

  private eliminarSancion(idSancion: number): void {
    this.sancionService.eliminarSancion(idSancion).subscribe({
      next: (response: any) => {
        console.log('Sanción eliminada:', response);
        this.mostrarMensaje('exito', 'Sanción eliminada correctamente.');
        this.cargarSancionesDelAlumno();
      },
      error: (err: any) => {
        console.error('Error al eliminar sanción:', err);
        this.mostrarMensaje('error', 'No se pudo eliminar la sanción.');
      }
    });
  }

  descargarReporte(sancion: Sancion): void {
    this.limpiarMensajes();
    
    if (sancion.tipoSancion !== 'Grave') {
      this.mostrarMensaje('error', 'Solo las sanciones graves pueden generar reporte.');
      return;
    }
    
    this.mostrarMensaje('exito', 'Generando reporte para imprimir...', 2000);
    
    // Llamar al servicio para obtener los datos
    this.sancionService.descargarReporte(sancion.idSancion).subscribe({
      next: (response: any) => {
        // Abrir ventana de impresión con los datos
        this.imprimirReporte(response, sancion);
      },
      error: (err: any) => {
        console.error('Error al obtener datos del reporte:', err);
        this.mostrarMensaje('error', 'No se pudo generar el reporte.');
      }
    });
  }

  private imprimirReporte(datos: any, sancion: Sancion): void {
    const ventanaImpresion = window.open('', '_blank');
    
    if (!ventanaImpresion) {
      this.mostrarMensaje('error', 'Por favor permita las ventanas emergentes para imprimir.');
      return;
    }

    // Obtener datos correctos
    const alumnoNombre = this.alumnoSeleccionado 
      ? `${this.alumnoSeleccionado.nombre_alumno} ${this.alumnoSeleccionado.apellido_alumno}` 
      : (datos.alumno || 'No disponible');
    
    const nie = this.alumnoSeleccionado?.nie || datos.nie || 'No disponible';
    
    const descripcion = sancion.descripcionSancion || datos.descripcion || 'No disponible';
    
    const fechaSancion = sancion.fechaSancion || datos.fecha;
    let fechaFormateada = 'No disponible';
    
    if (fechaSancion) {
      try {
        const fecha = new Date(fechaSancion);
        fechaFormateada = fecha.toLocaleDateString('es-SV', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } catch (e) {
        fechaFormateada = fechaSancion.toString();
      }
    }

    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Sanción</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header h2 {
            margin: 10px 0 0 0;
            font-size: 18px;
            font-weight: normal;
          }
          .section {
            margin: 20px 0;
          }
          .section-title {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 14px;
          }
          .section-content {
            padding: 10px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
            min-height: 30px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .firma {
            margin-top: 80px;
            text-align: center;
          }
          .firma-linea {
            border-top: 1px solid #000;
            width: 300px;
            margin: 0 auto 10px auto;
          }
          .fecha-impresion {
            text-align: right;
            font-size: 12px;
            color: #666;
            margin-top: 40px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>REPORTE DE SANCIÓN GRAVE</h1>
          <h2>Centro Escolar Gustavo Vides Valdes</h2>
        </div>
        
        <div class="section">
          <div class="section-title">ALUMNO:</div>
          <div class="section-content">${alumnoNombre}</div>
        </div>
        
        <div class="section">
          <div class="section-title">NIE:</div>
          <div class="section-content">${nie}</div>
        </div>
        
        <div class="section">
          <div class="section-title">FECHA DE LA SANCIÓN:</div>
          <div class="section-content">${fechaFormateada}</div>
        </div>
        
        <div class="section">
          <div class="section-title">TIPO DE SANCIÓN:</div>
          <div class="section-content">${sancion.tipoSancion}</div>
        </div>
        
        <div class="section">
          <div class="section-title">DESCRIPCIÓN:</div>
          <div class="section-content">${descripcion}</div>
        </div>
        
        <div class="firma">
          <div class="firma-linea"></div>
          <p>Firma del Encargado</p>
        </div>
        
        <div class="fecha-impresion">
          Impreso el: ${new Date().toLocaleString('es-SV')}
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    ventanaImpresion.document.write(contenidoHTML);
    ventanaImpresion.document.close();
  }

  // ==================== NUEVAS FUNCIONES ====================
  
  editarSancion(sancion: Sancion): void {
    this.modoEdicion = true;
    this.sancionEditando = sancion;
    this.mostrarFormularioSancion = true;
    
    // Cargar datos de la sanción en el formulario
    this.nuevaSancion = {
      tipoSancion: sancion.tipoSancion,
      fechaSancion: sancion.fechaSancion,
      descripcionSancion: sancion.descripcionSancion
    };

    // Scroll al formulario
    setTimeout(() => {
      const formElement = document.querySelector('.card.shadow-sm.mb-4.border-0');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // ==================== UTILIDADES ====================
  resetFormulario(): void {
    this.nuevaSancion = {
      tipoSancion: 'Leve',
      fechaSancion: new Date().toISOString().split('T')[0],
      descripcionSancion: ''
    };
  }

  volverASeleccionGrado(): void {
    this.gradoSeleccionado = null;
    this.alumnoSeleccionado = null;
    this.alumnos = [];
    this.alumnosFiltrados = [];
    this.sanciones = [];
    this.busquedaAlumno = '';
    this.mostrarFormularioSancion = false;
  }

  volverASeleccionAlumno(): void {
    this.alumnoSeleccionado = null;
    this.sanciones = [];
    this.mostrarFormularioSancion = false;
  }

  limpiarMensajes(): void {
    this.mensajeExito = null;
    this.mensajeError = null;
    if (this.alertTimer) clearTimeout(this.alertTimer);
  }

  mostrarMensaje(tipo: 'exito' | 'error', mensaje: string, duracion: number = 5000): void {
    this.limpiarMensajes();
    if (tipo === 'exito') this.mensajeExito = mensaje;
    if (tipo === 'error') this.mensajeError = mensaje;
    this.alertTimer = setTimeout(() => this.limpiarMensajes(), duracion);
  }
}