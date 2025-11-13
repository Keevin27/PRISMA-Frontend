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

  totalAlumnosDelAnio: number = 0; // Contador total

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
  // ========================================================

  obtenerAlumnos(): void {
    this.limpiarMensajes();
    
    // 1. Cargar AÑOS
    this.anioAcademicoService.obtenerAniosAcademicos().subscribe({
      next: (dataAnios: AnioAcademico[]) => {
        this.aniosDisponibles = dataAnios.sort((a, b) => b.anio - a.anio); // Ordenar años
        this.anioActivo = this.aniosDisponibles.find(a => a.anio_activo) || null;
        
        if (this.anioActivo) {
          this.filtroAnio = this.anioActivo.anio.toString();
          this.nombreAnioActivoModal = `${this.anioActivo.anio} (Activo)`;
        } else {
          this.nombreAnioActivoModal = 'No hay año activo';
          this.mostrarMensaje('advertencia', 'No se encontró un año académico activo. El modal de matrícula no funcionará.');
        }

        // 2. Cargar TODAS las matrículas
        this.matriculaService.obtenerMatriculas().subscribe({
          next: (matriculas: Matricula[]) => {
            this.todasLasMatriculas = matriculas || [];
            
            // 3. Cargar TODOS los alumnos
            this.alumnoServicio.obtenerListaDeAlumnos().subscribe({
              next: (alumnos: Alumno[]) => {
                this.todosLosAlumnos = alumnos || [];
                
                // 4. Cargar grados del año (activo por defecto) y FILTRAR
                if (this.filtroAnio) {
                  this.cargarGradosPorAnio(parseInt(this.filtroAnio), true); // true = auto-filtrar
                } else {
                  this.filtrarAlumnos(); // Filtrar sin año (mostrará todo)
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

  /**
   * Lógica de filtrado principal.
   * Decide qué alumnos mostrar (matriculados vs. candidatos) 
   * basándose en si el año seleccionado es el activo.
   */
  filtrarAlumnos(): void {
    // Limpiar listas
    this.matriculas = [];
    this.alumnosSinMatricula = [];
    this.totalAlumnosDelAnio = 0;

    if (!this.filtroAnio) {
        // Si no hay año seleccionado, no mostrar nada
        return;
    }

    // Encontrar todas las matrículas del AÑO seleccionado
    const matDelAnio = this.todasLasMatriculas.filter(matricula => 
        matricula.grado?.anioAcademico?.anio?.toString() === this.filtroAnio
    );
    
    // Obtener IDs de alumnos matriculados ESE AÑO
    const alumnosMatriculadosEnAnioIds = new Set(matDelAnio.map(m => m.alumno.idAlumno));

    // Obtener "Candidatos" (Todos los alumnos - los matriculados en ESE año)
    // Esta lista se usará si el año es el activo
    const candidatosDelAnio = this.todosLosAlumnos.filter(
        alumno => !alumnosMatriculadosEnAnioIds.has(alumno.idAlumno)
    );

    // Asignar el TOTAL de alumnos de ese año
    this.totalAlumnosDelAnio = matDelAnio.length + candidatosDelAnio.length;
    
    // Si el año seleccionado ES EL ACTIVO Y NO HAY FILTRO DE GRADO
    if (this.esAnioActivoSeleccionado() && !this.filtroGrado) {
        // Mostrar AMBOS: matriculados y candidatos
        this.matriculas = matDelAnio;
        this.alumnosSinMatricula = candidatosDelAnio;
    
    // Si hay filtro de GRADO (en cualquier año)
    } else if (this.filtroGrado) {
        // Mostrar SOLO los matriculados de ESE GRADO
        this.matriculas = matDelAnio.filter(matricula => 
            matricula.grado?.id_grado?.toString() === this.filtroGrado
        );
        // Ocultar candidatos (porque ya filtramos por grado)
        this.alumnosSinMatricula = [];

    // Si es un año PASADO (no activo) y SIN filtro de grado
    } else {
        // Mostrar SOLO los que estuvieron matriculados ese año
        this.matriculas = matDelAnio;
        // Ocultar candidatos
        this.alumnosSinMatricula = [];
    }
  }

  // Revisa si el filtroAnio es el anioActivo
  esAnioActivoSeleccionado(): boolean {
    return this.anioActivo?.anio.toString() === this.filtroAnio;
  }

  limpiarFiltros(): void {
    this.filtroGrado = '';
    
    if (this.anioActivo) {
      this.filtroAnio = this.anioActivo.anio.toString();
      this.onAnioChange(); // Carga grados y filtra
    } else {
      this.filtroAnio = '';
      this.filtrarAlumnos(); // Recalcular todo
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

    Swal.fire({
      title: '¿Confirmar Matrícula?',
      text: `Se matriculará a ${this.alumnoAMatricular.nombre_alumno} ${this.alumnoAMatricular.apellido_alumno} en ${nombreGrado}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754', // Verde
      cancelButtonColor: '#6c757d',  // Gris
      confirmButtonText: 'Sí, matricular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesarMatricula(); 
      }
    });
  }

  procesarMatricula(): void {
    if (!this.alumnoAMatricular || !this.gradoMatriculaSeleccionado) return;

    const payload = {
      idAlumno: this.alumnoAMatricular.idAlumno,
      idGrado: parseInt(this.gradoMatriculaSeleccionado)
    };

    this.matriculaService.crearMatricula(payload).subscribe({
      next: (response: any) => {
        const modalElement = document.getElementById('modalMatricular');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) modal.hide();
        }

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
      this.idAlumnoAEliminar = null; // Limpiar antes de la llamada
      
      this.alumnoServicio.eliminarAlumno(id).subscribe({
        next: () => {
          this.mostrarMensaje('exito', 'Se eliminó el alumno exitosamente.');
          this.obtenerAlumnos(); // Recargamos todos los datos
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

  // Total de alumnos mostrados DESPUÉS de aplicar el filtro de grado
  get alumnosFiltrados(): number {
    return this.matriculas.length + this.alumnosSinMatricula.length;
  }
}