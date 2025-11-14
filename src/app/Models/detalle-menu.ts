import { Alimento } from "./alimento";
import { Menu } from "./menu";

export class DetalleMenu {
    id_detalle_menu?: number;
    racion_gramos: number
    menu?:Menu;
    alimento: Alimento;
}
