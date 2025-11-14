import { CommonModule } from '@angular/common';
import { Component, OnInit} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Materia } from '../materia';
import { AuthService } from '../../Auth/auth.service';
import { MateriaService } from '../materia.service';

@Component({
  selector: 'app-lista-materias',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './lista-materias.component.html',
  styleUrl: './lista-materias.component.css'
})
export class ListaMateriasComponent implements OnInit{
  rolesUsuario: string[] = [];//PARA RESTRINGIR
  materias:Materia[];

  mensaje: string = '';
  constructor(private materiaServicio: MateriaService, private router: Router, private authService: AuthService) {//PARA RESTRINGIR
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { mensaje?: string };
    if (state?.mensaje) {
      this.mensaje = state.mensaje;
    }
  }

  ngOnInit():void{
    
    this.obtenerMaterias();
    if (this.mensaje) {
    setTimeout(() => this.mensaje = '', 2000);}
  }
  private obtenerMaterias(){
    this.materiaServicio.obtenerListaMaterias().subscribe(dato =>{
      this.materias=dato;
    });
  }
  cambiarEstadoActividad(materia:Materia){
    const nuevoEstado = !materia.estado_materia;
    // Actualiza el campo localmente para el UI
    materia.estado_materia=nuevoEstado;

    this.materiaServicio.actualizarEstadoMateria(materia.codigo_materia!,nuevoEstado).subscribe({
      next: () => {
        this.mensaje = `Se cambió el estado de la materia a ${nuevoEstado ? 'activo' : 'inactivo'}.`;
        
        // Oculta el mensaje después de 2 segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 2000);
      },
       error: err => {
        console.error('Error al cambiar el estado de la materia', err);
        // Revertir si falla
        materia.estado_materia = !nuevoEstado;
      }
    });

    
  }


  BloquearSecretaria(): boolean {  //PARA RESTRINGIR
    return !this.rolesUsuario.includes('ROLE_SECRETARIA');
  }

}
