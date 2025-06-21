import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { PaqueteEscolarComponent } from './PaqueteEscolar/paquete-escolar/paquete-escolar.component';
import { AgregarPaqueteEscolarComponent } from './PaqueteEscolar/agregar-paquete-escolar/agregar-paquete-escolar.component';
import { EntregarPaqueteEscolarComponent } from './PaqueteEscolar/entregar-paquete-escolar/entregar-paquete-escolar.component';
import { AgregarDocenteComponent } from './Docente/agregar-docente/agregar-docente.component';
import { ActualizarDocenteComponent } from './Docente/actualizar-docente/actualizar-docente.component';
import { LoginComponent } from './Auth/Login/login.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { AuthGuard } from './Auth/auth.guard';
import { NoAuthGuard } from './Auth/no-auth.guard';
import { UsuarioListComponent } from './usuarios/pages/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './usuarios/pages/usuario-form/usuario-form.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'paquetesescolares',
        component: PaqueteEscolarComponent,
      },
      {
        path: 'paquetesescolares/agregar-paqueteescolar',
        component: AgregarPaqueteEscolarComponent,
      },
      {
        path: 'entrega-paquetes-escolares',
        component: EntregarPaqueteEscolarComponent,
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'docentes',
        loadComponent: () =>
          import('./Docente/lista-docentes/lista-docentes.component').then(
            (m) => m.ListaDocentesComponent
          ),
      },
      {
        path: 'docentes/agregarDocente',
        component: AgregarDocenteComponent,
      },
      {
        path: 'docentes/:dui',
        component: ActualizarDocenteComponent,
      },

      { path: 'usuarios', component: UsuarioListComponent },
      { path: 'usuarios/nuevo', component: UsuarioFormComponent },
      { path: 'usuarios/editar/:id', component: UsuarioFormComponent },
    ],
  },

  // Login
  {
    path: '',
    component: LoginLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [NoAuthGuard],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
    ],
  },

  
  { path: '**', redirectTo: 'login' },
];