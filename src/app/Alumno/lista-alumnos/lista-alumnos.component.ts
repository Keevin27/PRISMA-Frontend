import { Component, OnInit } from '@angular/core';
import { Alumno } from '../alumno';
import { AlumnoService } from '../alumno.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Grado } from '../../Models/grado';
import { GradoService } from '../../Services/grado.service';
import { AuthService } from '../../Auth/auth.service';
import { AnioAcademicoService } from '../../Services/anio-academico.service';
import { AnioAcademico } from '../../Models/anio-academico';
import { Matricula } from '../../Models/matricula';
import { MatriculaService } from '../../Alumno/matricula.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-lista-alumnos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lista-alumnos.component.html',
  styleUrls: ['./lista-alumnos.component.css']
})
export class ListaAlumnosComponent implements OnInit {
  rolesUsuario: string[] = [];
  filtroAnio: string = '';
  filtroGrado: string = '';
  aniosDisponibles: AnioAcademico[] = [];
  todasLasMatriculas: Matricula[] = [];
  matriculas: Matricula[] = [];
  gradosDisponibles: Grado[] = [];
  
  todosLosAlumnos: Alumno[] = [];
  alumnosSinMatricula: Alumno[] = [];
  alumnoAMatricular: Alumno | null = null;
  anioActivo: AnioAcademico | null = null;
  nombreAnioActivoModal: string = 'Cargando...';
  gradoMatriculaSeleccionado: string = '';
  gradosParaMatricula: Grado[] = [];
  cuposDisponibles: Map<number, number> = new Map();
  
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  mensajeAdvertencia: string | null = null;
  private private_alertTimer: any = null;
  mensajeModalError: string | null = null;

  totalAlumnosDelAnio: number = 0;

  constructor(
    private alumnoServicio: AlumnoService,
    private gradoService: GradoService,
    private anioAcademicoService: AnioAcademicoService,
    private matriculaService: MatriculaService,
    private router: Router,
    private authService: AuthService
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { mensaje?: string };
    if (state?.mensaje) {
      this.mostrarMensaje('exito', state.mensaje);
    }
  }

  ngOnInit(): void {
    this.rolesUsuario = this.authService.getUserRoles();
    this.obtenerAlumnos();
    this.limpiarBackdropsHuerfanos();
  }

  BloquearDocente(): boolean {
    return !this.rolesUsuario.includes('ROLE_DOCENTE');
  }

  // ==================== GESTIÓN DE ALERTAS ====================
  limpiarMensajes(): void {
    this.mensajeExito = null;
    this.mensajeError = null;
    this.mensajeAdvertencia = null;
    this.mensajeModalError = null;
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

  // Limpieza
  private limpiarBackdropsHuerfanos(): void {
    // Remover todos los backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // Remover todos los modales ocultos
    const modales = document.querySelectorAll('.modal');
    modales.forEach(modal => {
      modal.classList.remove('show');
      modal.removeAttribute('aria-modal');
      modal.removeAttribute('role');
      modal.setAttribute('aria-hidden', 'true');
      (modal as HTMLElement).style.display = 'none';
    });
    
    // Limpiar clases del body
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
  }

  // Forzar cierre completo del modal
  private cerrarModalCompletamente(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    
    if (modalElement) {
      // Intentar cerrar con Bootstrap
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
      
      // Forzar limpieza después de un momento
      setTimeout(() => {
        this.limpiarBackdropsHuerfanos();
      }, 350);
    }
  }

  // ========================================================

  obtenerAlumnos(): void {
    this.limpiarMensajes();
    
    this.anioAcademicoService.obtenerAniosAcademicos().subscribe({
      next: (dataAnios: AnioAcademico[]) => {
        this.aniosDisponibles = dataAnios.sort((a, b) => b.anio - a.anio);
        this.anioActivo = this.aniosDisponibles.find(a => a.anio_activo) || null;
        
        if (this.anioActivo) {
          this.filtroAnio = this.anioActivo.anio.toString();
          this.nombreAnioActivoModal = `${this.anioActivo.anio} (Activo)`;
        } else {
          this.nombreAnioActivoModal = 'No hay año activo';
          this.mostrarMensaje('advertencia', 'No se encontró un año académico activo. El modal de matrícula no funcionará.');
        }

        this.matriculaService.obtenerMatriculas().subscribe({
          next: (matriculas: Matricula[]) => {
            this.todasLasMatriculas = matriculas || [];
            
            this.alumnoServicio.obtenerListaDeAlumnos().subscribe({
              next: (alumnos: Alumno[]) => {
                this.todosLosAlumnos = alumnos || [];
                
                if (this.filtroAnio) {
                  this.cargarGradosPorAnio(parseInt(this.filtroAnio), true);
                } else {
                  this.filtrarAlumnos();
                }
              },
              error: (error) => this.mostrarMensaje('error', 'No se pudieron cargar los alumnos.')
            });
          },
          error: (error) => this.mostrarMensaje('error', 'No se pudieron cargar las matrículas.')
        });
      },
      error: () => this.mostrarMensaje('error', 'No se pudieron cargar los años académicos.')
    });
  }

  cargarGradosPorAnio(anio: number, autoFiltrar: boolean = false): void {
    this.gradoService.obtenerGradosPorAnyo(anio).subscribe({
      next: (data: Grado[]) => {
        this.gradosDisponibles = data || [];
        if (autoFiltrar) {
          this.filtrarAlumnos();
        }
      },
      error: (error: any) => {
        this.gradosDisponibles = [];
        if (autoFiltrar) {
          this.filtrarAlumnos();
        }
      }
    });
  }
  
  onAnioChange(): void {
    this.filtroGrado = '';
    this.gradosDisponibles = [];
    this.matriculas = [];
    this.alumnosSinMatricula = [];

    if (this.filtroAnio) {
      this.cargarGradosPorAnio(parseInt(this.filtroAnio), true);
    } else {
      this.filtrarAlumnos();
    }
  }

  filtrarAlumnos(): void {
    this.matriculas = [];
    this.alumnosSinMatricula = [];
    this.totalAlumnosDelAnio = 0;

    if (!this.filtroAnio) {
        return;
    }

    const matDelAnio = this.todasLasMatriculas.filter(matricula => 
        matricula.grado?.anioAcademico?.anio?.toString() === this.filtroAnio
    );
    
    const alumnosMatriculadosEnAnioIds = new Set(matDelAnio.map(m => m.alumno.idAlumno));

    const candidatosDelAnio = this.todosLosAlumnos.filter(
        alumno => !alumnosMatriculadosEnAnioIds.has(alumno.idAlumno)
    );

    this.totalAlumnosDelAnio = matDelAnio.length + candidatosDelAnio.length;
    
    if (this.esAnioActivoSeleccionado() && !this.filtroGrado) {
        this.matriculas = matDelAnio;
        this.alumnosSinMatricula = candidatosDelAnio;
    
    } else if (this.filtroGrado) {
        this.matriculas = matDelAnio.filter(matricula => 
            matricula.grado?.id_grado?.toString() === this.filtroGrado
        );
        this.alumnosSinMatricula = [];

    } else {
        this.matriculas = matDelAnio;
        this.alumnosSinMatricula = [];
    }
  }

  esAnioActivoSeleccionado(): boolean {
    return this.anioActivo?.anio.toString() === this.filtroAnio;
  }

  limpiarFiltros(): void {
    this.filtroGrado = '';
    
    if (this.anioActivo) {
      this.filtroAnio = this.anioActivo.anio.toString();
      this.onAnioChange();
    } else {
      this.filtroAnio = '';
      this.filtrarAlumnos();
    }
  }

  // ============== FUNCIONES PARA MATRÍCULA (MODAL) ==============
  
  abrirModalMatricular(alumno: Alumno): void {
    this.limpiarMensajes();
    this.alumnoAMatricular = alumno;
    this.gradoMatriculaSeleccionado = '';
    this.gradosParaMatricula = [];
    this.mensajeModalError = '';
    this.cuposDisponibles.clear();

    if (this.anioActivo) {
      this.cargarGradosParaMatricula(this.anioActivo.anio);
    } else {
      this.mensajeModalError = 'Error: No hay un año académico activo configurado.';
    }
  }

  cargarGradosParaMatricula(anio: number): void {
    this.gradoService.obtenerGradosPorAnyo(anio).subscribe({
      next: (grados: Grado[]) => {
        this.gradosParaMatricula = grados || [];
        
        this.gradosParaMatricula.forEach(grado => {
          if (grado.id_grado) {
            this.matriculaService.contarAlumnosPorGrado(grado.id_grado).subscribe({
              next: (cantidad: number) => {
                this.cuposDisponibles.set(grado.id_grado, 45 - cantidad);
              },
              error: () => this.cuposDisponibles.set(grado.id_grado, 45)
            });
          }
        });
      },
      error: (error: any) => {
        this.mensajeModalError = 'Error al cargar los grados disponibles';
        this.gradosParaMatricula = [];
      }
    });
  }

  obtenerCupoDisponible(idGrado: number): number {
    return this.cuposDisponibles.get(idGrado) ?? 45;
  }

  // Confirmar la matricula
  confirmarMatricula(): void {
    this.limpiarMensajes();

    if (!this.alumnoAMatricular || !this.gradoMatriculaSeleccionado) {
      this.mensajeModalError = 'Debe seleccionar un grado';
      return;
    }
    if (this.obtenerCupoDisponible(parseInt(this.gradoMatriculaSeleccionado)) <= 0) {
      this.mensajeModalError = 'El grado seleccionado no tiene cupos disponibles';
      return;
    }

    const gradoSeleccionadoObj = this.gradosParaMatricula.find(g => g.id_grado.toString() === this.gradoMatriculaSeleccionado);
    const nombreGrado = gradoSeleccionadoObj ? this.obtenerNombreCompletoGrado(gradoSeleccionadoObj) : 'ese grado';

    // CERRAR MODAL COMPLETAMENTE Y FORZAR LIMPIEZA
    this.cerrarModalCompletamente('modalMatricular');

    // ESPERAR MÁS TIEMPO PARA ASEGURAR QUE TODO SE LIMPIÓ
    setTimeout(() => {
      Swal.fire({
        title: '¿Confirmar Matrícula?',
        text: `Se matriculará a ${this.alumnoAMatricular!.nombre_alumno} ${this.alumnoAMatricular!.apellido_alumno} en ${nombreGrado}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#198754',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, matricular',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.procesarMatricula(); 
        } else if (result.isDismissed) {
          // Si cancela, volver a abrir el modal
          const modalElement = document.getElementById('modalMatricular');
          if (modalElement) {
            const nuevoModal = new bootstrap.Modal(modalElement);
            nuevoModal.show();
          }
        }
      });
    }, 400); // Aumentado a 400ms
  }

  // Procesar la Matricula
  procesarMatricula(): void {
    if (!this.alumnoAMatricular || !this.gradoMatriculaSeleccionado) return;

    const payload = {
      idAlumno: this.alumnoAMatricular.idAlumno,
      idGrado: parseInt(this.gradoMatriculaSeleccionado)
    };

    this.matriculaService.crearMatricula(payload).subscribe({
      next: (response: any) => {
        //FORZAR LIMPIEZA DESPUÉS DEL ÉXITO
        this.limpiarBackdropsHuerfanos();
        
        this.mostrarMensaje('exito', `Alumno ${this.alumnoAMatricular?.nombre_alumno} ${this.alumnoAMatricular?.apellido_alumno} matriculado exitosamente`);
        this.obtenerAlumnos();
        
        this.alumnoAMatricular = null;
        this.gradoMatriculaSeleccionado = '';
        this.gradosParaMatricula = [];
        this.mensajeModalError = '';
      },
      error: (error: any) => {
        if (error.error && error.error.error) {
          this.mensajeModalError = error.error.error;
        } else {
          this.mensajeModalError = 'Error al crear la matrícula. Por favor intente nuevamente.';
        }
        
        // Si hay error, mostrar el modal nuevamente
        this.limpiarBackdropsHuerfanos();
        setTimeout(() => {
          const modalElement = document.getElementById('modalMatricular');
          if (modalElement) {
            const nuevoModal = new bootstrap.Modal(modalElement);
            nuevoModal.show();
          }
        }, 100);
      }
    });
  }

  // ============== FUNCIONES DE ELIMINACIÓN ==============
  
  idAlumnoAEliminar: number | null = null;
  
  abrirModalEliminar(id: number): void {
    this.idAlumnoAEliminar = id;
    this.limpiarMensajes();
    const modalElement = document.getElementById('modalEliminar');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmarEliminacionAlumno(): void {
    if (this.idAlumnoAEliminar != null) {
      const id = this.idAlumnoAEliminar;
      this.idAlumnoAEliminar = null;
      
      //CERRAR MODAL Y LIMPIAR
      this.cerrarModalCompletamente('modalEliminar');
      
      this.alumnoServicio.eliminarAlumno(id).subscribe({
        next: () => {
          this.mostrarMensaje('exito', 'Se eliminó el alumno exitosamente.');
          this.obtenerAlumnos();
        },
        error: (error: any) => {
          this.mostrarMensaje('error', 'Error al eliminar el alumno. Puede que esté asociado a otros registros.');
        }
      });
    }
  }

  // ============== FUNCIONES AUXILIARES ==============
  
  obtenerNombreCompletoGrado(grado: Grado): string {
    if (!grado) return 'Sin grado';
    let nombreCompleto = '';
    if (grado.nombre_grado) nombreCompleto += grado.nombre_grado;
    if (grado.seccion) nombreCompleto += ` - ${grado.seccion}`;
    return nombreCompleto || 'Sin grado';
  }

  obtenerGradoSeleccionado(): string {
    if (!this.filtroGrado) return '';
    const grado = this.gradosDisponibles.find(g => g.id_grado?.toString() === this.filtroGrado);
    return grado ? this.obtenerNombreCompletoGrado(grado) : '';
  }

  // ============== FUNCIONES DE IMPRESIÓN ==============
  imprimirExpedienteIndividual(idAlumno: number, nombre: string): void {
    this.limpiarMensajes();
    this.alumnoServicio.imprimirExpedienteAlumno(idAlumno).subscribe(
      (pdfBlob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expediente_alumno_${nombre}_${idAlumno}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        this.mostrarMensaje('error', 'Error al generar el PDF del expediente.');
      }
    );
  }

  imprimirTodosLosAlumnos(): void {
    this.limpiarMensajes();
    this.alumnoServicio.imprimirListadoAlumnos().subscribe(
      (pdfBlob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `listado_alumnos.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        this.mostrarMensaje('error', 'Error al generar el PDF del listado.');
      }
    );
  }

  imprimirAlumnosFiltrados(): void {
    this.limpiarMensajes();
    if (this.hayFiltrosActivos()) {
      const filtros: any = {};
      if (this.filtroAnio) filtros.anio = this.filtroAnio;
      if (this.filtroGrado) filtros.grado = this.filtroGrado;

      this.alumnoServicio.imprimirListadoAlumnosFiltrado(filtros).subscribe(
        (pdfBlob) => {
          const blob = new Blob([pdfBlob], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `listado_alumnos_filtrado.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          this.mostrarMensaje('error', 'Error al generar el PDF filtrado.');
        }
      );
    } else {
      this.imprimirTodosLosAlumnos();
    }
  }

  private hayFiltrosActivos(): boolean {
    return !!(this.filtroAnio || this.filtroGrado);
  }

  obtenerDescripcionImpresion(): string {
    if (!this.hayFiltrosActivos()) {
      return `Imprimir todos los alumnos (${this.totalAlumnosDelAnio})`;
    } else {
      return `Imprimir alumnos filtrados (${this.alumnosFiltrados})`;
    }
  }

  get alumnosFiltrados(): number {
    return this.matriculas.length + this.alumnosSinMatricula.length;
  }
}