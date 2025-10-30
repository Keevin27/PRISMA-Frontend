import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Alumno } from '../alumno';
import { AlumnoService } from '../alumno.service';
import { Grado } from '../../Models/grado';
import { GradoService } from '../../Services/grado.service';
import { MatriculaService } from '../../Services/matricula.service';
import { Matricula } from '../../Models/matricula';

@Component({
  selector: 'app-actualizar-alumno',
  standalone: true,
  imports: [FormsModule, HttpClientModule, RouterModule, CommonModule],
  templateUrl: './actualizar-alumno.component.html',
  styleUrls: ['./actualizar-alumno.component.css']
})
export class ActualizarAlumnoComponent implements OnInit {
  matricula: Matricula = new Matricula();
  idAlumno: number = 0;
  grados: Grado[] = [];

  // Lista de opciones para el sexo del alumno
  sexos = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' }
  ];

  // Opciones de parentesco para el encargado
  parentescos = [
    { value: 'Madre', label: 'Madre' },
    { value: 'Padre', label: 'Padre' },
    { value: 'Abuela', label: 'Abuela' },
    { value: 'Abuelo', label: 'Abuelo' },
    { value: 'Tía', label: 'Tía' },
    { value: 'Tío', label: 'Tío' },
    { value: 'Hermana', label: 'Hermana' },
    { value: 'Hermano', label: 'Hermano' },
    { value: 'Madrina', label: 'Madrina' },
    { value: 'Padrino', label: 'Padrino' },
    { value: 'Otro', label: 'Otro' }
  ];

  // Opciones de convivencia del alumno
  viveConOpciones = [
    { value: 'Ambos padres', label: 'Ambos padres' },
    { value: 'Solo madre', label: 'Solo madre' },
    { value: 'Solo padre', label: 'Solo padre' },
    { value: 'Abuelos', label: 'Abuelos' },
    { value: 'Tíos', label: 'Tíos' },
    { value: 'Hermanos', label: 'Hermanos' },
    { value: 'Otros familiares', label: 'Otros familiares' },
    { value: 'Otros', label: 'Otros' }
  ];

  anioActual: number = new Date().getFullYear();

  constructor(
    private alumnoService: AlumnoService,
    private matriculaService: MatriculaService,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  mensaje: string = '';//mensajito que se presentara en el flotante

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idAlumno = parseInt(id);
        this.cargarAlumno();
      } else {
        // Si NO hay ID, entonces sí redirigir
        console.error("No se recibió ID en la ruta");
        this.router.navigate(['/alumnos']);
      }
    });
    if (this.mensaje) {
      setTimeout(() => this.mensaje = '', 2000);
    }
  }

  cargarAlumno(): void {

    this.matriculaService.findMatriculaByIdAlumno(this.idAlumno).subscribe({
      next: (data) => {
        this.matricula = data;

        if (this.matricula.alumno.fecha_nacimiento_alumno) {
          const fecha = new Date(this.matricula.alumno.fecha_nacimiento_alumno);
          (this.matricula as any).alumno.fecha_nacimiento_alumno = fecha.toISOString().split('T')[0];
        }
        if (this.matricula.alumno.estado_alumno === undefined || this.matricula.alumno.estado_alumno === null) {
          this.matricula.alumno.estado_alumno = true;
        }

      }, error: (e) => {
        console.error("Error cargando alumno", e);
        this.mensaje = `Error al cargar los datos del alumno.`;

        // Oculta el mensaje después de 2 segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 2000);
        this.router.navigate(['/alumnos'], {
          state: { mensaje: 'Alumno actualizado con exito.' }
        });
      }

    });
  }

  onSubmit(): void {
    console.log('Formulario enviado');
    console.log('Datos del alumno:', this.matricula.alumno);

    if (this.validarFormulario()) {
      this.actualizarAlumno();
    }
  }

  actualizarAlumno(): void {
    // Preparo los datos antes de enviar al servidor
    const alumnoData = { ...this.matricula.alumno };

    // Convierto la fecha del formato yyyy-mm-dd (input) al formato correcto
    if (alumnoData.fecha_nacimiento_alumno) {
      const fechaInput = alumnoData.fecha_nacimiento_alumno.toString();
      if (fechaInput.includes('-')) {
        const partes = fechaInput.split('-');
        // Si viene en formato yyyy-mm-dd del input, lo convierto a Date
        if (partes[0].length === 4) {
          alumnoData.fecha_nacimiento_alumno = new Date(`${partes[0]}-${partes[1]}-${partes[2]}`) as any;
        }
      }
    }

    // Convertir el estado a booleano si viene como string
    if (typeof alumnoData.estado_alumno === 'string') {
      alumnoData.estado_alumno = alumnoData.estado_alumno === 'true';
    }

    console.log('Datos a enviar:', alumnoData);

    this.alumnoService.actualizarAlumno(this.idAlumno, alumnoData).subscribe({
      next: (response) => {
        console.log('Alumno actualizado con éxito', response);
        this.router.navigate(['/alumnos'], {
          state: { mensaje: 'Alumno Actualizado con exito.' }
        });
      },
      error: (error) => {
        console.error('Error actualizando alumno', error);
        this.mensaje = 'Error al actualizar el alumno';
        setTimeout(() => {

          window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

          // Ocultar mensaje después de unos segundos
          setTimeout(() => {
            this.mensaje = '';
          }, 3000);

        }, 100);

        if (error.error && typeof error.error === 'string') {
          this.mensaje = error.error;
        } else if (error.status === 400) {
          this.mensaje = `NIE ya ingresado`;

          // Oculta el mensaje después de 2 segundos
          setTimeout(() => {

            window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

            // Ocultar mensaje después de unos segundos
            setTimeout(() => {
              this.mensaje = '';
            }, 3000);

          }, 100);
        } else if (error.status === 404) {
          this.mensaje = `Alumno no encontrado`;

          // Oculta el mensaje después de 2 segundos
          setTimeout(() => {

            window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

            // Ocultar mensaje después de unos segundos
            setTimeout(() => {
              this.mensaje = '';
            }, 3000);

          }, 100);
        }

      }
    });
  }

  validarFormulario(): boolean {
    const errores: string[] = [];

    if (!this.matricula.alumno.nie || this.matricula.alumno.nie.toString().trim() === '') {
      errores.push('El NIE es obligatorio.');
    } else if (!/^\d{7}$/.test(this.matricula.alumno.nie.toString())) {
      errores.push('El NIE debe tener 7 dígitos.');
    }

    if (!this.matricula.alumno.nombre_alumno || this.matricula.alumno.nombre_alumno.trim() === '') {
      errores.push('El nombre del alumno es obligatorio.');
    }

    if (!this.matricula.alumno.apellido_alumno || this.matricula.alumno.apellido_alumno.trim() === '') {
      errores.push('El apellido del alumno es obligatorio.');
    }

    if (!this.matricula.alumno.fecha_nacimiento_alumno) {
      errores.push('La fecha de nacimiento es obligatoria.');
    }

    if (!this.matricula.alumno.sexo_a) {
      errores.push('El sexo es obligatorio.');
    }

    if (!this.matricula.alumno.direccion_a || this.matricula.alumno.direccion_a.trim() === '') {
      errores.push('La dirección es obligatoria.');
    }

    if (this.matricula.alumno.correo_alumno && !this.validarEmail(this.matricula.alumno.correo_alumno)) {
      errores.push('El formato del correo del alumno no es válido.');
    }

    if (this.matricula.alumno.correo_encargado && !this.validarEmail(this.matricula.alumno.correo_encargado)) {
      errores.push('El formato del correo del encargado no es válido.');
    }

    if (this.matricula.alumno.dui_encargado && !this.validarDUI(this.matricula.alumno.dui_encargado)) {
      errores.push('El formato del DUI del encargado no es válido (ej: 12345678-9).');
    }

    if (errores.length > 0) {
      this.mensaje = errores[0];

      // Mover al inicio
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Ocultar después de unos segundos
      setTimeout(() => {
        this.mensaje = '';
      }, 3000);

      return false;
    }

    return true;
  }


  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  private validarDUI(dui: string): boolean {
    const duiRegex = /^\d{8}-\d{1}$/;
    return duiRegex.test(dui.trim());
  }

  validarNie(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Solo permite números y limita a 7 dígitos
    let valor = input.value.replace(/\D/g, '').substring(0, 7);
    input.value = valor;
    this.matricula.alumno.nie = parseInt(valor) || 0;
  }

  validarTelefono(event: Event, campo: 'alumno' | 'encargado'): void {
    const input = event.target as HTMLInputElement;
    // Solo permite números y limita a 8 dígitos
    let valor = input.value.replace(/\D/g, '').substring(0, 8);
    input.value = valor;

    if (campo === 'alumno') {
      this.matricula.alumno.telefono_alumno = valor;
    } else {
      this.matricula.alumno.telefono_encargado = valor;
    }
  }

  validarDui(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remueve todo lo que no sea número
    let valor = input.value.replace(/\D/g, '');

    // Aplica el formato ########-#
    if (valor.length > 8) {
      valor = valor.substring(0, 8) + '-' + valor.substring(8, 9);
    }

    // Actualiza el valor en el input y en el modelo
    input.value = valor;
    this.matricula.alumno.dui_encargado = valor;
  }

  // Formateo automático del DUI mientras el usuario escribe
  formatearDUI(event: any): void {
    let valor = event.target.value.replace(/\D/g, ''); // Quito caracteres no numéricos
    if (valor.length >= 8) {
      valor = valor.substring(0, 8) + '-' + valor.substring(8, 9);
    }
    this.matricula.alumno.dui_encargado = valor;
  }

  onEmailChange(event: Event, campo: 'alumno' | 'encargado'): void {
    const input = event.target as HTMLInputElement;
    const email = input.value;

    if (email && !this.validarEmail(email)) {
      input.setCustomValidity('Formato de email inválido');
    } else {
      input.setCustomValidity('');
    }

    if (campo === 'alumno') {
      this.matricula.alumno.correo_alumno = email;
    } else {
      this.matricula.alumno.correo_encargado = email;
    }
  }

  cancelar(): void {
    this.router.navigate(['/alumnos'], {
      state: { mensaje: 'Se cancelo el proceso de  editar alumno' }
    });
  }
}