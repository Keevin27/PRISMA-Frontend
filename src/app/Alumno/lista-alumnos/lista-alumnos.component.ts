import { Component, OnInit } from '@angular/core';
import { Alumno } from '../alumno';
import { AlumnoService } from '../alumno.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
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
    private gradoService: GradoService
  ) {}

  // Inicializa el componente
  ngOnInit(): void {
    this.obtenerAlumnos();
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

  // Elimina un alumno después de confirmar
  eliminarAlumno(id: number): void {
    if (confirm('¿Estás seguro de eliminar este alumno?')) {
      this.alumnoServicio.eliminarAlumno(id).subscribe({
        next: () => {
          this.obtenerAlumnos();
        },
        error: (error) => {
          console.error('Error al eliminar alumno:', error);
          alert('Error al eliminar el alumno');
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
  
  imprimirExpedienteIndividual(idAlumno: number): void {
  const url = `http://localhost:8080/Alu/alumnos/${idAlumno}/imprimir`;
  this.abrirPDFEnNuevaVentana(url);
}
  // Imprimir todos los alumnos (sin filtros)
  imprimirTodosLosAlumnos(): void {
    const url = 'http://localhost:8080/Alu/alumnos/imprimir-listado';
    this.abrirPDFEnNuevaVentana(url);
  }

  // Imprimir solo los alumnos filtrados
  imprimirAlumnosFiltrados(): void {
    if (this.hayFiltrosActivos()) {
      // Si hay filtros, usar el endpoint con parámetros
      let url = 'http://localhost:8080/Alu/alumnos/imprimir-listado-filtrado?';
      const params: string[] = [];
      
      if (this.filtroAnio) {
        params.push(`anio=${encodeURIComponent(this.filtroAnio)}`);
      }
      
      if (this.filtroGrado) {
        params.push(`grado=${encodeURIComponent(this.filtroGrado)}`);
      }
      
      url += params.join('&');
      this.abrirPDFEnNuevaVentana(url);
    } else {
      // Si no hay filtros, imprimir todos
      this.imprimirTodosLosAlumnos();
    }
  }

  // Método principal que se llama desde el botón "Imprimir"
  imprimirListado(): void {
    if (this.totalAlumnos === 0) {
      alert('No hay alumnos para imprimir');
      return;
    }

    if (this.alumnosFiltrados === 0) {
      alert('No hay alumnos que coincidan con los filtros para imprimir');
      return;
    }

    // Imprimir según los filtros actuales
    this.imprimirAlumnosFiltrados();
  }

  // Método auxiliar para abrir PDF en nueva ventana
  private abrirPDFEnNuevaVentana(url: string): void {
    try {
      const nuevaVentana = window.open(url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      if (!nuevaVentana) {
        // Si el popup fue bloqueado, intentar con location.href
        alert('Por favor, permite ventanas emergentes para ver el PDF o usa Ctrl+Click para abrir en nueva pestaña');
      }
    } catch (error) {
      console.error('Error al abrir PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
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