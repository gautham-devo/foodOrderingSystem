import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/authContext";
import { useCart } from "../../context/cartContext";
import { useTheme } from "../../context/themeContext";
import { supabase } from "../../lib/supabase";

type Order = {
  id: string;
  items: { name: string; qty: number; price: number; emoji: string }[];
  total: number;
  created_at: string;
};

export default function AccountScreen() {
  const { colors, dark } = useTheme();
  const { user, logout } = useAuth();
  const { totalItems, totalPrice } = useCart();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [reminder, setReminder] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchOrders();
    }, [user]),
  );

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getDate() - date.getDate();
    if (diff === 0)
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    if (diff === 1)
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    return date.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as any);
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          My Account
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: dark ? "#111" : "#1a1a2e" },
          ]}
        >
          <View style={[styles.avatar, { borderColor: colors.primary }]}>
            <Text style={{ fontSize: 44 }}>👨‍💻</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? "Student"}</Text>
          <View
            style={[
              styles.idBadge,
              {
                backgroundColor: "rgba(0,122,255,0.2)",
                borderColor: "rgba(0,122,255,0.4)",
              },
            ]}
          >
            <Text style={[styles.idText, { color: colors.primary }]}>
              {user?.uid ?? "—"}
            </Text>
          </View>
          <Text style={styles.dept}>Computer Science & Engineering</Text>
          <Text style={styles.college}>🏫 Rajagiri College</Text>
          <View style={styles.statsRow}>
            {[
              { val: `${orders.length}`, label: "Orders" },
              { val: "3rd", label: "Year" },
              { val: `₹${totalSpent}`, label: "Spent" },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Student Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Student Info
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {[
              { icon: "📧", label: "Email", value: user?.email ?? "—" },
              { icon: "📱", label: "Phone", value: user?.phone ?? "—" },
              { icon: "🎓", label: "University ID", value: user?.uid ?? "—" },
              {
                icon: "🏫",
                label: "College",
                value: "Rajagiri College of Social Sciences",
              },
            ].map((row, i, arr) => (
              <View key={i}>
                <View style={styles.infoRow}>
                  <Text style={{ fontSize: 20 }}>{row.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                      {row.label}
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {row.value}
                    </Text>
                  </View>
                </View>
                {i < arr.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Orders {orders.length > 0 && `(${orders.length})`}
          </Text>
          {orders.length === 0 ? (
            <View
              style={[styles.emptyOrders, { backgroundColor: colors.card }]}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🛒</Text>
              <Text
                style={[
                  { fontSize: 13, fontWeight: "600" },
                  { color: colors.subtext },
                ]}
              >
                No orders yet
              </Text>
            </View>
          ) : (
            orders.map((order, index) => (
              <View
                key={order.id}
                style={[styles.orderCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.orderTop}>
                  <Text style={[styles.orderId, { color: colors.text }]}>
                    #{String(index + 1).padStart(3, "0")}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: dark ? "#0e2a12" : "#E8F5E9" },
                    ]}
                  >
                    <Text style={styles.statusText}>Delivered</Text>
                  </View>
                </View>
                <Text
                  style={[
                    { fontSize: 12, marginBottom: 6 },
                    { color: colors.subtext },
                  ]}
                  numberOfLines={1}
                >
                  {order.items
                    .map((i: any) => `${i.emoji} ${i.name}`)
                    .join(", ")}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={[{ fontSize: 11 }, { color: colors.subtext }]}>
                    {formatDate(order.created_at)}
                  </Text>
                  <Text
                    style={[
                      { fontSize: 13, fontWeight: "800" },
                      { color: colors.primary },
                    ]}
                  >
                    ₹{order.total}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferences
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.toggleRow}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                <Text style={{ fontSize: 20 }}>🔔</Text>
                <View>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    Order Notifications
                  </Text>
                  <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                    Get notified when order is ready
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#ddd", true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.toggleRow}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                }}
              >
                <Text style={{ fontSize: 20 }}>⏰</Text>
                <View>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    Pre-order Reminder
                  </Text>
                  <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                    Remind before canteen opens
                  </Text>
                </View>
              </View>
              <Switch
                value={reminder}
                onValueChange={setReminder}
                trackColor={{ false: "#ddd", true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Canteen Timings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Canteen Timings
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {[
              { icon: "🌅", label: "Breakfast", value: "8:00 AM – 10:00 AM" },
              { icon: "☀️", label: "Lunch", value: "12:00 PM – 2:30 PM" },
              { icon: "🌤️", label: "Snacks", value: "4:00 PM – 6:00 PM" },
              {
                icon: "📍",
                label: "Location",
                value: "Ground Floor, Main Block",
              },
            ].map((row, i, arr) => (
              <View key={i}>
                <View style={styles.infoRow}>
                  <Text style={{ fontSize: 20 }}>{row.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.infoLabel, { color: colors.subtext }]}>
                      {row.label}
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {row.value}
                    </Text>
                  </View>
                </View>
                {i < arr.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: colors.card,
                borderColor: dark ? "#4a1a1a" : "#ffdddd",
              },
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {totalItems > 0 && (
        <TouchableOpacity
          style={[
            styles.cartBar,
            { backgroundColor: dark ? "#1c1c1e" : "#1a1a2e" },
          ]}
          onPress={() => router.navigate("/(tabs)/explore" as any)}
        >
          <View style={styles.cartBarLeft}>
            <View
              style={[styles.cartBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
            <View>
              <Text style={styles.cartBarText}>View Cart</Text>
              <Text style={styles.cartBarSub}>
                {totalItems} item{totalItems > 1 ? "s" : ""} added
              </Text>
            </View>
          </View>
          <Text style={[styles.cartBarPrice, { color: colors.primary }]}>
            ₹{totalPrice} →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: (StatusBar.currentHeight || 0) + 50 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  profileCard: { padding: 24, alignItems: "center" },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    backgroundColor: "rgba(0,122,255,0.15)",
    marginBottom: 12,
  },
  name: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 6 },
  idBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
  },
  idText: { fontSize: 13, fontWeight: "700" },
  dept: { color: "#aaa", fontSize: 13, marginBottom: 4, textAlign: "center" },
  college: { color: "#aaa", fontSize: 12, marginBottom: 20 },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: { alignItems: "center", flex: 1 },
  statVal: { color: "#fff", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "#aaa", fontSize: 11, marginTop: 2 },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  section: { paddingHorizontal: 12, paddingTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "800", marginBottom: 10 },
  card: { borderRadius: 14, overflow: "hidden", elevation: 1 },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 13, fontWeight: "600", marginTop: 1 },
  divider: { height: 1, marginHorizontal: 14 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  orderCard: { borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1 },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderId: { fontSize: 14, fontWeight: "800" },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { color: "#388E3C", fontSize: 11, fontWeight: "700" },
  emptyOrders: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    elevation: 1,
  },
  logoutBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 8,
  },
  logoutText: { color: "#e53935", fontSize: 15, fontWeight: "700" },
  cartBar: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 10,
  },
  cartBarLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  cartBadge: {
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  cartBarText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cartBarSub: { color: "#aaa", fontSize: 11, marginTop: 1 },
  cartBarPrice: { fontSize: 16, fontWeight: "800" },
});
