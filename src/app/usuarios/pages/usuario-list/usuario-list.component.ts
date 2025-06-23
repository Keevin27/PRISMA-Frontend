import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { Rol } from '../../models/rol.model';
import { RolService } from '../../services/rol.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Auth/auth.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css'
})
export class UsuarioListComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  rolesUsuario: string[] = [];

  usuarioSeleccionado: Usuario | null = null;
  nuevoRolId: number | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private router: Router,
    private authService: AuthService //PARA RESTRINGIR
  ) {}

  ngOnInit(): void {
    this.rolesUsuario = this.authService.getUserRoles(); //PARA RESTRINGIR
    this.cargarUsuarios();
    this.rolService.listar().subscribe(data => this.roles = data);
  }

  BloquearDocente(): boolean {  //PARA RESTRINGIR
    return !this.rolesUsuario.includes('ROLE_DOCENTE');
  }

  cargarUsuarios() {
    this.usuarioService.listar().subscribe(data => {
      this.usuarios = data.map((u: any) => ({
        ...u,
        rol: (u.roles && u.roles.length > 0) ? u.roles[0] : null
      }));
    });
  }

  abrirModalCambioRol(usuario: Usuario) {
    this.usuarioSeleccionado = usuario;
    this.nuevoRolId = usuario.rol?.id ?? null;
  }

  cambiarRolUsuario() {
    if (!this.usuarioSeleccionado || !this.nuevoRolId || this.usuarioSeleccionado.idUsuario === undefined) {
      return;
    }
  
    const nuevoRol = this.roles.find(r => r.id === Number(this.nuevoRolId));
    if (!nuevoRol) {
      return;
    }
  
    const payload = {
      idUsuario: this.usuarioSeleccionado.idUsuario,
      roles: [nuevoRol]
    };
  
    this.usuarioService.actualizarRol(payload).subscribe(() => {
      this.cargarUsuarios();
      this.usuarioSeleccionado = null;
  
      const modalEl = document.getElementById('cambiarRolModal');
      if (modalEl) {
        modalEl.classList.remove('show');
        modalEl.style.display = 'none';
        modalEl.setAttribute('aria-hidden', 'true');
        modalEl.removeAttribute('aria-modal');
        modalEl.removeAttribute('role');
      }
  
      document.body.classList.remove('modal-open');
  
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    });
  }

  eliminarUsuario(id: number) {
    this.usuarioService.eliminar(id).subscribe(() => this.cargarUsuarios());
  }

  editarUsuario(u: Usuario) {
    this.router.navigate(['/usuarios/editar', u.idUsuario]);
  }

  nuevoUsuario() {
    this.router.navigate(['/usuarios/nuevo']);
  }

  getNombreRol(usuario: Usuario): string {
    if (!usuario.rol) return '';
    return this.formatearNombreRol(usuario.rol.nombre);
  }

  formatearNombreRol(nombre: string): string {
    return nombre.replace('ROLE_', '').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  }

  toggleActivo(usuario: Usuario | null, event: Event) {
    if (!usuario) return; // por seguridad
  
    const input = event.target as HTMLInputElement;
    const nuevoEstado = input.checked;
  
    this.usuarioService.actualizarActivo(usuario.idUsuario!, nuevoEstado).subscribe({
      next: updatedUser => {
        usuario.usuarioActivo = updatedUser.usuarioActivo;
      },
      error: err => {
        alert('Error al actualizar el estado del usuario');
        this.cargarUsuarios();
      }
    });
  }
  
}
