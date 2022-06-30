const moment = require("moment");

export function textoAbajoPasaporte(a: string) {
  let firstLine:
    | {
        tipo?: string;
        subtipo?: string;
        paisExpeditor?: string;
        apelativos?: string;
      }
    | undefined = new RegExp(
    /(?<tipo>[P])(?<subtipo>[<A-Z])(?<paisExpeditor>[<A-Z]{3})(?<apelativos>[<A-Z]{30,})/
  ).exec(a)?.groups;

  let secondLine:
    | {
        checkHashes?: string | number;
        hash1?: string | number;
        hash2?: string | number;
        hash3?: string | number;
        hash4?: string | number;
        fechaNacimiento?: string | Date;
        fechaExpiracion?: string | Date;
        apelativos?: string;
        nacionalidad?: string;
        sexo?: string;
        numeroPasaporte?: string | number;
        numeroPersonal?: string | number;
      }
    | undefined = new RegExp(
    /(?<numeroPasaporte>[A-Z0-9<]{9})(?<hash1>[0-9]{0,1})(?<nacionalidad>[<A-Z]{3})(?<fechaNacimiento>[<0-9]{6})(?<hash2>[0-9]{0,1})(?<sexo>[MF<]{0,1})(?<fechaExpiracion>[<0-9]{6})(?<hash3>[0-9]{0,1})(?<numeroPersonal>[<0-9A-Z]{14})(?<hash4>[0-9<]{0,1})(?<checkHashes>[0-9<]{0,1})/
  ).exec(a)?.groups;

  delete secondLine?.checkHashes;
  delete secondLine?.hash1;
  delete secondLine?.hash2;
  delete secondLine?.hash3;
  delete secondLine?.hash4;

  if (!firstLine || !secondLine) return null;

  // Sacar el nombre y apellido
  const nombre = firstLine?.apelativos
    ?.split("<<")[1]
    .replace(/([<]{1,})/g, " ");
  const apellido = firstLine?.apelativos
    ?.split("<<")[0]
    .replace(/([<]{1,})/g, " ");

  delete firstLine?.apelativos;

  const r = {
    ...firstLine,
    ...secondLine,
    nombre,
    apellido,
    fechaExpiracion: stringAfecha(secondLine.fechaExpiracion),
    fechaNacimiento: stringAfecha(secondLine.fechaNacimiento),
  } as TextoAbajoPasaporteType;
  return r;
}

export function stringAfecha(input: string | undefined | Date) {
  if (typeof input !== "string") return;

  const año = Number(moment(input.slice(0, 2), "YY").format("YYYY"));

  const mes = Number(input.slice(2, 4));
  const dia = Number(input.slice(4, 6));

  return new Date(año, mes + 1, dia);
}
export type TextoAbajoPasaporteType = {
  apellido: string;
  checkHashes: number;
  fechaExpiracion: Date;
  fechaNacimiento: Date;
  hash1: number;
  hash2: number;
  hash3: number;
  hash4: number;
  nacionalidad: string;
  nombre: string;
  numeroPasaporte: number;
  numeroPersonal: number;
  paisExpeditor: string;
  sexo: string;
  subtipo: string;
  tipo: string;
};
