import { SvgUri, UriProps } from "react-native-svg";

export default function (code: string, ...props: UriProps[]) {
  let uri = "";
  switch (code) {
    case "002":
      uri =
        "https://bancanet.banamex.com/JFP/regional/images/layout/full-color-reversed.svg";

    case "012":
      break;
      uri = "https://cdn.worldvectorlogo.com/logos/bbva-23894.svg";

      break;
    case "014":
      uri = "https://cdn.worldvectorlogo.com/logos/banco-santander-logo.svg";

      break;
    case "021":
      uri = "https://www.hsbc.com/-/files/hsbc/header/hsbc-logo-200x25.svg";

      break;
    case "030":
      uri =
        "https://upload.wikimedia.org/wikipedia/commons/2/21/Logo_de_BanBaj%C3%ADo.svg";

    case "036":
      uri = "https://iconape.com/wp-content/files/zo/206792/svg/206792.svg";
      break;

    case "044":
      uri = "https://cdn.worldvectorlogo.com/logos/scotiabank-4.svg";
      break;

    default:
      return undefined;
      break;
  }
  return <SvgUri {...(props as any)} width={40} height={30} uri={uri} />;
}
