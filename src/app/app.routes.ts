import { Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/layout.component';
import { PaqueteEscolarComponent } from './PaqueteEscolar/paquete-escolar/paquete-escolar.component';
import { AgregarPaqueteEscolarComponent } from './PaqueteEscolar/agregar-paquete-escolar/agregar-paquete-escolar.component';
import { AsistenciaListaComponent } from './AsistenciaAlumno/asistencia-lista/asistencia-lista.component';
import { AgregarAsistenciaComponent } from './AsistenciaAlumno/agregar-asistencia/agregar-asistencia.component';
import { EntregarPaqueteEscolarComponent } from './PaqueteEscolar/entregar-paquete-escolar/entregar-paquete-escolar.component';
import { AgregarDocenteComponent } from './Docente/agregar-docente/agregar-docente.component';
import { ActualizarDocenteComponent } from './Docente/actualizar-docente/actualizar-docente.component';
import { AgregarAlumnoComponent } from './Alumno/agregar-alumno/agregar-alumno.component';
import { ActualizarAlumnoComponent } from './Alumno/actualizar-alumno/actualizar-alumno.component';
import { LoginComponent } from './Auth/Login/login.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { AuthGuard } from './Auth/auth.guard';
import { NoAuthGuard } from './Auth/no-auth.guard';
import { UsuarioListComponent } from './usuarios/pages/usuario-list/usuario-list.component';
import { UsuarioFormComponent } from './usuarios/pages/usuario-form/usuario-form.component';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { AgregarMateriasComponent } from './Materia/agregar-materias/agregar-materias.component';
import { ActualizarMateriasComponent } from './Materia/actualizar-materias/actualizar-materias.component';
import { AsignarMateriaDocenteComponent } from './Materia/asignar-materia-docente/asignar-materia-docente.component';

import { ConsultarNotasMateriaComponent } from './Notas/components/consultar-notas-materia/consultar-notas-materia.component';
import { ConsultarNotasAlumnoComponent } from './Notas/components/consultar-notas-alumno/consultar-notas-alumno.component';
import { DetalleNotasAlumnoComponent } from './Notas/components/detalle-notas-alumno/detalle-notas-alumno.component';
import { GestionActividadesComponent } from './Notas/components/gestion-actividades/gestion-actividades.component';
import { AsignarNotasComponent } from './Notas/components/asignar-notas/asignar-notas.component';
import { ReporteAnualAlumnoComponent } from './Notas/components/reporte-anual-alumno/reporte-anual-alumno.component';

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
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA'] }
      },
      {
        path: 'paquetesescolares/agregar-paqueteescolar',
        component: AgregarPaqueteEscolarComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR'] }
      },
      {
        path: 'asistenciaalumno', component: AgregarAsistenciaComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DOCENTE', 'ROLE_DIRECTOR'] }
      },
      {
        path: 'asistenciaalumno/asistencia-lista', component: AsistenciaListaComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DOCENTE', 'ROLE_DIRECTOR'] }
      },

      {
        path: 'gestion-ano-academico',
        loadComponent: () =>
        import('./Administracion/gestion-anio-academico/gestion-anio-academico.component').then(
        (m) => m.GestionAnioAcademicoComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA'] }
      },

        {
        path: 'matriculas',
        loadComponent: () =>
          import('./Administracion/matricula/matricula.component').then(
            (m) => m.MatriculaComponent
          ),
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA', 'ROLE_DOCENTE'] }
      },

      {
        path: 'entrega-paquetes-escolares', component: EntregarPaqueteEscolarComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_DOCENTE'] }
      },

      {
        path: 'alumnos',
        loadComponent: () =>
          import('./Alumno/lista-alumnos/lista-alumnos.component').then(m => m.ListaAlumnosComponent),
      },
      {
        path: 'alumnos/agregarAlumno',
        component: AgregarAlumnoComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA'] }
      },

      {
        path: 'alumnos/ver/:id',
        loadComponent: () =>
          import('./Alumno/ver-alumno/ver-alumno.component').then(m => m.VerAlumnoComponent),
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA'] }
      },

      {
        path: 'alumnos/:id',
        component: ActualizarAlumnoComponent
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
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA'] }
      },
      {
        path: 'docentes/agregarDocente',
        component: AgregarDocenteComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR'] }
      },
      {
        path: 'docentes/:dui',
        component: ActualizarDocenteComponent,
      },

      {
        path: 'usuarios',
        component: UsuarioListComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA'] } // <-- Permitir solo estos roles
      },
      {
        path: 'usuarios/nuevo', component: UsuarioFormComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA'] }
      },
      {
        path: 'usuarios/editar/:id', component: UsuarioFormComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA'] }
      },
      {
        path: 'forbidden',
        component: ForbiddenComponent // <- Página de acceso denegado
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'materias',
        loadComponent: () =>
          import('./Materia/lista-materias/lista-materias.component').then(
            (m) => m.ListaMateriasComponent
          ),
          canActivate: [AuthGuard],
          data: {roles: ['ROLE_DIRECTOR', 'ROLE_SECRETARIA']}
      },
      {
        path: 'materias/agregarMaterias',
        component: AgregarMateriasComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR'] }
      },
      {
        path: 'materias/asignarMateriaADocente',
        loadComponent: () =>
          import('./Materia/asignar-materia-docente/asignar-materia-docente.component').then(
            (m) => m.AsignarMateriaDocenteComponent),
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DIRECTOR'] }
      },
      {
        path: 'materias/:codigo',
        component: ActualizarMateriasComponent,
      },

      // MÓDULO DE NOTAS
      {
        path: 'consultar-notas-materia',
        component: ConsultarNotasMateriaComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DOCENTE', 'ROLE_DIRECTOR'] }
      },
      {
        path: 'consultar-notas-alumno',
        component: ConsultarNotasAlumnoComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DOCENTE', 'ROLE_DIRECTOR'] }
      },
      {
        path: 'detalle-notas-alumno/:nie',
        component: DetalleNotasAlumnoComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DOCENTE', 'ROLE_DIRECTOR'] }
      },
      {
        path: 'gestion-actividades',
        component: GestionActividadesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DOCENTE', 'ROLE_DIRECTOR'] }
      },
      {
        path: 'asignar-notas/:idActividad',
        component: AsignarNotasComponent,
        canActivate: [AuthGuard],
        data: { roles: ['ROLE_DOCENTE', 'ROLE_DIRECTOR'] }
      },
      {
  path: 'reporte-anual-alumno',
  component: ReporteAnualAlumnoComponent,
  canActivate: [AuthGuard],
  data: { roles: ['ROLE_DOCENTE', 'ROLE_DIRECTOR'] }
},

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