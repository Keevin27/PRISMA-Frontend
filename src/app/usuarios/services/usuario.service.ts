import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'https://prisma-backend-9dd71ec0c985.herokuapp.com/api/usuarios';

  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  actualizar(id: number, usuario: any) {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  actualizarRol(usuario: { idUsuario: number; roles: any[] }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${usuario.idUsuario}/rol`, usuario);
  }

  actualizarActivo(idUsuario: number, activo: boolean) {
    return this.http.put<Usuario>(`${this.apiUrl}/${idUsuario}/activo`, activo);
  }
}
