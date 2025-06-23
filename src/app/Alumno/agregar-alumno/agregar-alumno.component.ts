import { Component, OnInit } from '@angular/core';
import { Alumno } from '../alumno';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AlumnoService } from '../alumno.service';
import { Grado } from '../../Models/grado';
import { GradoService } from '../../Services/grado.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agregar-alumno',
  standalone: true,
  imports: [RouterModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './agregar-alumno.component.html',
  styleUrl: './agregar-alumno.component.css'
})
export class AgregarAlumnoComponent implements OnInit {
  alumno: Alumno = new Alumno();
  grados: Grado[] = [];
  isEditing: boolean = false;
  alumnoId: number = 0;

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
    private gradoService: GradoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  mensaje: string = '';//mensajito que se presentara en el flotante

  ngOnInit(): void {
    this.cargarGrados();

    // Verifico si estamos en modo edición
    this.alumnoId = +this.route.snapshot.params['id'] || 0;
    if (this.alumnoId > 0) {
      this.isEditing = true;
      this.cargarAlumno();
    } else {
      // Establezco valores por defecto para nuevo alumno
      this.alumno.estado_alumno = true;
    }
  }

  cargarGrados(): void {
    // Obtengo la lista de grados disponibles
    this.gradoService.obtenerGradosPorAnyo(this.anioActual).subscribe({
      next: (data: Grado[]) => {
        this.grados = data;
      },
      error: (error: any) => {
        console.error('Error al cargar grados:', error);
        this.mensaje = 'Error al cargar grados';//agregar texto de que mostrara en el flotante
        setTimeout(() => {

          window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

          // Ocultar mensaje después de unos segundos
          setTimeout(() => {
            this.mensaje = '';
          }, 3000);

        }, 100);
      }
    });
  }

  cargarAlumno(): void {
    // Cargo los datos del alumno para edición
    this.alumnoService.obtenerAlumnoPorId(this.alumnoId).subscribe({
      next: (data: Alumno) => {
        this.alumno = data;
        // Convierto la fecha al formato que acepta el input HTML
        if (this.alumno.fecha_nacimiento_alumno) {
          const fecha = new Date(this.alumno.fecha_nacimiento_alumno);
          (this.alumno as any).fecha_nacimiento_alumno = fecha.toISOString().split('T')[0];
        }
      },
      error: (error: any) => {
        console.error('Error al cargar alumno:', error);
        this.mensaje = 'Error al cargar el alumno';//agregar texto de que mostrara en el flotante
        setTimeout(() => {

          window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

          // Ocultar mensaje después de unos segundos
          setTimeout(() => {
            this.mensaje = '';
          }, 3000);

        }, 100);
      }
    });
  }

  guardarAlumno(): void {
    // Preparo los datos antes de enviar al servidor
    const alumnoData = { ...this.alumno };

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

    // Validar que se haya seleccionado un grado
    if (!alumnoData.grado || (typeof alumnoData.grado === 'object' && !alumnoData.grado.id_grado)) {
      this.mensaje = 'Seleccione un grado valido.';
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);
      return;
    }

    // Asegurar que el grado tenga el formato correcto
    if (typeof alumnoData.grado === 'string' || typeof alumnoData.grado === 'number') {
      const gradoSeleccionado = this.grados.find(g =>
        (typeof alumnoData.grado === 'number' && g.id_grado === alumnoData.grado) ||
        (typeof alumnoData.grado === 'string' && g.id_grado === parseInt(alumnoData.grado))
      );
      if (gradoSeleccionado) {
        alumnoData.grado = gradoSeleccionado;
      } else {
        this.mensaje = 'Seleccione un grado valido.';
        setTimeout(() => {

          window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

          // Ocultar mensaje después de unos segundos
          setTimeout(() => {
            this.mensaje = '';
          }, 3000);

        }, 100);
        return;
      }
    }

    console.log('Datos a enviar:', alumnoData);

    if (this.isEditing) {
      // Actualizo alumno existente
      this.alumnoService.actualizarAlumno(this.alumnoId, alumnoData).subscribe({
        next: (response: any) => {
          this.mensaje = 'Se actualizo el Alumno';
          setTimeout(() => {

            window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

            // Ocultar mensaje después de unos segundos
            setTimeout(() => {
              this.mensaje = '';
            }, 3000);

          }, 100);
          this.irGestionarAlumnos();
        },
        error: (error: any) => {
          this.mensaje = 'Error al actualizar Alumno';
          setTimeout(() => {

            window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

            // Ocultar mensaje después de unos segundos
            setTimeout(() => {
              this.mensaje = '';
            }, 3000);

          }, 100);
        }
      });
    } else {
      // Creo nuevo alumno
      this.alumnoService.agregarAlumno(alumnoData).subscribe({
        next: (response: any) => {
          this.irGestionarAlumnos();
        },
        error: (error: any) => {
          this.mensaje = 'Error al insertar el Alumno.';
          setTimeout(() => {

            window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

            // Ocultar mensaje después de unos segundos
            setTimeout(() => {
              this.mensaje = '';
            }, 3000);

          }, 100);
        }
      });
    }
  }

  irGestionarAlumnos(): void {
    this.router.navigate(['/alumnos'], {
      state: { mensaje: 'Alumno registrado con exito.' }
    });
  }

  onSubmit(): void {
    if (this.validarFormulario()) {
      this.guardarAlumno();
    }
  }

  validarFormulario(): boolean {
    // Valido que los campos obligatorios estén completos
    if (!this.alumno.nie || this.alumno.nie.toString().trim() === '') {
      this.mensaje = 'Ingrese un NIE valido';//agregar texto de que mostrara en el flotante
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);
      return false;
    }

    if (!this.alumno.nombre_alumno || this.alumno.nombre_alumno.trim() === '') {
      this.mensaje = 'Ingrese el Nombre del alumno';//agregar texto de que mostrara en el flotante
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);
      return false;
    }

    if (!this.alumno.apellido_alumno || this.alumno.apellido_alumno.trim() === '') {
      this.mensaje = 'Ingrese el apellido del alumno';//agregar texto de que mostrara en el flotante
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);
      return false;
    }

    if (!this.alumno.grado) {
      this.mensaje = 'seleccione el grado del alumno';//agregar texto de que mostrara en el flotante
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);
      return false;
    }

    // Valido formato del NIE (7 dígitos)
    const nieRegex = /^\d{7}$/;
    if (!nieRegex.test(this.alumno.nie.toString())) {
      this.mensaje = 'Ingrese un NIE valido de 7 digitos';//agregar texto de que mostrara en el flotante
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);
      return false;
    }

    // Valido correos electrónicos si fueron proporcionados
    if (this.alumno.correo_alumno && !this.validarEmail(this.alumno.correo_alumno)) {
      this.mensaje = 'El formato del correo no es valido';//agregar texto de que mostrara en el flotante
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);
      return false;
    }

    if (this.alumno.correo_encargado && !this.validarEmail(this.alumno.correo_encargado)) {
      this.mensaje = 'el formato del correo no es valido';//agregar texto de que mostrara en el flotante
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);
      return false;
    }

    // Valido formato del DUI si fue proporcionado
    if (this.alumno.dui_encargado && !this.validarDUI(this.alumno.dui_encargado)) {
      this.mensaje = 'El formato del dui no es valido';//agregar texto de que mostrara en el flotante
      setTimeout(() => {

        window.scrollTo({ top: 0, behavior: 'smooth' }); //Me lleva al inicio de la vista para poder leer el mensaje

        // Ocultar mensaje después de unos segundos
        setTimeout(() => {
          this.mensaje = '';
        }, 3000);

      }, 100);
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

  // Limpio todos los campos del formulario
  limpiarFormulario(): void {
    this.alumno = new Alumno();
    this.alumno.estado_alumno = true;
    this.isEditing = false;
  }

  // Formateo automático del DUI mientras el usuario escribe
  formatearDUI(event: any): void {
    let valor = event.target.value.replace(/\D/g, ''); // Quito caracteres no numéricos
    if (valor.length >= 8) {
      valor = valor.substring(0, 8) + '-' + valor.substring(8, 9);
    }
    this.alumno.dui_encargado = valor;
  }
}