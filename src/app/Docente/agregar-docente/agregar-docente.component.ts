import { Component, OnInit } from '@angular/core';
import { Docente } from '../docente';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { DocenteService } from '../docente.service';
import { CommonModule } from '@angular/common';
import { Anexo } from '../anexo';

@Component({
  selector: 'app-agregar-docente',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule, CommonModule],
  templateUrl: './agregar-docente.component.html',
  styleUrls: ['./agregar-docente.component.css']
})
export class AgregarDocenteComponent implements OnInit {

  docente: Docente = new Docente();
  mostrarAnexos: boolean = false;
  archivoBase64: string = '';
  nombreArchivo: string = '';

  constructor(private docenteServicio: DocenteService, private router: Router) { }

  ngOnInit(): void {

  }

  regresarListaDocente() {
    this.router.navigate(['/docentes'], {
      state: { mensaje: 'Docente registrado con exito.' }
    });
  }
  mensaje: string = '';//mensajito que se presentara en el flotante
  onSubmit(form: NgForm) {
    if (!form.valid || !this.esMayorDeEdad(this.docente.fecha_Nacimiento_D) || !this.esCorreoValido(this.docente.correo_Docente)) {
      this.mensaje = 'No se ha podido ingresar el docente.';//agregar texto de que mostrara en el flotante
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);

      return;
    }
    //Validamos que el docente no se repita
    this.docenteServicio.existeDocente(this.docente.duiDocente).subscribe({
      next: (existe) => {
        if (existe) {
          this.mensaje = 'Este DUI ya esta registrado.';//agregar texto de que mostrara en el flotante
          setTimeout(() => {

            window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

            // Ocultar mensaje después de unos segundos
            setTimeout(() => {
              this.mensaje = '';
            }, 3000);

          }, 100);

          return;
        } else {
          // Proceder a guardar
          this.docenteServicio.guardarDocente(this.docente).subscribe(
            (docenteGuardado: Docente) => {
              this.regresarListaDocente();
              console.log('Docente guardado:', docenteGuardado);
              if (this.archivoBase64) {
                //subimos anexos si hay
                this.subirAnexo(docenteGuardado.duiDocente!);
              }
            },
            (error) => {
              console.error('Error guardando docente', error);
            }
          );
        }
      },
      error: (err) => {
        console.error("Error verificando existencia de DUI", err);
      }
    });
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
  toggleAnexos(event: Event) {
    const input = event.target as HTMLInputElement;
    this.mostrarAnexos = input.checked;
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    this.nombreArchivo = file.name;
    console.log('Archivo seleccionado:', this.nombreArchivo);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.archivoBase64 = (reader.result as string).split(',')[1];
      console.log('Base64 del archivo:', this.archivoBase64.substring(0, 30) + '...');
    };
  }

  subirAnexo(duiDocente: string) {
    const anexo: Anexo = {
      nombre_Anexo_D: this.nombreArchivo,
      datos_Anexo_D: this.archivoBase64
    };

    console.log('Intentando subir anexo con DUI:', duiDocente);
    console.log('Anexo:', anexo);
    this.docenteServicio.agregarAnexo(duiDocente, anexo).subscribe(
      (anexoGuardado) => {
        console.log('Anexo guardado:', anexoGuardado);
      },
      (error) => {
        console.error('Error guardando anexo', error);
      }
    );
  }
  esMayorDeEdad(fechaStr: Date | string): boolean {
    if (!fechaStr) return false;

    const hoy = new Date();
    const nacimiento = new Date(fechaStr);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      return edad - 1 >= 18;
    }

    return edad >= 18;
  }
  esCorreoValido(correo: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  }
}
