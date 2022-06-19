import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Keyboard,
  Route,
} from "react-native";
import { Auth } from "aws-amplify";

import { NavigationProp } from "../../../shared/interfaces/navigation.interface";

import AnimatedInput from "../../../components/AnimatedInput";
import Boton from "../../../components/Boton";
import HidePassword from "../components/HidePassword";

export default function ({
  navigation,
  route,
}: {
  navigation: NavigationProp;
  route: {
    params: {
      username?: string;
      newPassword?: boolean;
    };
  };
}) {
  // Variables del texto
  const [code, setCode] = useState("");
  const [new_password, setNew_pasword] = useState("");

  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState(false);
  const [errorPassword, setErrorPassword] = useState(false);

  const [hidePassword, setHidePassword] = useState(true);

  const newPassword = route.params?.newPassword;

  const [message, setMessage] = useState("");

  const [username, setUsername] = useState(route.params?.username);
  const [errorName, setErrorName] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleReenviar = async () => {
    clearErrors();
    if (!username) {
      newPassword &&
        Alert.alert(
          "Error",
          "Ocurrio un error obteniendo tu correo electronico, por favor contactanos"
        );
      setError("Introduce tu correo electronico");
      setErrorName(true);
      return;
    }
    setLoading(true);

    if (newPassword) {
      console.log("Codigo de contraseña");

      // Reenviar codigo de reestablecimiento de contraseña
      await Auth.forgotPassword(username)
        .then(() => {
          setMessage("Codigo enviado correctamente");
          setTimeout(() => {
            setMessage("");
          }, 3000);
        })
        .catch((error) => {
          Alert.alert("Error", "Error enviando el codigo");
          switch (error.message) {
            case "Attempt limit exceeded, please try after some time.":
              setError("Limite de intentos alcanzado, intentalo en un rato");
              break;
            default:
              setError(error.message);
              console.log(error);
              break;
          }
        });
    }
    // Reenviar codigo de validacion de correo electronico
    else {
      await Auth.resendSignUp(username)
        .then(() => {
          setMessage(`Codigo enviado a ${username}`);
          setTimeout(() => {
            setMessage("");
          }, 3000);
        })
        .catch((error) => {
          switch (error.message) {
            case "Username cannot be empty":
              setErrorName(true);
              setErrorCode(false);
              setError("El correo no puede estar vacio");
              break;
            case "Username/client id combination not found.":
              setErrorName(true);
              setErrorCode(false);
              setError("Usuario no encontrado vuelve a intentarlo");
              break;
            case "Attempt limit exceeded, please try after some time.":
              setErrorName(false);
              setErrorCode(false);
              setError("Limite de intentos alcanzado");
              break;
            default:
              setErrorName(false);
              setErrorCode(false);
              setError(error.message);
              console.log(error);
              break;
          }
        });
    }
    setLoading(false);
  };

  const handleContinuar = async () => {
    const codigo = String(code).replace(" ", "");

    if (!codigo || codigo?.length !== 6) {
      setError("El codigo debe tener 6 digitos");
      setErrorPassword(false);
      setErrorCode(true);

      return;
    }

    clearErrors();
    if (!username) {
      setError("Introduce tu correo electronico");
      setErrorName(true);
      return;
    }
    setLoading(true);

    // Si queremos una nueva contraseña
    if (newPassword) {
      if (!new_password) {
        setError("La contraseña puede estar vacia");
        setErrorPassword(true);
        setErrorCode(false);
      } else {
        await Auth.forgotPasswordSubmit(username, codigo, new_password)
          .then(() => {
            Alert.alert("Exito", "Contraseña actualizada correctamente");
            Keyboard.dismiss();
            navigation.navigate("Login", { username });
          })
          .catch((err) => {
            switch (err.message) {
              case "Confirmation code cannot be empty":
                setError("El codigo no puede estar vacio");
                setErrorPassword(false);
                setErrorCode(true);
                break;
              case "Invalid verification code provided, please try again.":
                setError("Codigo incorrecto, vuelve a intentarlo");
                setErrorPassword(false);
                setErrorCode(true);
                break;

              case "Password did not conform with policy: Password not long enough":
                setError("La contraseña debe tener minimo 8 caracteres");
                setErrorPassword(true);
                setErrorCode(false);
                break;

              case "Password did not conform with policy: Password must have uppercase characters":
                setError("La contraseña debe tener minimo una mayuscula");
                setErrorPassword(true);
                setErrorCode(false);
                break;

              default:
                clearErrors();
                setError(err.message);
                break;
            }
          });
      }
    } else {
      if (!username) {
        setError("El correo no puede estar vacio");
        setErrorCode(false);
        setErrorName(true);
      } else {
        await Auth.confirmSignUp(username, codigo)
          .then(() => {
            clearErrors();
            navigation.popToTop();
            navigation.navigate("Login", { username });
          })
          .catch((error) => {
            switch (error.message) {
              case "Confirmation code cannot be empty":
                setError("El codigo no puede estar vacio");
                setErrorName(false);
                setErrorCode(true);
                break;
              case "Invalid verification code provided, please try again.":
                setError("Codigo incorrecto, vuelve a intentarlo");
                setErrorName(false);
                setErrorCode(true);
                break;
              case "Username cannot be empty":
                setErrorName(true);
                setErrorCode(false);
                setError("El correo no puede estar vacio");
                break;
              case "Username/client id combination not found.":
                setErrorName(true);
                setErrorCode(false);
                setError("Usuario no encontrado vuelve a intentarlo");
                break;
              case "User cannot be confirmed. Current status is CONFIRMED":
                setErrorName(true);
                setErrorCode(false);
                setError("Usuario ya confirmado, inicia sesion");
                break;
              default:
                Alert.alert("Error inesperado", error.message);
                console.log(error);
                break;
            }
          });
      }
    }
    setLoading(false);
  };

  const clearErrors = () => {
    setErrorCode(false);
    setErrorPassword(false);
    setErrorName(false);
    setError("");
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.cuadro} onPress={() => Keyboard.dismiss()}>
        {/* Si es un error que no es de ningun campo */}
        {error && !errorCode && !errorPassword && !errorName ? (
          <Text
            style={{
              alignSelf: "flex-start",
              color: "red",
              height: 20,
              textAlign: "center",
              width: "100%",
            }}
          >
            {error}
          </Text>
        ) : (
          <View style={{ marginTop: 20 }} />
        )}

        <AnimatedInput
          mask={"custom"}
          maskOptions={{
            mask: "999 999",
          }}
          placeholder="Codigo de verificacion"
          value={code}
          onChangeText={(text) => {
            clearErrors();
            setCode(text);
          }}
          keyboardType="phone-pad"
          onEndEditing={clearErrors}
          valid={!errorCode}
          errorText={error}
        />

        {/* En caso que queramos confirmar un codigo */}
        {!newPassword && (
          <AnimatedInput
            placeholder="Email"
            value={username}
            autoCapitalize={"none"}
            onChangeText={(text) => {
              setUsername(text);
              clearErrors();
            }}
            valid={!errorName}
            errorText={error}
          />
        )}

        {/* En caso que queramos nueva contraseña */}
        {newPassword && (
          <View>
            <AnimatedInput
              placeholder="Nueva contraseña"
              value={new_password}
              onChangeText={(text) => {
                setNew_pasword(text);
                clearErrors();
              }}
              secureTextEntry={hidePassword}
              valid={!errorPassword}
              errorText={error}
            />
            <HidePassword
              setHidePassword={setHidePassword}
              hidePassword={hidePassword}
            />
          </View>
        )}

        <Boton
          style={{ marginTop: 10 }}
          titulo="Continuar"
          loading={loading}
          onPress={handleContinuar}
        />

        <Pressable style={styles.reenviar} onPress={handleReenviar}>
          <Text style={{ color: "#689ADA", fontSize: 14 }}>
            Reenviar correo de confirmacion
          </Text>
        </Pressable>
      </Pressable>

      {message !== "" ? (
        <View style={styles.message}>
          <Text style={{ fontSize: 18, color: "#fff", textAlign: "center" }}>
            {message}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cuadro: {
    backgroundColor: "white",
    flex: 1,
  },

  message: {
    backgroundColor: "#53A548",
    position: "absolute",
    alignSelf: "center",
    width: "100%",
    padding: 15,
    paddingHorizontal: 5,
  },
  reenviar: {
    alignSelf: "center",
    marginTop: 20,
  },

  container: {
    padding: 20,
    paddingTop: 10,
    flex: 1,
    backgroundColor: "#fff",
  },
});
