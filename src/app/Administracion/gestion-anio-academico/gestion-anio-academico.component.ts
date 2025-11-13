import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnioAcademicoService } from '../../Services/anio-academico.service';
import { GradoService } from '../../Services/grado.service';
import { AnioAcademico } from '../../Models/anio-academico';

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

  cargarAniosAcademicos(): void {
    this.anioAcademicoService.obtenerAniosAcademicos().subscribe({
      next: (data) => {
        this.aniosAcademicos = data.sort((a, b) => b.anio - a.anio);
        this.aniosAcademicos.forEach(anio => {
          this.verificarOferta(anio);
        });
      },
      error: (error) => {
        console.error('Error al cargar años académicos:', error);
        alert('Error: No se pudieron cargar los años académicos');
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
    this.nuevoAnio = new Date().getFullYear();
    this.mostrarModalCrearAnio = true;
  }

  cerrarModalCrearAnio(): void {
    this.mostrarModalCrearAnio = false;
  }

  crearAnio(): void {
    if (!this.nuevoAnio || this.nuevoAnio < 2000 || this.nuevoAnio > 2100) {
      alert('Error: Por favor ingrese un año válido');
      return;
    }

    this.anioAcademicoService.crearAnioAcademico(this.nuevoAnio).subscribe({
      next: (data) => {
        alert(`Éxito: Año ${this.nuevoAnio} creado correctamente`);
        this.cargarAniosAcademicos();
        this.cerrarModalCrearAnio();
      },
      error: (error) => {
        console.error('Error al crear año:', error);
        if (error.status === 409) {
          alert(`Error: El año ${this.nuevoAnio} ya existe`);
        } else {
          alert('Error: No se pudo crear el año académico');
        }
      }
    });
  }

  // Métodos para el modal de editar
  abrirModalEditar(anio: AnioAcademico): void {
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

    const actualizacion = {
      anio_activo: this.estadoEditar,
      anio_cerrado: !this.matriculaEditar
    };

    this.anioAcademicoService.actualizarEstado(this.anioSeleccionado.id_anio_academico, actualizacion).subscribe({
      next: (data) => {
        this.anioSeleccionado!.anio_activo = data.anio_activo;
        this.anioSeleccionado!.anio_cerrado = data.anio_cerrado;
        alert('Éxito: Cambios guardados correctamente');
        this.cerrarModalEditar();
        this.cargarAniosAcademicos();
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        alert('Error: No se pudieron guardar los cambios');
      }
    });
  }

  finalizarAnio(anio: AnioAcademico): void {
    const confirmacion = confirm(`¿Está seguro de finalizar el año ${anio.anio}? Esta acción cerrará el año y desactivará la matrícula.`);
    
    if (!confirmacion) return;

    const finalizacion = {
      anio_activo: false,
      anio_cerrado: true
    };

    this.anioAcademicoService.actualizarEstado(anio.id_anio_academico, finalizacion).subscribe({
      next: (data) => {
        anio.anio_activo = false;
        anio.anio_cerrado = true;
        alert(`Éxito: El año ${anio.anio} ha sido finalizado`);
        this.cargarAniosAcademicos();
      },
      error: (error) => {
        console.error('Error al finalizar año:', error);
        alert('Error: No se pudo finalizar el año');
      }
    });
  }

  abrirModalOferta(anio: AnioAcademico): void {
    this.anioSeleccionado = anio;
    this.resetearGrados();
    this.mostrarModalOferta = true;
  }

  cerrarModalOferta(): void {
    this.mostrarModalOferta = false;
    this.anioSeleccionado = null;
  }

  // Resetear todos los grados (deseleccionar todo)
  resetearGrados(): void {
    this.grados.forEach(grado => {
      grado.secciones.forEach(seccion => {
        seccion.seleccionada = false;
        // Restaurar turnos por defecto
        seccion.turno = ['A', 'B', 'C'].includes(seccion.letra) ? 'Matutino' : 'Vespertino';
      });
    });
  }

  // Toggle de selección de sección
  toggleSeccion(grado: Grado, seccion: Seccion): void {
    seccion.seleccionada = !seccion.seleccionada;
  }

  // Seleccionar/Deseleccionar todas las secciones de un grado
  seleccionarTodasSecciones(grado: Grado): void {
    const todasSeleccionadas = grado.secciones.every(s => s.seleccionada);
    grado.secciones.forEach(seccion => {
      seccion.seleccionada = !todasSeleccionadas;
    });
  }

  // Verificar si todas las secciones están seleccionadas
  todasSeccionesSeleccionadas(grado: Grado): boolean {
    return grado.secciones.every(s => s.seleccionada);
  }

  guardarOferta(): void {
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
      alert('Advertencia: Debe seleccionar al menos una sección');
      return;
    }

    const oferta = {
      idAnioAcademico: this.anioSeleccionado.id_anio_academico,
      grados: gradosConSecciones
    };

    this.gradoService.crearOferta(oferta).subscribe({
      next: (data) => {
        alert(`Éxito: Oferta creada con ${data.length} grados`);
        this.cerrarModalOferta();
        this.cargarAniosAcademicos();
      },
      error: (error) => {
        console.error('Error al crear oferta:', error);
        alert('Error: No se pudo crear la oferta');
      }
    });
  }

  verGrados(anio: AnioAcademico): void {
    this.anioSeleccionadoGrados = anio;
    this.gradoService.obtenerGradosPorAnyo(anio.anio).subscribe({
      next: (grados) => {
        if (grados.length === 0) {
          alert('Información: No hay grados registrados para este año');
          return;
        }
        this.gradosMostrar = grados;
        this.anioMostrar = anio.anio;
        this.mostrarModalGrados = true;
      },
      error: (error) => {
        console.error('Error al cargar grados:', error);
        alert('Error: No se pudieron cargar los grados');
      }
    });
  }

  cerrarModalGrados(): void {
    this.mostrarModalGrados = false;
    this.gradosMostrar = [];
    this.anioSeleccionadoGrados = null;
  }

  eliminarGrado(grado: any): void {
    const confirmacion = confirm(`¿Está seguro de eliminar el grado ${grado.nombre_grado} sección ${grado.seccion}?`);
    
    if (!confirmacion) return;

    this.gradoService.eliminarGrado(grado.id_grado).subscribe({
      next: () => {
        alert('Éxito: Grado eliminado correctamente');
        if (this.anioSeleccionadoGrados) {
          this.verGrados(this.anioSeleccionadoGrados);
        }
      },
      error: (error) => {
        console.error('Error al eliminar grado:', error);
        alert('Error: No se pudo eliminar el grado');
      }
    });
  }

  // Métodos para agregar grados adicionales
  abrirModalAgregarGrado(): void {
  // Crear copia profunda y resetear selecciones
  this.gradosAgregar = JSON.parse(JSON.stringify(this.grados));
  
  // Deseleccionar TODAS las secciones al abrir el modal
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
  // Solo permitir toggle si la sección NO existe
  if (!this.seccionYaExiste(grado.nombre, seccion.letra)) {
    seccion.seleccionada = !seccion.seleccionada;
  } else {
    // Si ya existe, forzar a false
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
      alert('Advertencia: Debe seleccionar al menos una sección nueva');
      return;
    }

    const oferta = {
      idAnioAcademico: this.anioSeleccionadoGrados.id_anio_academico,
      grados: gradosConSecciones
    };

    this.gradoService.crearOferta(oferta).subscribe({
      next: (data) => {
        alert(`Éxito: ${data.length} grados agregados correctamente`);
        this.cerrarModalAgregarGrado();
        if (this.anioSeleccionadoGrados) {
          this.verGrados(this.anioSeleccionadoGrados);
        }
      },
      error: (error) => {
        console.error('Error al agregar grados:', error);
        alert('Error: No se pudieron agregar los grados');
      }
    });
  }
}