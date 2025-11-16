import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnioAcademico } from '../Models/anio-academico';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AnioAcademicoService {

  private baseURL = "https://prisma-backend-9dd71ec0c985.herokuapp.com/AnioAcademico/"

  private anioSeleccionadoSubject = new BehaviorSubject<number | null>(null);
  public anioSeleccionado$ = this.anioSeleccionadoSubject.asObservable();

  private anioActivoSubject = new BehaviorSubject<number | null>(null);
public anioActivo$ = this.anioActivoSubject.asObservable();


  constructor(private httpClient: HttpClient) {
     const anioGuardado = localStorage.getItem('anioSeleccionado');
  if (anioGuardado) {
    this.anioSeleccionadoSubject.next(parseInt(anioGuardado, 10));
  }
   }

  obtenerAniosAcademicos(): Observable<AnioAcademico[]> {
    return this.httpClient.get<AnioAcademico[]>(`${this.baseURL}`)
  }

  obtenerAnioAcademicoPorId(id: number): Observable<AnioAcademico> {
    return this.httpClient.get<AnioAcademico>(`${this.baseURL}${id}`)
  }

  crearAnioAcademico(anio: number): Observable<AnioAcademico> {
    return this.httpClient.post<AnioAcademico>(`${this.baseURL}crear`, { anio })
  }

  actualizarEstado(id: number, estados: { anio_activo?: boolean, anio_cerrado?: boolean }): Observable<AnioAcademico> {
    return this.httpClient.put<AnioAcademico>(`${this.baseURL}actualizar-estado/${id}`, estados)
  }


 /** Alias: obtener todos los años académicos */
  obtenerTodos(): Observable<AnioAcademico[]> {
    return this.obtenerAniosAcademicos();
  }


  
  /** Obtener el año académico activo (no cachea por sí solo) */
  obtenerAnioActivo(): Observable<AnioAcademico> {
    return this.httpClient.get<AnioAcademico>(`${this.baseURL}activo`);
  }

  /** Establecer el año seleccionado globalmente (emite inmediatamente) */
  setAnioSeleccionado(anio: number): void {
    console.log('Servicio: setAnioSeleccionado ->', anio);
    localStorage.setItem('anioSeleccionado', anio.toString());
  this.anioSeleccionadoSubject.next(anio);
  }

  /** Obtener el año seleccionado actual */
  getAnioSeleccionado(): number | null {
    return this.anioSeleccionadoSubject.value;
  }

  /* Limpiar el año seleccionado (sin localStorage) */
  limpiarAnioSeleccionado(): void {
    this.anioSeleccionadoSubject.next(null);
  }

  // -------------------------------------------------------
  // Cache y refreshing del año activo (evita race conditions)
  // -------------------------------------------------------

  // Método para refrescar y cachear el año activo desde la BD
  refreshAnioActivo(): Observable<AnioAcademico> {
    return this.httpClient.get<AnioAcademico>(`${this.baseURL}activo`).pipe(
      tap(a => {
        if (a && typeof a.anio === 'number') {
          console.log('Servicio: cacheando año activo:', a.anio);
          this.anioActivoSubject.next(a.anio);
        }
      }),
      catchError(err => {
        console.error('Servicio: error refreshAnioActivo', err);
        this.anioActivoSubject.next(null);
        // Devolvemos un fallback Observable para que quien llame no rompa
        return of({ anio: new Date().getFullYear(), anio_activo: false, anio_cerrado: false } as AnioAcademico);
      })
    );
  }

  // Modifica cargarAnioInicial para usar refreshAnioActivo()
  private cargarAnioInicial(): void {
    console.log('Servicio: cargando año activo desde BD (inicial)...');
    this.refreshAnioActivo().subscribe({
      next: (a) => {
        if (a && typeof a.anio === 'number') {
          // seteamos seleccionado según cache recién obtenida
          this.anioSeleccionadoSubject.next(a.anio);
        } else {
          // fallback por si la respuesta no tiene la forma esperada
          this.anioSeleccionadoSubject.next(new Date().getFullYear());
        }
      },
      error: () => {
        const fallback = new Date().getFullYear();
        this.anioSeleccionadoSubject.next(fallback);
      }
    });
  }

  // Actualiza esAnioActivo para usar cache si existe y sino refrescar
  esAnioActivo(anio: number): Observable<boolean> {
    const cached = this.anioActivoSubject.value;
    if (cached !== null) {
      // respuesta inmediata si ya tenemos cache
      return of(cached === anio);
    }
    // si no hay cache, refrescamos y comparamos
    return this.refreshAnioActivo().pipe(
      map(a => a.anio === anio)
    );
  }
}