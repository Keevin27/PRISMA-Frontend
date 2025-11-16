import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Semana } from '../../Models/semana';
import { Dia } from '../../Models/dia';
import { Grado } from '../../Models/grado';
import { Coordinacion } from '../../Models/coordinacion';
import { Menu } from '../../Models/menu';
import { DetalleMenu } from '../../Models/detalle-menu';
import { SemanaService } from '../../Services/semana.service';
import { DiaService } from '../../Services/dia.service';
import { MenuService } from '../../Services/menu.service';
import { DetalleMenuService } from '../../Services/detalle-menu.service';
import { GradoService } from '../../Services/grado.service';
import { CoordinacionService } from '../../Services/coordinacion.service';
import { AsistenciaAlumnoService } from '../../AsistenciaAlumno/asistencia-alumno.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-entrega-alimentos',
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './entrega-alimentos.component.html',
  styleUrl: './entrega-alimentos.component.css'
})
export class EntregaAlimentosComponent {

  semanas: Semana[] = [];
  dias: Dia[] = [];
  grados: Grado[] = [];
  coordinaciones: Coordinacion[] = [];

  fechaSeleccionada: string = '';

  semanaCalculada: Semana | null = null;
  diaCalculado: Dia | null = null;
  menuDelDia: Menu | null = null;
  detallesMenu: DetalleMenu[] = [];

  gradosConDatos: any[] = [];

  turnoSeleccionado: string = 'Matutino';

  mensaje: string = '';
  mensajeTipo: 'success' | 'danger' | 'info' = 'info';
  cargando: boolean = false;

  constructor(
    private semanaService: SemanaService,
    private diaService: DiaService,
    private menuService: MenuService,
    private detalleMenuService: DetalleMenuService,
    private asistenciaService: AsistenciaAlumnoService,
    private gradoService: GradoService,
    private coordinacionService: CoordinacionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.cargando = true;

    forkJoin({
      semanas: this.semanaService.obtenerSemanas(),
      dias: this.diaService.obtenerDias(),
      grados: this.gradoService.obtenerGradosActivos(),
      coordinaciones: this.coordinacionService.obtenerCoordinaciones()
    }).subscribe({
      next: (data) => {
        this.semanas = data.semanas.sort((a, b) =>
          (a.numero_semana ?? 0) - (b.numero_semana ?? 0)
        );
        this.dias = data.dias;
        this.grados = data.grados;
        this.coordinaciones = data.coordinaciones;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar catálogos:', error);
        this.mensaje = 'Error al cargar datos iniciales';
        this.mensajeTipo = 'danger';
        this.cargando = false;
        this.mostrarMensaje();
      }
    });
  }

  onFechaCambio(): void {
    if (!this.fechaSeleccionada) {
      this.gradosConDatos = []; 
      return;
    }
    const fecha = new Date(this.fechaSeleccionada + 'T00:00:00');
    this.calcularSemanaYDia(fecha);
  }

  calcularSemanaYDia(fecha: Date): void {
    const diaSemana = fecha.getDay();

    if (diaSemana === 0 || diaSemana === 6) {
      this.mensaje = 'Seleccione un día laboral (Lunes a Viernes)';
      this.mensajeTipo = 'danger';
      this.mostrarMensaje();
      this.gradosConDatos = []; 
      return;
    }

    this.diaCalculado = this.dias[diaSemana - 1] || null;

    const diaDelMes = fecha.getDate();
    let numeroSemana = Math.ceil(diaDelMes / 7);
    numeroSemana = Math.min(numeroSemana, 4);

    this.semanaCalculada = this.semanas.find(s =>
      s.numero_semana === numeroSemana
    ) || null;

    if (this.semanaCalculada && this.diaCalculado) {
      this.cargarMenuYDatos();
    }
  }

  cargarMenuYDatos(): void {
    if (!this.semanaCalculada || !this.diaCalculado) {
      this.mensaje = 'Complete todos los datos necesarios';
      this.mensajeTipo = 'danger';
      this.mostrarMensaje();
      return;
    }

    this.cargando = true;
    this.gradosConDatos = [];
    this.detallesMenu = [];
    this.menuDelDia = null;

    this.menuService.obtenerMenuPorSemanaDia(
      this.semanaCalculada.id_semana!,
      this.diaCalculado.id_dia!
    ).subscribe({
      next: (menu) => {
        this.menuDelDia = menu;

        if (!this.menuDelDia) {
          this.mensaje = 'No hay menú asignado para este día';
          this.mensajeTipo = 'danger';
          this.cargando = false;
          this.mostrarMensaje();
          return;
        }

        if (this.menuDelDia.id_menu) {
          this.cargarDetallesYAsistencias(this.menuDelDia.id_menu);
        }
      },
      error: (error) => {
        console.error('Error al cargar menú:', error);
        this.mensaje = 'Error al cargar el menú del día';
        this.mensajeTipo = 'danger';
        this.cargando = false;
        this.mostrarMensaje();
      }
    });
  }

  cargarDetallesYAsistencias(idMenu: number): void {
    this.detalleMenuService.obtenerDetallesPorMenu(idMenu).subscribe({
      next: (detalles) => {
        this.detallesMenu = detalles;
        this.cargarAsistenciasPorGrados();
      },
      error: (error) => {
        console.error('Error al cargar detalles:', error);
        this.mensaje = 'Error al cargar detalles del menú';
        this.mensajeTipo = 'danger';
        this.cargando = false;
        this.mostrarMensaje();
      }
    });
  }

  cargarAsistenciasPorGrados(): void {
    const observables = this.grados.map(grado =>
      this.asistenciaService.obtenerAsistenciasPorGradoFecha(
        grado.id_grado?.toString() || '0',
        this.fechaSeleccionada
      )
    );

    forkJoin(observables).subscribe({
      next: (resultados) => {
        this.gradosConDatos = []; 

        resultados.forEach((asistencias, index) => {
          const grado = this.grados[index];
          const totalAsistencia = asistencias.filter(a =>
            a.estado_asistencia === 'Asistencia'
          ).length;

          // Obtener orientador
          const coord = this.coordinaciones.find(c =>
            c.grado?.id_grado === grado.id_grado
          );
          const nombreCompleto = coord?.docente ?
            `${coord.docente.nombre_Docente || ''} ${coord.docente.apellido_Docente || ''}`.trim() :
            'Sin asignar';

          // Calcular raciones
          const raciones: any = {};
          this.detallesMenu.forEach(detalle => {
            const nombreAlimento = detalle.alimento.nombre_alimento || 'Sin nombre';
            const racionPorAlumno = detalle.racion_gramos || 0;
            const totalGramos = totalAsistencia * racionPorAlumno;

            let cantidadFinal = totalGramos;
            if (nombreAlimento.toLowerCase().includes('aceite')) {
              cantidadFinal = totalGramos;
            } else {
              cantidadFinal = totalGramos / 453.592;
            }
            raciones[nombreAlimento] = cantidadFinal;
          });

          // Determinar ciclo
          const mapaGrados: Record<string, number> = {
            'Primero': 1, 'Segundo': 2, 'Tercero': 3,
            'Cuarto': 4, 'Quinto': 5, 'Sexto': 6,
            'Séptimo': 7, 'Octavo': 8, 'Noveno': 9
          };
          const numeroGrado = mapaGrados[grado.nombre_grado] || 0;
          let ciclo = 1;
          if (numeroGrado >= 4 && numeroGrado <= 6) ciclo = 2;
          else if (numeroGrado >= 7 && numeroGrado <= 9) ciclo = 3;

          this.gradosConDatos.push({
            grado: grado,
            nombreOrientador: nombreCompleto,
            totalAsistencia: totalAsistencia,
            raciones: raciones,
            ciclo: ciclo
          });
        });

        // Se asigna el turno por defecto
        const turnosDisponibles = this.obtenerTurnosDisponibles();
        if (turnosDisponibles.length > 0) {
          this.turnoSeleccionado = turnosDisponibles.find(t => t.toLowerCase().includes('matutino')) || turnosDisponibles[0];
        }

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar asistencias:', error);
        this.mensaje = 'Error al cargar asistencias';
        this.mensajeTipo = 'danger';
        this.cargando = false;
        this.mostrarMensaje();
      }
    });
  }

  obtenerNombresAlimentos(): string[] {
    return this.detallesMenu.map(d => d.alimento.nombre_alimento || 'Sin nombre');
  }

  obtenerGradosPorCiclo(ciclo: number): any[] {
    return this.gradosConDatos.filter(r =>
      r.ciclo === ciclo &&
      r.grado.turno_grado === this.turnoSeleccionado 
    );
  }

  obtenerTotalPorCiclo(ciclo: number): number {
    return this.obtenerGradosPorCiclo(ciclo) 
      .reduce((sum, r) => sum + r.totalAsistencia, 0);
  }

  obtenerTurnosDisponibles(): string[] {
    const turnos = [...new Set(this.gradosConDatos.map(r =>
      r.grado.turno_grado 
    ))].filter(t => !!t);

    return turnos.sort((a, b) => {
      if (a.toLowerCase().includes('matutino')) return -1;
      if (b.toLowerCase().includes('matutino')) return 1;
      return a.localeCompare(b);
    });
  }

  obtenerTotalAsistenciaTurno(): number {
    return this.gradosConDatos
      .filter(r =>
        r.grado.turno_grado === this.turnoSeleccionado 
      )
      .reduce((sum, r) => sum + r.totalAsistencia, 0);
  }

  obtenerTotalesRacionesTurno(): any {
    const racionesFiltradas: any = {};
    const gradosDelTurno = this.gradosConDatos.filter(r =>
      r.grado.turno_grado === this.turnoSeleccionado 
    );

    gradosDelTurno.forEach(registro => {
      Object.keys(registro.raciones).forEach(alimento => {
        if (!racionesFiltradas[alimento]) {
          racionesFiltradas[alimento] = 0;
        }
        racionesFiltradas[alimento] += registro.raciones[alimento];
      });
    });
    return racionesFiltradas;
  }

  private mostrarMensaje(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    }, 100);
  }

}