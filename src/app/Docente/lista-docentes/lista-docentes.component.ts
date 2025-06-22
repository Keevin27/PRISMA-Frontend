import { Component } from '@angular/core';
import { Docente } from '../docente';
import { DocenteService } from '../docente.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-docentes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-docentes.component.html',
  styleUrls: ['./lista-docentes.component.css']
})
export class ListaDocentesComponent {
  docentes:Docente[]; 
  mensajeCambioEstado: string = '';
  mostrarMensaje: boolean = false;


  mensaje: string = '';
  constructor(private docenteServicio: DocenteService, private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { mensaje?: string };
    if (state?.mensaje) {
      this.mensaje = state.mensaje;
    }
  }

  ngOnInit(): void {
    this.obtenerDocentes();
    if (this.mensaje) {
    setTimeout(() => this.mensaje = '', 2000);}
  }

  private obtenerDocentes() {
    this.docenteServicio.obtenerListaDocentes().subscribe(dato => {
      this.docentes = dato;
    });
  }
  cambiarEstadoActividad(docente: Docente) {
    const nuevoEstado = !docente.docente_Activo;
    // Actualiza el campo localmente para el UI
    docente.docente_Activo = nuevoEstado;

    // Llama a un servicio para actualizar el estado en el backend (opcional)
    this.docenteServicio.actualizarEstadoDocente(docente.duiDocente!, nuevoEstado).subscribe({
      next: () => {
        this.mensajeCambioEstado = `Se cambió el estado del docente a ${nuevoEstado ? 'activo' : 'inactivo'}.`;
        this.mostrarMensaje = true;
        
        // Oculta el mensaje después de 2 segundos
        setTimeout(() => {
          this.mostrarMensaje = false;
          this.mensajeCambioEstado = '';
        }, 2000);
      },
      error: err => {
        console.error('Error al cambiar el estado del docente', err);
        // Revertir si falla
        docente.docente_Activo = !nuevoEstado;
      }
    });
  }
  //Imprime toda la lista de docentes activos
  imprimirDocentesTodos() {
    this.docenteServicio.imprimirTodosLosDocentes().subscribe(
      (pdfBlob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'docentes_activos.pdf'; // o abre con _blank si prefieres
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error descargando el PDF:', error);
      }
    );
  }
  imprimirDocente(duiDocente: string,nombre_Docente:string) {
    this.docenteServicio.imprimirExpedienteDocente(duiDocente).subscribe(
      (pdfBlob) => {
        const blob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expediente_${nombre_Docente}_${duiDocente}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Error al generar el PDF del docente:', error);
      }
    );
  }



  
}
