import { Animated, StyleSheet, Text, View, ViewStyle } from "react-native";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Slider } from "@miblanchard/react-native-slider";
import { rojoClaro } from "../../constants";

export default function ({
  value,
  setValue,

  minimumValue,
  maximumValue,

  step,

  style,

  prefix,
  sufix,

  placeholderStyle,
}: {
  value: number[];
  setValue: React.Dispatch<React.SetStateAction<number[]>>;

  minimumValue: number;
  maximumValue: number;

  style?: ViewStyle;
  step?: number;

  prefix?: string;
  sufix?: string;

  placeholderStyle?: ViewStyle;
}) {
  return (
    <Slider
      containerStyle={style}
      trackStyle={{ height: 3 }}
      value={value}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      maximumTrackTintColor="#d3d3d3"
      minimumTrackTintColor={rojoClaro}
      thumbTintColor={rojoClaro}
      renderThumbComponent={() => {
        return <View style={styles.bolitaDeslizable} />;
      }}
      step={step}
      renderAboveThumbComponent={(props) => {
        return (
          <IndicadorValor
            style={placeholderStyle}
            value={value[props]}
            sufix={sufix}
            prefix={prefix}
            minValue={minimumValue}
            maxValue={maximumValue}
          />
        );
      }}
      onValueChange={(value) => {
        if (typeof value !== "number") {
          setValue(value);
        }
      }}
    />
  );
}

function IndicadorValor({
  value,
  prefix,
  sufix,
  style,
  maxValue,
  minValue,
}: {
  maxValue: number;
  minValue: number;

  value: number;
  prefix?: string;
  sufix?: string;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0)).current;

  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
    } else {
      Animated.timing(opacity, {
        toValue: 1,
        useNativeDriver: false,
        duration: 100,
      }).start();
    }

    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        useNativeDriver: false,
        duration: 300,
      }).start();
    }, 1000);

    return () => {
      clearTimeout(t);
    };
  }, [value]);

  if (!value || value === maxValue || value === minValue) return <></>;

  return (
    <Animated.View style={{ ...styles.container, opacity, ...style }}>
      <Animated.Text style={{ ...styles.text, opacity }} numberOfLines={1}>
        {prefix ? prefix : ""}
        {value}
        {sufix ? sufix : ""}
      </Animated.Text>
      <Animated.View style={{ ...styles.triangulo, opacity }} />
      <Animated.View style={{ ...styles.triangulo, opacity }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bolitaDeslizable: {
    width: 20,
    height: 20,
    borderRadius: 20,

    borderWidth: 3,
    borderColor: rojoClaro,

    backgroundColor: "#fff",
  },

  container: {
    left: -15,
    padding: 4,
    width: 55,
    backgroundColor: rojoClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  triangulo: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    bottom: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: rojoClaro,
    transform: [{ rotate: "180deg" }],
    position: "absolute",
  },

  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});
