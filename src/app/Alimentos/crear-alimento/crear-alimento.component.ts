import { Component } from '@angular/core';
import { Alimento } from '../../Models/alimento';
import { AlimentoService } from '../../Services/alimento.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-alimento',
  standalone: true,
  imports: [RouterModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './crear-alimento.component.html',
  styleUrl: './crear-alimento.component.css'
})
export class CrearAlimentoComponent {
  alimento: Alimento = new Alimento();

  constructor(private alimentoServicio: AlimentoService, private router: Router) { }

  ngOnInit(): void {

  }

  guardarAlimento() {
    this.alimentoServicio.agregarAlimento(this.alimento).subscribe(dato => {
      this.irGestionarAlimentos();
    }, error => console.log(error));
  }
  irGestionarAlimentos() {
    this.router.navigate(['/alimentos'], {
      state: { mensaje: 'Alimento registrado con éxito.' }
    });
  }
  mensaje: string = '';//mensajito que se presentara en el flotante
  onSubmit(form: NgForm): void {
    if (!form.valid) {
      this.mensaje = 'No se ha podido registrar el alimento.';//agregar texto de que mostrara
      setTimeout(() => this.mensaje = '', 2000);//duracion del mensaje
      return;
    }
    this.guardarAlimento();
  }
}
