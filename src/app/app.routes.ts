import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { PaqueteEscolarComponent } from './PaqueteEscolar/paquete-escolar/paquete-escolar.component';
import { AgregarPaqueteEscolarComponent } from './PaqueteEscolar/agregar-paquete-escolar/agregar-paquete-escolar.component';
import { EntregarPaqueteEscolarComponent } from './PaqueteEscolar/entregar-paquete-escolar/entregar-paquete-escolar.component';
import { AgregarDocenteComponent } from './Docente/agregar-docente/agregar-docente.component';
import { ActualizarDocenteComponent } from './Docente/actualizar-docente/actualizar-docente.component';
import { AgregarAlumnoComponent } from './Alumno/agregar-alumno/agregar-alumno.component';
import { ActualizarAlumnoComponent } from './Alumno/actualizar-alumno/actualizar-alumno.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'paquetesescolares', component:PaqueteEscolarComponent,
      },
      {
        path: 'paquetesescolares/agregar-paqueteescolar', component:AgregarPaqueteEscolarComponent,
      },
      {
        path: 'entrega-paquetes-escolares', component:EntregarPaqueteEscolarComponent,
      },

      {
        path: 'alumnos',
        loadComponent: () =>
          import('./Alumno/lista-alumnos/lista-alumnos.component').then(m => m.ListaAlumnosComponent),
      },
      {
        path: 'alumnos/agregarAlumno',
        component:AgregarAlumnoComponent
      },

      {
        path: 'alumnos/ver/:id',
        loadComponent: () =>
          import('./Alumno/ver-alumno/ver-alumno.component').then(m => m.VerAlumnoComponent),
      },

      {
        path: 'alumnos/:id',
        component:ActualizarAlumnoComponent
      },

      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.component').then(m => m.HomeComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'docentes',
        loadComponent: () =>
          import('./Docente/lista-docentes/lista-docentes.component').then(m => m.ListaDocentesComponent),
      },
      {
        path: 'docentes/agregarDocente', component:AgregarDocenteComponent
      },
      {
        path: 'docentes/:dui', component:ActualizarDocenteComponent
      }
    ],
  },
];
