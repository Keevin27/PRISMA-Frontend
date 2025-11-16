import { HttpClient,HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable,of } from 'rxjs';
import { Materia } from './materia';
import { Docente } from '../Docente/docente';
import { Grado } from '../Models/grado';

@Injectable({
  providedIn: 'root'
})
export class MateriaService {
  //obtener listados de materias desde el backend
  private baseURL="https://prisma-backend-9dd71ec0c985.herokuapp.com/gestionarMaterias/materias"
  private baseURLbloques="https://prisma-backend-9dd71ec0c985.herokuapp.com/asignarDocenteAMateria/bloques"
  private baseURLDocente="https://prisma-backend-9dd71ec0c985.herokuapp.com/expedienteDocente/docentes"
  private baseURLGrado="https://prisma-backend-9dd71ec0c985.herokuapp.com/Grado/grados"

  constructor(private httpClient: HttpClient) { 
  }
  obtenerListaMaterias():Observable<Materia[]>{
    return this.httpClient.get<Materia[]>(`${this.baseURL}`);
  }
  guardarMateria(materia:Materia):Observable<Materia>{
    return this.httpClient.post<Materia>(`${this.baseURL}`,materia)
  }
  obtenerMateriaPorCodigo(codigoMateria:string):Observable<Materia>{
    return this.httpClient.get<Materia>(`${this.baseURL}/${codigoMateria}`);
  }
  existeMateria(codigoMateria:string):Observable<boolean>{
    const url = `${this.baseURL}/existe/${codigoMateria}`;
    return this.httpClient.get<boolean>(url);
  }
  actualizarMateria(codigoMateria:string,materia:Materia):Observable<Materia>{
    const url = `${this.baseURL}/${codigoMateria}`;
    return this.httpClient.put<Materia>(url,materia);
  }
  actualizarEstadoMateria(codigoMateria:string, estado:boolean):Observable<void>{
    const url = `${this.baseURL}/${codigoMateria}/estado`;
    return this.httpClient.put<void>(url,{estado_materia:estado});
  }

  //bloques
  asignarDocenteAMateria(asignacion: any): Observable<any> {
    return this.httpClient.post<any>(this.baseURLbloques, asignacion);
  }
  obtenerListaDocentes():Observable<Docente[]>{
    return this.httpClient.get<Docente[]>(`${this.baseURLDocente}`);
  }
  obtenerGrados():Observable<Grado[]>{
    return this.httpClient.get<Grado[]>(`${this.baseURLGrado}`);
  }
  obtenerGradosActivos(): Observable<Grado[]> {
    return this.httpClient.get<Grado[]>(`${this.baseURLGrado}/activos`);
  }

  obtenerAsignacionesPorMateria(codigoMateria:string):Observable<any[]>{
    const url = `${this.baseURLbloques}/materia/${encodeURIComponent(codigoMateria)}`;
    return this.httpClient.get<any[]>(url).pipe(
      catchError(err => {
        console.error('[MateriaService]Error al obtener las asignaciones por materia', err);
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
  }
  eliminarAsignacion(duiDocente: string, codigoMateria: string, idGrado: number): Observable<void> {
    const url = `${this.baseURLbloques}/${duiDocente}/${codigoMateria}/${idGrado}`;
    return this.httpClient.delete<void>(url);
  }

  getGradosDisponiblesPorMateria(codigoMateria: string): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.baseURLbloques}/grados-disponibles/${codigoMateria}`);
  }



}
