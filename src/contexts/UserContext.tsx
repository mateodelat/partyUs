import { Context, createContext, Dispatch, SetStateAction } from "react";
import { tipoDocumento } from "../../constants";
import { TextoAbajoPasaporteType } from "../screens/SolicitudOrganizador/components/functions";

const UserContext: Context<{
  usuario: UserType;
  setUsuario: Dispatch<SetStateAction<UserType>>;
}> = createContext({
  usuario: {},
  setUsuario: (v: SetStateAction<UserType>) => {
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

  phoneNumber?: String;
  phoneCode?: String;

  admin?: Boolean;

  calificacion?: Number;
  numReseñas?: Number;
};

export type idData = {
  uri: string;
  key: string;
  detectedText: string;
  tipoDocumento: tipoDocumento;
  textoAbajoPasaporte?: null | TextoAbajoPasaporteType;
  curp?: string;
};
