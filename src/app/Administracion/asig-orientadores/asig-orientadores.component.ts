import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-asig-orientadores',
  standalone: true,
  imports: [CommonModule, FormsModule,  HttpClientModule],
  templateUrl: './asig-orientadores.component.html',
  styleUrls: ['./asig-orientadores.component.css']
})
export class AsigOrientadoresComponent implements OnInit {

  // URLs de la API
  private baseUrl = 'http://localhost:8080/coordinacion';

  // Datos
  asignaciones: any[] = [];
  docentesDisponibles: any[] = [];
  gradosDisponibles: any[] = [];
  aniosAcademicos: any[] = [];

  // Control de modales
  mostrarModalAgregar = false;
  mostrarModalEditar = false;
  idAsignacionEliminar: number | null = null;

  // Filtros
  anioSeleccionado: number | null = null;

  // Formulario de nueva asignación
  nuevaAsignacion = {
    duiDocente: '',
    idGrado: null as number | null
  };

  // Formulario de edición
  asignacionEditar: any = {
    idCoordinacion: null,
    duiDocente: '',
    idGrado: null,
    nombreGrado: ''
  };

  // Estados
  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.cargarAniosAcademicos();
    this.cargarAsignaciones();
  }

  // ========================================================
  // CARGAR AÑOS ACADÉMICOS
  // ========================================================
  cargarAniosAcademicos(): void {
    this.http.get<any[]>('http://localhost:8080/anio-academico/anios')
      .subscribe({
        next: (data) => {
          this.aniosAcademicos = data;
          // Seleccionar el año actual por defecto si existe
          const anioActual = data.find(a => a.estado === true);
          if (anioActual) {
            this.anioSeleccionado = anioActual.anio;
            this.cargarAsignaciones();
          }
        },
        error: (error) => {
          console.error('Error al cargar años académicos:', error);
        }
      });
  }

  // ========================================================
  // CARGAR ASIGNACIONES
  // ========================================================
  cargarAsignaciones(): void {
    this.cargando = true;
    let url = `${this.baseUrl}/asignaciones`;
    
    if (this.anioSeleccionado) {
      url += `?anioAcademico=${this.anioSeleccionado}`;
    }

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.asignaciones = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
        this.mostrarError('Error al cargar las asignaciones');
        this.cargando = false;
      }
    });
  }

  // ========================================================
  // FILTRAR POR AÑO
  // ========================================================
  filtrarPorAnio(): void {
    this.cargarAsignaciones();
  }

  // ========================================================
  // ABRIR MODAL PARA AGREGAR
  // ========================================================
  abrirModalAgregar(): void {
    this.limpiarFormulario();
    this.cargarDocentesDisponibles();
    this.cargarGradosDisponibles();
    this.mostrarModalAgregar = true;
  }

  // ========================================================
  // CARGAR DOCENTES DISPONIBLES
  // ========================================================
  cargarDocentesDisponibles(): void {
    this.http.get<any[]>(`${this.baseUrl}/docentes-disponibles`).subscribe({
      next: (data) => {
        this.docentesDisponibles = data;
      },
      error: (error) => {
        console.error('Error al cargar docentes:', error);
        this.mostrarError('Error al cargar los docentes disponibles');
      }
    });
  }

  // ========================================================
  // CARGAR GRADOS DISPONIBLES
  // ========================================================
  cargarGradosDisponibles(): void {
    let url = `${this.baseUrl}/grados-disponibles`;
    
    if (this.anioSeleccionado) {
      url += `?anioAcademico=${this.anioSeleccionado}`;
    }

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.gradosDisponibles = data;
      },
      error: (error) => {
        console.error('Error al cargar grados:', error);
        this.mostrarError('Error al cargar los grados disponibles');
      }
    });
  }

  // ========================================================
  // GUARDAR NUEVA ASIGNACIÓN
  // ========================================================
  guardarAsignacion(): void {
    if (!this.nuevaAsignacion.duiDocente || !this.nuevaAsignacion.idGrado) {
      this.mostrarError('Por favor complete todos los campos');
      return;
    }

    this.cargando = true;

    this.http.post<any>(`${this.baseUrl}/asignar`, this.nuevaAsignacion).subscribe({
      next: (response) => {
        this.mostrarExito('Coordinador asignado exitosamente');
        this.cerrarModalAgregar();
        this.cargarAsignaciones();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al asignar coordinador:', error);
        const mensaje = error.error?.error || 'Error al asignar el coordinador';
        this.mostrarError(mensaje);
        this.cargando = false;
      }
    });
  }

  // ========================================================
  // ABRIR MODAL PARA EDITAR
  // ========================================================
  abrirModalEditar(asignacion: any): void {
    this.asignacionEditar = {
      idCoordinacion: asignacion.idCoordinacion,
      duiDocente: asignacion.duiDocente,
      idGrado: asignacion.idGrado,
      nombreGrado: asignacion.gradoCompleto
    };
    
    this.cargarDocentesDisponibles();
    this.mostrarModalEditar = true;
  }

  // ========================================================
  // ACTUALIZAR ASIGNACIÓN
  // ========================================================
  actualizarAsignacion(): void {
    if (!this.asignacionEditar.duiDocente) {
      this.mostrarError('Por favor seleccione un docente');
      return;
    }

    this.cargando = true;

    const datos = {
      duiDocente: this.asignacionEditar.duiDocente
    };

    this.http.put<any>(
      `${this.baseUrl}/actualizar/${this.asignacionEditar.idCoordinacion}`,
      datos
    ).subscribe({
      next: (response) => {
        this.mostrarExito('Coordinador actualizado exitosamente');
        this.cerrarModalEditar();
        this.cargarAsignaciones();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al actualizar coordinador:', error);
        const mensaje = error.error?.error || 'Error al actualizar el coordinador';
        this.mostrarError(mensaje);
        this.cargando = false;
      }
    });
  }

  // ========================================================
  // ABRIR MODAL PARA ELIMINAR
  // ========================================================
  abrirModalEliminar(id: number): void {
    this.idAsignacionEliminar = id;
  }

  // ========================================================
  // CONFIRMAR ELIMINACIÓN
  // ========================================================
  confirmarEliminacion(): void {
    if (this.idAsignacionEliminar === null) {
      return;
    }

    this.cargando = true;

    this.http.delete<any>(`${this.baseUrl}/eliminar/${this.idAsignacionEliminar}`).subscribe({
      next: (response) => {
        this.mostrarExito('Asignación eliminada exitosamente');
        this.cerrarModalEliminar();
        this.cargarAsignaciones();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al eliminar asignación:', error);
        const mensaje = error.error?.error || 'Error al eliminar la asignación';
        this.mostrarError(mensaje);
        this.cargando = false;
      }
    });
  }

  // ========================================================
  // CERRAR MODALES
  // ========================================================
  cerrarModalAgregar(): void {
    this.mostrarModalAgregar = false;
    this.limpiarFormulario();
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.asignacionEditar = {
      idCoordinacion: null,
      duiDocente: '',
      idGrado: null,
      nombreGrado: ''
    };
  }

  cerrarModalEliminar(): void {
    this.idAsignacionEliminar = null;
  }

  // ========================================================
  // LIMPIAR FORMULARIO
  // ========================================================
  limpiarFormulario(): void {
    this.nuevaAsignacion = {
      duiDocente: '',
      idGrado: null
    };
  }

  // ========================================================
  // MENSAJES
  // ========================================================
  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    setTimeout(() => {
      this.mensajeExito = '';
    }, 5000);
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => {
      this.mensajeError = '';
    }, 5000);
  }
}