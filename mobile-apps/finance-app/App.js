import React, { useEffect, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "finance.v1";
const CATS = {
  income: ["Зарплата", "Бизнес", "Другое"],
  expense: ["Еда", "Транспорт", "Жильё", "Развлечения", "Другое"],
};
const fmt = (n) => n.toLocaleString("ru-RU") + " ₽";

export default function App() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState("Еда");

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setItems(JSON.parse(v)));
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = () => {
    const a = parseFloat(amount.replace(",", "."));
    if (!a || a <= 0) return;
    setItems([
      { id: Date.now().toString(), type, amount: a, cat,
        date: new Date().toLocaleDateString("ru-RU") },
      ...items,
    ]);
    setAmount("");
  };
  const remove = (id) => setItems(items.filter((i) => i.id !== id));

  const income = items.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
  const expense = items.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
  const balance = income - expense;

  return (
    <SafeAreaView style={s.app}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.label}>Баланс</Text>
        <Text style={s.balance}>{fmt(balance)}</Text>
        <View style={s.sumRow}>
          <Text style={s.in}>↑ {fmt(income)}</Text>
          <Text style={s.out}>↓ {fmt(expense)}</Text>
        </View>
      </View>

      <View style={s.form}>
        <View style={s.typeRow}>
          {["expense", "income"].map((t) => (
            <TouchableOpacity key={t} onPress={() => { setType(t); setCat(CATS[t][0]); }}
              style={[s.typeBtn, type === t && (t === "income" ? s.typeIn : s.typeOut)]}>
              <Text style={[s.typeTxt, type === t && s.typeTxtOn]}>
                {t === "income" ? "Доход" : "Расход"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.inputRow}>
          <TextInput style={s.input} placeholder="Сумма" keyboardType="numeric"
            value={amount} onChangeText={setAmount} />
          <TouchableOpacity style={s.addBtn} onPress={add}>
            <Text style={s.addTxt}>Добавить</Text>
          </TouchableOpacity>
        </View>
        <View style={s.cats}>
          {CATS[type].map((c) => (
            <TouchableOpacity key={c} onPress={() => setCat(c)}
              style={[s.cat, cat === c && s.catOn]}>
              <Text style={[s.catTxt, cat === c && s.catTxtOn]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={s.empty}>Добавьте первую операцию 💰</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.tx} onLongPress={() => remove(item.id)}>
            <View style={[s.dot, { backgroundColor: item.type === "income" ? "#16a34a" : "#dc2626" }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.txCat}>{item.cat}</Text>
              <Text style={s.txDate}>{item.date}</Text>
            </View>
            <Text style={[s.txAmt, { color: item.type === "income" ? "#16a34a" : "#dc2626" }]}>
              {item.type === "income" ? "+" : "−"}{fmt(item.amount)}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#f1f5f9" },
  header: { backgroundColor: "#0e7490", padding: 24, paddingTop: 48,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  label: { color: "#a5f3fc", fontSize: 15 },
  balance: { color: "#fff", fontSize: 36, fontWeight: "900", marginTop: 4 },
  sumRow: { flexDirection: "row", gap: 20, marginTop: 12 },
  in: { color: "#bbf7d0", fontSize: 16, fontWeight: "700" },
  out: { color: "#fecaca", fontSize: 16, fontWeight: "700" },
  form: { backgroundColor: "#fff", margin: 16, borderRadius: 18, padding: 16, elevation: 2 },
  typeRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: "#eef2f6",
    alignItems: "center" },
  typeIn: { backgroundColor: "#16a34a" },
  typeOut: { backgroundColor: "#dc2626" },
  typeTxt: { fontWeight: "700", color: "#475569" },
  typeTxtOn: { color: "#fff" },
  inputRow: { flexDirection: "row", gap: 10 },
  input: { flex: 1, backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 16,
    height: 48, fontSize: 16 },
  addBtn: { backgroundColor: "#0e7490", borderRadius: 12, paddingHorizontal: 18,
    justifyContent: "center" },
  addTxt: { color: "#fff", fontWeight: "700" },
  cats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  cat: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 16, backgroundColor: "#eef2f6" },
  catOn: { backgroundColor: "#0e7490" },
  catTxt: { color: "#475569", fontWeight: "600", fontSize: 13 },
  catTxtOn: { color: "#fff" },
  tx: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "center", gap: 12, elevation: 1 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  txCat: { fontSize: 16, color: "#1e293b", fontWeight: "600" },
  txDate: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  txAmt: { fontSize: 16, fontWeight: "800" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontSize: 16 },
});
