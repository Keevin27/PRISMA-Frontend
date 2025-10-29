import { Alumno } from '../../Alumno/alumno';
import { Bloque } from '../../Models/bloque';

export class NotaMateria {
    id_notaMateria?: number;
    alumno: Alumno;
    bloque: Bloque;
    nota_materia: number;
}