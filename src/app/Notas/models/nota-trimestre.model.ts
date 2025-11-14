import { Alumno } from '../../Alumno/alumno';
import { Bloque } from '../../Models/bloque';
import { Trimestre } from './trimestre.model';

export class NotaTrimestre {
    id_notaTrimestre?: number;
    bloque: Bloque;
    trimestre: Trimestre;
    alumno: Alumno;
    nota_trimestre: number;
}