import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/authContext";
import { useCart } from "../../context/cartContext";
import { useTheme } from "../../context/themeContext";

export default function CartScreen() {
  const {
    cart,
    increaseQty,
    decreaseQty,
    totalItems,
    totalPrice,
    clearCart,
    placeOrder,
  } = useCart();
  const router = useRouter();
  const { colors, dark } = useTheme();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { user } = useAuth();
  const taxes = Math.round(totalPrice * 0.05);
  const delivery = totalPrice > 0 ? 30 : 0;
  const grandTotal = totalPrice + taxes + delivery;

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  const handleConfirm = async () => {
    if (!user) return;
    bottomSheetRef.current?.close();
    const { error } = await placeOrder(user.id, grandTotal);
    if (error) {
      Alert.alert("Cannot Place Order", error);
      return;
    }
    setTimeout(() => setOrderPlaced(true), 300);
  };

  if (orderPlaced) {
    return (
      <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Text style={{ fontSize: 80 }}>🎉</Text>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Order Placed!
          </Text>
          <Text style={[styles.successSub, { color: colors.subtext }]}>
            Your order has been received.{"\n"}It'll be ready soon!
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => {
              setOrderPlaced(false);
              router.replace("/(tabs)/" as any);
            }}
          >
            <Text style={styles.btnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Your Cart
          </Text>
        </View>
        <View style={styles.center}>
          <Text style={{ fontSize: 64 }}>🛒</Text>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Cart is empty
          </Text>
          <Text style={[styles.successSub, { color: colors.subtext }]}>
            Add some delicious items from our menu
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => router.navigate("/(tabs)/menu" as any)}
          >
            <Text style={styles.btnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Your Cart
        </Text>
        <Text style={[styles.headerSub, { color: colors.subtext }]}>
          {totalItems} item{totalItems > 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Items</Text>
        {cart.map((item) => (
          <View
            key={item.id}
            style={[styles.cartItem, { backgroundColor: colors.card }]}
          >
            <Text style={{ fontSize: 34, marginRight: 12 }}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.subtext }]}>
                ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
              </Text>
            </View>
            <View style={[styles.qtyRow, { backgroundColor: colors.primary }]}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => decreaseQty(item.id)}
              >
                <Text style={styles.qtyText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{item.qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => increaseQty(item.id)}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text
          style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}
        >
          Bill Summary
        </Text>
        <View style={[styles.billCard, { backgroundColor: colors.card }]}>
          {[
            { label: "Item Total", value: `₹${totalPrice}` },
            { label: "Delivery Fee", value: `₹${delivery}` },
            { label: "Taxes (5%)", value: `₹${taxes}` },
          ].map((row, i) => (
            <View key={i} style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.subtext }]}>
                {row.label}
              </Text>
              <Text style={[styles.billValue, { color: colors.text }]}>
                {row.value}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.billRow}>
            <Text style={[styles.billTotal, { color: colors.text }]}>
              Grand Total
            </Text>
            <Text style={[styles.billTotal, { color: colors.primary }]}>
              ₹{grandTotal}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Bar */}
      <View
        style={[
          styles.checkout,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.addMoreBtn, { borderColor: colors.primary }]}
          onPress={() => router.navigate("/(tabs)/menu" as any)}
        >
          <Text style={[styles.addMoreText, { color: colors.primary }]}>
            + Add More
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
          onPress={() => bottomSheetRef.current?.expand()}
        >
          <Text style={styles.btnText}>Checkout ₹{grandTotal}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["57%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: dark ? "#1c1c1e" : "#ffffff" }}
        handleIndicatorStyle={{ backgroundColor: dark ? "#444" : "#ddd" }}
      >
        <BottomSheetView style={styles.sheetContent}>
          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetHeaderIcon}>🧾</Text>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              Confirm Order
            </Text>
          </View>

          {/* Payment Method */}
          <View
            style={[
              styles.paymentRow,
              { backgroundColor: dark ? "#2c2c2e" : "#f5f5f5" },
            ]}
          >
            <View
              style={[
                styles.paymentIcon,
                { backgroundColor: dark ? "#3a3a3c" : "#e0e0e0" },
              ]}
            >
              <Text style={{ fontSize: 20 }}>💳</Text>
            </View>
            <View>
              <Text style={[styles.paymentLabel, { color: colors.subtext }]}>
                Payment Method
              </Text>
              <Text style={[styles.paymentValue, { color: colors.text }]}>
                Campus Wallet
              </Text>
            </View>
          </View>

          {/* Bill Breakdown */}
          <View style={styles.sheetBill}>
            {[
              { label: "Item Total", value: `₹${totalPrice}` },
              { label: "Delivery Fee", value: `₹${delivery}` },
              { label: "Taxes (5%)", value: `₹${taxes}` },
            ].map((row, i) => (
              <View key={i} style={styles.sheetBillRow}>
                <Text
                  style={[styles.sheetBillLabel, { color: colors.subtext }]}
                >
                  {row.label}
                </Text>
                <Text style={[styles.sheetBillValue, { color: colors.text }]}>
                  {row.value}
                </Text>
              </View>
            ))}
            <View
              style={[styles.sheetDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.sheetBillRow}>
              <Text style={[styles.sheetTotalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.sheetTotalValue, { color: colors.primary }]}>
                ₹{grandTotal}
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>
              Confirm & Pay ₹{grandTotal}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: (StatusBar.currentHeight || 0) + 50 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  headerSub: { fontSize: 12, marginTop: 2 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 8,
  },
  successSub: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  btn: { borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14 },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  cartItem: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    elevation: 1,
  },
  itemName: { fontSize: 14, fontWeight: "700" },
  itemPrice: { fontSize: 12, marginTop: 3 },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  qtyText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  qtyNum: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 6,
  },
  billCard: { borderRadius: 12, padding: 16, elevation: 1 },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  billLabel: { fontSize: 13 },
  billValue: { fontSize: 13, fontWeight: "600" },
  divider: { height: 1, marginVertical: 6 },
  billTotal: { fontSize: 15, fontWeight: "800" },
  checkout: {
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: 90,
    flexDirection: "row",
    gap: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 12,
  },
  addMoreBtn: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addMoreText: { fontSize: 13, fontWeight: "700" },
  checkoutBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  // Sheet
  sheetContent: { paddingHorizontal: 20, paddingBottom: 20 },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  sheetHeaderIcon: { fontSize: 24 },
  sheetTitle: { fontSize: 18, fontWeight: "800" },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentLabel: { fontSize: 11, marginBottom: 2 },
  paymentValue: { fontSize: 14, fontWeight: "700" },
  sheetBill: { marginBottom: 24 },
  sheetBillRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sheetBillLabel: { fontSize: 13 },
  sheetBillValue: { fontSize: 13, fontWeight: "600" },
  sheetDivider: { height: 1, marginVertical: 8 },
  sheetTotalLabel: { fontSize: 16, fontWeight: "800" },
  sheetTotalValue: { fontSize: 18, fontWeight: "900" },
  confirmBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    elevation: 6,
  },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
