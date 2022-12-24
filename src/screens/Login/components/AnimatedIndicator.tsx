import React from "react";
import { Animated } from "react-native";

//Los 3 puntitos creados mediante views con color negro y radius para que sean circulos
export default function Indicator({
  scrollX,
  width,
  data,
  opacity,
}: {
  scrollX: Animated.Value;
  width: number;
  data: Array<any>;
  opacity?: Animated.AnimatedInterpolation<any>;
}) {
  return (
    <Animated.View
      style={{
        flexDirection: "row",
        borderRadius: 10,
        opacity,
      }}
    >
      {data?.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 0.8, 0.4],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={"inidicator-" + i}
            style={{
              height: 15,
              width: 15,
              borderRadius: 15,
              backgroundColor: "white",
              margin: 5,
              opacity,
              // transform: [{
              //     scale
              // }]
            }}
          ></Animated.View>
        );
      })}
    </Animated.View>
  );
}
