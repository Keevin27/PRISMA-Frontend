import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {  HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './Auth/auth.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet,HttpClientModule,FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'PRISMA-Frontend';

  usuarioCorreo: string = '';
  nuevaPassword: string = '';

  constructor(private http: HttpClient, private authService: AuthService) {}

  guardarCambios() {
    if (this.nuevaPassword.trim()) {
      this.authService.resolveUserId().subscribe((id: number) => {
        const url = `http://localhost:8080/api/usuarios/${id}/password`;
        const headers = { Authorization: `Bearer ${this.authService.getToken()}` };

        this.http.put(url, { passwordUsuario: this.nuevaPassword }, { headers })
          .subscribe({
            next: () => {
              this.nuevaPassword = '';

              document.querySelector('#ajustesModal .btn-close')
                ?.dispatchEvent(new Event('click'));

              const confirmacionModalEl = document.getElementById('confirmacionModal');
              if (confirmacionModalEl) {
                const confirmacionModal = new bootstrap.Modal(confirmacionModalEl);
                confirmacionModal.show();
              }
            },
            error: (err) => {
              console.error('Error al actualizar la contraseña', err);

              const confirmacionModalEl = document.getElementById('confirmacionModal');
              if (confirmacionModalEl) {
                confirmacionModalEl.querySelector('.modal-body')!.textContent =
                  'Hubo un problema al actualizar la contraseña';
                const confirmacionModal = new bootstrap.Modal(confirmacionModalEl);
                confirmacionModal.show();
              }
            }
          });
      });
    } else {
      const confirmacionModalEl = document.getElementById('confirmacionModal');
      if (confirmacionModalEl) {
        confirmacionModalEl.querySelector('.modal-body')!.textContent =
          'La contraseña no puede estar vacía';
        const confirmacionModal = new bootstrap.Modal(confirmacionModalEl);
        confirmacionModal.show();
      }
    }
  }




}

