import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { map, Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiAuth = 'http://localhost:8080/auth';
  private apiUsuarios = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient, private router: Router) {}

  login(correo: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiAuth}/login`, { correo, password })
      .pipe(
        tap(response => {
          this.saveToken(response.token);
          this.resolveUserId();
        })
      );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); 
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    const decoded: any = jwtDecode(token);
    return decoded.roles || [];
  }

  getUserEmail(): string {
    const token = this.getToken();
    if (!token) return '';
    const decoded: any = jwtDecode(token);
    return decoded.sub || decoded.correo || ''; 
  }


resolveUserId(): Observable<number> {
  const correo = this.getUserEmail();
  return this.http.get<any>(`${this.apiUsuarios}/correo/${correo}`).pipe(
    tap(usuario => {
      console.log('Respuesta backend:', usuario); // 👈 ver qué trae
      localStorage.setItem('userId', usuario.idUsuario.toString());
    }),
    map(usuario => usuario.idUsuario as number)
  );
}

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }
}