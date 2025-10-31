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
  todasLasMatriculas: Matricula[] = [];
  matriculas: Matricula[] = [];
  gradosDisponibles: Grado[] = [];
  
  // NUEVAS PROPIEDADES PARA MATRÍCULA
  todosLosAlumnos: Alumno[] = [];
  alumnosSinMatricula: Alumno[] = [];
  alumnoAMatricular: Alumno | null = null;
  anioMatriculaSeleccionado: string = '';
  gradoMatriculaSeleccionado: string = '';
  gradosParaMatricula: Grado[] = [];
  cuposDisponibles: Map<number, number> = new Map();
  
  mensaje: string = '';
  mensajeError: string = '';
  mensajeModalError: string = '';

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
      this.mensaje = state.mensaje;
    }
  }

  ngOnInit(): void {
    this.rolesUsuario = this.authService.getUserRoles();
    this.obtenerAlumnos();
    if (this.mensaje) {
      setTimeout(() => this.mensaje = '', 3000);
    }
  }

  BloquearDocente(): boolean {
    return !this.rolesUsuario.includes('ROLE_DOCENTE');
  }

  // Obtiene todos los alumnos y matrículas
  obtenerAlumnos(): void {
    this.matriculaService.obtenerMatriculas().subscribe({
      next: (matriculas: Matricula[]) => {
        this.todasLasMatriculas = matriculas || [];
        this.matriculas = [...this.todasLasMatriculas];
        
        this.alumnoServicio.obtenerListaDeAlumnos().subscribe({
          next: (alumnos: Alumno[]) => {
            this.todosLosAlumnos = alumnos || [];
            this.identificarAlumnosSinMatricula();
            this.cargarOpciones();
          },
          error: (error) => {
            console.error('Error al obtener alumnos:', error);
            this.todosLosAlumnos = [];
            this.identificarAlumnosSinMatricula();
          }
        });
      },
      error: (error) => {
        console.error('ERROR AL OBTENER MATRICULAS', error);
        this.todasLasMatriculas = [];
        this.matriculas = [];
      }
    });
  }

  // Identifica alumnos que no tienen matrícula
  identificarAlumnosSinMatricula(): void {
    const alumnosMatriculadosIds = this.todasLasMatriculas.map(m => m.alumno.idAlumno);
    this.alumnosSinMatricula = this.todosLosAlumnos.filter(
      alumno => !alumnosMatriculadosIds.includes(alumno.idAlumno)
    );
    console.log(`Alumnos sin matrícula: ${this.alumnosSinMatricula.length}`);
  }

  // Carga años académicos disponibles
  cargarOpciones(): void {
    this.anioAcademicoService.obtenerAniosAcademicos().subscribe({
      next: (data: AnioAcademico[]) => {
        this.aniosDisponibles = data || [];
      },
      error: () => {
        this.aniosDisponibles = [];
      }
    });
  }

  // Maneja el cambio de filtro por año
  onAnioChange(): void {
    this.filtroGrado = '';
    this.gradosDisponibles = [];

    if (this.filtroAnio) {
      this.cargarGradosPorAnio(parseInt(this.filtroAnio));
    }

    this.filtrarAlumnos();
  }

  // Carga los grados disponibles según el año seleccionado
  cargarGradosPorAnio(anio: number): void {
    this.gradoService.obtenerGradosPorAnyo(anio).subscribe({
      next: (data: Grado[]) => {
        this.gradosDisponibles = data || [];
        console.log(`Grados cargados para ${anio}:`, this.gradosDisponibles);
      },
      error: (error: any) => {
        console.error(`Error al cargar grados para ${anio}:`, error);
        this.gradosDisponibles = [];
      }
    });
  }

  // Filtra la lista de alumnos según los criterios seleccionados
  filtrarAlumnos(): void {
  // Filtrar matrículas
  this.matriculas = this.todasLasMatriculas.filter(matricula => {
    let cumplioFiltros = true;
    
    if (this.filtroAnio) {
      const anio = matricula.grado?.anioAcademico?.anio?.toString();
      cumplioFiltros = cumplioFiltros && (anio === this.filtroAnio);
    }

    if (this.filtroGrado) {
      const gradoseleccionado = matricula.grado?.id_grado?.toString();
      cumplioFiltros = cumplioFiltros && (gradoseleccionado === this.filtroGrado);
    }

    return cumplioFiltros;
  });

  // MODIFICADO: Controlar visibilidad de alumnos sin matrícula
  if (this.mostrarSinMatricula) {
    // Si el checkbox está marcado, mostrar alumnos sin matrícula
    this.identificarAlumnosSinMatricula();
  } else {
    // Si no está marcado, no mostrar alumnos sin matrícula
    this.alumnosSinMatricula = [];
  }

  console.log(`Alumnos filtrados: ${this.matriculas.length} de ${this.todasLasMatriculas.length}`);
  console.log(`Alumnos sin matrícula mostrados: ${this.alumnosSinMatricula.length}`);
}

  // Resetea todos los filtros
limpiarFiltros(): void {
  this.filtroAnio = '';
  this.filtroGrado = '';
  this.mostrarSinMatricula = true; // RESTAURAR valor predeterminado
  this.gradosDisponibles = [];
  this.matriculas = [...this.todasLasMatriculas];
  
  this.identificarAlumnosSinMatricula();
}

  // ============== FUNCIONES PARA MATRÍCULA ==============
  
  // Abre el modal para matricular un alumno
  abrirModalMatricular(alumno: Alumno): void {
    this.alumnoAMatricular = alumno;
    this.anioMatriculaSeleccionado = '';
    this.gradoMatriculaSeleccionado = '';
    this.gradosParaMatricula = [];
    this.mensajeModalError = '';
    this.cuposDisponibles.clear();
  }

  // Maneja el cambio de año en el modal de matrícula
  onAnioMatriculaChange(): void {
    this.gradoMatriculaSeleccionado = '';
    this.gradosParaMatricula = [];
    this.mensajeModalError = '';
    this.cuposDisponibles.clear();

    if (this.anioMatriculaSeleccionado) {
      this.cargarGradosParaMatricula(parseInt(this.anioMatriculaSeleccionado));
    }
  }

  // Carga los grados disponibles para matricular
  cargarGradosParaMatricula(anio: number): void {
    this.gradoService.obtenerGradosPorAnyo(anio).subscribe({
      next: (grados: Grado[]) => {
        this.gradosParaMatricula = grados || [];
        
        // Cargar cupos disponibles para cada grado
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

  // Obtiene el cupo disponible de un grado
  obtenerCupoDisponible(idGrado: number): number {
    return this.cuposDisponibles.get(idGrado) ?? 45;
  }

  // Confirma y crea la matrícula
  confirmarMatricula(): void {
    if (!this.alumnoAMatricular || !this.gradoMatriculaSeleccionado) {
      this.mensajeModalError = 'Debe seleccionar un grado';
      return;
    }

    const cupoDisponible = this.obtenerCupoDisponible(parseInt(this.gradoMatriculaSeleccionado));
    if (cupoDisponible <= 0) {
      this.mensajeModalError = 'El grado seleccionado no tiene cupos disponibles';
      return;
    }

    const payload = {
      idAlumno: this.alumnoAMatricular.idAlumno,
      idGrado: parseInt(this.gradoMatriculaSeleccionado)
    };

    this.matriculaService.crearMatricula(payload).subscribe({
      next: (response: any) => {
        console.log('Matrícula creada:', response);
        
        // Cerrar modal
        const modalElement = document.getElementById('modalMatricular');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }

        // Mostrar mensaje de éxito
        this.mensaje = `Alumno ${this.alumnoAMatricular?.nombre_alumno} ${this.alumnoAMatricular?.apellido_alumno} matriculado exitosamente`;
        
        // Recargar datos
        this.obtenerAlumnos();
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

        // Limpiar variables del modal
        this.alumnoAMatricular = null;
        this.anioMatriculaSeleccionado = '';
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
  }

  confirmarEliminacionAlumno(): void {
    if (this.idAlumnoAEliminar != null) {
      this.alumnoServicio.eliminarAlumno(this.idAlumnoAEliminar).subscribe({
        next: () => {
          this.matriculas = this.matriculas.filter(m => m.alumno.idAlumno !== this.idAlumnoAEliminar);
          this.alumnosSinMatricula = this.alumnosSinMatricula.filter(a => a.idAlumno !== this.idAlumnoAEliminar);
          
          this.mensaje = `Se eliminó el alumno exitosamente.`;
          setTimeout(() => {
            this.mensaje = '';
          }, 3000);
        },
        error: (error: any) => {
          console.error('Error al eliminar alumno:', error);
          this.mensajeError = 'Error al eliminar el alumno';
          setTimeout(() => {
            this.mensajeError = '';
          }, 3000);
        }
      });
    }
  }

  // ============== FUNCIONES AUXILIARES ==============
  
  // Construye el nombre completo del grado con sección
  obtenerNombreCompletoGrado(grado: Grado): string {
    if (!grado) return 'Sin grado';

    let nombreCompleto = '';

    if (grado.nombre_grado) {
      nombreCompleto += grado.nombre_grado;
    }

    if (grado.seccion) {
      nombreCompleto += ` - ${grado.seccion}`;
    }

    return nombreCompleto || 'Sin grado';
  }

  // Obtiene el nombre del grado seleccionado en el filtro
  obtenerGradoSeleccionado(): string {
    if (!this.filtroGrado) return '';

    const grado = this.gradosDisponibles.find(g => g.id_grado?.toString() === this.filtroGrado);
    return grado ? this.obtenerNombreCompletoGrado(grado) : '';
  }

  // ============== FUNCIONES DE IMPRESIÓN ==============

  imprimirExpedienteIndividual(idAlumno: number, nombre: string): void {
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
      }
    );
  }

  imprimirTodosLosAlumnos(): void {
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
        console.error('Error al generar el PDF del listado de alumnos:', error);
      }
    );
  }

  imprimirAlumnosFiltrados(): void {
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
          console.error('Error al generar el PDF filtrado:', error);
        }
      );
    } else {
      this.imprimirTodosLosAlumnos();
    }
  }

  // Método auxiliar para verificar si hay filtros activos
  private hayFiltrosActivos(): boolean {
    return !!(this.filtroAnio || this.filtroGrado);
  }

  // Método para obtener descripción de qué se va a imprimir
  obtenerDescripcionImpresion(): string {
    if (!this.hayFiltrosActivos()) {
      return `Imprimir todos los alumnos (${this.totalAlumnos})`;
    } else {
      return `Imprimir alumnos filtrados (${this.alumnosFiltrados})`;
    }
  }

  get totalAlumnos(): number {
  return this.todasLasMatriculas.length + this.alumnosSinMatricula.length;
}

get alumnosFiltrados(): number {
  // Cuenta las matrículas filtradas + los alumnos sin matrícula que se están mostrando
  return this.matriculas.length + (this.mostrarSinMatricula ? this.alumnosSinMatricula.length : 0);
}
}