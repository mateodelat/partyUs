import { StatusBarStyle } from "expo-status-bar";
import { Context, createContext, Dispatch, SetStateAction } from "react";
import { TextStyle } from "react-native";
import { tipoDocumento } from "../../constants";
import { Usuario } from "../models";
import { TextoAbajoPasaporteType } from "../screens/SolicitudOrganizador/components/functions";

type LocalUserType = Usuario & {
  stripeIdFrontKey?: string;
  stripeIdBackKey?: string;
  localUriIdFront?: string;
  localUriIdBack?: string;
};

const UserContext: Context<{
  usuario: LocalUserType;
  setUsuario: Dispatch<SetStateAction<LocalUserType>>;

  setStatusStyle: Dispatch<SetStateAction<StatusBarStyle>>;

  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;

  newNotifications: number;
  setNewNotifications: Dispatch<SetStateAction<number>>;
  setBottomMessage: Dispatch<
    SetStateAction<{
      content: string;
      style?: TextStyle;
    }>
  >;
}> = createContext({
  usuario: {
    id: "guest",
    nickname: "guest",
    email: "guest",
  },
  setUsuario: (v: SetStateAction<LocalUserType>) => {
    return;
  },
  setStatusStyle: (a: any) => null,
  loading: false,
  setLoading: (e: any) => null,

  newNotifications: 0,
  setNewNotifications: (e: any) => null,
  setBottomMessage: (e: any) => null,
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
