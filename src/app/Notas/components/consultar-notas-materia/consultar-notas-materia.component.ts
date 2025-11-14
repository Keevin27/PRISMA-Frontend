// Ubicación: src/app/Notas/components/consultar-notas-materia/consultar-notas-materia.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NotasService } from '../../services/notas.service';
import { BloqueService } from '../../../Services/bloque.service';
import { AuthService } from '../../../Auth/auth.service';
import { AnioAcademicoService } from '../../../Services/anio-academico.service'; 
import { SelectorAnioComponent } from '../selector-anio/selector-anio.component'; 

@Component({
  selector: 'app-consultar-notas-materia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule, SelectorAnioComponent],
  templateUrl: './consultar-notas-materia.component.html',
  styleUrl: './consultar-notas-materia.component.css'
})
export class ConsultarNotasMateriaComponent implements OnInit {
  bloques: any[] = [];
  bloquesDisponibles: any[] = [];
  bloqueSeleccionado: any = null;
  trimestreSeleccionado: number = 1;
  
  datosNotas: any = null;
  mensaje: string = '';
  cargando: boolean = false;

anioSeleccionado: number | null = null;  

  trimestres = [
    { value: 1, label: 'Primer Trimestre' },
    { value: 2, label: 'Segundo Trimestre' },
    { value: 3, label: 'Tercer Trimestre' }
  ];

  constructor(
    private notasService: NotasService,
    private bloqueService: BloqueService,
    private authService: AuthService,
    private anioService: AnioAcademicoService
  ) { }

  ngOnInit(): void {
    this.anioService.anioSeleccionado$.subscribe(anio => {
      if (anio) {
        this.anioSeleccionado = anio;
        this.cargarBloques();
      }
    });
  }

    cargarBloques(): void {
    if (!this.anioSeleccionado) {
      console.warn(' No hay año seleccionado');
      return;
    }

    const roles = this.authService.getUserRoles();
    const esDocente = roles.includes('ROLE_DOCENTE');
    
    console.log('Usuario logueado:', { roles, esDocente });
    
    if (esDocente) {
      console.log(' Cargando bloques del DOCENTE para año:', this.anioSeleccionado);
      this.bloqueService.obtenerMisBloquesDocente(this.anioSeleccionado).subscribe({
        next: (data: any[]) => {
          console.log(' Bloques del docente:', data);
          this.bloques = data;
          this.bloquesDisponibles = data;
          
          if (data.length === 0) {
            this.mensaje = 'No tiene materias asignadas para este año';
            this.mostrarMensaje();
          }
        },
        error: (error: any) => {
          console.error('Error al cargar bloques del docente:', error);
          this.mensaje = 'Error al cargar sus materias asignadas';
          this.mostrarMensaje();
        }
      });
    } 
    else {
      console.log(' Cargando TODOS los bloques (ADMIN) para año:', this.anioSeleccionado);
      this.bloqueService.obtenerTodosBloques(this.anioSeleccionado).subscribe({
        next: (data: any[]) => {
          console.log(' Todos los bloques:', data);
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

  consultarNotas(): void {
    if (!this.bloqueSeleccionado || !this.trimestreSeleccionado) {
      this.mensaje = 'Debe seleccionar una materia y un trimestre';
      this.mostrarMensaje();
      return;
    }

    this.cargando = true;
    this.notasService.consultarNotasPorMateria(this.bloqueSeleccionado, this.trimestreSeleccionado).subscribe({
      next: (data: any) => {
        this.datosNotas = data;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al consultar notas:', error);
        this.mensaje = 'Error al consultar las notas';
        this.mostrarMensaje();
        this.cargando = false;
      }
    });
  }

  limpiarConsulta(): void {
    this.bloqueSeleccionado = null;
    this.trimestreSeleccionado = 1;
    this.datosNotas = null;
  }

  private mostrarMensaje(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    }, 100);
  }

  calcularPromedio(notas: number[]): number {
    const notasValidas = notas.filter(n => n !== null && n !== undefined);
    if (notasValidas.length === 0) return 0;
    const suma = notasValidas.reduce((acc, nota) => acc + nota, 0);
    return Math.round((suma / notasValidas.length) * 100) / 100;
  }
}