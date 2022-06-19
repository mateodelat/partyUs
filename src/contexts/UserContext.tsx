import { Context, createContext, Dispatch, SetStateAction } from "react";

const UserContext: Context<UserType> = createContext({
  setOrganizador: (p: any) => p,
});

export default UserContext;

type UserType = {
  nickname?: string;
  organizador?: boolean;
  email?: string;
  setOrganizador: Dispatch<SetStateAction<boolean>>;
};
