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
    this.usuarioService.listar().subscribe(data => this.usuarios = data);
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

  getNombresRoles(usuario: Usuario): string {
  return usuario.roles && usuario.roles.length > 0
    ? usuario.roles.map(r => r.nombre).join(', ')
    : 'Sin rol';
}
}
