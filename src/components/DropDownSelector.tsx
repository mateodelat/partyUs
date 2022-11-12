import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { azulClaro, mayusFirstLetter, shadowMarcada } from "../../constants";

import { MaterialIcons } from "@expo/vector-icons";

export default function ({
  items,
  handleSelectItem,
  selectedItem,
}: {
  items: string[];
  handleSelectItem: (item: string) => void;
  selectedItem?: string;
}) {
  let { height, width } = Dimensions.get("screen");
  width = width < height ? width : height;
  height = height < width ? height : width;

  const [shown, setShown] = useState(false);
  return (
    <View>
      {shown && (
        <Pressable
          onPress={() => setShown(false)}
          style={{
            top: -height,
            left: -width,
            height: height * 2,
            width: width * 2,

            position: "absolute",
            zIndex: 1,
            elevation: 1,
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => {
          setShown(!shown);
        }}
        style={styles.dropDownContainer}
      >
        <Text
          style={{
            ...styles.selectedDropDownTxt,
            color: azulClaro,
          }}
        >
          {mayusFirstLetter(selectedItem)}
        </Text>
        <MaterialIcons
          name={("keyboard-arrow-" + (shown ? "up" : "down")) as any}
          size={35}
          color={azulClaro}
        />
      </TouchableOpacity>

      {shown && (
        <View style={styles.dropDownList}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {items.map((m, idx) => {
              const selected = selectedItem === m;
              function handlePress() {
                if (selected) return;
                handleSelectItem(m);
                setShown(false);
              }

              return (
                <TouchableOpacity
                  onPress={handlePress}
                  activeOpacity={selected ? 1 : 0.2}
                  style={{
                    ...styles.itemDropDown,
                  }}
                  key={idx}
                >
                  <Text
                    style={{
                      ...styles.selectedDropDownTxt,
                      color: selected ? azulClaro : "#555",
                    }}
                  >
                    {mayusFirstLetter(m)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropDownContainer: {
    backgroundColor: azulClaro + "0e",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  selectedDropDownTxt: {
    fontSize: 18,
    flex: 1,
    color: "#555",
  },

  dropDownList: {
    width: "100%",

    position: "absolute",
    backgroundColor: "#fff",
    maxHeight: 200,
    zIndex: 1,
    elevation: 1,
    top: 55,

    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: azulClaro + "0e",
    paddingBottom: 15,
  },

  itemDropDown: {
    padding: 15,
  },
});
