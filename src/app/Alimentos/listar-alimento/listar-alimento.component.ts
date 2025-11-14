import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Alimento } from '../../Models/alimento';
import { AlimentoService } from '../../Services/alimento.service';

@Component({
  selector: 'app-listar-alimento',
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './listar-alimento.component.html',
  styleUrl: './listar-alimento.component.css'
})
export class ListarAlimentoComponent {
  @ViewChild('inputNombre') inputNombre?: ElementRef;

  alimentos: Alimento[] = [];
  estadoEdicion: { [key: number]: { editando: boolean, nombreTemp: string } } = {};
  private enfocarInput = false;

  mensaje: string = '';
  constructor(private alimentoService: AlimentoService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { mensaje?: string };
    if (state?.mensaje) {
      this.mensaje = state.mensaje;
    }
  }

  ngOnInit(): void {
    this.obtenerAlimentos();
    if (this.mensaje) {
      setTimeout(() => this.mensaje = '', 2000);
    }
  }
  private obtenerAlimentos() {
    this.alimentoService.obtenerListaAlimentos().subscribe(dato => {
      this.alimentos = dato;
    })
  }

  // Verifica si un alimento está en modo edición
  estaEditando(alimento: Alimento): boolean {
    return this.estadoEdicion[alimento.id_alimento]?.editando || false;
  }

  // Obtiene el nombre temporal
  getNombreTemp(alimento: Alimento): string {
    return this.estadoEdicion[alimento.id_alimento]?.nombreTemp || '';
  }

  // Actualiza el nombre temporal
  setNombreTemp(alimento: Alimento, valor: string): void {
    if (this.estadoEdicion[alimento.id_alimento]) {
      this.estadoEdicion[alimento.id_alimento].nombreTemp = valor;
    }
  }

  // Guarda la edición
  guardarEdicion(alimento: Alimento): void {
    const estado = this.estadoEdicion[alimento.id_alimento];

    if (estado && estado.nombreTemp.trim() !== '') {
      alimento.nombre_alimento = estado.nombreTemp.trim();
      delete this.estadoEdicion[alimento.id_alimento];
      this.actualizarAlimento(alimento);
    } else {
      // Si está vacío, cancelar
      this.cancelarEdicion(alimento);
    }
  }

  // Cancela la edición
  cancelarEdicion(alimento: Alimento): void {
    delete this.estadoEdicion[alimento.id_alimento];
  }

  // Activa el modo edición
  activarEdicion(alimento: Alimento): void {
    this.estadoEdicion[alimento.id_alimento] = {
      editando: true,
      nombreTemp: alimento.nombre_alimento
    };
    this.enfocarInput = true;
  }

  actualizarAlimento(alimento: Alimento) {
    this.alimentoService.actualizarAlimento(alimento.id_alimento, alimento).subscribe();
    this.mensaje = 'Alimento actualizado con éxito.';//agregar texto de que mostrara
    setTimeout(() => this.mensaje = '', 2000);//duracion del mensaje
  }

  toggleActivo(alimento: Alimento) {
    alimento.estado_alimento = !alimento.estado_alimento;
    this.actualizarAlimento(alimento);
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
