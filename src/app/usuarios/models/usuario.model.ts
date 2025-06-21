import { Rol } from "./rol.model";

export interface Usuario {
  idUsuario?: number;
  correoUsuario: string;
  passwordUsuario: string;
  fechaRegistro?: Date;
  usuarioActivo: boolean;
  roles: Rol[];
}