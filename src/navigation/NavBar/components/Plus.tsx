import React from "react";
import {
  View,
  StyleSheet,
  TouchableHighlight,
  Animated,
  Pressable,
  Dimensions,
  ViewProps,
  Alert,
} from "react-native";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import {
  AsyncAlert,
  getUserSub,
  rojoClaro,
  shadowMedia,
} from "../../../../constants";
import useUser from "../../../Hooks/useUser";
import { Usuario } from "../../../models";

const { width, height } = Dimensions.get("screen");

type MyProps = {
  navigation: NavigationProp<any>;
  user?: Usuario;
};

class PlusButton extends React.Component<MyProps> {
  mode = new Animated.Value(0);

  handleButton1 = () => {
    this.props.navigation.navigate("QRScanner");
  };

  handleButton2 = () => {
    this.props.navigation.navigate("AgregarEventoStack");
  };

  handlePress = async () => {
    // Si el usuario no es organizador se manda alerta
    const { user, navigation } = this.props;

    const organizador = user?.organizador;

    // Si no esta el usuario pasar a logearlo
    if (!(await getUserSub())) {
      navigation.navigate("LoginStack");
      return;
    }

    if (!organizador) {
      Alert.alert(
        "Atencion",
        "¿Quieres registrarte como organizador para agrgar eventos?",
        [
          {
            text: "CANCELAR",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => navigation.navigate("SolicitudOrganizador"),
          },
        ]
      );
    } else {
      Animated.timing(this.mode, {
        toValue: (this.mode as any)._value === 0 ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }).start();
    }
  };

  render() {
    const icon1X = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-24, -110],
    });

    const icon1Y = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-40, -60],
    });

    const icon2X = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-24, -60],
    });

    const icon2Y = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, -124],
    });

    const rotation = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "45deg"],
    });

    return (
      <View>
        <Pressable onPress={this.handlePress} style={styles.container}>
          {/* Boton 1 */}
          <Animated.View
            style={{
              position: "absolute",
              left: icon1X,
              top: icon1Y,
            }}
          >
            <TouchableHighlight
              underlayColor={"#f13040"}
              onPress={this.handleButton1}
              style={styles.secondaryButton}
            >
              <Ionicons name="ios-qr-code" size={24} color="white" />
            </TouchableHighlight>
          </Animated.View>

          {/* Boton 2 */}
          <Animated.View
            style={{
              position: "absolute",
              left: icon2X,
              top: icon2Y,
            }}
          >
            <TouchableHighlight
              underlayColor={"#f13040"}
              onPress={this.handleButton2}
              style={styles.secondaryButton}
            >
              <MaterialCommunityIcons name="plus" size={24} color="white" />
            </TouchableHighlight>
          </Animated.View>

          <Animated.View style={styles.button}>
            <View>
              <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                <FontAwesome5 name="plus" size={24} color="#FFF" />
              </Animated.View>
            </View>
          </Animated.View>
        </Pressable>
      </View>
    );
  }
}

// Wrap and export
export default function ({}) {
  const navigation = useNavigation();
  const user = useUser().usuario;

  return <PlusButton navigation={navigation} user={user} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },

  button: {
    alignItems: "center",
    justifyContent: "center",
    width: 82,
    height: 82,
    borderRadius: 80,
    backgroundColor: rojoClaro,
    position: "absolute",
    marginTop: -60,
    borderWidth: 12,
    borderColor: "#FFFFFF",

    ...shadowMedia,
  },

  secondaryButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: rojoClaro,
  },
});
