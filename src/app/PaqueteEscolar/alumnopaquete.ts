import { Alumno } from "../Alumno/alumno";
import { PaqueteEscolar } from "./paquete-escolar";

export class Alumnopaquete {
    id_asignacion?: number;
    paquete_entregado: boolean;
    fecha_entrega_p?: Date;
    alumno: Alumno;
    paqueteEscolar: PaqueteEscolar;
}
