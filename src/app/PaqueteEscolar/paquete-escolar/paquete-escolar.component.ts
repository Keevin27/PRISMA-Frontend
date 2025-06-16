import { Component } from '@angular/core';
import { PaqueteEscolar } from '../paquete-escolar';
import { HttpClientModule } from '@angular/common/http';
import { PaqueteEscolarService } from '../paquete-escolar.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paquete-escolar',
  standalone: true,
  imports: [HttpClientModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './paquete-escolar.component.html',
  styleUrl: './paquete-escolar.component.css'
})
export class PaqueteEscolarComponent {
  paquetesescolares: PaqueteEscolar[]=[];

  constructor(private paqueteServicio: PaqueteEscolarService) { }

  ngOnInit(): void {
    this.obtenerPaquetes();
  }
  private obtenerPaquetes() {
    this.paqueteServicio.obtenerListaDePaquetes().subscribe(dato => {
      this.paquetesescolares = dato;
    })
  }
  actualizarPaquete(paquete: PaqueteEscolar) {
    this.paqueteServicio.actualizarPaquete(paquete.id_paquete_e, paquete).subscribe();
  }

  onNombreEdit(paquete: PaqueteEscolar, event: any) {
    paquete.nombre_paquete = event.target.textContent.trim();
    this.actualizarPaquete(paquete);
  }

  toggleActivo(paquete: PaqueteEscolar) {
    paquete.paquete_activo = !paquete.paquete_activo;
    this.actualizarPaquete(paquete);
  }
  
}
