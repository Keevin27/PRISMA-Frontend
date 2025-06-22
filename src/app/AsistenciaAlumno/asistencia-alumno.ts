import { Alumno } from "../Alumno/alumno";

export class AsistenciaAlumno {
    id_asistencia?: number;
    estado_asistencia?: string;
    fecha_asistencia?: Date;
    alumno: Alumno;
}
