import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CoordinacionService } from '../../Services/coordinacion.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-asig-orientadores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './asig-orientadores.component.html',
  styleUrls: ['./asig-orientadores.component.css']
})
export class AsigOrientadoresComponent implements OnInit {

  cargando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  asignaciones: any[] = [];
  docentesDisponibles: any[] = [];
  gradosDisponibles: any[] = [];
  aniosAcademicos: any[] = [];

  anioSeleccionado: number | null = null;

  mostrarModalAgregar: boolean = false;
  mostrarModalEditar: boolean = false;
  idAsignacionEliminar: number | null = null;

  nuevaAsignacion = {
    duiDocente: '',
    idGrado: null as number | null
  };

  asignacionEditar = {
    idCoordinacion: null as number | null,
    duiDocente: '',
    nombreGrado: '' 
  };

  constructor(private coordinacionService: CoordinacionService) {}

  ngOnInit(): void {
    this.cargarAsignaciones();
  }


  cargarAsignaciones(): void {
    this.cargando = true;
    this.coordinacionService.getAsignaciones(this.anioSeleccionado).subscribe({
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

  cargarDocentesDisponibles(): void {
    this.coordinacionService.getDocentesDisponibles().subscribe({
      next: (data) => {
        this.docentesDisponibles = data;
      },
      error: (error) => {
        console.error('Error al cargar docentes:', error);
        this.mostrarError('Error al cargar docentes disponibles');
      }
    });
  }

  cargarGradosDisponibles(): void {
    // 5. La lógica de URL y parámetros se fue al servicio
    this.coordinacionService.getGradosDisponibles(this.anioSeleccionado).subscribe({
      next: (data) => {
        this.gradosDisponibles = data;
      },
      error: (error) => {
        console.error('Error al cargar grados:', error);
        this.mostrarError('Error al cargar grados disponibles');
      }
    });
  }


  filtrarPorAnio(): void {
    this.cargarAsignaciones();
  }


  abrirModalAgregar(): void {
    this.limpiarFormularioAgregar();
    this.cargarDocentesDisponibles();
    this.cargarGradosDisponibles();
    this.mostrarModalAgregar = true;
    document.body.classList.add('modal-open');
  }

  cerrarModalAgregar(): void {
    this.mostrarModalAgregar = false;
    this.limpiarFormularioAgregar();
    document.body.classList.remove('modal-open');
  }

  limpiarFormularioAgregar(): void {
    this.nuevaAsignacion = {
      duiDocente: '',
      idGrado: null
    };
  }

  guardarAsignacion(): void {
    if (!this.nuevaAsignacion.duiDocente || !this.nuevaAsignacion.idGrado) {
      this.mostrarError('Por favor complete todos los campos obligatorios');
      return;
    }

    this.cargando = true;

    this.coordinacionService.crearAsignacion(this.nuevaAsignacion).subscribe({
      next: (response: any) => {
        this.mostrarExito(response.mensaje || 'Asignación creada exitosamente');
        this.cerrarModalAgregar();
        this.cargarAsignaciones(); // Recarga la lista
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al guardar asignación:', error);
        const mensajeError = error.error?.error || 'Error al crear la asignación';
        this.mostrarError(mensajeError);
        this.cargando = false;
      }
    });
  }


  abrirModalEditar(asignacion: any): void {
    this.asignacionEditar = {
      idCoordinacion: asignacion.idCoordinacion,
      duiDocente: asignacion.duiDocente,
      nombreGrado: asignacion.gradoCompleto 
    };
    this.cargarDocentesDisponibles();
    this.mostrarModalEditar = true;
    document.body.classList.add('modal-open');
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.limpiarFormularioEditar();
    document.body.classList.remove('modal-open');
  }

  limpiarFormularioEditar(): void {
    this.asignacionEditar = {
      idCoordinacion: null,
      duiDocente: '',
      nombreGrado: ''
    };
  }

  actualizarAsignacion(): void {
    if (!this.asignacionEditar.duiDocente || !this.asignacionEditar.idCoordinacion) {
      this.mostrarError('Por favor seleccione un docente');
      return;
    }

    this.cargando = true;
    const datos = {
      duiDocente: this.asignacionEditar.duiDocente
    };

    this.coordinacionService.actualizarAsignacion(this.asignacionEditar.idCoordinacion, datos).subscribe({
      next: (response: any) => {
        this.mostrarExito(response.mensaje || 'Asignación actualizada exitosamente');
        this.cerrarModalEditar();
        this.cargarAsignaciones();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al actualizar asignación:', error);
        const mensajeError = error.error?.error || 'Error al actualizar la asignación';
        this.mostrarError(mensajeError);
        this.cargando = false;
      }
    });
  }


  abrirModalEliminar(idCoordinacion: number): void {
    this.idAsignacionEliminar = idCoordinacion;
    document.body.classList.add('modal-open');
  }

  cerrarModalEliminar(): void {
    this.idAsignacionEliminar = null;
    document.body.classList.remove('modal-open');
  }

  confirmarEliminacion(): void {
    if (!this.idAsignacionEliminar) return;

    this.coordinacionService.eliminarAsignacion(this.idAsignacionEliminar).subscribe({
      next: (response: any) => {
        this.mostrarExito(response.mensaje || 'Asignación eliminada exitosamente');
        this.cerrarModalEliminar();
        this.cargarAsignaciones(); // Recarga la lista
      },
      error: (error) => {
        console.error('Error al eliminar asignación:', error);
        const mensajeError = error.error?.error || 'Error al eliminar la asignación';
        this.mostrarError(mensajeError);
        this.cerrarModalEliminar();
      }
    });
  }


  mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mensajeError = '';
    setTimeout(() => {
      this.mensajeExito = '';
    }, 5000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    this.mensajeExito = '';
    setTimeout(() => {
      this.mensajeError = '';
    }, 5000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}