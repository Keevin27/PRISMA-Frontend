import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { PaqueteEscolarComponent } from './PaqueteEscolar/paquete-escolar/paquete-escolar.component';
import { AgregarPaqueteEscolarComponent } from './PaqueteEscolar/agregar-paquete-escolar/agregar-paquete-escolar.component';
import { AsistenciaListaComponent } from './AsistenciaAlumno/asistencia-lista/asistencia-lista.component';
import { AgregarAsistenciaComponent } from './AsistenciaAlumno/agregar-asistencia/agregar-asistencia.component';

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
        path: 'asistenciaalumno', component:AgregarAsistenciaComponent,
      },
      {
        path: 'asistenciaalumno/asistencia-lista', component:AsistenciaListaComponent,
      },
      
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.component').then(m => m.HomeComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
