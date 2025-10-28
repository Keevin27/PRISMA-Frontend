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
import { MatriculaService } from '../../Services/matricula.service';

@Component({
  selector: 'app-lista-alumnos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lista-alumnos.component.html',
  styleUrls: ['./lista-alumnos.component.css']
})
export class ListaAlumnosComponent implements OnInit {
  rolesUsuario: string[] = [];//PARA RESTRINGIR
  // alumnos: Alumno[] = [];
  // todosLosAlumnos: Alumno[] = [];
  filtroAnio: string = '';
  filtroGrado: string = '';
  aniosDisponibles: AnioAcademico[] = [];
  todasLasMatriculas: Matricula[] = [];
  matriculas: Matricula[] = [];
  gradosDisponibles: Grado[] = [];
  anioActual: number = new Date().getFullYear();

  constructor(
    private alumnoServicio: AlumnoService,
    private gradoService: GradoService,
    private anioAcademicoService: AnioAcademicoService,
    private matriculaService: MatriculaService,
    private router: Router,
    private authService: AuthService //PARA RESTRINGIR
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { mensaje?: string };
    if (state?.mensaje) {
      this.mensaje = state.mensaje;
    }
  }
  mensaje: string = '';

  // Inicializa el componente
  ngOnInit(): void {
    this.rolesUsuario = this.authService.getUserRoles(); //PARA RESTRINGIR
    this.obtenerAlumnos();
    if (this.mensaje) {
      setTimeout(() => this.mensaje = '', 2000);
    }
  }
  BloquearDocente(): boolean {  //PARA RESTRINGIR
    return !this.rolesUsuario.includes('ROLE_DOCENTE');
  }

  // Obtiene todos los alumnos del servidor
  obtenerAlumnos(): void {

    this.matriculaService.obtenerMatriculas().subscribe({
      next: (data: Matricula[]) => {
        this.todasLasMatriculas = data || [];
        this.matriculas = [...this.todasLasMatriculas];
        this.cargarOpciones();
      },
      error:(error) => {
        console.error('ERROR AL OBTENER MATRICULAS', error);
        this.todasLasMatriculas = [];
        this.matriculas = [];
      }
    })

    // this.alumnoServicio.obtenerListaDeAlumnos().subscribe({
    //   next: (data: Alumno[]) => {
    //     console.log('Datos recibidos del servidor:', data);
    //     this.todosLosAlumnos = data || [];
    //     this.alumnos = [...this.todosLosAlumnos];
    //     this.cargarOpciones();
    //   },
    //   error: (error) => {
    //     console.error('Error al obtener alumnos:', error);
    //     this.todosLosAlumnos = [];
    //     this.alumnos = [];
    //   }
    // });
  }

  // Extrae los años disponibles para el filtro
  cargarOpciones(): void {

    this.anioAcademicoService.obtenerAniosAcademicos().subscribe({
      next: (data: AnioAcademico[]) => {
        this.aniosDisponibles = data || [];
      },
      error: () => {
        this.gradosDisponibles = [];
      }
    })
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

    })

    // this.alumnos = this.todosLosAlumnos.filter(alumno => {
    //   let cumpleFiltros = true;

    //   if (this.filtroAnio) {
    //     const anioAlumno = alumno.grado?.anioAcademico?.anio?.toString();
    //     cumpleFiltros = cumpleFiltros && (anioAlumno === this.filtroAnio);
    //   }

    //   if (this.filtroGrado) {
    //     const gradoAlumno = alumno.grado?.id_grado?.toString();
    //     cumpleFiltros = cumpleFiltros && (gradoAlumno === this.filtroGrado);
    //   }

    //   return cumpleFiltros;
    // });

    console.log(`Alumnos filtrados: ${this.matriculas.length} de ${this.todasLasMatriculas.length}`);
  }

  // Resetea todos los filtros
  limpiarFiltros(): void {
    this.filtroAnio = '';
    this.filtroGrado = '';
    this.gradosDisponibles = [];
    this.matriculas = [...this.todasLasMatriculas];
  }

  //Eliminar Alumno
  idAlumnoAEliminar: number | null = null;
  abrirModalEliminar(id: number) {
    this.idAlumnoAEliminar = id;
  }
  confirmarEliminacionAlumno() {
    if (this.idAlumnoAEliminar != null) {
      this.alumnoServicio.eliminarAlumno(this.idAlumnoAEliminar).subscribe({
        next: () => {

          this.matriculas = this.matriculas.filter(m => m.alumno.idAlumno !== this.idAlumnoAEliminar);
          this.mensaje = `Se elimino el alumno.`;

          // Oculta el mensaje después de 2 segundos
          setTimeout(() => {
            this.mensaje = '';
          }, 2000);
        },
        error: (error) => {
          console.error('Error al eliminar alumno:', error);
        }
      });
    }
  }

  // Construye el nombre completo del grado con sección
  obtenerNombreCompletoGrado(grado: Grado): string {
    if (!grado) return '';

    let nombreCompleto = '';

    if (grado.nombre_grado) {
      nombreCompleto += grado.nombre_grado;
    }

    if (grado.seccion) {
      nombreCompleto += ` - ${grado.seccion}`;
    }

    return nombreCompleto;
  }

  // Obtiene el nombre del grado seleccionado en el filtro
  obtenerGradoSeleccionado(): string {
    if (!this.filtroGrado) return '';

    const grado = this.gradosDisponibles.find(g => g.id_grado?.toString() === this.filtroGrado);
    return grado ? this.obtenerNombreCompletoGrado(grado) : '';
  }

  // PARA IMPRIMIR

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
    return this.todasLasMatriculas.length;
  }

  get alumnosFiltrados(): number {
    return this.matriculas.length;
  }
}