import { Platform } from "react-native";
import AndroidLayout from "../../components/android-layout";
import IOSLayout from "../../components/ios-layout";

export default function TabLayout() {
  return Platform.OS === "ios" ? <IOSLayout /> : <AndroidLayout />;
}
