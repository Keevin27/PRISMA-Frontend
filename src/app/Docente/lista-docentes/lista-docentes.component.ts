import { Component } from '@angular/core';
import { Docente } from '../docente';
import { DocenteService } from '../docente.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-docentes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-docentes.component.html',
  styleUrls: ['./lista-docentes.component.css']
})
export class ListaDocentesComponent {
  docentes: Docente[];

  mensaje: string = '';
  constructor(private docenteServicio: DocenteService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { mensaje?: string };
    if (state?.mensaje) {
      this.mensaje = state.mensaje;
    }
  }

  ngOnInit(): void {
    this.obtenerDocentes();
    if (this.mensaje) {
    setTimeout(() => this.mensaje = '', 2000);}
  }

  private obtenerDocentes() {
    this.docenteServicio.obtenerListaDocentes().subscribe(dato => {
      this.docentes = dato;
    });
  }

}
