import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { StyleSheet, Text, View } from "react-native";
import { useCart } from "../context/cartContext";

function CartBadge() {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{totalItems > 9 ? "9+" : totalItems}</Text>
    </View>
  );
}

export default function IOSLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="menu">
        <Icon sf="fork.knife" />
        <Label>Menu</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <Icon sf="cart.fill" />
        <Label>Cart</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <Icon sf="person.fill" />
        <Label>Account</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "#ff6b35",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
});
