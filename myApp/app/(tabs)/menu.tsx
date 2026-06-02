import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../context/cartContext";
import { useTheme } from "../../context/themeContext";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

const CATEGORY_INFO: Record<
  string,
  { icon: string; color: string; darkColor: string }
> = {
  "Rice & Biryani": { icon: "🍛", color: "#FFF3E0", darkColor: "#2a1f0e" },
  "Burgers & Sandwiches": {
    icon: "🍔",
    color: "#FFF8E1",
    darkColor: "#2a2510",
  },
  Pizza: { icon: "🍕", color: "#FCE4EC", darkColor: "#2a0e16" },
  Healthy: { icon: "🥗", color: "#E8F5E9", darkColor: "#0e2a12" },
  "Drinks & Desserts": { icon: "☕", color: "#EDE7F6", darkColor: "#1a1228" },
};

const TAG_STYLES: Record<
  string,
  { bg: string; darkBg: string; color: string }
> = {
  Bestseller: { bg: "#FFF3E0", darkBg: "#2a1f0e", color: "#FF9800" },
  Popular: { bg: "#E3F2FD", darkBg: "#0e1e2a", color: "#1976D2" },
  Healthy: { bg: "#E8F5E9", darkBg: "#0e2a12", color: "#388E3C" },
  Spicy: { bg: "#FFEBEE", darkBg: "#2a0e0e", color: "#D32F2F" },
};

const TAG_PREFIX: Record<string, string> = {
  Bestseller: "⭐ ",
  Spicy: "🌶️ ",
};

export default function MenuScreen() {
  const { cart, addToCart, increaseQty, decreaseQty, totalItems, totalPrice } =
    useCart();
  const router = useRouter();
  const { colors, dark } = useTheme();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const [menuData, setMenuData] = useState<any[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const groupMenu = (data: any[]) => {
    return data.reduce((acc: any[], item) => {
      const existing = acc.find((g: any) => g.category === item.category);
      if (existing) {
        existing.items.push(item);
      } else {
        const catInfo = CATEGORY_INFO[item.category] ?? {
          icon: "🍽️",
          color: "#F5F5F5",
          darkColor: "#1c1c1e",
        };
        acc.push({ category: item.category, ...catInfo, items: [item] });
      }
      return acc;
    }, []);
  };

  const fetchMenu = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .order("category")
      .order("name");
    if (data) setMenuData(groupMenu(data));
    setMenuLoading(false);
  };

  useEffect(() => {
    fetchMenu();

    const channel = supabase
      .channel("menu-live")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "menu_items" },
        (payload) => {
          console.log(
            "Realtime update:",
            payload.new.name,
            "stock:",
            payload.new.stock,
            "available:",
            payload.new.is_available,
            "id type:",
            typeof payload.new.id,
          );
          setMenuData((prev) => {
            const updated = prev.map((category) => ({
              ...category,
              items: category.items.map((item: any) =>
                item.id === payload.new.id || item.id === Number(payload.new.id)
                  ? { ...payload.new }
                  : item,
              ),
            }));
            return [...updated];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "menu_items" },
        () => fetchMenu(),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "menu_items" },
        () => fetchMenu(),
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Also refetch when tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchMenu();
    }, []),
  );

  const getQty = (id: number) => cart.find((i) => i.id === id)?.qty ?? 0;
  const isSearching = search.trim().length > 0;
  const safeIndex = activeCategory < menuData.length ? activeCategory : 0;
  const currentCategory = menuData[safeIndex];

  const currentItems = isSearching
    ? menuData.flatMap((cat) =>
        cat.items.filter((item: any) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        ),
      )
    : (currentCategory?.items ?? []);

  if (menuLoading) {
    return (
      <View
        style={[
          styles.safeArea,
          {
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Our Menu
        </Text>
        <TextInput
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.inputBg,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="🔍  Search dishes..."
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {/* Category Tabs */}
      {!isSearching && (
        <View
          style={[
            styles.categoryWrapper,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {menuData.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor:
                      safeIndex === index ? colors.primary : colors.background,
                  },
                ]}
                onPress={() => setActiveCategory(index)}
              >
                <Text style={styles.categoryPillIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: safeIndex === index ? "#fff" : colors.subtext },
                  ]}
                >
                  {cat.category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Banner */}
      {isSearching ? (
        <View
          style={[
            styles.searchResultsBar,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.searchResultsText, { color: colors.subtext }]}>
            {currentItems.length} result{currentItems.length !== 1 ? "s" : ""}{" "}
            for "{search}"
          </Text>
        </View>
      ) : currentCategory ? (
        <View
          style={[
            styles.categoryBanner,
            {
              backgroundColor: dark
                ? currentCategory.darkColor
                : currentCategory.color,
            },
          ]}
        >
          <View>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>
              {currentCategory.category}
            </Text>
            <Text style={[styles.bannerSub, { color: colors.subtext }]}>
              {currentCategory.items.length} items available
            </Text>
          </View>
          <Text style={styles.bannerEmoji}>{currentCategory.icon}</Text>
        </View>
      ) : null}

      {/* Items List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.itemsList}
      >
        {currentItems.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsEmoji}>🍽️</Text>
            <Text style={[styles.noResultsText, { color: colors.subtext }]}>
              No dishes found
            </Text>
          </View>
        )}

        {currentItems.map((item: any) => {
          const qty = getQty(item.id);
          const tag = TAG_STYLES[item.tag];
          const isSoldOut = item.stock === 0;
          const isUnavailable = !item.is_available;

          return (
            <View
              key={item.id}
              style={[
                styles.menuCard,
                {
                  backgroundColor: colors.card,
                  opacity: isSoldOut || isUnavailable ? 0.6 : 1,
                },
              ]}
            >
              <View style={styles.menuCardLeft}>
                {tag && (
                  <View
                    style={[
                      styles.tagBadge,
                      { backgroundColor: dark ? tag.darkBg : tag.bg },
                    ]}
                  >
                    <Text style={[styles.tagText, { color: tag.color }]}>
                      {TAG_PREFIX[item.tag] ?? ""}
                      {item.tag}
                    </Text>
                  </View>
                )}
                <Text style={[styles.menuName, { color: colors.text }]}>
                  {item.name}
                </Text>
                <Text
                  style={[styles.menuDesc, { color: colors.subtext }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
                <Text style={[styles.menuPrice, { color: colors.text }]}>
                  ₹{item.price}
                </Text>

                {item.stock !== -1 && item.stock > 0 && item.stock <= 5 && (
                  <View style={styles.lowStockBadge}>
                    <Text style={styles.lowStockText}>
                      ⚠️ Only {item.stock} left!
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.menuCardRight}>
                <View
                  style={[
                    styles.emojiBox,
                    { backgroundColor: colors.background },
                  ]}
                >
                  <Text style={styles.menuEmoji}>{item.emoji}</Text>
                </View>

                {isUnavailable || isSoldOut ? (
                  <View
                    style={[styles.soldOutBtn, { borderColor: colors.border }]}
                  >
                    <Text
                      style={[styles.soldOutText, { color: colors.subtext }]}
                    >
                      {isUnavailable ? "Unavailable" : "Sold Out"}
                    </Text>
                  </View>
                ) : qty === 0 ? (
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
                    <Text style={styles.addBtnText}>ADD +</Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[styles.qtyRow, { backgroundColor: colors.primary }]}
                  >
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => decreaseQty(item.id)}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyNum}>{qty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => increaseQty(item.id)}
                      disabled={item.stock !== -1 && qty >= item.stock}
                    >
                      <Text
                        style={[
                          styles.qtyBtnText,
                          {
                            opacity:
                              item.stock !== -1 && qty >= item.stock ? 0.3 : 1,
                          },
                        ]}
                      >
                        +
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}
        <View style={{ height: totalItems > 0 ? 140 : 80 }} />
      </ScrollView>

      {/* Cart Bar */}
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
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", marginBottom: 10 },
  searchBar: {
    borderRadius: 50,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "500",
  },
  categoryWrapper: { borderBottomWidth: 1 },
  categoryScroll: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  categoryPillIcon: { fontSize: 14 },
  categoryPillText: { fontSize: 12, fontWeight: "600" },
  categoryBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
  },
  bannerTitle: { fontSize: 16, fontWeight: "800" },
  bannerSub: { fontSize: 12, marginTop: 2 },
  bannerEmoji: { fontSize: 40 },
  searchResultsBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchResultsText: { fontSize: 13, fontWeight: "500" },
  itemsList: { paddingHorizontal: 12, paddingTop: 10 },
  menuCard: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    elevation: 2,
  },
  menuCardLeft: { flex: 1, paddingRight: 10 },
  menuCardRight: { alignItems: "center", gap: 8 },
  emojiBox: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuEmoji: { fontSize: 40 },
  tagBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 5,
  },
  tagText: { fontSize: 10, fontWeight: "700" },
  menuName: { fontSize: 15, fontWeight: "700" },
  menuDesc: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  menuPrice: { fontSize: 14, fontWeight: "800", marginTop: 6 },
  addBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    width: 70,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
    width: 70,
    justifyContent: "space-between",
  },
  qtyBtn: { paddingHorizontal: 8, paddingVertical: 7 },
  qtyBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  qtyNum: { color: "#fff", fontSize: 13, fontWeight: "800" },
  soldOutBtn: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 7,
    width: 70,
    alignItems: "center",
    borderWidth: 1,
  },
  soldOutText: { fontSize: 9, fontWeight: "700" },
  noResults: { alignItems: "center", paddingTop: 60 },
  noResultsEmoji: { fontSize: 48, marginBottom: 12 },
  noResultsText: { fontSize: 16, fontWeight: "600" },
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
  lowStockBadge: {
    backgroundColor: "#2a1a00",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#FF9800",
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FF9800",
  },
});
