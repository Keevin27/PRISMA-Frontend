import { Component, OnInit } from '@angular/core';
import { Materia } from '../materia';
import { MateriaService } from '../materia.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actualizar-materias',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './actualizar-materias.component.html',
  styleUrl: './actualizar-materias.component.css'
})
export class ActualizarMateriasComponent implements OnInit {
  materia:Materia = new Materia();

  constructor(private materiServicio: MateriaService, private router: Router, private route: ActivatedRoute){

  }
  codigo_materia: string='';
  ngOnInit(): void {
    this.route.paramMap.subscribe(params=>{
      const codigo = params.get('codigo');
      if(codigo){
        this.codigo_materia=codigo;

        this.materiServicio.obtenerMateriaPorCodigo(this.codigo_materia).subscribe({
          next: (data)=>{this.materia=data;},
          error: (e) => {console.error("Error cargando la materia",e);}
        });
      }
      else{
        console.error("No se recibio un codigo de materia en la ruta");
      }
    });
  }
  mensaje: string = '';//mensajito que se presentara en el flotante
  onSubmit(form: NgForm){
    if(!form.valid){
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);

      return;
    }
    this.materiServicio.actualizarMateria(this.materia.codigo_materia,this.materia).subscribe(
      (response)=>{
        console.log('Materia Actualizada con exito',response);
        this.router.navigate(['/materias'], {
          state: { mensaje: 'Materia actualizado con exito.' } //Envio de mensaje a la vista
        });
      },
      (error) => {
        console.error('Error actualizando materia', error);
      }
    )
  }
  
}
