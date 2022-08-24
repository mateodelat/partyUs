import {
  Context,
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { EventoType } from "../screens/Inicio/Home";

const EventContext: Context<{
  evento: EventoType;
  setEvento: Dispatch<SetStateAction<EventoType>>;
}> = createContext({
  evento: {},
  setEvento: (v: SetStateAction<EventoType>) => {
    return;
  },
});

export default EventContext;
