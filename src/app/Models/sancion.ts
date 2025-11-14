import { Alumno } from "../Alumno/alumno";

export interface Sancion {
    idSancion: number;
    tipoSancion:string; 
    descripcionSancion: string;
    fechaSancion: string; 
    alumno: Alumno; 
}