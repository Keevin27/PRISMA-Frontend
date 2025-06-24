import { Component, HostBinding, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit{
  rolesUsuario: string[] = [];//ESTA ES LA OTRA COSA
  private readonly _open = signal(false);
  constructor(
    private authService: AuthService //PARA RESTRINGIR
  ) { }
  ngOnInit(): void {
    this.rolesUsuario = this.authService.getUserRoles(); //PARA RESTRINGIR
  }
  BloquearDocente(): boolean {  //PARA RESTRINGIR
    return !this.rolesUsuario.includes('ROLE_DOCENTE');
  }
  toggle() {
    this._open.update(v => !v);
  }
  @HostBinding('class.open')
  get isOpen() {
    return this._open();
  }
}
