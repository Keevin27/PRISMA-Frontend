import { Component } from '@angular/core';
import { Docente } from '../docente';
import { DocenteService } from '../docente.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-docentes',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './lista-docentes.component.html',
  styleUrls: ['./lista-docentes.component.css']
})
export class ListaDocentesComponent {
  docentes:Docente[]; 

  constructor(private docenteServicio: DocenteService){}

  ngOnInit():void{
    this.obtenerDocentes();
  }

  private obtenerDocentes(){
    this.docenteServicio.obtenerListaDocentes().subscribe(dato => {
      this.docentes = dato;
    });
  } 
}