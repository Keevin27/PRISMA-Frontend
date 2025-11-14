import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Menu } from '../../Models/menu';
import { MenuService } from '../../Services/menu.service';
import { DetalleMenu } from '../../Models/detalle-menu';
import { DetalleMenuService } from '../../Services/detalle-menu.service';
import { DiaService } from '../../Services/dia.service';
import { SemanaService } from '../../Services/semana.service';
import { Semana } from '../../Models/semana';
import { Dia } from '../../Models/dia';

@Component({
  selector: 'app-listar-menu',
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './listar-menu.component.html',
  styleUrl: './listar-menu.component.css'
})

export class ListarMenuComponent {
  menus: Menu[] = [];
  menusFiltrados: Menu[] = [];
  semanas: Semana[] = [];
  dias: Dia[] = [];
  semanasConMenus: Semana[] = [];

  mensaje: string = '';
  vistaActual: 'semanal' | 'lista' = 'semanal';
  semanaFiltro: string = '';
  semanaExpandida: number | null = null;
  detallesExpandidos: Set<number> = new Set();

  constructor(
    private menuService: MenuService,
    private detalleMenuService: DetalleMenuService,
    private semanaService: SemanaService,
    private diaService: DiaService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { mensaje?: string };
    if (state?.mensaje) {
      this.mensaje = state.mensaje;
    }
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargarSemanas();
    this.cargarDias();
    this.cargarMenus();
  }

  cargarSemanas(): void {
    this.semanaService.obtenerSemanas().subscribe({
      next: (data: Semana[]) => {
        this.semanas = data.sort((a, b) => (a.numero_semana ?? 0) - (b.numero_semana ?? 0));
        //this.actualizarSemanasConMenus();
      },
      error: (error: any) => {
        console.error('Error al cargar semanas:', error);
        this.mensaje = 'Error al cargar semanas';
        this.ocultarMensaje();
      }
    });
  }

  cargarDias(): void {
    this.diaService.obtenerDias().subscribe({
      next: (data: Dia[]) => {
        this.dias = data;
      },
      error: (error: any) => {
        console.error('Error al cargar días:', error);
        this.mensaje = 'Error al cargar días';
        this.ocultarMensaje();
      }
    });
  }

  cargarMenus(): void {
    this.menuService.obtenerListaMenus().subscribe({
      next: (data: Menu[]) => {
        this.menus = data;
        // Cargar detalles de cada menú
        this.menus.forEach(menu => {
          if (menu.id_menu) {
            this.cargarDetallesMenu(menu.id_menu);
          }
        });
        // this.filtrarMenus();
        // this.actualizarSemanasConMenus();
        this.semanaExpandida = this.semanas.length > 0 ? this.semanas[0].id_semana : null;
      },
      error: (error: any) => {
        console.error('Error al cargar menús:', error);
        this.mensaje = 'Error al cargar menús';
        this.ocultarMensaje();
      }
    });
  }

  cargarDetallesMenu(idMenu: number): void {
    this.detalleMenuService.obtenerDetallesPorMenu(idMenu).subscribe({
      next: (detalles: DetalleMenu[]) => {
        const menu = this.menus.find(m => m.id_menu === idMenu);
        if (menu) {
          menu.detallesMenu = detalles;
        }
      },
      error: (error: any) => {
        console.error(`Error al cargar detalles del menú ${idMenu}:`, error);
      }
    });
  }

  // actualizarSemanasConMenus(): void {
  //   // Filtrar solo las semanas que tienen menús
  //   this.semanasConMenus = this.semanas.filter(semana =>
  //     this.menus.some(menu => menu.semana?.id_semana === semana.id_semana)
  //   );

  //   // Si hay semanas con menús, expandir la primera por defecto
  //   if (this.semanasConMenus.length > 0 && this.semanaExpandida === null) {
  //     this.semanaExpandida = this.semanasConMenus[0].id_semana;
  //   }
  // }

  // filtrarMenus(): void {
  //   if (this.semanaFiltro) {
  //     this.menusFiltrados = this.menus.filter(
  //       menu => menu.semana?.id_semana === parseInt(this.semanaFiltro)
  //     );
  //   } else {
  //     this.menusFiltrados = [...this.menus];
  //   }
  //   this.actualizarSemanasConMenus();
  // }

  cambiarVista(vista: 'semanal' | 'lista'): void {
    this.vistaActual = vista;
  }

  toggleSemana(idSemana: number): void {
    this.semanaExpandida = this.semanaExpandida === idSemana ? null : idSemana;
  }

  toggleDetalles(idMenu: number): void {
    if (this.detallesExpandidos.has(idMenu)) {
      this.detallesExpandidos.delete(idMenu);
    } else {
      this.detallesExpandidos.add(idMenu);
    }
  }

  mostrandoDetalles(idMenu: number): boolean {
    return this.detallesExpandidos.has(idMenu);
  }

  obtenerMenuPorDia(idSemana: number, idDia: number): Menu | null {
    return this.menus.find(
      menu => menu.semana?.id_semana === idSemana && menu.dia?.id_dia === idDia
    ) || null;
  }

  toggleEstadoMenu(menu: Menu): void {
    if (!menu.id_menu) return;

    const nuevoEstado = !menu.estado_menu;
    const menuActualizado = { ...menu, estado_menu: nuevoEstado };

    this.menuService.actualizarMenu(menu.id_menu, menuActualizado).subscribe({
      next: () => {
        menu.estado_menu = nuevoEstado;
        this.mensaje = `Menú ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`;
        this.ocultarMensaje();
      },
      error: (error: any) => {
        console.error('Error al actualizar estado del menú:', error);
        this.mensaje = 'Error al actualizar el estado del menú';
        this.ocultarMensaje();
      }
    });
  }

  duplicarMenu(menu: Menu): void {
    if (confirm(`¿Desea duplicar el menú "${menu.nombre_menu}"?`)) {
      const menuDuplicado: Menu = {
        nombre_menu: `${menu.nombre_menu} (Copia)`,
        estado_menu: false,
        semana: menu.semana,
        dia: menu.dia
      };

      this.menuService.agregarMenu(menuDuplicado).subscribe({
        next: (menuGuardado: Menu) => {
          // Duplicar también los detalles
          if (menu.detallesMenu && menu.detallesMenu.length > 0 && menuGuardado.id_menu) {
            menu.detallesMenu.forEach(detalle => {
              const detalleNuevo: DetalleMenu = {
                alimento: detalle.alimento,
                racion_gramos: detalle.racion_gramos,
                menu: menuGuardado
              };

              this.detalleMenuService.agregarDetalleMenu(detalleNuevo).subscribe({
                error: (err) => console.error('Error al duplicar detalle:', err)
              });
            });
          }

          this.mensaje = 'Menú duplicado correctamente';
          this.cargarMenus();
          this.ocultarMensaje();
        },
        error: (error: any) => {
          console.error('Error al duplicar menú:', error);
          this.mensaje = 'Error al duplicar el menú';
          this.ocultarMensaje();
        }
      });
    }
  }

  duplicarSemana(semana: Semana): void {
    if (confirm(`¿Desea duplicar todos los menús de la Semana ${semana.numero_semana}?`)) {
      const menusASemana = this.menus.filter(
        m => m.semana?.id_semana === semana.id_semana
      );

      if (menusASemana.length === 0) {
        this.mensaje = 'No hay menús en esta semana para duplicar';
        this.ocultarMensaje();
        return;
      }

      // Aquí deberías permitir al usuario seleccionar la semana destino
      // Por simplicidad, mostramos un mensaje
      this.mensaje = 'Función de duplicar semana completa en desarrollo';
      this.ocultarMensaje();
    }
  }

  private ocultarMensaje(): void {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);
    }, 100);
  }
}
