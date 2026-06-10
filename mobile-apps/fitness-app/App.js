import React, { useEffect, useState } from "react";
import {
  SafeAreaView, View, Text, TouchableOpacity, FlatList,
  StyleSheet, StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "fitness.v1";
const STEP_GOAL = 10000;
const WORKOUTS = [
  { type: "Бег", emoji: "🏃", kcalPerMin: 11, stepsPerMin: 150 },
  { type: "Ходьба", emoji: "🚶", kcalPerMin: 5, stepsPerMin: 110 },
  { type: "Велосипед", emoji: "🚴", kcalPerMin: 9, stepsPerMin: 0 },
  { type: "Зал", emoji: "🏋️", kcalPerMin: 8, stepsPerMin: 0 },
  { type: "Йога", emoji: "🧘", kcalPerMin: 4, stepsPerMin: 0 },
];

export default function App() {
  const [log, setLog] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setLog(JSON.parse(v)));
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(KEY, JSON.stringify(log));
  }, [log]);

  const addWorkout = (w) => {
    const minutes = 30;
    setLog([
      {
        id: Date.now().toString(),
        type: w.type, emoji: w.emoji, minutes,
        kcal: w.kcalPerMin * minutes,
        steps: w.stepsPerMin * minutes,
        time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      },
      ...log,
    ]);
  };
  const remove = (id) => setLog(log.filter((l) => l.id !== id));

  const steps = log.reduce((s, l) => s + l.steps, 0);
  const kcal = log.reduce((s, l) => s + l.kcal, 0);
  const minutes = log.reduce((s, l) => s + l.minutes, 0);
  const pct = Math.min(100, Math.round((steps / STEP_GOAL) * 100));

  return (
    <SafeAreaView style={s.app}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <Text style={s.h1}>Сегодня</Text>
        <View style={s.ring}>
          <Text style={s.ringPct}>{pct}%</Text>
          <Text style={s.ringSub}>цели по шагам</Text>
        </View>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={s.stepsTxt}>{steps.toLocaleString("ru-RU")} / {STEP_GOAL.toLocaleString("ru-RU")} шагов</Text>
        <View style={s.kpis}>
          <View style={s.kpi}><Text style={s.kpiV}>{kcal}</Text><Text style={s.kpiK}>ккал</Text></View>
          <View style={s.kpi}><Text style={s.kpiV}>{minutes}</Text><Text style={s.kpiK}>минут</Text></View>
          <View style={s.kpi}><Text style={s.kpiV}>{log.length}</Text><Text style={s.kpiK}>трен.</Text></View>
        </View>
      </View>

      <Text style={s.section}>Добавить тренировку (30 мин)</Text>
      <View style={s.types}>
        {WORKOUTS.map((w) => (
          <TouchableOpacity key={w.type} style={s.type} onPress={() => addWorkout(w)}>
            <Text style={s.typeEmoji}>{w.emoji}</Text>
            <Text style={s.typeTxt}>{w.type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.section}>Журнал</Text>
      <FlatList
        data={log}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={<Text style={s.empty}>Добавьте первую тренировку 💪</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.row} onLongPress={() => remove(item.id)}>
            <Text style={s.rowEmoji}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.rowType}>{item.type} · {item.minutes} мин</Text>
              <Text style={s.rowSub}>{item.time} · {item.kcal} ккал{item.steps ? ` · ${item.steps} шагов` : ""}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#f0fdf4" },
  header: { backgroundColor: "#15803d", padding: 24, paddingTop: 48, alignItems: "center",
    borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  h1: { color: "#bbf7d0", fontSize: 16, fontWeight: "600", alignSelf: "flex-start" },
  ring: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: "#4ade80",
    alignItems: "center", justifyContent: "center", marginVertical: 14,
    backgroundColor: "rgba(255,255,255,.08)" },
  ringPct: { color: "#fff", fontSize: 32, fontWeight: "900" },
  ringSub: { color: "#bbf7d0", fontSize: 11 },
  progressTrack: { width: "100%", height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,.25)" },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: "#fff" },
  stepsTxt: { color: "#dcfce7", marginTop: 8, fontWeight: "600" },
  kpis: { flexDirection: "row", gap: 28, marginTop: 16 },
  kpi: { alignItems: "center" },
  kpiV: { color: "#fff", fontSize: 22, fontWeight: "800" },
  kpiK: { color: "#bbf7d0", fontSize: 12 },
  section: { fontSize: 16, fontWeight: "800", color: "#166534", margin: 16, marginBottom: 8 },
  types: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16 },
  type: { backgroundColor: "#fff", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
    alignItems: "center", elevation: 1, minWidth: 88 },
  typeEmoji: { fontSize: 28 },
  typeTxt: { color: "#166534", fontWeight: "700", marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14,
    padding: 14, marginBottom: 10, gap: 12, elevation: 1 },
  rowEmoji: { fontSize: 30 },
  rowType: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  rowSub: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  empty: { textAlign: "center", color: "#86919c", marginTop: 20, fontSize: 16 },
});
