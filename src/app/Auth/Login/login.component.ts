import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: '../Login/login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private http: HttpClient) {}

  onSubmit() {
    if (this.form.invalid) return;
    const { correo, password } = this.form.value;
    this.auth.login(correo!, password!).subscribe({
      next: res => {
        this.auth.saveToken(res.token);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.error = 'Correo o contraseña inválidos';
      },
    });
  }

  recuperar() {
    const correo = this.form.get('correo')?.value;
    if (!correo) {
      this.error = "Debe ingresar su correo para recuperar la contraseña";
      return;
    }

    this.http.post('http://localhost:8080/api/usuarios/recuperar', { correo })
      .subscribe({
        next: () => alert("Se envió un correo con la nueva contraseña"),
        error: err => {
          console.error(err);
          this.error = err.error?.message || err.message || "Error al recuperar contraseña";
        }
      });
  }
}