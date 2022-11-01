import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Modal, StyleSheet, View, Pressable, Keyboard } from "react-native";
export default function ({
  modalVisible,
  setModalVisible,
  children,
}: {
  modalVisible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  children: any;
}) {
  const [innerModal, setInnerModal] = useState(false);
  useEffect(() => {
    if (modalVisible === true) {
      setInnerModal(true);
    } else {
      setInnerModal(false);
    }
  }, [modalVisible]);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  function handleCloseModal() {
    if (isKeyboardVisible) {
      setKeyboardVisible(false);
      Keyboard.dismiss();
      return;
    }
    setInnerModal(false);
    setModalVisible(false);
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCloseModal}
    >
      <View style={{ backgroundColor: "#00000099", flex: 1 }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={innerModal}
          onRequestClose={handleCloseModal}
        >
          <Pressable onPress={handleCloseModal} style={{ flex: 1 }} />
          {children}
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000cc",
  },
});
