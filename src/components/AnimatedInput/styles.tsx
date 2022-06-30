import { StyleSheet } from "react-native";

export default StyleSheet.create({
  content: {
    justifyContent: "flex-end",
  },
  wrapper: {
    flex: 1,
    justifyContent: "space-between",
  },
  input: {
    fontSize: 18,
    flex: 1,
  },
  prefix: {
    fontSize: 20,
  },
  bodyContent: {
    borderBottomColor: "black",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  toucheableLineContent: {
    flexDirection: "row",
  },
  label: {
    fontSize: 13,
    color: "#606060",
    fontWeight: "600",
  },
  error: {
    marginBottom: 5,
    color: "#d32f2f",
    fontSize: 13,
    marginTop: 2,
  },
  sufix: {
    flexDirection: "column-reverse",
  },
});
