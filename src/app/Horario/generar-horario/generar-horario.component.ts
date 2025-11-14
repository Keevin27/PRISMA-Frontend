import { CommonModule} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HorarioService } from '../horario.service';
import { MateriaService } from '../../Materia/materia.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Auth/auth.service';

declare var bootstrap: any;


@Component({
  
  selector: 'app-generar-horario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generar-horario.component.html',
  styleUrl: './generar-horario.component.css'
  
  
})
export class GenerarHorarioComponent implements OnInit{
  rolesUsuario: string[] = [];//PARA RESTRINGIR

  mensaje: string = '';
  mensajeTipo: 'success' | 'error' | '' = '';
  modo: 'grado' | 'docente' = 'grado';
  grados: any[] = [];
  docentes: any[] = [];

  coloresMaterias: Record<string, string> = {};


  idGradoSeleccionado: number | null = null;
  duiDocenteSeleccionado: string | null = null;

  dias: string[] = [];
  horas: string[] = [];

  matriz: any[][] = []; // tabla de asignaciones

  cargando: boolean = false;

  constructor(private horarioService: HorarioService, private materiaService:MateriaService, private authService: AuthService) { }

  ngOnInit(): void {
    this.rolesUsuario = this.authService.getUserRoles();
    this.cargarGrados();
    this.cargarDocentes();
  }

  BloquearSecretaria(): boolean {  //PARA RESTRINGIR
    return !this.rolesUsuario.includes('ROLE_SECRETARIA');
  }

  cargarGrados() {
    this.materiaService.obtenerGradosActivos().subscribe({
      next: (data) => (this.grados = data),
      error: (err) => console.error('Error cargando grados', err)
    });
  }

  cargarDocentes() {
    this.materiaService.obtenerListaDocentes().subscribe({
      next: (data) => (this.docentes = data),
      error: (err) => console.error('Error cargando docentes', err)
    });
  }

  abrirModalConfirmacion() {
    const modal = new bootstrap.Modal(
      document.getElementById('modalConfirmarGeneracion')
    );
    modal.show();

    // Binding del botón confirmar
    setTimeout(() => {
      document
        .getElementById('btnConfirmarGeneracion')!
        .addEventListener('click', () => {
          modal.hide();
          this.generarHorarios(); // Ejecutar generación real
        });
    }, 200);
  }

  generarHorarios() {

    this.cargando = true;
    this.horarioService.generarHorarios().subscribe({
      next: (msg) => {
        this.mostrarMensaje(msg, 'success');
        this.cargando = false;
      },
      error: (err) => {
        this.mostrarMensaje(' Error al generar horarios', 'error');
        console.error(err);
        this.cargando = false;
      }
    });
  }

  verHorarios() {
    if (this.modo === 'grado' && this.idGradoSeleccionado) {
      this.horarioService.obtenerPorGrado(this.idGradoSeleccionado).subscribe({
        next: (data) => this.construirMatriz(data),
        error: (err) => console.error(err)
      });
    } else if (this.modo === 'docente' && this.duiDocenteSeleccionado) {
      this.horarioService.obtenerPorDocente(this.duiDocenteSeleccionado).subscribe({
        next: (data) => this.construirMatriz(data),
        error: (err) => console.error(err)
      });
    }
  }

  construirMatriz(asignaciones: any[]) {
    // obtener lista de días y horas únicas
    const diasSet = new Set<string>();
    const horasSet = new Set<string>();

    asignaciones.forEach(a => {
      diasSet.add(a.horario.dia.nombre_Dia);
      horasSet.add(a.horario.hora.hora_inicio + ' - ' + a.horario.hora.hora_fin);
    });

    this.dias = Array.from(diasSet);
    this.horas = Array.from(horasSet);

    // ordenar (opcional, si las horas tienen formato HH:mm)
    this.horas.sort((a, b) => {
      const getMinutes = (str: string) => {
        const hora = str.split(' - ')[0];      // "07:00"
        const [h, m] = hora.split(':').map(Number);
        return h * 60 + m;
      };
      return getMinutes(a) - getMinutes(b);
    });

    // construir matriz vacía
    this.matriz = this.horas.map(() =>
      this.dias.map(() => '')
    );

    // rellenar
    for (const a of asignaciones) {
      const diaIdx = this.dias.indexOf(a.horario.dia.nombre_Dia);
      const horaStr = a.horario.hora.hora_inicio + ' - ' + a.horario.hora.hora_fin;
      const horaIdx = this.horas.indexOf(horaStr);

      if (diaIdx >= 0 && horaIdx >= 0) {
        if (this.modo === 'grado') {
          this.matriz[horaIdx][diaIdx] = `${a.bloque.materia.nombre_materia}\n${a.bloque.docente.nombre_Docente}`;
        } else {
          this.matriz[horaIdx][diaIdx] = `${a.bloque.materia.nombre_materia}\nGrado\n ${a.bloque.grado.nombre_grado} ${a.bloque.grado.seccion}`;
        }
      }
    }
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
  this.mensaje = texto;
  this.mensajeTipo = tipo;

  setTimeout(() => {
    this.mensaje = '';
    this.mensajeTipo = '';
  }, 4000); // desaparece en 4 segundos
}

  imprimirHorario() {
    const tablaOriginal = document.querySelector('.tabla-horario table') as HTMLElement;

    if (!tablaOriginal) {
      console.error('No se encontró la tabla de horario para imprimir');
      this.mostrarMensaje('No hay horario para imprimir', 'error');
      return;
    }

    const tablaClonada = tablaOriginal.cloneNode(true) as HTMLElement;

    const ventana = window.open('', '_blank', 'width=900,height=650');

    if (!ventana) {
      alert("No se pudo abrir la ventana de impresión");
      return;
    }

    ventana.document.write(`
      <html>
        <head>
          <title>Horario</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
            }
            h2 {
              text-align: center;
              margin-bottom: 20px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
            }
            th, td { 
              border: 1px solid #000; 
              padding: 7px; 
              text-align: center; 
              font-size: 0.85rem;
              white-space: pre-wrap;
            }
            th { 
              background-color: #343a40; 
              color: white; 
            }
            td { 
              background: #f8f9fa; 
            }
          </style>
        </head>

        <body>
          <h2>Horario ${this.modo === 'grado' ? 'del grado'  :'del docente'}</h2>
          ${tablaClonada.outerHTML}
        </body>
      </html>
    `);

    ventana.document.close();

    setTimeout(() => {
      ventana.print();
    }, 300);
  }
}