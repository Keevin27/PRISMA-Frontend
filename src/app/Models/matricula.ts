import { Alumno } from "../Alumno/alumno";
import { Grado } from "./grado";

export class Matricula {
    idMatricula: number;
    estadoMatricula: string;

	grado: Grado;

	alumno: Alumno;
}