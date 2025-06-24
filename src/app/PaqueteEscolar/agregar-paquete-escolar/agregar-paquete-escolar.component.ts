import { Component } from '@angular/core';
import { PaqueteEscolar } from '../paquete-escolar';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PaqueteEscolarService } from '../paquete-escolar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agregar-paquete-escolar',
  standalone: true,
  imports: [RouterModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './agregar-paquete-escolar.component.html',
  styleUrl: './agregar-paquete-escolar.component.css'
})
export class AgregarPaqueteEscolarComponent {
  paqueteescolar: PaqueteEscolar = new PaqueteEscolar();

  constructor(private paqueteServicio: PaqueteEscolarService, private router: Router) { }

  ngOnInit(): void {

  }

  guardarPaquete() {
    this.paqueteServicio.agregarPaquete(this.paqueteescolar).subscribe(dato => {
      this.irGestionarPaquetes();
    }, error => console.log(error));
  }
  irGestionarPaquetes() {
    this.router.navigate(['/paquetesescolares'], {
      state: { mensaje: 'Paquete escolar registrado con éxito.' }
    });
  }
  mensaje: string = '';//mensajito que se presentara en el flotante
  onSubmit(form: NgForm): void {
    if (!form.valid) {
      this.mensaje = 'No se ha podido registrar el paquete escolar.';//agregar texto de que mostrara
      setTimeout(() => this.mensaje = '', 2000);//duracion del mensaje
      return;
    }
    this.guardarPaquete();
  }
}
