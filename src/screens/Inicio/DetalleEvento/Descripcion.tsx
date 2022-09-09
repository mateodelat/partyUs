import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, ViewStyle } from "react-native";
import { vibrar, VibrationType } from "../../../../constants";

const Descripcion = ({
  descripcion,
  style,
}: {
  descripcion: string;
  style?: ViewStyle;
}) => {
  const [detallesAbierto, setDetallesAbierto] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const NUM_OF_LINES = 3;

  const handleMas = () => {
    if (!detallesAbierto) {
      vibrar(VibrationType.light);
      setDetallesAbierto(true);
    } else {
      setDetallesAbierto(false);
    }
  };

  const onTextLayout = React.useCallback((e) => {
    console.log(e.nativeEvent.lines.length);
    setShowMore(e.nativeEvent.lines.length > NUM_OF_LINES);
  }, []);

  return (
    <View style={{ ...styles.container, ...style }}>
      <Text
        numberOfLines={detallesAbierto ? undefined : NUM_OF_LINES}
        style={styles.descripcion}
        onTextLayout={onTextLayout}
      >
        {descripcion}
      </Text>
      {showMore && (
        <Text style={styles.mas} onPress={handleMas}>
          {detallesAbierto ? "Ocultar" : "Ver mas"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    marginTop: 10,
  },

  descripcion: {
    color: "#00000099",
    fontSize: 16,
    lineHeight: 20,
    marginTop: 10,
  },

  mas: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 5,
  },
});

export default Descripcion;
