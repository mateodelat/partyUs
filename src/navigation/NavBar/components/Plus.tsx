import React from "react";
import {
  View,
  StyleSheet,
  TouchableHighlight,
  Animated,
  Pressable,
  Dimensions,
  ViewProps,
} from "react-native";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
  Ionicons,
} from "@expo/vector-icons";
import { NavigationProp, useNavigation } from "@react-navigation/native";

const color = "#f34856";

const { width, height } = Dimensions.get("screen");

type MyProps = {
  navigation: NavigationProp<any>;
};

class PlusButton extends React.Component<MyProps> {
  mode = new Animated.Value(0);
  buttonSize = new Animated.Value(1);

  handleButton1 = () => {
    this.props.navigation.navigate("MisReservas");
  };

  handleButton2 = () => {
    this.props.navigation.navigate("QRCode");
  };

  handleButton3 = () => {
    this.props.navigation.navigate("AgregarEventoStack");
  };

  handlePress = () => {
    Animated.sequence([
      Animated.timing(this.mode, {
        toValue: (this.mode as any)._value === 0 ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  };

  render() {
    const icon1X = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-24, -100],
    });

    const icon1Y = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, -100],
    });

    const icon2X = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-24, -24],
    });

    const icon2Y = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, -150],
    });

    const icon3X = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-24, 50],
    });

    const icon3Y = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: [-50, -100],
    });

    const rotation = this.mode.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "45deg"],
    });

    const sizeStyle = {
      transform: [{ scale: this.buttonSize }],
    };

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
              <MaterialCommunityIcons
                name="ticket-outline"
                size={24}
                color="white"
              />
            </TouchableHighlight>
          </Animated.View>

          {/* Boton 2 */}
          <Animated.View
            style={{ position: "absolute", left: icon2X, top: icon2Y }}
          >
            <TouchableHighlight
              underlayColor={"#f13040"}
              onPress={this.handleButton2}
              style={styles.secondaryButton}
            >
              <Ionicons name="ios-qr-code" size={24} color="white" />
            </TouchableHighlight>
          </Animated.View>

          {/* Boton 3*/}
          <Animated.View
            style={{ position: "absolute", left: icon3X, top: icon3Y }}
          >
            <TouchableHighlight
              underlayColor={"#f13040"}
              onPress={this.handleButton3}
              style={styles.secondaryButton}
            >
              <FontAwesome5 name="plus" size={18} color="#FFF" />
            </TouchableHighlight>
          </Animated.View>

          <Animated.View style={[styles.button, sizeStyle]}>
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
export default function () {
  const navigation = useNavigation();

  return <PlusButton navigation={navigation} />;
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
    backgroundColor: color,
    position: "absolute",
    marginTop: -60,
    shadowColor: color,
    shadowRadius: 5,
    shadowOffset: { height: 10, width: 10 },
    shadowOpacity: 0.3,
    borderWidth: 12,
    borderColor: "#FFFFFF",
  },

  secondaryButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: color,
  },
});
