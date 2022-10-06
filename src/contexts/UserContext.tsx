import { Context, createContext, Dispatch, SetStateAction } from "react";
import { tipoDocumento } from "../../constants";
import { Usuario } from "../models";
import { TextoAbajoPasaporteType } from "../screens/SolicitudOrganizador/components/functions";

const UserContext: Context<{
  usuario: Usuario;
  setUsuario: Dispatch<SetStateAction<Usuario>>;

  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}> = createContext({
  usuario: {
    id: "guest",
    nickname: "guest",
    email: "guest",
  },
  setUsuario: (v: SetStateAction<Usuario>) => {
    return;
  },
  loading: false,
  setLoading: (e: any) => null,
});

export default UserContext;

export type idData = {
  uri: string;
  key?: string;
  detectedText: string;
  tipoDocumento: tipoDocumento;
  textoAbajoPasaporte?: null | TextoAbajoPasaporteType;
  curp?: string;
};
