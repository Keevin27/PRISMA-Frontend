import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Menu } from '../../Models/menu';
import { MenuService } from '../../Services/menu.service';
import { DetalleMenu } from '../../Models/detalle-menu';
import { Alimento } from '../../Models/alimento';
import { AlimentoService } from '../../Services/alimento.service';
import { switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { DetalleMenuService } from '../../Services/detalle-menu.service';
import { DiaService } from '../../Services/dia.service';
import { SemanaService } from '../../Services/semana.service';
import { Semana } from '../../Models/semana';
import { Dia } from '../../Models/dia';

@Component({
  selector: 'app-crear-menu',
  standalone: true,
  imports: [RouterModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './crear-menu.component.html',
  styleUrl: './crear-menu.component.css'
})
export class CrearMenuComponent {
  menu: Menu = new Menu();
  semanas: Semana[] = [];
  dias: Dia[] = [];
  detallesMenu: DetalleMenu[] = [];
  alimentos: Alimento[] = [];

  semanaSeleccionada: Semana | null = null;
  diaSeleccionado: Dia | null = null;
  nombreMenu: string = '';
  alimentoSeleccionado: Alimento | null = null;
  estado_menu: boolean = true;
  racionPorAlumno: number = 0;

  isEditing: boolean = false;
  mensaje: string = '';//mensajito que se presentara en el flotante
  cargando: boolean = false;

  constructor(private menuServicio: MenuService, private alimentoServicio: AlimentoService,
    private detalleMenuServicio: DetalleMenuService, private semanaService: SemanaService,
    private diaService: DiaService, private router: Router) { }

  ngOnInit(): void {
    this.cargarAlimentosActivos();
    this.cargarSemanas();
    this.cargarDias();
  }

  cargarAlimentosActivos() {
    this.alimentoServicio.obtenerListaAlimentosActivos().subscribe({
      next: (data: Alimento[]) => {
        this.alimentos = data;
      },
      error: (error: any) => {
        console.error('Error al cargar alimentos:', error);
        this.mensaje = 'Error al cargar alimentos';//agregar texto de que mostrara en el flotante
        setTimeout(() => {

          window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

          // Ocultar mensaje después de unos segundos
          setTimeout(() => {
            this.mensaje = '';
          }, 3000);

        }, 100);
      }
    });
  }
  cargarSemanas() {
    this.semanaService.obtenerSemanas().subscribe({
      next: (data: Semana[]) => {
        this.semanas = data;
      },
      error: (error: any) => {
        console.error('Error al cargar semanas:', error);
        this.mensaje = 'Error al cargar semanas';//agregar texto de que mostrara en el flotante
        setTimeout(() => {

          window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

          // Ocultar mensaje después de unos segundos
          setTimeout(() => {
            this.mensaje = '';
          }, 3000);

        }, 100);
      }
    });
  }
  cargarDias() {
    this.diaService.obtenerDias().subscribe({
      next: (data: Dia[]) => {
        this.dias = data;
      },
      error: (error: any) => {
        console.error('Error al cargar días:', error);
        this.mensaje = 'Error al cargar días';//agregar texto de que mostrara en el flotante
        setTimeout(() => {

          window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

          // Ocultar mensaje después de unos segundos
          setTimeout(() => {
            this.mensaje = '';
          }, 3000);

        }, 100);
      }
    });
  }

  guardarMenu() {
    // Validaciones
    if (!this.semanaSeleccionada || !this.diaSeleccionado || !this.nombreMenu) {
      this.mensaje = 'Por favor complete todos los campos obligatorios';
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => this.mensaje = '', 3000);
      }, 100);
      return;
    }

    if (this.detallesMenu.length === 0) {
      this.mensaje = 'Debe agregar al menos un alimento al menú';
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => this.mensaje = '', 3000);
      }, 100);
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    // Preparar objeto menú
    this.menu = {
      nombre_menu: this.nombreMenu,
      estado_menu: this.estado_menu,
      semana: { id_semana: this.semanaSeleccionada.id_semana },
      dia: { id_dia: this.diaSeleccionado.id_dia }
    };

    // Guardar el menú y obtener su ID
    this.menuServicio.agregarMenu(this.menu).pipe(
      switchMap((menuGuardado: Menu) => {
        console.log('Menú guardado con ID:', menuGuardado.id_menu);
        

        // Validar que el menú tiene ID
        if (!menuGuardado.id_menu) {
          throw new Error('El menú guardado no tiene ID');
        }

        // Asignar el ID del menú a todos los detalles
        const detallesConMenu = this.detallesMenu
          .filter(detalle => detalle.alimento !== null)
          .map(detalle => ({
            alimento: detalle.alimento,
            racion_gramos: detalle.racion_gramos,
            menu: menuGuardado
          }));

        console.log('Detalles a guardar:', detallesConMenu);

        // Guardar todos los detalles en paralelo
        const observablesDetalles = detallesConMenu.map(detalle =>
          this.detalleMenuServicio.agregarDetalleMenu(detalle)
        );

        // Si no hay detalles, retornar array vacío
        if (observablesDetalles.length === 0) {
          return forkJoin([]);
        }

        return forkJoin(observablesDetalles);
      })
    ).subscribe({
      next: (detallesGuardados) => {
        console.log('Detalles guardados:', detallesGuardados);
        this.cargando = false;
        this.mensaje = 'Menú y detalles registrados con éxito.';

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);

        setTimeout(() => {
          this.router.navigate(['/menus']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.cargando = false;
        this.mensaje = 'Error al registrar detalles menu: ' + (err.message || 'Error desconocido');

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => this.mensaje = '', 5000);
        }, 100);
      }
    });
  }

  agregarAlimento(): void {
    if (this.alimentoSeleccionado && this.racionPorAlumno > 0) {
      
      const nuevoDetalle: DetalleMenu = {
        alimento: this.alimentoSeleccionado,
        racion_gramos: this.racionPorAlumno
      };

      this.detallesMenu.push(nuevoDetalle);

      // Limpiar campos
      this.alimentoSeleccionado = null;
      this.racionPorAlumno = 0;
    }
  }

  editarItem(index: number): void {
    const detalle = this.detallesMenu[index];
    this.alimentoSeleccionado = detalle.alimento;
    this.racionPorAlumno = detalle.racion_gramos;
    this.eliminarItem(index);
  }

  eliminarItem(index: number): void {
    this.detallesMenu.splice(index, 1);
  }

  cancelar(): void {
    this.semanaSeleccionada = null;
    this.diaSeleccionado = null;
    this.nombreMenu = '';
    this.alimentoSeleccionado = null;
    this.racionPorAlumno = 0;
    this.detallesMenu = [];
    this.mensaje = '';

    this.router.navigate(['/menus']);
  }
}
