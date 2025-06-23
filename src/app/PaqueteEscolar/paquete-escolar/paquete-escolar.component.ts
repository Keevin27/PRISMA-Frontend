import { Component } from '@angular/core';
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
export class PaqueteEscolarComponent {
  paquetesescolares: PaqueteEscolar[] = [];

  mensaje: string = '';
  constructor(private paqueteServicio: PaqueteEscolarService, private router: Router) {
  const navigation = this.router.getCurrentNavigation();
  const state = navigation?.extras.state as { mensaje?: string };
  if (state?.mensaje) {
    this.mensaje = state.mensaje;
  }}

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

  onNombreEdit(paquete: PaqueteEscolar, event: any) {
    paquete.nombre_paquete = event.target.textContent.trim();
    this.actualizarPaquete(paquete);
  }

  toggleActivo(paquete: PaqueteEscolar) {
    paquete.paquete_activo = !paquete.paquete_activo;
    this.actualizarPaquete(paquete);
  }

}
