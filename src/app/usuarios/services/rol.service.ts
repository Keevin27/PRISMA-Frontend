import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Rol {
  id: number;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = 'https://prisma-backend-9dd71ec0c985.herokuapp.com/api/roles';

  constructor(private http: HttpClient) {}

  listar(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }
}