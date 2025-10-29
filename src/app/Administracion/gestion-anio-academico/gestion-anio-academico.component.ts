import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnioAcademicoService } from '../../Services/anio-academico.service';
import { GradoService } from '../../Services/grado.service';
import { AnioAcademico } from '../../Models/anio-academico';

@Component({
  selector: 'app-gestion-anio-academico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-anio-academico.component.html',
  styleUrls: ['./gestion-anio-academico.component.css']
})
export class GestionAnioAcademicoComponent implements OnInit {
  aniosAcademicos: AnioAcademico[] = [];
  aniosConOferta: Set<number> = new Set(); // IDs de años que tienen oferta
  nuevoAnio: number = new Date().getFullYear();
  
  // Para el modal de crear año
  mostrarModalCrearAnio: boolean = false;

  // Para el modal de crear oferta
  mostrarModalOferta: boolean = false;
  anioSeleccionado: AnioAcademico | null = null;
  turnoSeleccionado: string = 'Matutino';

  // Para el modal de editar
  mostrarModalEditar: boolean = false;
  estadoEditar: boolean = false;
  matriculaEditar: boolean = false;

  // Para mostrar grados en modal
  mostrarModalGrados: boolean = false;
  gradosMostrar: any[] = [];
  anioMostrar: number = 0;
  anioSeleccionadoGrados: AnioAcademico | null = null;

  // Para agregar grados adicionales
  mostrarModalAgregarGrado: boolean = false;
  gradosAgregar = [
    { nombre: 'Primero', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Segundo', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Tercero', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Cuarto', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Quinto', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Sexto', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Séptimo', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Octavo', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Noveno', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] }
  ];

  // Grados de 1° a 9° con secciones A-F
  grados = [
    { nombre: 'Primero', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Segundo', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Tercero', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Cuarto', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Quinto', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Sexto', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Séptimo', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Octavo', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] },
    { nombre: 'Noveno', secciones: ['A', 'B', 'C', 'D', 'E', 'F'], seleccionadas: [] as string[] }
  ];

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
        
        // Verificar cuáles años tienen oferta creada
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

  // Método para finalizar año
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
    this.grados.forEach(g => g.seleccionadas = []);
    this.mostrarModalOferta = true;
  }

  cerrarModalOferta(): void {
    this.mostrarModalOferta = false;
    this.anioSeleccionado = null;
  }

  toggleSeccion(grado: any, seccion: string): void {
    const index = grado.seleccionadas.indexOf(seccion);
    if (index > -1) {
      grado.seleccionadas.splice(index, 1);
    } else {
      grado.seleccionadas.push(seccion);
    }
  }

  seleccionarTodasSecciones(grado: any): void {
    if (grado.seleccionadas.length === grado.secciones.length) {
      grado.seleccionadas = [];
    } else {
      grado.seleccionadas = [...grado.secciones];
    }
  }

  // Método auxiliar para determinar el turno según la sección
  obtenerTurnoPorSeccion(seccion: string): string {
    const seccionesMatutinas = ['A', 'B', 'C'];
    return seccionesMatutinas.includes(seccion) ? 'Matutino' : 'Vespertino';
  }

  guardarOferta(): void {
    if (!this.anioSeleccionado) return;

    const gradosConSecciones = this.grados
      .filter(g => g.seleccionadas.length > 0)
      .map(g => ({
        nombre: g.nombre,
        secciones: g.seleccionadas
      }));

    if (gradosConSecciones.length === 0) {
      alert('Advertencia: Debe seleccionar al menos una sección');
      return;
    }

    // Crear oferta con turnos automáticos por sección
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
        // Recargar la lista de grados
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
    this.gradosAgregar.forEach(g => g.seleccionadas = []);
    this.mostrarModalAgregarGrado = true;
  }

  // Verificar si una combinación grado-sección ya existe
  seccionYaExiste(nombreGrado: string, seccion: string): boolean {
    return this.gradosMostrar.some(g => 
      g.nombre_grado === nombreGrado && g.seccion === seccion
    );
  }

  // Método para verificar si todas las secciones de un grado ya existen
  todasSeccionesExisten(nombreGrado: string): boolean {
    const grado = this.gradosAgregar.find(g => g.nombre === nombreGrado);
    if (!grado) return false;
    
    return grado.secciones.every(seccion => this.seccionYaExiste(nombreGrado, seccion));
  }

  cerrarModalAgregarGrado(): void {
    this.mostrarModalAgregarGrado = false;
  }

  toggleSeccionAgregar(grado: any, seccion: string): void {
    const index = grado.seleccionadas.indexOf(seccion);
    if (index > -1) {
      grado.seleccionadas.splice(index, 1);
    } else {
      grado.seleccionadas.push(seccion);
    }
  }

  seleccionarTodasSeccionesAgregar(grado: any): void {
    if (grado.seleccionadas.length === grado.secciones.length) {
      grado.seleccionadas = [];
    } else {
      grado.seleccionadas = [...grado.secciones];
    }
  }

  guardarGradosAdicionales(): void {
    if (!this.anioSeleccionadoGrados) return;

    const gradosConSecciones = this.gradosAgregar
      .filter(g => g.seleccionadas.length > 0)
      .map(g => ({
        nombre: g.nombre,
        secciones: g.seleccionadas
      }));

    if (gradosConSecciones.length === 0) {
      alert('Advertencia: Debe seleccionar al menos una sección');
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
        // Recargar la lista de grados
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