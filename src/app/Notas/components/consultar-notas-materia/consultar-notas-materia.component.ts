import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { NotasService } from '../../services/notas.service';
import { BloqueService } from '../../../Services/bloque.service';

@Component({
  selector: 'app-consultar-notas-materia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './consultar-notas-materia.component.html',
  styleUrl: './consultar-notas-materia.component.css'
})
export class ConsultarNotasMateriaComponent implements OnInit {
  bloques: any[] = [];
  bloquesDisponibles: any[] = [];
  trimestreSeleccionado: number = 1;
  bloqueSeleccionado: any = null;
  
  datosNotas: any = null;
  mensaje: string = '';
  cargando: boolean = false;

  trimestres = [
    { value: 1, label: 'Primer Trimestre' },
    { value: 2, label: 'Segundo Trimestre' },
    { value: 3, label: 'Tercer Trimestre' }
  ];

  constructor(
    private notasService: NotasService,
    private bloqueService: BloqueService
  ) { }

  ngOnInit(): void {
    this.cargarBloques();
  }

  cargarBloques(): void {
    // Cargar todos los bloques (materias asignadas)
    this.bloqueService.obtenerTodosBloques().subscribe({
      next: (data: any[]) => {
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