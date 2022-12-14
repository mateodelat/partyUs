import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ViewStyle,
  View,
} from "react-native";
import {
  colorFondo,
  fetchWithTimeout,
  isUrl,
  openCameraPickerAsync,
  openImagePickerAsync,
} from "../../constants";

import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

export default function ({
  setModalVisible,
  style,
  data,

  titulo,
}: {
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  style?: ViewStyle;

  titulo: string;
  data: {
    icon: React.FunctionComponent;
    onPress: () => void;
    titulo: string;
  }[];
}) {
  const [innerModal, setInnerModal] = useState(false);

  useEffect(() => {
    setInnerModal(true);
  }, []);

  function handleCloseModal() {
    setInnerModal(false);
    setModalVisible(false);
  }

  return (
    <View style={{ ...styles.container, ...style }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={innerModal}
        onRequestClose={() => {
          setInnerModal(false);
          setModalVisible(false);
        }}
      >
        <>
          <Pressable onPress={handleCloseModal} style={{ flex: 1 }} />
          <View style={{ ...styles.innerContainer, paddingTop: 20 }}>
            <View style={styles.header}>
              <Text style={styles.title}>{titulo}</Text>
              <Feather
                onPress={handleCloseModal}
                name="x"
                size={30}
                color="gray"
              />
            </View>

            {/* Mapear la informacion recibida */}

            {data.map((e, idx) => {
              const Icono = e.icon;

              return (
                <Pressable key={idx} onPress={e.onPress} style={styles.row}>
                  <View style={styles.icon}>
                    <Icono />
                  </View>
                  <Text style={styles.subTitle}>{e.titulo}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000cc",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  innerContainer: {
    backgroundColor: colorFondo,
    padding: 15,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  icon: {
    borderRadius: 100,
    backgroundColor: "#00000022",
    marginRight: 20,
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  row: {
    flexDirection: "row",
    marginVertical: 10,
    alignItems: "center",
  },

  subTitle: {
    fontSize: 18,
  },

  inputText: {
    fontSize: 18,
    padding: 10,
    backgroundColor: "#00000015",
    flex: 1,
    marginRight: 10,
    borderRadius: 7,
  },

  mas: {
    position: "absolute",
    left: 32,
    top: 13,
  },
});
