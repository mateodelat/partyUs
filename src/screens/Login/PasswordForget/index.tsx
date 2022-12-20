import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, Keyboard } from "react-native";
import { Auth } from "aws-amplify";
import { NavigationProp } from "../../../shared/interfaces/navigation.interface";
import Boton from "../../../components/Boton";
import AnimatedInput from "../../../components/AnimatedInput";

export default ({
  route: { params },
  navigation,
}: {
  route: {
    params: {
      username?: string;
    };
  };
  navigation: NavigationProp;
}) => {
  const [email, setEmail] = useState(params.username);
  const [check, setCheck] = useState(true);

  const [loading, setLoading] = useState(false);
  const [doneLoading, setDoneLoading] = useState(false);

  const [error, setError] = useState("");

  const handleRecuperar = async () => {
    setLoading(true);
    if (!email || email === "") {
      setError("El usuario no puede estar vacio");
      setCheck(false);
    } else {
      await Auth.forgotPassword(email)
        .then(() => {
          Alert.alert("Codigo enviado correctamente");
          navigation.navigate("Confirm", {
            username: email,
            newPassword: true,
          });
          setDoneLoading(true);
          setLoading(false);
        })
        .catch((error) => {
          var errorMessage = error.message;

          switch (errorMessage) {
            case "Username/client id combination not found.":
              setError("Este usuario no existe");
              setCheck(false);
              break;

            case "Username cannot be empty":
              setError("El usuario no puede estar vacio");
              setCheck(false);
              break;

            case "Cognito received the following":
              setError("Error, el usuario no esta verificado");
              setCheck(false);
              break;

            default:
              setError(errorMessage);
              setCheck(false);
              break;
          }
        });
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.innerContainer}
        onPress={() => Keyboard.dismiss()}
      >
        <AnimatedInput
          style={{ flex: 1 }}
          value={email}
          placeholder="Correo electronico"
          onChangeText={(text) => {
            setEmail(text);
            setCheck(true);
          }}
          editable={!check}
          // onChangeEnd={() => setError("")}
          errorText={error}
          valid={check}
        />

        <Boton
          onPress={handleRecuperar}
          titulo={"Enviar codigo"}
          done={doneLoading}
          loading={loading}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  innerContainer: {
    flex: 1,
    padding: 30,
    backgroundColor: "#fff",
  },
});
