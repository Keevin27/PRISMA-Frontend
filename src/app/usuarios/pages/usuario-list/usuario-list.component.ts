import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.css'
})
export class UsuarioListComponent implements OnInit {
  usuarios: Usuario[] = [];

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  ngOnInit(): void {
    this.usuarioService.listar().subscribe(data => {
      // Mapea cada usuario para asignar 'rol' con el primer rol del arreglo roles
      this.usuarios = data.map((u: any) => ({
        ...u,
        rol: (u.roles && u.roles.length > 0) ? u.roles[0] : null
      }));
    });
  }

  eliminarUsuario(id: number) {
    this.usuarioService.eliminar(id).subscribe(() => this.ngOnInit());
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
    // Elimina el prefijo "ROLE_" y pone en mayúscula la primera letra
    return nombre.replace('ROLE_', '').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  }
}
