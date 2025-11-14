import { Bloque } from '../../Models/bloque';
import { Trimestre } from './trimestre.model';

export class Actividad {
    id_actividad?: number;
    bloque?: Bloque;
    trimestre?: Trimestre;
    nombre_actividad: string;
    ponderacion_actividad: number;
    fecha_actividad: string; // formato YYYY-MM-DD
}