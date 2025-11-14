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
import Swal from 'sweetalert2'; // Importar Swal

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
  mostrarSinMatricula: boolean = true;
  aniosDisponibles: AnioAcademico[] = [];
  todasLasMatriculas: Matricula[] = []; // TODAS las matrículas de la BD
  matriculas: Matricula[] = []; // Las matrículas filtradas para mostrar
  gradosDisponibles: Grado[] = [];
  
  // PROPIEDADES PARA MATRÍCULA
  todosLosAlumnos: Alumno[] = []; // TODOS los alumnos de la BD
  alumnosSinMatricula: Alumno[] = []; // Alumnos sin matrícula filtrados
  alumnoAMatricular: Alumno | null = null;
  anioActivo: AnioAcademico | null = null;
  nombreAnioActivoModal: string = 'Cargando...';
  gradoMatriculaSeleccionado: string = '';
  gradosParaMatricula: Grado[] = [];
  cuposDisponibles: Map<number, number> = new Map();
  
  // PROPIEDADES PARA ALERTAS EN BANNER
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  mensajeAdvertencia: string | null = null;
  private private_alertTimer: any = null;
  mensajeModalError: string | null = null;

  // NUEVA VARIABLE PARA EL CONTADOR TOTAL
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
    
    // 1. Cargar AÑOS (para encontrar el activo)
    this.anioAcademicoService.obtenerAniosAcademicos().subscribe({
      next: (dataAnios: AnioAcademico[]) => {
        this.aniosDisponibles = dataAnios || [];
        this.anioActivo = this.aniosDisponibles.find(a => a.anio_activo) || null;
        
        if (this.anioActivo) {
          this.filtroAnio = this.anioActivo.anio.toString(); // Poner año activo por defecto
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
                
                // 4. Cargar grados del año activo (para el filtro)
                if (this.anioActivo) {
                  this.cargarGradosPorAnio(this.anioActivo.anio, true); // true = auto-filtrar
                } else {
                  this.filtrarAlumnos(); // Filtrar sin año (mostrará todo)
                }
              },
              error: (error) => {
                this.mostrarMensaje('error', 'No se pudieron cargar los alumnos.');
              }
            });
          },
          error: (error) => {
            this.mostrarMensaje('error', 'No se pudieron cargar las matrículas.');
          }
        });
      },
      error: () => {
        this.mostrarMensaje('error', 'No se pudieron cargar los años académicos.');
      }
    });
  }


  // Carga los grados disponibles según el año seleccionado
  cargarGradosPorAnio(anio: number, autoFiltrar: boolean = false): void {
    this.gradoService.obtenerGradosPorAnyo(anio).subscribe({
      next: (data: Grado[]) => {
        this.gradosDisponibles = data || [];
        if (autoFiltrar) {
          this.filtrarAlumnos(); // Auto-filtrar después de cargar grados
        }
      },
      error: (error: any) => {
        console.error(`Error al cargar grados para ${anio}:`, error);
        this.gradosDisponibles = [];
        if (autoFiltrar) {
          this.filtrarAlumnos(); // Filtrar aunque fallen los grados
        }
      }
    });
  }
  
  // Maneja el cambio de filtro por año
  onAnioChange(): void {
    this.filtroGrado = '';
    this.gradosDisponibles = [];
    this.matriculas = [];
    this.alumnosSinMatricula = [];

    if (this.filtroAnio) {
      this.cargarGradosPorAnio(parseInt(this.filtroAnio), true); // Carga grados y LUEGO filtra
    } else {
      this.filtrarAlumnos(); // Si quita el año, filtra todo
    }
  }

  // Filtra la lista de alumnos según los criterios seleccionados
  filtrarAlumnos(): void {
    let matDelAnio: Matricula[] = [];
    let alumnosMatriculadosEnAnioIds: Set<number> = new Set();
    let candidatosDelAnio: Alumno[] = [];

    if (this.filtroAnio) {
        // 1. Filtrar matrículas POR AÑO
        matDelAnio = this.todasLasMatriculas.filter(matricula => 
            matricula.grado?.anioAcademico?.anio?.toString() === this.filtroAnio
        );
        
        // 2. Obtener IDs de alumnos matriculados ESE AÑO
        alumnosMatriculadosEnAnioIds = new Set(matDelAnio.map(m => m.alumno.idAlumno));
        
        // 3. Obtener "sin matrícula" (candidatos) DE ESE AÑO
        // Son todos los alumnos que NO están en la lista de matriculados de ese año
        candidatosDelAnio = this.todosLosAlumnos.filter(
            alumno => !alumnosMatriculadosEnAnioIds.has(alumno.idAlumno)
        );

    } else {
        // Si NO HAY filtro de año, mostrar todo
        matDelAnio = [...this.todasLasMatriculas];
        
        // "Sin matrícula" son los que no están en NINGUNA matrícula
        const alumnosMatriculadosIds = new Set(this.todasLasMatriculas.map(m => m.alumno.idAlumno));
        candidatosDelAnio = this.todosLosAlumnos.filter(
            alumno => !alumnosMatriculadosIds.has(alumno.idAlumno)
        );
    }
    
    // Asignar el TOTAL de alumnos de ese año
    this.totalAlumnosDelAnio = matDelAnio.length + candidatosDelAnio.length;

    // Aplicar filtro de GRADO (si existe)
    if (this.filtroGrado) {
        this.matriculas = matDelAnio.filter(matricula => 
            matricula.grado?.id_grado?.toString() === this.filtroGrado
        );
    } else {
        this.matriculas = matDelAnio; // Mostrar todas las del año
    }

    // Aplicar filtro de "Mostrar sin matrícula"
    if (this.mostrarSinMatricula) {
        // Si hay filtro de grado, NO mostramos "sin matrícula"
        this.alumnosSinMatricula = this.filtroGrado ? [] : candidatosDelAnio;
    } else {
        this.alumnosSinMatricula = [];
    }
  }


  // Resetea todos los filtros
  limpiarFiltros(): void {
    this.filtroAnio = '';
    this.filtroGrado = '';
    this.mostrarSinMatricula = true;
    this.gradosDisponibles = [];
    
    // Al limpiar, volvemos a poner el año activo por defecto
    if (this.anioActivo) {
      this.filtroAnio = this.anioActivo.anio.toString();
      this.onAnioChange(); // Carga grados y filtra
    } else {
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
              error: () => {
                this.cuposDisponibles.set(grado.id_grado, 45);
              }
            });
          }
        });
      },
      error: (error: any) => {
        console.error('Error al cargar grados para matrícula:', error);
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

    const cupoDisponible = this.obtenerCupoDisponible(parseInt(this.gradoMatriculaSeleccionado));
    if (cupoDisponible <= 0) {
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
          if (modal) {
            modal.hide();
          }
        }

        this.mostrarMensaje('exito', `Alumno ${this.alumnoAMatricular?.nombre_alumno} ${this.alumnoAMatricular?.apellido_alumno} matriculado exitosamente`);
        
        this.obtenerAlumnos(); // Recarga TODOS los datos
        
        this.alumnoAMatricular = null;
        this.gradoMatriculaSeleccionado = '';
        this.gradosParaMatricula = [];
        this.mensajeModalError = '';
      },
      error: (error: any) => {
        console.error('Error al crear matrícula:', error);
        
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
    // Abrir modal de Bootstrap
    const modalElement = document.getElementById('modalEliminar');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmarEliminacionAlumno(): void {
    if (this.idAlumnoAEliminar != null) {
      const id = this.idAlumnoAEliminar; 

      // Usamos Swal solo para la confirmación (que ya no es necesaria si usamos el modal de Bootstrap)
      // PERO el modal de Bootstrap ya tiene su propia confirmación.
      // Simplificamos: El botón "Sí, eliminar" del modal llama a esto.
      
      this.alumnoServicio.eliminarAlumno(id).subscribe({
        next: () => {
          this.mostrarMensaje('exito', 'Se eliminó el alumno exitosamente.');
          this.obtenerAlumnos(); // Recargamos todos los datos
        },
        error: (error: any) => {
          console.error('Error al eliminar alumno:', error);
          this.mostrarMensaje('error', 'Error al eliminar el alumno. Puede que esté asociado a otros registros.');
        }
      });
    }
    this.idAlumnoAEliminar = null; // Limpiamos el ID
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
        console.error('Error al generar el PDF del alumno:', error);
        this.mostrarMensaje('error', 'Error al generar el PDF del expediente.');
      }
    );
  }

  imprimirTodosLosAlumnos(): void {
    // ... (código de impresión sin cambios)
  }

  imprimirAlumnosFiltrados(): void {
    // ... (código de impresión sin cambios)
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

  // Total de alumnos relevantes PARA EL AÑO SELECCIONADO
  get totalAlumnos(): number {
    return this.totalAlumnosDelAnio;
  }

  // Total de alumnos mostrados DESPUÉS de aplicar el filtro de grado
  get alumnosFiltrados(): number {
    return this.matriculas.length + this.alumnosSinMatricula.length;
  }
}