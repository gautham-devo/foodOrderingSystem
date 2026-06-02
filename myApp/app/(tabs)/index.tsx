import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../context/cartContext";
import { useTheme } from "../../context/themeContext";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart, cart, increaseQty, decreaseQty, totalItems, totalPrice } =
    useCart();
  const { colors, dark } = useTheme();
  const [featured, setFeatured] = useState<any[]>([]);

  const fetchFeatured = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .in("tag", ["Bestseller", "Popular"])
      .eq("is_available", true)
      .limit(4);
    if (data) setFeatured(data);
  };

  useEffect(() => {
    fetchFeatured();

    const channel = supabase
      .channel("home-menu-live")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "menu_items" },
        (payload) => {
          setFeatured((prev) => {
            const exists = prev.find(
              (i) => i.id === payload.new.id || i.id === Number(payload.new.id),
            );
            if (exists) {
              // If item becomes unavailable or sold out, remove from featured
              if (!payload.new.is_available || payload.new.stock === 0) {
                return prev.filter(
                  (i) =>
                    i.id !== payload.new.id && i.id !== Number(payload.new.id),
                );
              }
              // Otherwise update it
              return [
                ...prev.map((i) =>
                  i.id === payload.new.id || i.id === Number(payload.new.id)
                    ? { ...payload.new }
                    : i,
                ),
              ];
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFeatured();
    }, []),
  );

  const getQty = (id: number) => cart.find((i) => i.id === id)?.qty ?? 0;

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={styles.locationIcon}>📍</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.locationTitle, { color: colors.primary }]}>
            My Shop
          </Text>
          <Text style={[styles.locationSub, { color: colors.subtext }]}>
            123 Main Street, Kollam, Kerala
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Fresh &{"\n"}
              <Text style={{ color: colors.primary }}>Delicious</Text>
            </Text>
            <Text style={[styles.heroSub, { color: colors.subtext }]}>
              Order your favourite food now
            </Text>
            <TouchableOpacity
              style={[styles.heroBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/menu" as any)}
            >
              <Text style={styles.heroBtnText}>View Menu →</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroEmoji}>🍽️</Text>
        </View>

        <View style={styles.grid}>
          {[
            {
              emoji: "📋",
              title: "Our Menu",
              sub: "View all items",
              route: "/(tabs)/menu",
            },
            {
              emoji: "🛒",
              title: "Your Cart",
              sub: "View & checkout",
              route: "/(tabs)/explore",
            },
            {
              emoji: "🔥",
              title: "Today's Special",
              sub: "Limited offers",
              route: "/(tabs)/menu",
            },
            {
              emoji: "⏱️",
              title: "Quick Bites",
              sub: "Ready in 10 mins",
              route: null,
            },
          ].map((card, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => card.route && router.push(card.route as any)}
            >
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {card.title}
              </Text>
              <Text style={[styles.cardSub, { color: colors.subtext }]}>
                {card.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ⭐ Featured Items
          </Text>
          {featured.length === 0 && (
            <Text style={[styles.noFeatured, { color: colors.subtext }]}>
              No featured items available
            </Text>
          )}
          {featured.map((item) => {
            const isSoldOut = item.stock === 0;
            const isUnavailable = !item.is_available;
            const disabled = isSoldOut || isUnavailable;

            return (
              <View
                key={item.id}
                style={[
                  styles.featuredItem,
                  { backgroundColor: colors.card, opacity: disabled ? 0.5 : 1 },
                ]}
              >
                <Text style={styles.featuredEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.featuredName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.tag,
                      {
                        backgroundColor: dark
                          ? "rgba(255,107,53,0.2)"
                          : "#fff5f0",
                      },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: colors.primary }]}>
                      {item.tag}
                    </Text>
                  </View>
                  <Text style={[styles.featuredPrice, { color: colors.text }]}>
                    ₹{item.price}
                  </Text>
                  {item.stock !== -1 && item.stock > 0 && item.stock <= 5 && (
                    <Text style={styles.lowStock}>
                      ⚠️ Only {item.stock} left!
                    </Text>
                  )}
                </View>

                {disabled ? (
                  <View
                    style={[styles.soldOutBtn, { borderColor: colors.border }]}
                  >
                    <Text
                      style={[styles.soldOutText, { color: colors.subtext }]}
                    >
                      {isUnavailable ? "Unavailable" : "Sold Out"}
                    </Text>
                  </View>
                ) : getQty(item.id) === 0 ? (
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: colors.primary }]}
                    onPress={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        emoji: item.emoji,
                      })
                    }
                  >
                    <Text style={styles.addBtnText}>ADD</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[styles.qtyRow, { backgroundColor: colors.primary }]}
                  >
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => decreaseQty(item.id)}
                    >
                      <Text style={styles.qtyText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{getQty(item.id)}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => increaseQty(item.id)}
                      disabled={
                        item.stock !== -1 && getQty(item.id) >= item.stock
                      }
                    >
                      <Text
                        style={[
                          styles.qtyText,
                          {
                            opacity:
                              item.stock !== -1 && getQty(item.id) >= item.stock
                                ? 0.3
                                : 1,
                          },
                        ]}
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <View style={{ height: totalItems > 0 ? 160 : 120 }} />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  locationIcon: { fontSize: 18 },
  locationTitle: { fontSize: 18, fontWeight: "800" },
  locationSub: { fontSize: 11, marginTop: 1 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  heroTitle: { fontSize: 28, fontWeight: "900", lineHeight: 34 },
  heroSub: { fontSize: 12, marginTop: 6 },
  heroBtn: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
  },
  heroBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  heroEmoji: { fontSize: 70 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  card: {
    width: (width - 34) / 2,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardEmoji: { fontSize: 30, marginBottom: 6 },
  cardTitle: { fontSize: 13, fontWeight: "800", textAlign: "center" },
  cardSub: { fontSize: 11, marginTop: 2, textAlign: "center" },
  section: { paddingHorizontal: 12, paddingTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  noFeatured: { fontSize: 13, textAlign: "center", paddingVertical: 20 },
  featuredItem: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
    elevation: 1,
  },
  featuredEmoji: { fontSize: 38 },
  featuredName: { fontSize: 14, fontWeight: "700" },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  tagText: { fontSize: 9, fontWeight: "700" },
  featuredPrice: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  lowStock: { fontSize: 10, fontWeight: "700", color: "#FF9800", marginTop: 3 },
  addBtn: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  soldOutBtn: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 8,
    width: 70,
    alignItems: "center",
    borderWidth: 1,
  },
  soldOutText: { fontSize: 9, fontWeight: "700" },
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
