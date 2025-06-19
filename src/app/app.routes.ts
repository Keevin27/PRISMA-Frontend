import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { AgregarDocenteComponent } from './Docente/agregar-docente/agregar-docente.component';
import { ActualizarDocenteComponent } from './Docente/actualizar-docente/actualizar-docente.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./PaqueteEscolar/paquete-escolar/paquete-escolar.component').then((m) => m.PaqueteEscolarComponent),
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
