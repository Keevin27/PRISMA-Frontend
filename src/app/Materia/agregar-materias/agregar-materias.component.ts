import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule, NgForm } from "@angular/forms";
import { Materia } from '../materia';
import { MateriaService } from '../materia.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agregar-materias',
  standalone: true,
  imports: [ FormsModule,CommonModule],
  templateUrl: './agregar-materias.component.html',
  styleUrl: './agregar-materias.component.css'
})
export class AgregarMateriasComponent implements OnInit {
  materia:Materia = new Materia();

  constructor(private materiaServicio: MateriaService, private router:Router){

  }

  ngOnInit(): void {
    
  }

  regresarListaMateria(){
    this.router.navigate(['/materias'],{
      state: {mensaje: 'Materia Registrada con Exito.'}
    });
  }
  mensaje: string=''; //instanciamos el del metodo de arriba para que lo use

  onSubmit(form: NgForm){
    this.materiaServicio.existeMateria(this.materia.codigo_materia).subscribe({
      next:(existe)=> {
        if(existe){
          this.mensaje='Este codigo de materia ya esta registrado.';
          setTimeout(() => {

            window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

            // Ocultar mensaje después de unos segundos
            setTimeout(() => {
              this.mensaje = '';
            }, 3000);

          }, 100);
          return;
        }
        else{
          //guardamos si no existe
          this.materiaServicio.guardarMateria(this.materia).subscribe(
            (materiaGuardada: Materia)=>{
              this.regresarListaMateria();
              console.log('Materia Guardada: ',materiaGuardada);
            },
            (error) => {
              console.error('Error guardando materia', error);
            }
          )
        }
      },
      error: (err) => {
        console.error("Error verificando existencia de la materia", err);
      }
    })
  }
}
