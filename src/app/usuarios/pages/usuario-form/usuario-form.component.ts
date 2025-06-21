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
    roles: [],
  };

  rolesDisponibles: Rol[] = []; // lista para el select
  isEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private rolService: RolService // inyectar
  ) {}

  ngOnInit(): void {
    this.rolService.listar().subscribe(roles => this.rolesDisponibles = roles);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.usuarioService.listar().subscribe(users => {
        const u = users.find(x => x.idUsuario === +id);
        if (u) this.usuario = u;
      });
    }
  }

  guardar() {
    if (this.isEdit && this.usuario.idUsuario) {
      this.usuarioService.actualizar(this.usuario.idUsuario, this.usuario)
        .subscribe(() => this.router.navigate(['/usuarios']));
    } else {
      this.usuarioService.crear(this.usuario)
        .subscribe(() => this.router.navigate(['/usuarios']));
    }
  }
}
