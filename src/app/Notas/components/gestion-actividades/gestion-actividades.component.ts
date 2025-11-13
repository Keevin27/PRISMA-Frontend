// Ubicación: src/app/Notas/components/gestion-actividades/gestion-actividades.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ActividadesService } from '../../services/actividades.service';
import { BloqueService } from '../../../Services/bloque.service';
import { AuthService } from '../../../Auth/auth.service';

@Component({
  selector: 'app-gestion-actividades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './gestion-actividades.component.html',
  styleUrl: './gestion-actividades.component.css'
})
export class GestionActividadesComponent implements OnInit {
  bloques: any[] = [];
  bloquesDisponibles: any[] = [];
  bloqueSeleccionado: any = null;
  trimestreSeleccionado: number = 1;
  
  actividades: any[] = [];
  datosBloque: any = null;
  mensaje: string = '';
  cargando: boolean = false;

  // Modal para agregar/editar actividad
  mostrarModal: boolean = false;
  actividadEditando: any = null;
  isEditing: boolean = false;

  // Datos del formulario
  nombreActividad: string = '';
  ponderacion: number = 0;
  fechaActividad: string = '';

  trimestres = [
    { value: 1, label: 'Primer Trimestre' },
    { value: 2, label: 'Segundo Trimestre' },
    { value: 3, label: 'Tercer Trimestre' }
  ];

  constructor(
    private actividadesService: ActividadesService,
    private bloqueService: BloqueService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarBloques();
  }

  cargarBloques(): void {
    const roles = this.authService.getUserRoles();
    const esDocente = roles.includes('ROLE_DOCENTE');
    
    if (esDocente) {
      this.bloqueService.obtenerMisBloquesDocente().subscribe({
        next: (data: any[]) => {
          console.log('Bloques del docente cargados:', data);
          this.bloques = data;
          this.bloquesDisponibles = data;
        },
        error: (error: any) => {
          console.error('Error al cargar bloques del docente:', error);
          this.mensaje = 'Error al cargar las materias asignadas';
          this.mostrarMensaje();
        }
      });
    } else {
      this.bloqueService.obtenerTodosBloques().subscribe({
        next: (data: any[]) => {
          console.log('Todos los bloques cargados:', data);
          this.bloques = data;
          this.bloquesDisponibles = data;
        },
        error: (error: any) => {
          console.error('Error al cargar bloques:', error);
          this.mensaje = 'Error al cargar las materias';
          this.mostrarMensaje();
        }
      });
    }
  }

  consultarActividades(): void {
    if (!this.bloqueSeleccionado || !this.trimestreSeleccionado) {
      this.mensaje = 'Debe seleccionar una materia y un trimestre';
      this.mostrarMensaje();
      return;
    }

    this.cargando = true;
    console.log('Consultando actividades:', this.bloqueSeleccionado, this.trimestreSeleccionado);
    
    this.actividadesService.listarActividades(this.bloqueSeleccionado, this.trimestreSeleccionado).subscribe({
      next: (data: any) => {
        console.log('Actividades recibidas:', data);
        this.datosBloque = {
          materia: data.materia,
          grado: data.grado,
          seccion: data.seccion,
          trimestre: data.trimestre
        };
        this.actividades = data.actividades;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al consultar actividades:', error);
        this.mensaje = 'Error al consultar las actividades';
        this.mostrarMensaje();
        this.cargando = false;
      }
    });
  }

  abrirModalAgregar(): void {
    if (!this.bloqueSeleccionado || !this.trimestreSeleccionado) {
      this.mensaje = 'Primero debe consultar una materia y trimestre';
      this.mostrarMensaje();
      return;
    }

    //Validar que no se haya completado el 100%
    const totalPonderacion = this.calcularTotalPonderacion();
    if (totalPonderacion >= 100) {
      this.mensaje = 'Ya se completó el 100% de ponderación en este trimestre. No puede agregar más actividades.';
      this.mostrarMensaje();
      return;
    }

    this.isEditing = false;
    this.actividadEditando = null;
    this.limpiarFormulario();
    this.mostrarModal = true;
  }

  abrirModalEditar(actividad: any): void {
    this.isEditing = true;
    this.actividadEditando = actividad;
    this.nombreActividad = actividad.nombreActividad;
    this.ponderacion = actividad.ponderacion;
    this.fechaActividad = actividad.fechaActividad;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.limpiarFormulario();
  }

  guardarActividad(): void {
    // Validaciones
    if (!this.nombreActividad || this.nombreActividad.trim() === '') {
      this.mensaje = 'Ingrese el nombre de la actividad';
      this.mostrarMensaje();
      return;
    }

    if (this.ponderacion <= 0 || this.ponderacion > 100) {
      this.mensaje = 'La ponderación debe estar entre 0 y 100';
      this.mostrarMensaje();
      return;
    }

    // Validacion que no exceda el 100%
    if (!this.isEditing) {
      const totalActual = this.calcularTotalPonderacion();
      if (totalActual + this.ponderacion > 100) {
        this.mensaje = `La ponderación excede el 100%. Disponible: ${100 - totalActual}%`;
        this.mostrarMensaje();
        return;
      }
    } else {
      // Al editar, restar la ponderación anterior
      const totalSinActual = this.calcularTotalPonderacion() - (this.actividadEditando.ponderacion || 0);
      if (totalSinActual + this.ponderacion > 100) {
        this.mensaje = `La ponderación excede el 100%. Disponible: ${100 - totalSinActual}%`;
        this.mostrarMensaje();
        return;
      }
    }

    if (!this.fechaActividad) {
      this.mensaje = 'Seleccione la fecha de la actividad';
      this.mostrarMensaje();
      return;
    }

    if (this.isEditing && this.actividadEditando) {
      // Actualizar
      const updateData = {
        nombreActividad: this.nombreActividad,
        ponderacion: this.ponderacion,
        fechaActividad: this.fechaActividad
      };

      console.log('Actualizando actividad:', updateData);

      this.actividadesService.actualizarActividad(this.actividadEditando.idActividad, updateData).subscribe({
        next: (response: any) => {
          this.mensaje = 'Actividad actualizada exitosamente';
          this.mostrarMensaje();
          this.cerrarModal();
          this.consultarActividades();
        },
        error: (error: any) => {
          console.error('Error al actualizar:', error);
          this.mensaje = 'Error al actualizar la actividad';
          this.mostrarMensaje();
        }
      });
    } else {
      // Crear
      const actividadData = {
        idBloque: this.bloqueSeleccionado,
        trimestre: this.trimestreSeleccionado,
        nombreActividad: this.nombreActividad,
        ponderacion: this.ponderacion,
        fechaActividad: this.fechaActividad
      };

      console.log('Creando actividad con datos:', actividadData);

      this.actividadesService.crearActividad(actividadData).subscribe({
        next: (response: any) => {
          console.log('Respuesta del servidor:', response);
          this.mensaje = 'Actividad creada exitosamente';
          this.mostrarMensaje();
          this.cerrarModal();
          this.consultarActividades();
        },
        error: (error: any) => {
          console.error('Error completo:', error);
          this.mensaje = 'Error al crear la actividad: ' + (error.error?.error || error.message);
          this.mostrarMensaje();
        }
      });
    }
  }

  eliminarActividad(actividad: any): void {
    if (!confirm(`¿Está seguro de eliminar la actividad "${actividad.nombreActividad}"? Esta acción eliminará también todas las notas asociadas.`)) {
      return;
    }

    this.actividadesService.eliminarActividad(actividad.idActividad).subscribe({
      next: (response: any) => {
        this.mensaje = 'Actividad eliminada exitosamente';
        this.mostrarMensaje();
        this.consultarActividades();
      },
      error: (error: any) => {
        console.error('Error al eliminar:', error);
        this.mensaje = 'Error al eliminar la actividad';
        this.mostrarMensaje();
      }
    });
  }

  irAsignarNotas(actividad: any): void {
    this.router.navigate(['/asignar-notas', actividad.idActividad]);
  }

  limpiarConsulta(): void {
    this.bloqueSeleccionado = null;
    this.trimestreSeleccionado = 1;
    this.actividades = [];
    this.datosBloque = null;
  }

  limpiarFormulario(): void {
    this.nombreActividad = '';
    this.ponderacion = 0;
    this.fechaActividad = '';
    this.actividadEditando = null;
    this.isEditing = false;
  }

  private mostrarMensaje(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    }, 100);
  }

  calcularTotalPonderacion(): number {
    if (this.actividades.length === 0) return 0;
    return this.actividades.reduce((sum, act) => sum + (act.ponderacion || 0), 0);
  }

  getPonderacionRestante(): number {
    return Math.max(0, 100 - this.calcularTotalPonderacion());
  }

  //Verificar si el botón debe estar deshabilitado
  puedeAgregarActividad(): boolean {
    if (!this.bloqueSeleccionado || !this.trimestreSeleccionado) {
      return false;
    }
    return this.calcularTotalPonderacion() < 100;
  }
}