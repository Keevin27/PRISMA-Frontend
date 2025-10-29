// Ubicación: src/app/Notas/components/asignar-notas/asignar-notas.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ActividadesService } from '../../services/actividades.service';

@Component({
  selector: 'app-asignar-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './asignar-notas.component.html',
  styleUrl: './asignar-notas.component.css'
})
export class AsignarNotasComponent implements OnInit {
  idActividad: number = 0;
  datosActividad: any = null;
  alumnos: any[] = [];
  mensaje: string = '';
  cargando: boolean = false;
  guardando: boolean = false;

  // Para edición de notas
  alumnoEditando: any = null;
  notaTemporal: number = 0;

  constructor(
    private actividadesService: ActividadesService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.idActividad = +this.route.snapshot.params['idActividad'] || 0;
    
    if (this.idActividad > 0) {
      this.cargarAlumnosParaNotas();
    } else {
      this.mensaje = 'ID de actividad no válido';
      this.mostrarMensaje();
      this.volver();
    }
  }

  cargarAlumnosParaNotas(): void {
    this.cargando = true;
    this.actividadesService.obtenerAlumnosParaNotas(this.idActividad).subscribe({
      next: (data: any) => {
        this.datosActividad = {
          nombreActividad: data.nombreActividad,
          ponderacion: data.ponderacion
        };
        this.alumnos = data.alumnos;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar alumnos:', error);
        this.mensaje = 'Error al cargar los datos de la actividad';
        this.mostrarMensaje();
        this.cargando = false;
      }
    });
  }

  iniciarEdicion(alumno: any): void {
    this.alumnoEditando = alumno;
    this.notaTemporal = alumno.nota || 0;
  }

  cancelarEdicion(): void {
    this.alumnoEditando = null;
    this.notaTemporal = 0;
  }

  guardarNota(alumno: any): void {
    // Validar nota
    if (this.notaTemporal < 0 || this.notaTemporal > 10) {
      this.mensaje = 'La nota debe estar entre 0 y 10';
      this.mostrarMensaje();
      return;
    }

    this.guardando = true;

    const notaData = {
      idActividad: this.idActividad,
      nie: alumno.nie,
      nota: this.notaTemporal
    };

    this.actividadesService.asignarNota(notaData).subscribe({
      next: (response: any) => {
        this.mensaje = 'Nota asignada exitosamente';
        this.mostrarMensaje();
        
        // Actualizar la nota en la lista
        alumno.nota = this.notaTemporal;
        alumno.fechaModificacion = new Date().toISOString().split('T')[0];
        
        this.cancelarEdicion();
        this.guardando = false;
        
        // Recargar datos
        this.cargarAlumnosParaNotas();
      },
      error: (error: any) => {
        console.error('Error al asignar nota:', error);
        this.mensaje = 'Error al asignar la nota';
        this.mostrarMensaje();
        this.guardando = false;
      }
    });
  }

  eliminarNota(alumno: any): void {
    if (!alumno.idNotaActividad) {
      this.mensaje = 'No hay nota para eliminar';
      this.mostrarMensaje();
      return;
    }

    if (!confirm(`¿Está seguro de eliminar la nota de ${alumno.nombreCompleto}?`)) {
      return;
    }

    this.guardando = true;

    this.actividadesService.eliminarNota(alumno.idNotaActividad).subscribe({
      next: (response: any) => {
        this.mensaje = 'Nota eliminada exitosamente';
        this.mostrarMensaje();
        
        // Actualizar la lista
        alumno.nota = null;
        alumno.fechaModificacion = null;
        alumno.idNotaActividad = null;
        
        this.guardando = false;
        
        // Recargar datos
        this.cargarAlumnosParaNotas();
      },
      error: (error: any) => {
        console.error('Error al eliminar nota:', error);
        this.mensaje = 'Error al eliminar la nota';
        this.mostrarMensaje();
        this.guardando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/gestion-actividades']);
  }

  private mostrarMensaje(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    }, 100);
  }

  // Validación en tiempo real del input de nota
  validarNotaInput(event: any): void {
    let valor = event.target.value;
    
    // Permitir solo números y punto decimal
    valor = valor.replace(/[^0-9.]/g, '');
    
    // Permitir solo un punto decimal
    const partes = valor.split('.');
    if (partes.length > 2) {
      valor = partes[0] + '.' + partes.slice(1).join('');
    }
    
    // Limitar a dos decimales
    if (partes.length === 2 && partes[1].length > 2) {
      valor = partes[0] + '.' + partes[1].substring(0, 2);
    }
    
    // Limitar el valor entre 0 y 10
    const num = parseFloat(valor);
    if (!isNaN(num)) {
      if (num > 10) {
        valor = '10';
      } else if (num < 0) {
        valor = '0';
      }
    }
    
    this.notaTemporal = parseFloat(valor) || 0;
    event.target.value = valor;
  }

  calcularEstadisticas(): any {
    const notasValidas = this.alumnos
      .filter(a => a.nota !== null && a.nota !== undefined)
      .map(a => a.nota);
    
    if (notasValidas.length === 0) {
      return {
        total: this.alumnos.length,
        conNota: 0,
        sinNota: this.alumnos.length,
        promedio: 0,
        aprobados: 0,
        reprobados: 0
      };
    }

    const suma = notasValidas.reduce((acc, nota) => acc + nota, 0);
    const promedio = suma / notasValidas.length;
    const aprobados = notasValidas.filter(n => n >= 6).length;
    const reprobados = notasValidas.filter(n => n < 6).length;

    return {
      total: this.alumnos.length,
      conNota: notasValidas.length,
      sinNota: this.alumnos.length - notasValidas.length,
      promedio: Math.round(promedio * 100) / 100,
      aprobados: aprobados,
      reprobados: reprobados
    };
  }
}