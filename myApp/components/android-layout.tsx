import { BlurView } from "expo-blur";
import { Tabs, usePathname, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useCart } from "../context/cartContext";

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems } = useCart();
  const isDark = useColorScheme() === "dark";

  const tabs = [
    { name: "index", path: "/(tabs)/", emoji: "🏠", label: "Home" },
    { name: "menu", path: "/(tabs)/menu", emoji: "🍽️", label: "Menu" },
    { name: "explore", path: "/(tabs)/explore", emoji: "🛒", label: "Cart" },
    { name: "account", path: "/(tabs)/account", emoji: "👤", label: "Account" },
  ];

  const isActive = (tab: { name: string }) => {
    if (tab.name === "index") return pathname === "/" || pathname === "/(tabs)";
    return pathname.includes(tab.name);
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.outerContainer,
          {
            borderColor: isDark
              ? "rgba(255,255,255,0.15)"
              : "rgba(255,255,255,0.45)",
          },
        ]}
      >
        <BlurView
          intensity={25}
          tint={isDark ? "dark" : "light"}
          style={styles.blurView}
        >
          <View
            style={[
              styles.tabBar,
              {
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.3)"
                  : "rgba(255,255,255,0.15)",
              },
            ]}
          >
            {tabs.map((tab) => {
              const active = isActive(tab);
              return (
                <TouchableOpacity
                  key={tab.name}
                  style={[styles.tabItem, active && styles.tabItemActive]}
                  onPress={() => router.push(tab.path as any)}
                  activeOpacity={0.8}
                >
                  <View>
                    <Text style={[styles.emoji, active && styles.emojiActive]}>
                      {tab.emoji}
                    </Text>
                    {tab.name === "explore" && totalItems > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {totalItems > 9 ? "9+" : totalItems}
                        </Text>
                      </View>
                    )}
                  </View>
                  {active && (
                    <Text style={styles.labelActive}>{tab.label}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

export default function AndroidLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={() => <CustomTabBar />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="menu" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  outerContainer: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 1,
  },
  blurView: { borderRadius: 50, overflow: "hidden" },
  tabBar: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 50,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: "#ff6b35",
    shadowColor: "#ff6b35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  emoji: { fontSize: 20, opacity: 0.4 },
  emojiActive: { opacity: 1 },
  labelActive: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#ff6b35",
  },
  badgeText: { color: "#ff6b35", fontSize: 9, fontWeight: "900" },
});
