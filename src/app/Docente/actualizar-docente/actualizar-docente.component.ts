import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Anexo } from '../anexo';
import { Docente } from '../docente';
import { DocenteService } from '../docente.service';
import { AnexoDTO } from '../anexo-dto';

@Component({
  selector: 'app-actualizar-docente',
  standalone: true,
  imports: [FormsModule,HttpClientModule,RouterModule,CommonModule],
  templateUrl: './actualizar-docente.component.html',
  styleUrls: ['./actualizar-docente.component.css']
})
export class ActualizarDocenteComponent implements OnInit{
  docente : Docente=new Docente();
  mostrarAnexos: boolean = false;
  anexosNuevos: Anexo[] = [];     //Este es el que vamos a guardar
  anexos: AnexoDTO[] = [];        //Viene desde BackEnd

  nuevoAnexo: Anexo = {
    nombre_Anexo_D: '',
    datos_Anexo_D: '',
    fecha_Anexo_D: new Date().toISOString().slice(0, 10)
  };

  constructor(private docenteServicio:DocenteService, private router:Router,private route:ActivatedRoute){}
  duiDocente:string='';

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const dui = params.get('dui');
    if (dui) {
      this.duiDocente = dui;

      this.docenteServicio.obtenerDocentePorDui(this.duiDocente).subscribe({
        next: (data) => { this.docente = data; },
        error: (e) => { console.error("Error cargando docente", e); }
      });

      this.docenteServicio.obtenerAnexosPorDocente(this.duiDocente).subscribe({
        next: (data) => { this.anexos = data; },
        error: (e) => { console.error("Error cargando anexos", e); }
      });
    } else {
      console.error("No se recibió DUI en la ruta");
    }
  });
  }
  
  onSubmit() {
    this.docenteServicio.actualizarDocente(this.docente.duiDocente,this.docente).subscribe(
      (response)=> {
        console.log('Docente actualizado con éxito', response);

        // Subir todos los anexos nuevos
        if (this.mostrarAnexos && this.anexosNuevos.length > 0) {
          this.anexosNuevos.forEach(anexo => {
            this.docenteServicio.agregarAnexo(this.docente.duiDocente, anexo).subscribe(
              (res) => console.log('Anexo guardado:', res),
              (err) => console.error('Error guardando anexo', err)
            );
          });
        }
        this.router.navigate(['/docentes']);
      },
    (error) => {
      console.error('Error actualizando docente', error);
    }
    );
  }
  descargarAnexo(id?: number): void {
    const url = `http://localhost:8080/anexos/docente/${id}/archivo`;
    window.open(url, '_blank');
  }
  toggleAnexos(event: Event) {
    const input = event.target as HTMLInputElement;
    this.mostrarAnexos = input.checked;
  }
  onArchivoSeleccionado(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!this.nuevoAnexo.nombre_Anexo_D) {
      this.nuevoAnexo.nombre_Anexo_D = file.name;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.nuevoAnexo.datos_Anexo_D = base64;
      console.log('Archivo convertido a base64.');
    };
  }

  agregarAnexo() {
    if (this.nuevoAnexo.nombre_Anexo_D && this.nuevoAnexo.datos_Anexo_D) {
      this.anexosNuevos.push({ ...this.nuevoAnexo });
      console.log('Anexo agregado localmente:', this.nuevoAnexo);
      this.nuevoAnexo = {
        nombre_Anexo_D: '',
        datos_Anexo_D: '',
        fecha_Anexo_D: new Date().toISOString().slice(0, 10)
      };
    } else {
      alert('Debes ingresar el nombre y el archivo del anexo.');
    }
  }
  eliminarAnexo(id: number):void {
    if (confirm('¿Estás seguro de eliminar este anexo del servidor?')) {
    this.docenteServicio.eliminarAnexo(id).subscribe({
      next: () => {
        this.anexos = this.anexos.filter(a => a.id_Anexo_D !== id);
        console.log('Anexo eliminado del servidor');
      },
      error: (err) => console.error('Error eliminando anexo', err)
    });
    }
  }
  validarDui(event: Event) {
      const input = event.target as HTMLInputElement;

      // Remueve todo lo que no sea número
      let valor = input.value.replace(/\D/g, '');

      // Aplica el formato ########-#
      if (valor.length > 8) {
        valor = valor.substring(0, 8) + '-' + valor.substring(8, 9);
      }

      // Actualiza el valor en el input y en el modelo
      input.value = valor;
      this.docente.duiDocente = valor;
    }

  validarTelefono(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').substring(0, 8); // solo números
    this.docente.telefono_Docente = input.value;
  }
  
    
}
