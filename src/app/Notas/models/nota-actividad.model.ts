import { Alumno } from '../../Alumno/alumno';
import { Actividad } from './actividad.model';

export class NotaActividad {
    id_notaActividad?: number;
    alumno: Alumno;
    actividad: Actividad;
    nota_obtenida: number;
    fecha_modificacion: string;
}
