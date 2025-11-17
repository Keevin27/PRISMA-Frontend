import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { PaqueteEscolar } from '../paquete-escolar';
import { HttpClientModule } from '@angular/common/http';
import { PaqueteEscolarService } from '../paquete-escolar.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paquete-escolar',
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './paquete-escolar.component.html',
  styleUrl: './paquete-escolar.component.css'
})
export class PaqueteEscolarComponent implements AfterViewChecked {
  @ViewChild('inputNombre') inputNombre?: ElementRef;

  paquetesescolares: PaqueteEscolar[] = [];
  // Objeto para manejar el estado de edición de cada fila
  estadoEdicion: { [key: number]: { editando: boolean, nombreTemp: string } } = {};
  private enfocarInput = false;

  mensaje: string = '';
  constructor(private paqueteServicio: PaqueteEscolarService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { mensaje?: string };
    if (state?.mensaje) {
      this.mensaje = state.mensaje;
    }
  }

  ngOnInit(): void {
    this.obtenerPaquetes();
    if (this.mensaje) {
      setTimeout(() => this.mensaje = '', 2000);
    }
  }

  private obtenerPaquetes() {
    this.paqueteServicio.obtenerListaDePaquetes().subscribe(dato => {
      this.paquetesescolares = dato;
    })
  }

  actualizarPaquete(paquete: PaqueteEscolar) {
    this.paqueteServicio.actualizarPaquete(paquete.id_paquete_e, paquete).subscribe();
    this.mensaje = 'Paquete escolar actualizado con éxito.';//agregar texto de que mostrara
    setTimeout(() => this.mensaje = '', 2000);//duracion del mensaje
  }

  // --- Funcionalidad de Edición en Línea ---

  // Verifica si un paquete está en modo edición
  estaEditando(paquete: PaqueteEscolar): boolean {
    return this.estadoEdicion[paquete.id_paquete_e]?.editando || false;
  }

  // Obtiene el nombre temporal
  getNombreTemp(paquete: PaqueteEscolar): string {
    return this.estadoEdicion[paquete.id_paquete_e]?.nombreTemp || '';
  }

  // Actualiza el nombre temporal
  setNombreTemp(paquete: PaqueteEscolar, valor: string): void {
    if (this.estadoEdicion[paquete.id_paquete_e]) {
      this.estadoEdicion[paquete.id_paquete_e].nombreTemp = valor;
    }
  }

  // Guarda la edición
  guardarEdicion(paquete: PaqueteEscolar): void {
    const estado = this.estadoEdicion[paquete.id_paquete_e];

    if (estado && estado.nombreTemp.trim() !== '') {
      paquete.nombre_paquete = estado.nombreTemp.trim();
      delete this.estadoEdicion[paquete.id_paquete_e];
      this.actualizarPaquete(paquete);
    } else {
      // Si está vacío, cancelar
      this.cancelarEdicion(paquete);
    }
  }

  // Cancela la edición
  cancelarEdicion(paquete: PaqueteEscolar): void {
    delete this.estadoEdicion[paquete.id_paquete_e];
  }

  // Activa el modo edición
  activarEdicion(paquete: PaqueteEscolar): void {
    this.estadoEdicion[paquete.id_paquete_e] = {
      editando: true,
      nombreTemp: paquete.nombre_paquete
    };
    this.enfocarInput = true;
  }

  // --- Fin de Edición en Línea ---

  toggleActivo(paquete: PaqueteEscolar) {
    paquete.paquete_activo = !paquete.paquete_activo;
    this.actualizarPaquete(paquete);
  }

  ngAfterViewChecked(): void {
    // Enfocar el input después de que se renderice
    if (this.enfocarInput && this.inputNombre) {
      this.inputNombre.nativeElement.focus();
      this.inputNombre.nativeElement.select();
      this.enfocarInput = false;
    }
  }
}