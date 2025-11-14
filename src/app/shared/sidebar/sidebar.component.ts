import { Component, HostBinding, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit{
  rolesUsuario: string[] = [];//PARA RESTRINGIR
  usuarioCorreo: string = '';
  nuevaPassword: string = '';
  private readonly _open = signal(false);
  constructor(
    private authService: AuthService, //PARA RESTRINGIR
    private http: HttpClient 
  ) { }
  ngOnInit(): void {
    this.rolesUsuario = this.authService.getUserRoles(); //PARA RESTRINGIR
    this.usuarioCorreo = this.authService.getUserEmail();
  }
  BloquearDocente(): boolean {  //PARA RESTRINGIR
    return !this.rolesUsuario.includes('ROLE_DOCENTE');
  }
  BloquearDirectora(): boolean {  //PARA RESTRINGIR
    return !this.rolesUsuario.includes('ROLE_DIRECTORA');
  }
  BloquearSecretaria(): boolean {  //PARA RESTRINGIR
    return !this.rolesUsuario.includes('ROLE_SECRETARIA');
  }
  toggle() {
    this._open.update(v => !v);
  }
  @HostBinding('class.open')
  get isOpen() {
    return this._open();
  }

  abrirModal() {
    const modal = document.getElementById('ajustesModal');
    if (modal) {
      const correoInput = modal.querySelector('#correo') as HTMLInputElement;
      const passwordInput = modal.querySelector('#password') as HTMLInputElement;

      correoInput.value = this.usuarioCorreo;
      passwordInput.value = '';

      const bsModal = new (window as any).bootstrap.Modal(modal);
      bsModal.show();
    }
  }

}
