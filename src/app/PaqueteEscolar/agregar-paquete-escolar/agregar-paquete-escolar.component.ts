import { Component } from '@angular/core';
import { PaqueteEscolar } from '../paquete-escolar';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PaqueteEscolarService } from '../paquete-escolar.service';

@Component({
  selector: 'app-agregar-paquete-escolar',
  standalone: true,
  imports: [RouterModule, FormsModule, HttpClientModule],
  templateUrl: './agregar-paquete-escolar.component.html',
  styleUrl: './agregar-paquete-escolar.component.css'
})
export class AgregarPaqueteEscolarComponent {
  paqueteescolar:PaqueteEscolar = new PaqueteEscolar();

  constructor(private paqueteServicio:PaqueteEscolarService, private router:Router){}

  ngOnInit(): void{

  }

  guardarPaquete(){
    this.paqueteServicio.agregarPaquete(this.paqueteescolar).subscribe(dato=>{
      this.irGestionarPaquetes();
    },error => console.log(error));
  }
  irGestionarPaquetes(){
    this.router.navigate(['/paquetesescolares'])
  }

  onSubmit(): void{
    this.guardarPaquete();
  }
}
