import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnioAcademicoService } from '../../Services/anio-academico.service';
import { GradoService } from '../../Services/grado.service';
import { AnioAcademico } from '../../Models/anio-academico';
import Swal from 'sweetalert2'; 

interface Seccion {
  letra: string;
  seleccionada: boolean;
  turno: string;
}

interface Grado {
  nombre: string;
  secciones: Seccion[];
}

@Component({
  selector: 'app-gestion-anio-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-anio-academico.component.html',
  styleUrls: ['./gestion-anio-academico.component.css']
})
export class GestionAnioAcademicoComponent implements OnInit {
  aniosAcademicos: AnioAcademico[] = [];
  aniosConOferta: Set<number> = new Set();
  nuevoAnio: number = new Date().getFullYear();
  
  mostrarModalCrearAnio: boolean = false;
  mostrarModalOferta: boolean = false;
  anioSeleccionado: AnioAcademico | null = null;
  mostrarModalEditar: boolean = false;
  estadoEditar: boolean = false;
  matriculaEditar: boolean = false;
  mostrarModalGrados: boolean = false;
  gradosMostrar: any[] = [];
  anioMostrar: number = 0;
  anioSeleccionadoGrados: AnioAcademico | null = null;
  mostrarModalAgregarGrado: boolean = false;

  // =====================================================
  // === SECCIÓN DE ALERTAS EN BANNER ===
  // =====================================================
  mensajeExito: string | null = null;
  mensajeError: string | null = null;
  mensajeAdvertencia: string | null = null;
  private private_alertTimer: any = null;
  // =====================================================

  // =====================================================
  // === VARIABLE PARA ERROR EN MODAL ===
  // =====================================================
  mensajeErrorModal: string | null = null;
  // =====================================================

  // Estructura de grados con turnos por defecto
  grados: Grado[] = [
    { 
      nombre: 'Primero', 
      secciones: [
        { letra: 'A', seleccionada: false, turno: 'Matutino' },
        { letra: 'B', seleccionada: false, turno: 'Matutino' },
        { letra: 'C', seleccionada: false, turno: 'Matutino' },
        { letra: 'D', seleccionada: false, turno: 'Vespertino' },
        { letra: 'E', seleccionada: false, turno: 'Vespertino' },
        { letra: 'F', seleccionada: false, turno: 'Vespertino' }
      ]
    },
    { 
      nombre: 'Segundo', 
      secciones: [
        { letra: 'A', seleccionada: false, turno: 'Matutino' },
        { letra: 'B', seleccionada: false, turno: 'Matutino' },
        { letra: 'C', seleccionada: false, turno: 'Matutino' },
        { letra: 'D', seleccionada: false, turno: 'Vespertino' },
        { letra: 'E', seleccionada: false, turno: 'Vespertino' },
        { letra: 'F', seleccionada: false, turno: 'Vespertino' }
      ]
    },
    { 
      nombre: 'Tercero', 
      secciones: [
        { letra: 'A', seleccionada: false, turno: 'Matutino' },
        { letra: 'B', seleccionada: false, turno: 'Matutino' },
        { letra: 'C', seleccionada: false, turno: 'Matutino' },
        { letra: 'D', seleccionada: false, turno: 'Vespertino' },
        { letra: 'E', seleccionada: false, turno: 'Vespertino' },
        { letra: 'F', seleccionada: false, turno: 'Vespertino' }
      ]
    },
    { 
      nombre: 'Cuarto', 
      secciones: [
        { letra: 'A', seleccionada: false, turno: 'Matutino' },
        { letra: 'B', seleccionada: false, turno: 'Matutino' },
        { letra: 'C', seleccionada: false, turno: 'Matutino' },
        { letra: 'D', seleccionada: false, turno: 'Vespertino' },
        { letra: 'E', seleccionada: false, turno: 'Vespertino' },
        { letra: 'F', seleccionada: false, turno: 'Vespertino' }
      ]
    },
    { 
      nombre: 'Quinto', 
      secciones: [
        { letra: 'A', seleccionada: false, turno: 'Matutino' },
        { letra: 'B', seleccionada: false, turno: 'Matutino' },
        { letra: 'C', seleccionada: false, turno: 'Matutino' },
        { letra: 'D', seleccionada: false, turno: 'Vespertino' },
        { letra: 'E', seleccionada: false, turno: 'Vespertino' },
        { letra: 'F', seleccionada: false, turno: 'Vespertino' }
      ]
    },
    { 
      nombre: 'Sexto', 
      secciones: [
        { letra: 'A', seleccionada: false, turno: 'Matutino' },
        { letra: 'B', seleccionada: false, turno: 'Matutino' },
        { letra: 'C', seleccionada: false, turno: 'Matutino' },
        { letra: 'D', seleccionada: false, turno: 'Vespertino' },
        { letra: 'E', seleccionada: false, turno: 'Vespertino' },
        { letra: 'F', seleccionada: false, turno: 'Vespertino' }
      ]
    },
    { 
      nombre: 'Séptimo', 
      secciones: [
        { letra: 'A', seleccionada: false, turno: 'Matutino' },
        { letra: 'B', seleccionada: false, turno: 'Matutino' },
        { letra: 'C', seleccionada: false, turno: 'Matutino' },
        { letra: 'D', seleccionada: false, turno: 'Vespertino' },
        { letra: 'E', seleccionada: false, turno: 'Vespertino' },
        { letra: 'F', seleccionada: false, turno: 'Vespertino' }
      ]
    },
    { 
      nombre: 'Octavo', 
      secciones: [
        { letra: 'A', seleccionada: false, turno: 'Matutino' },
        { letra: 'B', seleccionada: false, turno: 'Matutino' },
        { letra: 'C', seleccionada: false, turno: 'Matutino' },
        { letra: 'D', seleccionada: false, turno: 'Vespertino' },
        { letra: 'E', seleccionada: false, turno: 'Vespertino' },
        { letra: 'F', seleccionada: false, turno: 'Vespertino' }
      ]
    },
    { 
      nombre: 'Noveno', 
      secciones: [
        { letra: 'A', seleccionada: false, turno: 'Matutino' },
        { letra: 'B', seleccionada: false, turno: 'Matutino' },
        { letra: 'C', seleccionada: false, turno: 'Matutino' },
        { letra: 'D', seleccionada: false, turno: 'Vespertino' },
        { letra: 'E', seleccionada: false, turno: 'Vespertino' },
        { letra: 'F', seleccionada: false, turno: 'Vespertino' }
      ]
    }
  ];

  // Para agregar grados adicionales
  gradosAgregar: Grado[] = JSON.parse(JSON.stringify(this.grados)); // Copia profunda

  constructor(
    private anioAcademicoService: AnioAcademicoService,
    private gradoService: GradoService
  ) { }

  ngOnInit(): void {
    this.cargarAniosAcademicos();
  }

  // ==================== GESTIÓN DE ALERTAS ====================
  limpiarMensajes(): void {
    this.mensajeExito = null;
    this.mensajeError = null;
    this.mensajeAdvertencia = null;
    if (this.private_alertTimer) {
      clearTimeout(this.private_alertTimer);
    }
    // También limpiamos el error del modal por si acaso
    this.mensajeErrorModal = null; 
  }

  mostrarMensaje(tipo: 'exito' | 'error' | 'advertencia', mensaje: string, duracion: number = 5000): void {
    this.limpiarMensajes();

    if (tipo === 'exito') this.mensajeExito = mensaje;
    if (tipo === 'error') this.mensajeError = mensaje;
    if (tipo === 'advertencia') this.mensajeAdvertencia = mensaje;

    // Timer para ocultar el mensaje automáticamente
    this.private_alertTimer = setTimeout(() => {
      this.limpiarMensajes();
    }, duracion);
  }
  // ========================================================

  cargarAniosAcademicos(): void {
    this.limpiarMensajes(); // Limpia mensajes al cargar
    this.anioAcademicoService.obtenerAniosAcademicos().subscribe({
      next: (data) => {
        this.aniosAcademicos = data.sort((a, b) => b.anio - a.anio);
        this.aniosAcademicos.forEach(anio => {
          this.verificarOferta(anio);
        });
      },
      error: (error) => {
        console.error('Error al cargar años académicos:', error);
        this.mostrarMensaje('error', 'No se pudieron cargar los años académicos');
      }
    });
  }

  verificarOferta(anio: AnioAcademico): void {
    this.gradoService.obtenerGradosPorAnyo(anio.anio).subscribe({
      next: (grados) => {
        if (grados.length > 0) {
          this.aniosConOferta.add(anio.id_anio_academico);
        }
      },
      error: (error) => {
        console.error('Error al verificar oferta:', error);
      }
    });
  }

  tieneOferta(anio: AnioAcademico): boolean {
    return this.aniosConOferta.has(anio.id_anio_academico);
  }

  // Métodos para el modal de crear año
  abrirModalCrearAnio(): void {
    this.limpiarMensajes();
    this.nuevoAnio = new Date().getFullYear();
    this.mostrarModalCrearAnio = true;
    this.mensajeErrorModal = null; // Limpiamos al abrir
  }

  cerrarModalCrearAnio(): void {
    this.mostrarModalCrearAnio = false;
    this.mensajeErrorModal = null; // Limpiamos al cerrar
  }

  crearAnio(): void {
    this.limpiarMensajes(); // Limpia el banner principal
    this.mensajeErrorModal = null; // Limpia el error del modal

    if (!this.nuevoAnio || this.nuevoAnio < 2000 || this.nuevoAnio > 2100) {
      // CAMBIO: Mostrar error DENTRO del modal
      this.mensajeErrorModal = 'Por favor ingrese un año válido (Ej: 2025)';
      return;
    }

    this.anioAcademicoService.crearAnioAcademico(this.nuevoAnio).subscribe({
      next: (data) => {
        // Esto está bien: cerramos modal y mostramos banner
        this.mostrarMensaje('exito', `Año ${this.nuevoAnio} creado correctamente`);
        this.cargarAniosAcademicos();
        this.cerrarModalCrearAnio();
      },
      error: (error) => {
        console.error('Error al crear año:', error);
        
        // CAMBIO: Mostrar error DENTRO del modal
        if (error.status === 409) {
          this.mensajeErrorModal = `Error: El año ${this.nuevoAnio} ya existe`;
        } else {
          this.mensajeErrorModal = 'No se pudo crear el año académico';
        }
        // Ya NO llamamos a this.mostrarMensaje('error', ...)
      }
    });
  }

  // Métodos para el modal de editar
  abrirModalEditar(anio: AnioAcademico): void {
    this.limpiarMensajes();
    this.anioSeleccionado = anio;
    this.estadoEditar = anio.anio_activo;
    this.matriculaEditar = !anio.anio_cerrado;
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.anioSeleccionado = null;
  }

  guardarEdicion(): void {
    if (!this.anioSeleccionado) return;
    this.limpiarMensajes();

    const actualizacion = {
      anio_activo: this.estadoEditar,
      anio_cerrado: !this.matriculaEditar
    };

    this.anioAcademicoService.actualizarEstado(this.anioSeleccionado.id_anio_academico, actualizacion).subscribe({
      next: (data) => {
        this.anioSeleccionado!.anio_activo = data.anio_activo;
        this.anioSeleccionado!.anio_cerrado = data.anio_cerrado;
        this.mostrarMensaje('exito', 'Cambios guardados correctamente');
        this.cerrarModalEditar();
        this.cargarAniosAcademicos();
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.mostrarMensaje('error', 'No se pudieron guardar los cambios');
      }
    });
  }

  finalizarAnio(anio: AnioAcademico): void {
    this.limpiarMensajes();
    
    Swal.fire({
      title: `¿Finalizar el año ${anio.anio}?`,
      text: "Esta acción cerrará el año y desactivará la matrícula. No se puede revertir.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545', // Rojo (Peligro)
      cancelButtonColor: '#6c757d',  // Gris (Secundario)
      confirmButtonText: 'Sí, finalizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const finalizacion = {
          anio_activo: false,
          anio_cerrado: true
        };
    
        this.anioAcademicoService.actualizarEstado(anio.id_anio_academico, finalizacion).subscribe({
          next: (data) => {
            anio.anio_activo = false;
            anio.anio_cerrado = true;
            this.mostrarMensaje('exito', `El año ${anio.anio} ha sido finalizado`);
            this.cargarAniosAcademicos();
          },
          error: (error) => {
            console.error('Error al finalizar año:', error);
            this.mostrarMensaje('error', 'No se pudo finalizar el año');
          }
        });
      }
    });
  }

  abrirModalOferta(anio: AnioAcademico): void {
    this.limpiarMensajes();
    this.anioSeleccionado = anio;
    this.resetearGrados();
    this.mostrarModalOferta = true;
  }

  cerrarModalOferta(): void {
    this.mostrarModalOferta = false;
    this.anioSeleccionado = null;
  }

  resetearGrados(): void {
    this.grados.forEach(grado => {
      grado.secciones.forEach(seccion => {
        seccion.seleccionada = false;
        seccion.turno = ['A', 'B', 'C'].includes(seccion.letra) ? 'Matutino' : 'Vespertino';
      });
    });
  }

  toggleSeccion(grado: Grado, seccion: Seccion): void {
    seccion.seleccionada = !seccion.seleccionada;
  }

  seleccionarTodasSecciones(grado: Grado): void {
    const todasSeleccionadas = grado.secciones.every(s => s.seleccionada);
    grado.secciones.forEach(seccion => {
      seccion.seleccionada = !todasSeleccionadas;
    });
  }

  todasSeccionesSeleccionadas(grado: Grado): boolean {
    return grado.secciones.every(s => s.seleccionada);
  }

  guardarOferta(): void {
    this.limpiarMensajes();
    if (!this.anioSeleccionado) return;

    const gradosConSecciones: any[] = [];
    this.grados.forEach(grado => {
      const seccionesSeleccionadas = grado.secciones.filter(s => s.seleccionada);
      if (seccionesSeleccionadas.length > 0) {
        seccionesSeleccionadas.forEach(seccion => {
          gradosConSecciones.push({
            nombre: grado.nombre,
            seccion: seccion.letra,
            turno: seccion.turno
          });
        });
      }
    });

    if (gradosConSecciones.length === 0) {
      this.mostrarMensaje('advertencia', 'Debe seleccionar al menos una sección');
      return;
    }

    // AÑADIMOS LA CONFIRMACIÓN CON SWAL
    Swal.fire({
      title: '¿Confirmar Creación?',
      text: `Se crearán ${gradosConSecciones.length} nuevos grados/secciones.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754', // Verde (Éxito)
      cancelButtonColor: '#6c757d',  // Gris
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const oferta = {
          idAnioAcademico: this.anioSeleccionado!.id_anio_academico,
          grados: gradosConSecciones
        };
    
        this.gradoService.crearOferta(oferta).subscribe({
          next: (data) => {
            this.mostrarMensaje('exito', `Oferta creada con ${data.length} grados`);
            this.cerrarModalOferta();
            this.cargarAniosAcademicos();
          },
          error: (error) => {
            console.error('Error al crear oferta:', error);
            this.mostrarMensaje('error', 'No se pudo crear la oferta');
          }
        });
      }
    });
  }

  verGrados(anio: AnioAcademico): void {
    this.limpiarMensajes();
    this.anioSeleccionadoGrados = anio;
    this.gradoService.obtenerGradosPorAnyo(anio.anio).subscribe({
      next: (grados) => {
        if (grados.length === 0) {
          this.mostrarMensaje('advertencia', 'No hay grados registrados para este año', 3000); // 3 segundos
          return;
        }
        this.gradosMostrar = grados;
        this.anioMostrar = anio.anio;
        this.mostrarModalGrados = true;
      },
      error: (error) => {
        console.error('Error al cargar grados:', error);
        this.mostrarMensaje('error', 'No se pudieron cargar los grados');
      }
    });
  }

  cerrarModalGrados(): void {
    this.mostrarModalGrados = false;
    this.gradosMostrar = [];
    this.anioSeleccionadoGrados = null;
  }

  eliminarGrado(grado: any): void {
    this.limpiarMensajes();

    Swal.fire({
      title: '¿Eliminar Grado?',
      text: `¿Está seguro de eliminar ${grado.nombre_grado} sección ${grado.seccion}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545', // Rojo
      cancelButtonColor: '#6c757d',  // Gris
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.gradoService.eliminarGrado(grado.id_grado).subscribe({
          next: () => {
            this.mostrarMensaje('exito', 'Grado eliminado correctamente');
            if (this.anioSeleccionadoGrados) {
              // Recarga la lista de grados en el modal
              this.verGrados(this.anioSeleccionadoGrados);
            }
          },
          error: (error) => {
            console.error('Error al eliminar grado:', error);
            this.mostrarMensaje('error', 'No se pudo eliminar el grado. Verifique que no tenga alumnos matriculados.');
          }
        });
      }
    });
  }

  // Métodos para agregar grados adicionales
  abrirModalAgregarGrado(): void {
    this.limpiarMensajes();
    this.gradosAgregar = JSON.parse(JSON.stringify(this.grados));
    this.gradosAgregar.forEach(grado => {
      grado.secciones.forEach(seccion => {
        seccion.seleccionada = false;
      });
    });
    this.mostrarModalAgregarGrado = true;
  }

  resetearGradosAgregar(): void {
    this.gradosAgregar = JSON.parse(JSON.stringify(this.grados));
  }

  seccionYaExiste(nombreGrado: string, seccion: string): boolean {
    return this.gradosMostrar.some(g => 
      g.nombre_grado === nombreGrado && g.seccion === seccion
    );
  }

  todasSeccionesExisten(nombreGrado: string): boolean {
    const grado = this.gradosAgregar.find(g => g.nombre === nombreGrado);
    if (!grado) return false;
    return grado.secciones.every(seccion => this.seccionYaExiste(nombreGrado, seccion.letra));
  }

  cerrarModalAgregarGrado(): void {
    this.mostrarModalAgregarGrado = false;
  }

  toggleSeccionAgregar(grado: Grado, seccion: Seccion): void {
    if (!this.seccionYaExiste(grado.nombre, seccion.letra)) {
      seccion.seleccionada = !seccion.seleccionada;
    } else {
      seccion.seleccionada = false;
    }
  }

  seleccionarTodasSeccionesAgregar(grado: Grado): void {
    const todasSeleccionadas = grado.secciones
      .filter(s => !this.seccionYaExiste(grado.nombre, s.letra))
      .every(s => s.seleccionada);
    
    grado.secciones.forEach(seccion => {
      if (!this.seccionYaExiste(grado.nombre, seccion.letra)) {
        seccion.seleccionada = !todasSeleccionadas;
      }
    });
  }

  guardarGradosAdicionales(): void {
    this.limpiarMensajes();
    if (!this.anioSeleccionadoGrados) return;

    const gradosConSecciones: any[] = [];
    this.gradosAgregar.forEach(grado => {
      const seccionesSeleccionadas = grado.secciones.filter(s => 
        s.seleccionada && !this.seccionYaExiste(grado.nombre, s.letra)
      );
      if (seccionesSeleccionadas.length > 0) {
        seccionesSeleccionadas.forEach(seccion => {
          gradosConSecciones.push({
            nombre: grado.nombre,
            seccion: seccion.letra,
            turno: seccion.turno
          });
        });
      }
    });

    if (gradosConSecciones.length === 0) {
      this.mostrarMensaje('advertencia', 'Debe seleccionar al menos una sección nueva');
      return;
    }

    // ==========================================================
    // === CONFIRMACIÓN AGREGADA (LA QUE HABÍA QUITADO) ===
    // ==========================================================
    Swal.fire({
      title: '¿Confirmar Creación?',
      text: `Se agregarán ${gradosConSecciones.length} nuevos grados/secciones a este año académico.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#198754', // Verde (btn-success)
      cancelButtonColor: '#6c757d',  // Gris (btn-secondary)
      confirmButtonText: 'Sí, agregar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Si confirman, ejecutamos la lógica para guardar
        const oferta = {
          idAnioAcademico: this.anioSeleccionadoGrados!.id_anio_academico,
          grados: gradosConSecciones
        };
    
        this.gradoService.crearOferta(oferta).subscribe({
          next: (data) => {
            // Usamos el banner de éxito con tu texto
            this.mostrarMensaje('exito', `${data.length} grados agregados exitosamente`);
            this.cerrarModalAgregarGrado();
            if (this.anioSeleccionadoGrados) {
              this.verGrados(this.anioSeleccionadoGrados);
            }
          },
          error: (error) => {
            console.error('Error al agregar grados:', error);
            this.mostrarMensaje('error', 'No se pudieron agregar los grados');
          }
        });
      }
    });

  }
}