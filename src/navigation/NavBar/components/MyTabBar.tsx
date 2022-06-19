import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

import { shadowMarcada } from "../../../../constants";

const { width } = Dimensions.get("screen");

export default function ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        bottom: 20,
        position: "absolute",
        backgroundColor: "#fff",
        alignSelf: "center",
        borderRadius: 10,
        paddingHorizontal: 10,
        width: width - 40,
        justifyContent: "space-around",
        ...shadowMarcada,
      }}
    >
      {state.routes.map(
        (
          route: {
            name: string;
            key: string;
          },
          index
        ) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isDisabled = label === "Plus";

          const isFocused = state.index === index;

          const Icon = () =>
            options.tabBarIcon
              ? options.tabBarIcon({
                  focused: isFocused,
                  color: "#FFF",
                  size: 10,
                })
              : null;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // The `merge: true` option makes sure that the params inside the tab screen are preserved
              navigation.navigate(route.name, { merge: true });
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          if (isDisabled)
            return (
              <View key={route.key} style={styles.iconContainer}>
                {Icon()}
              </View>
            );

          if (isFocused) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  ...styles.iconContainer,
                  width: 120,
                }}
              >
                {Icon()}

                <Text
                  style={{
                    color: "#222",
                    fontSize: 16,
                    fontWeight: "bold",
                    marginLeft: 5,
                  }}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.iconContainer}
            >
              {Icon()}
            </TouchableOpacity>
          );
        }
      )}

      {/*  */}
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 25,

    flexDirection: "row",

    flex: 1,
  },
});
