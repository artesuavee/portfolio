import React, { useEffect, useState } from "react";
import {
  SafeAreaView, View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "tasks.v1";
const FILTERS = ["Все", "Активные", "Готовые"];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("Все");

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setTasks(JSON.parse(v)));
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(tasks));
  }, [tasks]);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    setTasks([{ id: Date.now().toString(), title: t, done: false }, ...tasks]);
    setText("");
  };
  const toggle = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const visible = tasks.filter((t) =>
    filter === "Активные" ? !t.done : filter === "Готовые" ? t.done : true
  );
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <SafeAreaView style={s.app}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.h1}>Мои задачи</Text>
        <Text style={s.sub}>
          Выполнено {doneCount} из {tasks.length}
        </Text>
      </View>

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder="Новая задача…"
          value={text}
          onChangeText={setText}
          onSubmitEditing={add}
        />
        <TouchableOpacity style={s.addBtn} onPress={add}>
          <Text style={s.addTxt}>＋</Text>
        </TouchableOpacity>
      </View>

      <View style={s.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={[s.chip, filter === f && s.chipActive]}>
            <Text style={[s.chipTxt, filter === f && s.chipTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={s.empty}>Пока пусто. Добавьте задачу ✍️</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <TouchableOpacity style={s.row} onPress={() => toggle(item.id)}>
              <View style={[s.check, item.done && s.checkOn]}>
                {item.done && <Text style={s.checkMark}>✓</Text>}
              </View>
              <Text style={[s.title, item.done && s.titleDone]}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={s.del}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#f4f5fb" },
  header: { backgroundColor: "#7c3aed", padding: 24, paddingTop: 48,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  h1: { color: "#fff", fontSize: 28, fontWeight: "800" },
  sub: { color: "#e9d5ff", marginTop: 6, fontSize: 15 },
  inputRow: { flexDirection: "row", padding: 16, gap: 10 },
  input: { flex: 1, backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 16,
    height: 50, fontSize: 16, elevation: 1 },
  addBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: "#7c3aed",
    alignItems: "center", justifyContent: "center" },
  addTxt: { color: "#fff", fontSize: 28, lineHeight: 30 },
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#e9e7f5" },
  chipActive: { backgroundColor: "#7c3aed" },
  chipTxt: { color: "#5b4b8a", fontWeight: "600" },
  chipTxtActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 1 },
  row: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  check: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: "#c4b5fd",
    alignItems: "center", justifyContent: "center" },
  checkOn: { backgroundColor: "#7c3aed", borderColor: "#7c3aed" },
  checkMark: { color: "#fff", fontWeight: "900" },
  title: { fontSize: 16, color: "#1f2440", flex: 1 },
  titleDone: { textDecorationLine: "line-through", color: "#a0a4bb" },
  del: { fontSize: 18, marginLeft: 10 },
  empty: { textAlign: "center", color: "#9aa0bd", marginTop: 40, fontSize: 16 },
});
