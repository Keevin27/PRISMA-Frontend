import { Component } from '@angular/core';
import { Docente } from '../docente';
import { DocenteService } from '../docente.service';

@Component({
  selector: 'app-lista-docentes',
  standalone: true,
  imports: [],
  templateUrl: './lista-docentes.component.html',
  styleUrl: './lista-docentes.component.css'
})
export class ListaDocentesComponent {
  docentes:Docente[]; 

  constructor(private docenteServicio: DocenteService){}

  ngOnInit():void{

  }

  private obtenerDocentes(){
    this.docenteServicio.obtenerListaDocentes().subscribe(dato => {
      this.docentes = dato;
    });
  }
}
