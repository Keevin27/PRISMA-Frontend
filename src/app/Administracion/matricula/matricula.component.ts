import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { MatriculaService } from '../../Alumno/matricula.service';
import { AlumnoService } from '../../Alumno/alumno.service';
import { GradoService } from '../../Services/grado.service';
import { AnioAcademicoService } from '../../Services/anio-academico.service';

@Component({
  selector: 'app-matricula',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './matricula.component.html',
  styleUrl: './matricula.component.css'
})
export class MatriculaComponent implements OnInit {
  
  // Datos principales
  aniosAcademicos: any[] = [];
  grados: any[] = [];
  
  todosLosAlumnos: any[] = [];
  alumnosMatriculados: any[] = [];
  alumnosNoMatriculados: any[] = [];
  alumnosMostrados: any[] = [];

  // Filtros seleccionados
  anioSeleccionado: number | null = null;
  nombreAnioActivo: string = ''; // VARIABLE PARA EL TEXTO FIJO
  gradoSeleccionado: number | null = null;

  // Vista activa (pestañas)
  vistaActiva: string = 'todos';

  alumnosSeleccionados: Set<number> = new Set();

  // Estados de carga
  cargandoDatos: boolean = false;
  cargandoAlumnos: boolean = false;

  // Información adicional
  cupoDisponible: number = 45;
  totalMatriculados: number = 0;
  totalNoMatriculados: number = 0;

  // Alertas en Banner
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  mensajeAdvertencia: string | null = null;
  private private_alertTimer: any = null;

  constructor(
    private matriculaService: MatriculaService,
    private alumnoService: AlumnoService,
    private gradoService: GradoService,
    private anioAcademicoService: AnioAcademicoService
  ) {}

  ngOnInit(): void {
    this.cargarAniosAcademicos();
  }

  //Métodos de mensajes
  limpiarMensajes(): void {
    this.mensajeExito = null;
    this.mensajeError = null;
    this.mensajeAdvertencia = null;
    if (this.private_alertTimer) {
      clearTimeout(this.private_alertTimer);
    }
  }

  mostrarMensaje(tipo: 'exito' | 'error' | 'advertencia', mensaje: string, duracion: number = 5000): void {
    this.limpiarMensajes();
    if (tipo === 'exito') this.mensajeExito = mensaje;
    if (tipo === 'error') this.mensajeError = mensaje;
    if (tipo === 'advertencia') this.mensajeAdvertencia = mensaje;
    this.private_alertTimer = setTimeout(() => {
      this.limpiarMensajes();
    }, duracion);
  }

  // ==================== CARGA DE DATOS INICIALES ====================

  cargarAniosAcademicos(): void {
    this.cargandoDatos = true;
    this.anioAcademicoService.obtenerAniosAcademicos().subscribe({
      next: (data: any) => {
        this.aniosAcademicos = data;
        this.cargandoDatos = false;
        
        // Buscar solo el activo
        const anioActivo = this.aniosAcademicos.find(a => a.anio_activo);
        if (anioActivo) {
          this.anioSeleccionado = anioActivo.anio;
          // Guardamos el nombre para mostrarlo en el HTML sin que sea editable
          this.nombreAnioActivo = `${anioActivo.nombre_anio || anioActivo.anio} (Activo)`; 
          this.cargarGradosPorAnio();
        } else {
            this.nombreAnioActivo = 'No hay año activo';
        }
      },
      error: (error: any) => {
        console.error('Error al cargar años académicos:', error);
        this.cargandoDatos = false;
        this.mostrarMensaje('error', 'No se pudieron cargar los años académicos.');
      }
    });
  }

  cargarGradosPorAnio(): void {
    if (!this.anioSeleccionado) {
      this.grados = [];
      return;
    }
    this.cargandoDatos = true;
    this.gradoService.obtenerGradosPorAnyo(this.anioSeleccionado).subscribe({
      next: (data: any) => {
        this.grados = data.filter((g: any) => g.estadoGrado);
        this.cargandoDatos = false;
        if (this.gradoSeleccionado && !this.grados.find(g => g.id_grado === this.gradoSeleccionado)) {
          this.gradoSeleccionado = null;
          this.limpiarDatos();
        }
      },
      error: (error: any) => {
        console.error('Error al cargar grados:', error);
        this.cargandoDatos = false;
        this.mostrarMensaje('error', 'No se pudieron cargar los grados de este año.');
      }
    });
  }

  //cargarAlumnos, cambiarVista, actualizarVista
  cargarAlumnos(): void {
    if (!this.anioSeleccionado || !this.gradoSeleccionado) {
      this.mostrarMensaje('advertencia', 'Debe seleccionar un año académico y un grado.');
      return;
    }
    this.cargandoAlumnos = true;
    this.limpiarSelecciones();
    this.limpiarMensajes(); 

    this.matriculaService.obtenerAlumnosPorGrado(this.gradoSeleccionado, this.anioSeleccionado).subscribe({
      next: (response: any) => {
        this.alumnosMatriculados = response.matriculados || [];
        this.alumnosNoMatriculados = response.noMatriculados || [];
        this.totalMatriculados = response.totalMatriculados || 0;
        this.totalNoMatriculados = response.totalNoMatriculados || 0;
        this.cupoDisponible = response.cupoDisponible || 0;
        this.todosLosAlumnos = [...this.alumnosMatriculados, ...this.alumnosNoMatriculados];
        this.actualizarVista(); 
        this.cargandoAlumnos = false;
      },
      error: (error: any) => {
        console.error('Error al cargar alumnos:', error);
        this.cargandoAlumnos = false;
        this.mostrarMensaje('error', 'No se pudieron cargar los alumnos.');
      }
    });
  }

  cambiarVista(vista: 'todos' | 'matriculados' | 'no-matriculados'): void {
    this.vistaActiva = vista;
    this.actualizarVista();
    this.deseleccionarTodos();
    this.limpiarMensajes();
  }

  actualizarVista(): void {
    switch (this.vistaActiva) {
      case 'todos':
        this.alumnosMostrados = this.todosLosAlumnos.slice().sort((a, b) =>
          a.alumno.apellido_alumno.localeCompare(b.alumno.apellido_alumno)
        );
        break;
      case 'matriculados':
        this.alumnosMostrados = this.alumnosMatriculados.slice().sort((a, b) =>
          a.alumno.apellido_alumno.localeCompare(b.alumno.apellido_alumno)
        );
        break;
      case 'no-matriculados':
        this.alumnosMostrados = this.alumnosNoMatriculados.slice().sort((a, b) =>
          a.alumno.apellido_alumno.localeCompare(b.alumno.apellido_alumno)
        );
        break;
    }
  }

  // Selección de alumnos
  toggleSeleccion(idAlumno: number): void {
    if (this.alumnosSeleccionados.has(idAlumno)) {
      this.alumnosSeleccionados.delete(idAlumno);
    } else {
      this.alumnosSeleccionados.add(idAlumno);
    }
  }
  seleccionarTodos(): void {
    this.alumnosMostrados.forEach(matricula => {
      this.alumnosSeleccionados.add(matricula.alumno.idAlumno);
    });
  }
  deseleccionarTodos(): void {
    this.alumnosSeleccionados.clear();
  }
  estaSeleccionado(idAlumno: number): boolean {
    return this.alumnosSeleccionados.has(idAlumno);
  }
  todosSeleccionados(): boolean {
    return this.alumnosMostrados.length > 0 && 
           this.alumnosMostrados.every(m => this.alumnosSeleccionados.has(m.alumno.idAlumno));
  }

  // ==================== MATRÍCULA Y DESMATRÍCULA ====================

  matricularSeleccionados(): void {
    this.limpiarMensajes();
    if (this.alumnosSeleccionados.size === 0) {
      this.mostrarMensaje('advertencia', 'Debe seleccionar al menos un alumno.');
      return;
    }
    if (!this.gradoSeleccionado) {
      this.mostrarMensaje('error', 'No hay un grado seleccionado.');
      return;
    }
    if (this.alumnosSeleccionados.size > this.cupoDisponible) {
      this.mostrarMensaje('advertencia', `Cupo insuficiente. Solo hay ${this.cupoDisponible} cupos disponibles.`);
      return;
    }
    
    Swal.fire({
      title: '¿Confirmar matrícula?',
      text: `Se matricularán ${this.alumnosSeleccionados.size} alumno(s)`,
      icon: 'question',
      showCancelButton: true,
      // COLOR VERDE PARA CONFIRMAR
      confirmButtonColor: '#16a34a', 
      // COLOR ROJO PARA CANCELAR
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Sí, matricular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarMatricula();
      }
    });
  }

  procesarMatricula(): void {
    const payload = {
      idGrado: this.gradoSeleccionado,
      idsAlumnos: Array.from(this.alumnosSeleccionados)
    };
    this.matriculaService.matricularMultiples(payload).subscribe({
      next: (response: any) => {
        if (response.errores && response.errores.length > 0) {
          const erroresHtml = response.errores.map((e: string) => `<li>${e}</li>`).join('');
          this.mostrarMensaje('advertencia', `Matrícula completada con advertencias: ${response.matriculasCreadas} exitosas. Errores: ${erroresHtml}`, 10000);
        } else {
          this.mostrarMensaje('exito', `Se matricularon ${response.matriculasCreadas} alumno(s) correctamente.`);
        }
        this.cargarAlumnos();
      },
      error: (error: any) => {
        console.error('Error al matricular:', error);
        this.mostrarMensaje('error', 'No se pudo completar la matrícula. Intente de nuevo.');
      }
    });
  }

  desmatricularSeleccionados(): void {
    this.limpiarMensajes();
    if (this.alumnosSeleccionados.size === 0) {
      this.mostrarMensaje('advertencia', 'Debe seleccionar al menos un alumno.');
      return;
    }
    
    Swal.fire({
      title: '¿Confirmar desmatrícula?',
      text: `Se desmatricularán ${this.alumnosSeleccionados.size} alumno(s) de este grado.`,
      icon: 'warning',
      showCancelButton: true, 
      confirmButtonColor: '#dc2626', 
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desmatricular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarDesmatricula();
      }
    });
  }

  procesarDesmatricula(): void {
    const payload = {
      idsAlumnos: Array.from(this.alumnosSeleccionados),
      idGrado: this.gradoSeleccionado 
    };
    this.matriculaService.desmatricularMultiples(payload).subscribe({
      next: (response: any) => {
        if (response.errores && response.errores.length > 0) {
          this.mostrarMensaje('advertencia', `Proceso completado con advertencias. ${response.desmatriculasExitosas} exitosas.`);
        } else {
          this.mostrarMensaje('exito', `Se desmatricularon ${response.desmatriculasExitosas} alumno(s) correctamente.`);
        }
        this.cargarAlumnos();
      },
      error: (error: any) => {
        console.error('Error al desmatricular:', error);
        this.mostrarMensaje('error', 'No se pudo completar la desmatrícula.');
      }
    });
  }

  //Utilidades y lógica extra
  limpiarSelecciones(): void {
    this.alumnosSeleccionados.clear();
  }
  limpiarDatos(): void {
    this.todosLosAlumnos = [];
    this.alumnosMatriculados = [];
    this.alumnosNoMatriculados = [];
    this.alumnosMostrados = [];
    this.limpiarSelecciones();
    this.totalMatriculados = 0;
    this.totalNoMatriculados = 0;
    this.cupoDisponible = 45;
    this.vistaActiva = 'todos';
  }
  onAnioChange(): void {
    this.gradoSeleccionado = null;
    this.limpiarDatos();
    this.cargarGradosPorAnio();
  }
  onGradoChange(): void {
    this.limpiarDatos();
    if (this.gradoSeleccionado) {
      this.cargarAlumnos();
    }
  }
  obtenerNombreGrado(idGrado: number): string {
    const grado = this.grados.find(g => g.id_grado === idGrado);
    return grado ? `${grado.nombre_grado} - Sección ${grado.seccion}` : '';
  }
  estaMatriculado(idAlumno: number): boolean {
    return this.alumnosMatriculados.some(m => m.alumno.idAlumno === idAlumno);
  }

  // ==================== INDIVIDUAL ====================

  matricularAlumnoIndividual(idAlumno: number): void {
    this.limpiarMensajes();
    if (!this.gradoSeleccionado) {
      this.mostrarMensaje('error', 'No hay un grado seleccionado para matricular.');
      return;
    }
    if (this.cupoDisponible <= 0) {
      this.mostrarMensaje('advertencia', 'No hay cupo disponible en este grado.');
      return;
    }
    const alumnoMatricula = this.alumnosMostrados.find(m => m.alumno.idAlumno === idAlumno);
    const nombreAlumno = alumnoMatricula ? `${alumnoMatricula.alumno.nombre_alumno} ${alumnoMatricula.alumno.apellido_alumno}` : `el alumno`;

    Swal.fire({
      title: '¿Confirmar matrícula?',
      text: `Se matriculará a ${nombreAlumno} en ${this.obtenerNombreGrado(this.gradoSeleccionado)}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Sí, matricular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarMatriculaIndividual(idAlumno);
      }
    });
  }

  procesarMatriculaIndividual(idAlumno: number): void {
    const payload = {
      idGrado: this.gradoSeleccionado,
      idsAlumnos: [idAlumno]
    };
    this.matriculaService.matricularMultiples(payload).subscribe({
      next: (response: any) => {
        if (response.errores && response.errores.length > 0) {
          this.mostrarMensaje('advertencia', response.errores[0]);
        } else {
          this.mostrarMensaje('exito', 'El alumno fue matriculado correctamente.');
        }
        this.cargarAlumnos(); 
      },
      error: (error: any) => {
        console.error('Error al matricular:', error);
        this.mostrarMensaje('error', 'No se pudo completar la matrícula.');
      }
    });
  }
}