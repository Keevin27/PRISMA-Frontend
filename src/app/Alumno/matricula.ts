import { Alumno } from "../Alumno/alumno";
import { Grado } from "../Models/grado";

export class Matricula {
    idMatricula: number;
    estadoMatricula: string;
    grado: Grado;
    alumno: Alumno;
}
