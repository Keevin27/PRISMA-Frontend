import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { PaqueteEscolarComponent } from './PaqueteEscolar/paquete-escolar/paquete-escolar.component';
import { AgregarPaqueteEscolarComponent } from './PaqueteEscolar/agregar-paquete-escolar/agregar-paquete-escolar.component';
import { EntregarPaqueteEscolarComponent } from './PaqueteEscolar/entregar-paquete-escolar/entregar-paquete-escolar.component';
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
