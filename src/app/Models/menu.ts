import { DetalleMenu } from "./detalle-menu";
import { Dia } from "./dia";
import { Semana } from "./semana";

export class Menu {
    id_menu?: number;
    nombre_menu: string;
    dia: Dia;
    semana: Semana;
    estado_menu: boolean;
    detallesMenu?: DetalleMenu[]; 
}
