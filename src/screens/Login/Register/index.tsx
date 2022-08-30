import { useState } from "react";
import {
  Button,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AnimatedInput from "../../../components/AnimatedInput";

import Boton from "../../../components/Boton";
import LoginHeader from "../components/LoginHeader";

import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import { Auth } from "aws-amplify";
import HidePassword from "../components/HidePassword";

export default function ({ navigation }: { navigation: NavigationProp }) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");

  // Estado de errores parametros
  const [errorEmail, setErrorEmail] = useState("");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const [buttonLoading, setButtonLoading] = useState(false);

  const [hidePassword, setHidePassword] = useState(true);

  function navigateLogin() {
    navigation.replace("Login");
  }

  const handleRegistrarse = async () => {
    if (nombre.length < 4) {
      clearError();
      setErrorNombre("El usuario tiene que ser mayor a 4 caracteres");
      return;
    }
    if (email === "") {
      clearError();
      setErrorEmail("El correo no puede estar vacio");
      return;
    }
    if (password === "") {
      clearError();
      setErrorPassword("La contraseña no puede estar vacia");
      return;
    }
    setButtonLoading(true);
    await Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        nickname: nombre,
      },
    })
      .then((user) => {
        //Una vez le damos a registrar, se crea el nuevo perfil con la api key
        navigation.navigate("Confirm", { username: email });
        clearError();
        setNombre("");
        setEmail("");
        setPassword("");
      })
      .catch((error) => {
        switch (error.message) {
          case "Invalid email address format.":
            clearError();
            setErrorEmail("Email no invalido");
            break;
          case "Password cannot be empty":
            clearError();
            setErrorPassword("La contraseña no puede estar vacia");
            break;
          case "An account with the given email already exists.":
          case "User already exists":
            clearError();
            setErrorEmail("La cuenta ya existe por favor inicia sesion");
            break;
          case "Username cannot be empty":
            clearError();
            setErrorEmail("El correo puede estar vacio");
            break;
          case "Password did not conform with policy: Password must have uppercase characters":
            clearError();
            setErrorPassword(
              "La contraseña debe contener minimo una mayuscula"
            );
            break;
          case "Password did not conform with policy: Password not long enough":
            clearError();
            setErrorPassword("La contraseña debe contener minimo 8 caracteres");
            break;
          case "1 validation error detected: Value at 'password' failed to satisfy constraint: Member must satisfy regular expression pattern: ^[\\S]+.*[\\S]+$":
            clearError();
            setErrorPassword("La contraseña debe ser alfanumerica");
            break;
          default:
            clearError();
            console.log(error);
            break;
        }
      });
    setButtonLoading(false);
  };

  function clearError() {
    setErrorEmail("");
    setErrorPassword("");
    setErrorNombre("");
    setButtonLoading(false);
  }

  return (
    <>
      <Pressable onPress={Keyboard.dismiss} style={styles.inputContainer}>
        <LoginHeader register />
        <AnimatedInput
          placeholder="Nickname"
          prefix="@"
          valid={!errorNombre}
          autoCapitalize={"none"}
          errorText={errorNombre}
          onChangeText={(text) => {
            setNombre(text);
            clearError();
          }}
          value={nombre}
          styleLabel={{ fontWeight: "600" }}
        />
        <AnimatedInput
          placeholder="Email"
          valid={!errorEmail}
          errorText={errorEmail}
          autoCapitalize={"none"}
          onChangeText={(text) => {
            setEmail(text);
            clearError();
          }}
          value={email}
          styleLabel={{ fontWeight: "600" }}
        />
        <View>
          <AnimatedInput
            placeholder="Contraseña"
            valid={!errorPassword}
            autoCapitalize={"none"}
            secureTextEntry={hidePassword}
            errorText={errorPassword}
            onChangeText={(text) => {
              setPassword(text);
              clearError();
            }}
            value={password}
            styleLabel={{ fontWeight: "600" }}
          />

          <HidePassword
            setHidePassword={setHidePassword}
            hidePassword={hidePassword}
          />
        </View>
      </Pressable>
      <Boton
        loading={buttonLoading}
        onPress={handleRegistrarse}
        style={{ marginHorizontal: 30, marginBottom: 20 }}
        titulo="Registrarse"
      />

      <TouchableOpacity onPress={navigateLogin}>
        <Text style={{ ...styles.forget, marginBottom: 20 }}>
          ¿Ya tienes cuenta?{" "}
          <Text style={{ color: "blue" }}>Inicia sesion</Text>
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 30,
    backgroundColor: "#FFF",
  },

  forget: {
    color: "#555",
    textAlign: "center",
    padding: 5,
  },
  container: {
    flex: 1,
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },

  inutContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
