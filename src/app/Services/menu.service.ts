import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Menu } from '../Models/menu';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private baseURL = "http://localhost:8080/Menu"

  constructor(private httpClient: HttpClient) { }

  obtenerListaMenus(): Observable<Menu[]> {
    return this.httpClient.get<Menu[]>(`${this.baseURL}/`);
  }
  obtenerListaMenusActivos(): Observable<Menu[]> {
    return this.httpClient.get<Menu[]>(`${this.baseURL}/activos`);
  }
  obtenerMenuPorId(id: number): Observable<Menu> {
    return this.httpClient.get<Menu>(`${this.baseURL}/menu/${id}`);
  }
  agregarMenu(menu: Menu): Observable<Menu> {
    return this.httpClient.post<Menu>(`${this.baseURL}/`, menu)
  }
  actualizarMenu(id: number, menu: Menu): Observable<Menu> {
    return this.httpClient.put<Menu>(`${this.baseURL}/${id}`, menu);
  }
  obtenerMenuPorSemanaDia(idSemana: number, idDia: number): Observable<Menu> {
    return this.httpClient.get<Menu>(`${this.baseURL}/semana/${idSemana}/dia/${idDia}`);
  }
}