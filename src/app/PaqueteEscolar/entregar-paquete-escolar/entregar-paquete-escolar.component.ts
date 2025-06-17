import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Alumno } from '../../Alumno/alumno';
import { PaqueteEscolarService } from '../paquete-escolar.service';
import { AlumnoService } from '../../Alumno/alumno.service';
import { PaqueteEscolar } from '../paquete-escolar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-entregar-paquete-escolar',
  standalone: true,
  imports: [RouterModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './entregar-paquete-escolar.component.html',
  styleUrl: './entregar-paquete-escolar.component.css'
})
export class EntregarPaqueteEscolarComponent {
  alumnos:Alumno[]=[];
  paquetesescolares:PaqueteEscolar[]=[];
  paqueteSeleccionadoId:string='';

  constructor(private paqueteServicio:PaqueteEscolarService, private alumnoServicio: AlumnoService){}

  ngOnInit():void{
    this.obtenerAlumnos();
    this.obtenerPaquetes();
  }

  private obtenerAlumnos(){
    this.alumnoServicio.obtenerListaDeAlumnos().subscribe(dato =>{
      this.alumnos=dato;
    })
  }
  private obtenerPaquetes(){
    this.paqueteServicio.obtenerListaDePaquetes().subscribe(dato =>{
      this.paquetesescolares=dato;
    })
  }
}
