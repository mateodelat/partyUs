import { Context, createContext, Dispatch, SetStateAction } from "react";
import { tipoDocumento } from "../../constants";
import { TextoAbajoPasaporteType } from "../screens/SolicitudOrganizador/components/functions";

const UserContext: Context<{
  usuario: UserType;
  setUsuario: Dispatch<SetStateAction<UserType>>;
}> = createContext({
  usuario: {},
  setUsuario: (value: SetStateAction<UserType>) => {
    return;
  },
});

export default UserContext;

export type UserType = {
  nickname?: string;
  organizador?: boolean;
  nombre?: string;
  materno?: string;
  paterno?: string;

  idUploaded?: boolean;
  idData?: idData;

  fechaNacimiento?: Date;

  email?: string;
};

export type idData = {
  uri: string;
  detectedText: string;
  tipoDocumento: tipoDocumento;
  textoAbajoPasaporte?: null | TextoAbajoPasaporteType;
  curp?: string;
};
