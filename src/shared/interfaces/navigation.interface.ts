import { CompositeNavigationProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

export type NavigationProp = CompositeNavigationProp<
  StackNavigationProp<any, "Profile">,
  StackNavigationProp<any>
>;
