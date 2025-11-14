import { Injectable } from '@angular/core';
import { Menu } from '../Models/menu';
import { Alimento } from '../Models/alimento';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DetalleMenu } from '../Models/detalle-menu';

@Injectable({
  providedIn: 'root'
})
export class DetalleMenuService {

  private baseURL = "http://localhost:8080/DetalleMenu"

  constructor(private httpClient: HttpClient) { }

  obtenerDetallesMenu(): Observable<DetalleMenu[]> {
    return this.httpClient.get<DetalleMenu[]>(`${this.baseURL}/`);
  }
  obtenerDetallesPorMenu(idMenu: number): Observable<DetalleMenu[]> {
    return this.httpClient.get<DetalleMenu[]>(`${this.baseURL}/menu/${idMenu}`);
  }
  agregarDetalleMenu(detalleMenu: DetalleMenu): Observable<Object> {
    return this.httpClient.post<Object>(`${this.baseURL}/detallemenu`, detalleMenu)
  }
  eliminarDetalleMenu(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseURL}/detallemenu/${id}`);
  }
  actualizarDetalleMenu(id: number, detalleMenu: DetalleMenu): Observable<DetalleMenu> {
    return this.httpClient.put<DetalleMenu>(`${this.baseURL}/detallemenu/${id}`, detalleMenu);
  }


}
