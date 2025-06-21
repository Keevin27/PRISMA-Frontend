import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: '../Login/login.component.html',
})
export class LoginComponent {
  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

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
}