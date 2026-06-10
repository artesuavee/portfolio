import React, { useMemo, useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, FlatList,
  StyleSheet, StatusBar, Alert,
} from "react-native";

const DELIVERY = 149;
const FREE_FROM = 1500;
const MENU = [
  { id: "1", name: "Пицца Маргарита", price: 590, emoji: "🍕", cat: "Пицца" },
  { id: "2", name: "Пицца Пепперони", price: 690, emoji: "🍕", cat: "Пицца" },
  { id: "3", name: "Бургер классик", price: 390, emoji: "🍔", cat: "Бургеры" },
  { id: "4", name: "Бургер двойной", price: 520, emoji: "🍔", cat: "Бургеры" },
  { id: "5", name: "Ролл Филадельфия", price: 450, emoji: "🍣", cat: "Суши" },
  { id: "6", name: "Сет Дракон", price: 1290, emoji: "🍱", cat: "Суши" },
  { id: "7", name: "Кола 0.5", price: 120, emoji: "🥤", cat: "Напитки" },
  { id: "8", name: "Лимонад", price: 180, emoji: "🍋", cat: "Напитки" },
];
const CATS = ["Все", "Пицца", "Бургеры", "Суши", "Напитки"];
const fmt = (n) => n.toLocaleString("ru-RU") + " ₽";

export default function App() {
  const [cart, setCart] = useState({});
  const [cat, setCat] = useState("Все");

  const add = (id) => setCart({ ...cart, [id]: (cart[id] || 0) + 1 });
  const dec = (id) => {
    const n = (cart[id] || 0) - 1; const c = { ...cart };
    if (n <= 0) delete c[id]; else c[id] = n; setCart(c);
  };
  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const sub = useMemo(
    () => Object.entries(cart).reduce(
      (s, [id, q]) => s + MENU.find((m) => m.id === id).price * q, 0), [cart]);
  const delivery = sub >= FREE_FROM || sub === 0 ? 0 : DELIVERY;
  const total = sub + delivery;
  const list = MENU.filter((m) => cat === "Все" || m.cat === cat);

  const order = () => {
    Alert.alert("Заказ принят 🛵", `К оплате: ${fmt(total)}\nКурьер приедет через ~40 минут.`);
    setCart({});
  };

  return (
    <SafeAreaView style={s.app}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.h1}>🛵 Вкусно и точка</Text>
        <Text style={s.sub}>Бесплатная доставка от {fmt(FREE_FROM)}</Text>
      </View>

      <View style={s.cats}>
        <FlatList horizontal showsHorizontalScrollIndicator={false} data={CATS}
          keyExtractor={(c) => c}
          renderItem={({ item: c }) => (
            <TouchableOpacity onPress={() => setCat(c)} style={[s.chip, cat === c && s.chipOn]}>
              <Text style={[s.chipTxt, cat === c && s.chipTxtOn]}>{c}</Text>
            </TouchableOpacity>
          )} />
      </View>

      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.emoji}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{item.name}</Text>
              <Text style={s.price}>{fmt(item.price)}</Text>
            </View>
            {cart[item.id] ? (
              <View style={s.qty}>
                <TouchableOpacity onPress={() => dec(item.id)}><Text style={s.qBtn}>−</Text></TouchableOpacity>
                <Text style={s.qNum}>{cart[item.id]}</Text>
                <TouchableOpacity onPress={() => add(item.id)}><Text style={s.qBtn}>＋</Text></TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={s.add} onPress={() => add(item.id)}>
                <Text style={s.addTxt}>＋</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {count > 0 && (
        <View style={s.bar}>
          <View>
            <Text style={s.barSub}>{count} поз. · доставка {delivery === 0 ? "бесплатно" : fmt(delivery)}</Text>
            <Text style={s.barTotal}>{fmt(total)}</Text>
          </View>
          <TouchableOpacity style={s.orderBtn} onPress={order}>
            <Text style={s.orderTxt}>Заказать</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#fff7ed" },
  header: { backgroundColor: "#ea580c", padding: 20, paddingTop: 48,
    borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  h1: { color: "#fff", fontSize: 24, fontWeight: "800" },
  sub: { color: "#fed7aa", marginTop: 4 },
  cats: { paddingVertical: 12, paddingLeft: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#ffedd5", marginRight: 8 },
  chipOn: { backgroundColor: "#ea580c" },
  chipTxt: { color: "#9a3412", fontWeight: "600" },
  chipTxtOn: { color: "#fff" },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16,
    padding: 14, marginBottom: 10, gap: 12, elevation: 1 },
  emoji: { fontSize: 40 },
  name: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  price: { fontSize: 15, color: "#ea580c", fontWeight: "800", marginTop: 4 },
  add: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#ea580c",
    alignItems: "center", justifyContent: "center" },
  addTxt: { color: "#fff", fontSize: 24, lineHeight: 26 },
  qty: { flexDirection: "row", alignItems: "center", gap: 12 },
  qBtn: { fontSize: 22, color: "#ea580c", fontWeight: "800", width: 24, textAlign: "center" },
  qNum: { fontSize: 16, fontWeight: "700", minWidth: 18, textAlign: "center" },
  bar: { position: "absolute", left: 16, right: 16, bottom: 20, backgroundColor: "#1f2937",
    borderRadius: 18, padding: 16, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", elevation: 4 },
  barSub: { color: "#9ca3af", fontSize: 12 },
  barTotal: { color: "#fff", fontSize: 20, fontWeight: "800" },
  orderBtn: { backgroundColor: "#ea580c", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 22 },
  orderTxt: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
