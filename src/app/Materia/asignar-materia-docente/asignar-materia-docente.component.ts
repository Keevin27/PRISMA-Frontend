import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Materia } from '../materia';
import { MateriaService } from '../materia.service';
import { Docente } from '../../Docente/docente';
import { Subscription } from 'rxjs';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-asignar-materia-docente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './asignar-materia-docente.component.html',
  styleUrl: './asignar-materia-docente.component.css'
})

export class AsignarMateriaDocenteComponent implements OnInit {
  formAsignacion!: FormGroup;
  docentes: Docente[] = [];
  grados: any[] = [];
  materias: Materia[] = [];

  mensaje: string='';
  anioDiferente: boolean = false;
  constructor(private fb: FormBuilder, private materiaService: MateriaService) {}

  asignacionesPorGrado: Record<string, { duiDocente: string; nombreDocente?: string }> = {};

  private subs: Subscription[] = [];
  gradosSeleccionados: number[] = [];

  ngOnInit(): void {  
    this.formAsignacion = this.fb.group({
      duiDocente: ['', Validators.required],
      codigoMateria: ['', Validators.required]
    });


    this.cargarDocentes();
    // this.cargarGrados();
    this.cargarMaterias();

    const subMat = this.formAsignacion.get('codigoMateria')!.valueChanges.subscribe((codigo: string) => {
      if (codigo) {
        this.cargarAsignaciones(codigo);
        this.cargarGradosPorMateria(codigo);
      } else {
        // this.asignacionesPorGrado = {};
        this.asignacionesPorGrado = {};
        this.grados = [];
      }
      // limpiar selección de grados al cambiar materia
      this.gradosSeleccionados = [];
      this.actualizarAnioDesdeGrados();
    });
    this.subs.push(subMat);

    const subDoc = this.formAsignacion.get('duiDocente')!.valueChanges.subscribe((dui: string) => {
      console.log('Docente seleccionado:', dui);

      this.gradosSeleccionados = this.gradosSeleccionados.filter(id => {
        const asign = this.asignacionesPorGrado[String(id)];
        return !(asign && asign.duiDocente && asign.duiDocente !== dui);
      });
    });
    this.subs.push(subDoc);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  

  }
  cargarMaterias() {
    this.materiaService.obtenerListaMaterias().subscribe({
      next: (data) =>{
        this.materias = data;
        console.log('materias cargadas',this.materias.length,this.materias);
      },
      error: (err) => {console.error('Error cargando materias', err);
        }
      });
  }

  cargarAsignaciones(codigoMateria: string) {
    this.asignacionesPorGrado = {};
    this.materiaService.obtenerAsignacionesPorMateria(codigoMateria).subscribe({
      next: (data) => {
        for (const a of data) {
          const id = a.gradoId ?? a.idGrado ?? a.grado_id ?? a.id ?? a.id_grado;
          if (id != null) {
            const key = String(id);
            this.asignacionesPorGrado[key] = {
              duiDocente: a.duiDocente ?? a.dui ?? a.docenteDui ?? a.dui_docente,
              nombreDocente: a.nombreDocente ?? a.nombre ?? a.nombre_docente
            };
          }
        }
        console.log('Asignaciones por grado:', this.asignacionesPorGrado);
      },
      error: (err) => {
        console.error('Error cargando asignaciones por materia', err);
        this.asignacionesPorGrado = {};
      }
    });
  }

  getGradoIdValue(grado: any): string {
    return String(grado?.id ?? grado?.id_grado ?? grado?.gradoId ?? grado?.codigo ?? '');
  }

  isGradoDisabled(grado: any): boolean {
    const id = this.getGradoIdValue(grado);
    const asign = this.asignacionesPorGrado[id];
    // si existe asignación y pertenece a un docente distinto, deshabilitar
    if (asign && asign.duiDocente && asign.duiDocente !== this.formAsignacion.get('duiDocente')?.value) {
      return true;
    }
    // si existe asignación y pertenece al mismo docente queremos que aparezca activo pero no editable (disabled)
   
    return false;
  }

   isGradoChecked(grado: any): boolean {
    const id = this.getGradoIdValue(grado);
    const asign = this.asignacionesPorGrado[id];
    const selectedDocente = this.formAsignacion.get('duiDocente')?.value;
    if (asign) {
      // checked si asignado y pertenece al docente seleccionado
      return asign.duiDocente === selectedDocente;
    }
    // si no hay asignación, usar selección del usuario
    const numericId = Number(id);
    return this.gradosSeleccionados.includes(numericId);
  }

  toggleGrado(grado: any,event:any) {
    event.stopPropagation();
    const id = this.getGradoIdValue(grado);
    const checked = (event.target as HTMLInputElement).checked;
  const numericId = Number(id);
  const duiDocente = this.formAsignacion.get('duiDocente')?.value;
  const codigoMateria = this.formAsignacion.get('codigoMateria')?.value;

  if (!duiDocente || !codigoMateria) return;

  const asign = this.asignacionesPorGrado[id];

  // Si el switch se ACTIVÓ
  if (checked) {
    if (!this.gradosSeleccionados.includes(numericId)) {
      this.gradosSeleccionados.push(numericId);
    }
  } 
  // Si el switch se DESACTIVÓ
  else {
    // quitar de selección
    this.gradosSeleccionados = this.gradosSeleccionados.filter(g => g !== numericId);

    // si el grado ya estaba asignado antes, eliminar del backend
    if (asign && asign.duiDocente === duiDocente) {
      if (!confirm(`¿Desea eliminar la asignación del grado ${grado.nombre ?? numericId}?\nEsta acción no se puede deshacer.`)) {
        (event.target as HTMLInputElement).checked = true;
        return;
      }
      this.materiaService.eliminarAsignacion(duiDocente, codigoMateria, numericId).subscribe({
        next: () => {
          console.log(`Asignación eliminada: grado ${numericId}`);
          // actualizar visualmente el registro
          delete this.asignacionesPorGrado[id];
          this.mensaje = `Asignación eliminada correctamente del grado ${grado.nombre ?? numericId}`;
        },
        error: (err) => {
          console.error('Error al eliminar asignación', err);
          this.mensaje = 'Error al eliminar la asignación. Intente nuevamente.';
          // revertir visualmente el cambio
          (event.target as HTMLInputElement).checked = true;
          if (!this.gradosSeleccionados.includes(numericId))
            this.gradosSeleccionados.push(numericId);
        }
      });
    }
  }

  this.actualizarAnioDesdeGrados();
  }
  trackByGrado = (index: number, grado: any): string | number => {
  return this.getGradoIdValue(grado) || index;
  };

  private getAnioFromGrado(grado: any): number | null {
    return grado?.anioAcademico ?? grado?.anio ?? grado?.anio_academico ?? null;
  }

  private actualizarAnioDesdeGrados(): void {
    const seleccionados = this.grados.filter(g => this.gradosSeleccionados.includes(g.id));
    const anios = Array.from(new Set(seleccionados.map(g => this.getAnioFromGrado(g)).filter(a => a !== null))) as number[];
    const anioControl = this.formAsignacion.get('anioAcademico');
    this.anioDiferente = false;

    if(anios.length === 1) {
      anioControl?.patchValue(anios[0]);
      anioControl?.disable();
    } else if (anios.length === 0 && this.gradosSeleccionados.length > 0) {
      anioControl?.enable();
      anioControl?.reset();
    } else if (anios.length > 1) {
      this.anioDiferente = true;
      anioControl?.enable();
      anioControl?.reset();
    }else if(this.gradosSeleccionados.length === 0){
      anioControl?.enable();
      anioControl?.reset();
    }
  }


  cargarDocentes() {
  this.materiaService.obtenerListaDocentes().subscribe({
      next: (data) => {
        this.docentes = data;
        console.log('Docentes cargados:', this.docentes.length, this.docentes);
      },
      error: (err) => console.error('Error cargando docentes', err)
    });
  } 
  cargarGradosPorMateria(codigoMateria: string) {
    this.materiaService.obtenerGradosActivos().subscribe({
      next: (data) => {
        this.grados = data;
        console.log('Grados disponibles cargados:', this.grados.length, this.grados);
      },
      error: (err) => {
        console.error('Error cargando grados disponibles', err);
        this.grados = [];
      }
    });
  }


  // cargarGrados() {
  //   this.materiaService.obtenerGradosActivos().subscribe({
  //     next: (data) => {
  //       this.grados = data;
  //       console.log('Grados cargados:', this.grados.length, this.grados);
  //     },
  //     error: (err) => {
  //       console.error('Error cargando grados', err);
  //     }
  //   });
  // }


  guardarAsignacion() {
    this.formAsignacion.markAllAsTouched();

    if (!this.formAsignacion.get('duiDocente')?.valid || !this.formAsignacion.get('codigoMateria')?.valid ){
      this.mensaje = 'Por favor complete todos los campos obligatorios.';
      return;
    }
    if(this.gradosSeleccionados.length===0){
      this.mensaje = 'Seleccione al menos un grado.';
      return;
    }

    const gradosSeleccionadosObjs = this.grados.filter(g => 
      this.gradosSeleccionados.includes(Number(this.getGradoIdValue(g)))
    );
    const anios = Array.from(
      new Set(gradosSeleccionadosObjs.map(g => g.anioAcademico?.anio ?? null).filter(a => a !== null))
    );
    const anioAcademico = anios[0];
    

    const asignacion = {
      duiDocente: this.formAsignacion.value.duiDocente,
      codigoMateria: this.formAsignacion.value.codigoMateria,
      anioAcademico: anioAcademico,
      grados: this.gradosSeleccionados
    };
    console.log('Enviando asignación:', asignacion);

    this.materiaService.asignarDocenteAMateria(asignacion).subscribe({
      next: () => {
        this.mensaje = 'Asignación guardada correctamente';
        // opcional: reset del formulario/selecciones
        this.formAsignacion.reset();
        this.gradosSeleccionados = [];
      },
      error: (err) => {
        console.error('Error al guardar la asignación', err);
        this.mensaje = 'Error al guardar la asignación'+ (err.error?.message || err.message);
      }
    });
  }
  validoParaGuardar(): boolean {
    return!! (
      this.formAsignacion.get('duiDocente')?.valid &&
      this.formAsignacion.get('codigoMateria')?.valid &&
      this.gradosSeleccionados.length > 0
    );
  }
  
}

