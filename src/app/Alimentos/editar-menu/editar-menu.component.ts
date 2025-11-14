import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Menu } from '../../Models/menu';
import { MenuService } from '../../Services/menu.service';
import { DetalleMenu } from '../../Models/detalle-menu';
import { Alimento } from '../../Models/alimento';
import { AlimentoService } from '../../Services/alimento.service';
import { forkJoin, of } from 'rxjs';
import { DetalleMenuService } from '../../Services/detalle-menu.service';
import { DiaService } from '../../Services/dia.service';
import { SemanaService } from '../../Services/semana.service';
import { Semana } from '../../Models/semana';
import { Dia } from '../../Models/dia';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';



@Component({
  selector: 'app-editar-menu',
  standalone: true,
  imports: [RouterModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './editar-menu.component.html',
  styleUrl: './editar-menu.component.css'
})
export class EditarMenuComponent {
  menuId: number = 0;
  menu: Menu = new Menu();
  menuOriginal: Menu = new Menu();

  semanas: Semana[] = [];
  dias: Dia[] = [];
  detallesMenu: DetalleMenu[] = [];
  detallesOriginales: DetalleMenu[] = [];
  alimentos: Alimento[] = [];

  semanaSeleccionada: Semana | null = null;
  diaSeleccionado: Dia | null = null;
  nombreMenu: string = '';
  alimentoSeleccionado: Alimento | null = null;
  estado_menu: boolean = true;
  racionPorAlumno: number = 0;

  mensaje: string = '';
  mensajeTipo: 'success' | 'danger' = 'danger';
  cargando: boolean = true;
  guardando: boolean = false;

  constructor(
    private menuServicio: MenuService,
    private alimentoServicio: AlimentoService,
    private detalleMenuServicio: DetalleMenuService,
    private semanaService: SemanaService,
    private diaService: DiaService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Obtener el ID del menú desde la ruta
    this.route.params.subscribe(params => {
      this.menuId = +params['id'];
      if (this.menuId) {
        this.cargarDatosIniciales();
      } else {
        this.mensaje = 'ID de menú no válido';
        this.mensajeTipo = 'danger';
        this.cargando = false;
      }
    });
  }

  cargarDatosIniciales(): void {
    // Cargar todo en paralelo
    forkJoin({
      menu: this.menuServicio.obtenerMenuPorId(this.menuId),
      alimentos: this.alimentoServicio.obtenerListaAlimentosActivos(),
      semanas: this.semanaService.obtenerSemanas(),
      dias: this.diaService.obtenerDias()
    }).subscribe({
      next: (data) => {
        // Guardar datos del menú
        this.menuOriginal = data.menu;
        this.menu = { ...data.menu };

        this.nombreMenu = this.menu.nombre_menu || '';
        this.estado_menu = this.menu.estado_menu || false;

        // Guardar catálogos
        this.alimentos = data.alimentos;
        this.semanas = data.semanas;
        this.dias = data.dias;

        this.semanaSeleccionada = this.semanas.find(s => s.id_semana === this.menu.semana?.id_semana) || null;
        this.diaSeleccionado = this.dias.find(d => d.id_dia === this.menu.dia?.id_dia) || null;

        // Cargar detalles del menú
        this.cargarDetallesMenu();
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.mensaje = 'Error al cargar los datos del menú';
        this.mensajeTipo = 'danger';
        this.cargando = false;
        this.mostrarMensajeConScroll();
      }
    });
  } 

  cargarDetallesMenu(): void {
    this.detalleMenuServicio.obtenerDetallesPorMenu(this.menuId).subscribe({
      next: (detalles: DetalleMenu[]) => {
        this.detallesMenu = [...detalles];
        this.detallesOriginales = [...detalles];
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles del menú:', error);
        this.mensaje = 'Error al cargar los detalles del menú';
        this.mensajeTipo = 'danger';
        this.cargando = false;
        this.mostrarMensajeConScroll();
      }
    });
  }

  actualizarMenu() {
    if (!this.menu?.id_menu) {
      this.mensaje = "No se puede actualizar: el menú no tiene ID.";
      return;
    }

    if (!this.nombreMenu || !this.semanaSeleccionada || !this.diaSeleccionado) {
      this.mensaje = "Complete todos los campos obligatorios.";
      return;
    }

    if (this.detallesMenu.length === 0) {
      this.mensaje = "Debe agregar al menos un alimento.";
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    const idMenu = this.menu.id_menu;

    //Actualizar datos del menú
    const menuActualizado: Menu = {
      id_menu: idMenu,
      nombre_menu: this.nombreMenu,
      estado_menu: this.estado_menu,
      semana: { id_semana: this.semanaSeleccionada.id_semana },
      dia: { id_dia: this.diaSeleccionado.id_dia }
    };

    this.menuServicio.actualizarMenu(idMenu, menuActualizado).pipe(
      // elimina todos los detalles actuales del menú
      switchMap(() =>
        this.detalleMenuServicio.obtenerDetallesPorMenu(idMenu)
      ),
      switchMap((detallesMenu: DetalleMenu[]) => {

        const eliminaciones = detallesMenu.map(det => {
          console.log('Eliminando detalle ID:', det.id_detalle_menu);
          return this.detalleMenuServicio.eliminarDetalleMenu(det.id_detalle_menu!);
        });

        return eliminaciones.length > 0 ? forkJoin(eliminaciones) : of(null);
      }),

      //insertar los detalles que están actualmente en la vista
      switchMap(() => {
        const nuevosDetalles = this.detallesMenu.map(det => ({
          alimento: det.alimento,
          racion_gramos: det.racion_gramos,
          menu: menuActualizado
        }));

        const inserciones = nuevosDetalles.map(det =>
          this.detalleMenuServicio.agregarDetalleMenu(det)
        );

        return inserciones.length > 0 ? forkJoin(inserciones) : of(null);
      })

    ).subscribe({
      next: () => {
        this.router.navigate(['/menus']);
      },
      error: (err) => {
        this.cargando = false;
        console.error("Error al actualizar:", err);

        this.mensaje = "Error al actualizar el menú: " + (err.message || "Error desconocido");
        this.mensajeTipo = "danger";
        this.mostrarMensajeConScroll();
      }
    });
  }
  agregarAlimento(): void {
    if (this.alimentoSeleccionado && this.racionPorAlumno > 0) {
      // Verificar si el alimento ya está en la lista
      const yaExiste = this.detallesMenu.some(
        detalle => detalle.alimento.id_alimento === this.alimentoSeleccionado?.id_alimento
      );

      if (yaExiste) {
        this.mensaje = 'Este alimento ya está agregado al menú';
        this.mensajeTipo = 'danger';
        this.mostrarMensajeConScroll();
        return;
      }

      const nuevoDetalle: DetalleMenu = {
        alimento: this.alimentoSeleccionado,
        racion_gramos: this.racionPorAlumno,
      };

      this.detallesMenu.push(nuevoDetalle);

      // Limpiar campos
      this.alimentoSeleccionado = null;
      this.racionPorAlumno = 0;
    }
  }

  editarItem(index: number): void {
    const detalle = this.detallesMenu[index];
    this.alimentoSeleccionado =  this.alimentos.find(a => a.id_alimento === detalle.alimento.id_alimento) || null;
    this.racionPorAlumno = detalle.racion_gramos;
    this.eliminarItem(index);
  }

  eliminarItem(index: number): void {
    this.detallesMenu.splice(index, 1);
  }

  cancelar(): void {
    this.router.navigate(['/menus']);
  }

  private mostrarMensajeConScroll(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (this.mensajeTipo === 'danger') {
          this.mensaje = '';
        }
      }, 5000);
    }, 100);
  }
}