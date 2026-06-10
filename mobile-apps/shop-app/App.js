import React, { useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, Alert,
} from "react-native";

const PRODUCTS = [
  { id: "1", name: "Наушники Pro", price: 8990, emoji: "🎧", cat: "Аудио" },
  { id: "2", name: "Смарт-часы", price: 14500, emoji: "⌚", cat: "Гаджеты" },
  { id: "3", name: "Рюкзак Urban", price: 4200, emoji: "🎒", cat: "Аксессуары" },
  { id: "4", name: "Колонка Mini", price: 3590, emoji: "🔊", cat: "Аудио" },
  { id: "5", name: "Клавиатура", price: 6700, emoji: "⌨️", cat: "Гаджеты" },
  { id: "6", name: "Кружка-термос", price: 1290, emoji: "☕", cat: "Аксессуары" },
];
const CATS = ["Все", "Аудио", "Гаджеты", "Аксессуары"];
const fmt = (n) => n.toLocaleString("ru-RU") + " ₽";

export default function App() {
  const [cart, setCart] = useState({});
  const [cat, setCat] = useState("Все");
  const [screen, setScreen] = useState("catalog");

  const add = (id) => setCart({ ...cart, [id]: (cart[id] || 0) + 1 });
  const dec = (id) => {
    const n = (cart[id] || 0) - 1;
    const c = { ...cart };
    if (n <= 0) delete c[id]; else c[id] = n;
    setCart(c);
  };

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const total = useMemo(
    () => Object.entries(cart).reduce(
      (s, [id, q]) => s + PRODUCTS.find((p) => p.id === id).price * q, 0),
    [cart]
  );
  const list = PRODUCTS.filter((p) => cat === "Все" || p.cat === cat);
  const cartItems = PRODUCTS.filter((p) => cart[p.id]);

  const checkout = () => {
    Alert.alert("Заказ оформлен ✅", `Сумма: ${fmt(total)}\nСпасибо за покупку!`);
    setCart({});
    setScreen("catalog");
  };

  return (
    <SafeAreaView style={s.app}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.h1}>{screen === "cart" ? "Корзина" : "Магазин"}</Text>
        <TouchableOpacity onPress={() => setScreen(screen === "cart" ? "catalog" : "cart")}>
          <Text style={s.cartBtn}>{screen === "cart" ? "← Каталог" : `🛒 ${count}`}</Text>
        </TouchableOpacity>
      </View>

      {screen === "catalog" ? (
        <>
          <View style={s.cats}>
            {CATS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setCat(c)}
                style={[s.chip, cat === c && s.chipOn]}>
                <Text style={[s.chipTxt, cat === c && s.chipTxtOn]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <FlatList
            data={list}
            keyExtractor={(i) => i.id}
            numColumns={2}
            contentContainerStyle={{ padding: 12 }}
            renderItem={({ item }) => (
              <View style={s.card}>
                <Text style={s.emoji}>{item.emoji}</Text>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.price}>{fmt(item.price)}</Text>
                <TouchableOpacity style={s.buy} onPress={() => add(item.id)}>
                  <Text style={s.buyTxt}>{cart[item.id] ? `В корзине: ${cart[item.id]}` : "В корзину"}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={<Text style={s.empty}>Корзина пуста 🛒</Text>}
            renderItem={({ item }) => (
              <View style={s.row}>
                <Text style={s.rowEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <Text style={s.price}>{fmt(item.price)}</Text>
                </View>
                <View style={s.qty}>
                  <TouchableOpacity onPress={() => dec(item.id)}><Text style={s.qBtn}>−</Text></TouchableOpacity>
                  <Text style={s.qNum}>{cart[item.id]}</Text>
                  <TouchableOpacity onPress={() => add(item.id)}><Text style={s.qBtn}>＋</Text></TouchableOpacity>
                </View>
              </View>
            )}
          />
          {count > 0 && (
            <View style={s.footer}>
              <Text style={s.total}>Итого: {fmt(total)}</Text>
              <TouchableOpacity style={s.checkout} onPress={checkout}>
                <Text style={s.checkoutTxt}>Оформить заказ</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#fff1f2" },
  header: { backgroundColor: "#be123c", padding: 20, paddingTop: 48, flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  h1: { color: "#fff", fontSize: 26, fontWeight: "800" },
  cartBtn: { color: "#fff", fontSize: 16, fontWeight: "700",
    backgroundColor: "rgba(255,255,255,.2)", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  cats: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12 },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 18, backgroundColor: "#ffe4e6" },
  chipOn: { backgroundColor: "#be123c" },
  chipTxt: { color: "#9f1239", fontWeight: "600" },
  chipTxtOn: { color: "#fff" },
  card: { flex: 1, backgroundColor: "#fff", margin: 6, borderRadius: 16, padding: 16,
    alignItems: "center", elevation: 1 },
  emoji: { fontSize: 46 },
  name: { fontSize: 15, fontWeight: "700", color: "#1f2937", marginTop: 8, textAlign: "center" },
  price: { fontSize: 15, color: "#be123c", fontWeight: "800", marginTop: 4 },
  buy: { backgroundColor: "#be123c", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginTop: 10 },
  buyTxt: { color: "#fff", fontWeight: "700", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14,
    padding: 12, marginBottom: 10, gap: 12, elevation: 1 },
  rowEmoji: { fontSize: 36 },
  qty: { flexDirection: "row", alignItems: "center", gap: 14 },
  qBtn: { fontSize: 22, color: "#be123c", fontWeight: "800", width: 26, textAlign: "center" },
  qNum: { fontSize: 16, fontWeight: "700", minWidth: 20, textAlign: "center" },
  footer: { padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#fecdd3" },
  total: { fontSize: 20, fontWeight: "800", color: "#1f2937", marginBottom: 10 },
  checkout: { backgroundColor: "#be123c", borderRadius: 14, padding: 16, alignItems: "center" },
  checkoutTxt: { color: "#fff", fontSize: 17, fontWeight: "800" },
  empty: { textAlign: "center", color: "#9f1239", marginTop: 40, fontSize: 16 },
});
