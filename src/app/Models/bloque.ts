import { Grado } from './grado';
import { Materia } from '../Materia/materia';

export class Bloque {
    id_bloque?: number;
    grado: Grado;
    materia: Materia;
    anioAcademico: number;
}