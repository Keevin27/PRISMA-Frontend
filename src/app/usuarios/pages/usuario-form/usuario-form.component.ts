import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { RolService } from '../../services/rol.service';
import { Rol } from '../../models/rol.model';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.css'
})
export class UsuarioFormComponent implements OnInit {

  usuario: Usuario = {
    correoUsuario: '',
    passwordUsuario: '',
    usuarioActivo: true,
    rol: null
  };

  rolesDisponibles: Rol[] = [];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {}

  ngOnInit(): void {
    this.rolService.listar().subscribe(roles => this.rolesDisponibles = roles);
  }

  guardar() {
    if (!this.usuario.rol) {
      alert('Debe seleccionar un rol');
      return;
    }

    const usuarioEnviar: any = {
      correoUsuario: this.usuario.correoUsuario,
      passwordUsuario: this.usuario.passwordUsuario,
      usuarioActivo: this.usuario.usuarioActivo,
      roles: [this.usuario.rol]
    };

    this.usuarioService.crear(usuarioEnviar)
      .subscribe(() => this.router.navigate(['/usuarios']));
  }
}