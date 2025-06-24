import { Component, OnInit } from '@angular/core';
import { Alumno } from '../alumno';
import { AlumnoService } from '../alumno.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Grado } from '../../Models/grado';
import { GradoService } from '../../Services/grado.service';

@Component({
  selector: 'app-lista-alumnos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lista-alumnos.component.html',
  styleUrls: ['./lista-alumnos.component.css']
})
export class ListaAlumnosComponent implements OnInit {
  alumnos: Alumno[] = [];
  todosLosAlumnos: Alumno[] = [];
  filtroAnio: string = '';
  filtroGrado: string = '';
  aniosDisponibles: number[] = [];
  gradosDisponibles: Grado[] = [];
  anioActual: number = new Date().getFullYear();

  constructor(
    private alumnoServicio: AlumnoService,
    private gradoService: GradoService,
    private router: Router
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
    this.obtenerAlumnos();
    if (this.mensaje) {
      setTimeout(() => this.mensaje = '', 2000);
    }
  }

  // Obtiene todos los alumnos del servidor
  obtenerAlumnos(): void {
    this.alumnoServicio.obtenerListaDeAlumnos().subscribe({
      next: (data: Alumno[]) => {
        console.log('Datos recibidos del servidor:', data);
        this.todosLosAlumnos = data || [];
        this.alumnos = [...this.todosLosAlumnos];
        this.cargarOpciones();
      },
      error: (error) => {
        console.error('Error al obtener alumnos:', error);
        this.todosLosAlumnos = [];
        this.alumnos = [];
      }
    });
  }

  // Extrae los años disponibles para el filtro
  cargarOpciones(): void {
    const aniosSet = new Set<number>();

    this.todosLosAlumnos.forEach(alumno => {
      if (alumno.grado?.anioAcademico?.anio) {
        aniosSet.add(alumno.grado.anioAcademico.anio);
      }
    });

    this.aniosDisponibles = Array.from(aniosSet).sort((a, b) => b - a);
    console.log('Años disponibles:', this.aniosDisponibles);
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
    this.alumnos = this.todosLosAlumnos.filter(alumno => {
      let cumpleFiltros = true;

      if (this.filtroAnio) {
        const anioAlumno = alumno.grado?.anioAcademico?.anio?.toString();
        cumpleFiltros = cumpleFiltros && (anioAlumno === this.filtroAnio);
      }

      if (this.filtroGrado) {
        const gradoAlumno = alumno.grado?.id_grado?.toString();
        cumpleFiltros = cumpleFiltros && (gradoAlumno === this.filtroGrado);
      }

      return cumpleFiltros;
    });

    console.log(`Alumnos filtrados: ${this.alumnos.length} de ${this.todosLosAlumnos.length}`);
  }

  // Resetea todos los filtros
  limpiarFiltros(): void {
    this.filtroAnio = '';
    this.filtroGrado = '';
    this.gradosDisponibles = [];
    this.alumnos = [...this.todosLosAlumnos];
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

          this.alumnos = this.alumnos.filter(a => a.idAlumno !== this.idAlumnoAEliminar);
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
    return this.todosLosAlumnos.length;
  }

  get alumnosFiltrados(): number {
    return this.alumnos.length;
  }
}