import { useState } from "react";
import {
  Alert,
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Route,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AnimatedInput from "../../../components/AnimatedInput";

import LoginHeader from "../components/LoginHeader";
import Boton from "../../../components/Boton";
import { SafeAreaView } from "react-native-safe-area-context";
import HidePassword from "../components/HidePassword";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import { Auth } from "aws-amplify";

export default function ({
  navigation,
  route,
}: {
  navigation: NavigationProp;
  route: { params: any };
}) {
  const username = route?.params?.username;
  const onLogin = route?.params?.onLogin;

  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(username);

  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const [buttonLoading, setButtonLoading] = useState(false);

  const [hidePassword, setHidePassword] = useState(true);

  function navigteRegister() {
    navigation.replace("Register");
  }

  function handleForget() {
    navigation.navigate("PasswordForget", {
      username: email,
    });
  }

  function navigateCode() {
    navigation.navigate("Confirm", {
      username: email,
    });
  }

  const handleLogin = async () => {
    if (email === "") {
      setErrorEmail("El correo no puede estar vacio");
      setErrorPassword("");
      return;
    }

    if (password === "") {
      setErrorEmail("");
      setErrorPassword("La contraseña no puede estar vacia");
      return;
    }

    setButtonLoading(true);
    await Auth.signIn(email, password)
      .then(() => {
        setErrorEmail("");
        setErrorPassword("");
        setPassword("");
        setEmail("");
        setButtonLoading(false);
        navigation.pop();
        onLogin ? onLogin() : null;
      })
      .catch(function (error) {
        setButtonLoading(false);

        // Handle Errors here.
        var errorCode = error.code;
        switch (errorCode) {
          case "UserNotConfirmedException":
            setErrorEmail("Por favor confirma tu usuario");
            setErrorPassword("");
            break;

          case "UserNotFoundException":
            setErrorPassword("");
            setErrorEmail("El usuario no existe");
            break;

          case "NotAuthorizedException":
            setErrorPassword("Contraseña incorrecta, vuelve a intentarlo");
            setErrorEmail("");
            break;

          default:
            console.log(error);
            Alert.alert(error.message);
            setButtonLoading(false);
            setErrorEmail("");
            setErrorPassword("");

            break;
        }
      });
  };

  function clearErrors() {
    setErrorEmail("");
    setErrorPassword("");
    setButtonLoading(false);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <Pressable onPress={Keyboard.dismiss} style={styles.inputContainer}>
        <LoginHeader />
        <AnimatedInput
          placeholder="Email"
          valid={!errorEmail}
          autoCapitalize={"none"}
          errorText={errorEmail}
          onChangeText={(text) => {
            setEmail(text);
            clearErrors();
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
              clearErrors();
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
        style={{ marginHorizontal: 30, marginBottom: 10 }}
        titulo="Login"
        onPress={handleLogin}
      />

      <TouchableOpacity onPress={navigateCode}>
        <Text style={styles.forget}>Confirmar codigo</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleForget}>
        <Text style={styles.forget}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={navigteRegister}>
        <Text style={{ ...styles.forget, marginBottom: 20 }}>
          ¿No tienes cuenta? <Text style={{ color: "blue" }}>Registrate</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 30,
  },

  forget: {
    textAlign: "center",
    padding: 3,
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
