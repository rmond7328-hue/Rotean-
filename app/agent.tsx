import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Screen } from "@/components/Screen";
import { colors, typography } from "@/theme/tokens";
import { buildAgentPlan } from "@/services/agentPlanner";
import { actionLabels } from "@/services/agentTypes";
import { executeAgentAction } from "@/services/agentExecutor";

export default function Agent() {
  const [request, setRequest] = useState("");
  const [plan, setPlan] = useState<any>();
  const [busy, setBusy] = useState(false);

  async function planRequest() {
    if (!request.trim()) return;

    setBusy(true);
    try {
      setPlan(await buildAgentPlan(request.trim()));
    } catch (e: any) {
      Alert.alert("Rotean couldn't plan that", e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function runAction(action: any) {
    try {
      const ok = await executeAgentAction(action);
      if (ok) {
        Alert.alert("Done", "Rotean completed the action.");
      } else {
        Alert.alert("Cancelled", "Nothing was changed.");
      }
    } catch (e: any) {
      Alert.alert("Not connected yet", e?.message ?? "This action is not available yet.");
    }
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={s.e}>JARVIS MODE</Text>
        <Text style={s.t}>What should I handle?</Text>
        <Text style={s.sub}>
          Tell Rotean what you need in normal language. It will prepare actions before changing anything.
        </Text>

        <TextInput
          value={request}
          onChangeText={setRequest}
          placeholder="Handle my Saturday…"
          placeholderTextColor={colors.inkMuted}
          multiline
          style={s.input}
        />

        <Pressable disabled={busy} onPress={planRequest} style={s.button}>
          <Text style={s.bt}>{busy ? "Thinking…" : "Make a plan"}</Text>
        </Pressable>

        {plan && (
          <View style={s.result}>
            <Text style={s.summary}>{plan.summary}</Text>
            {plan.actions.map((action: any) => (
              <View key={action.id} style={s.action}>
                <Text style={s.badge}>{actionLabels[action.kind] || "Action"}</Text>
                <Text style={s.title}>{action.title}</Text>
                <Text style={s.body}>{action.description}</Text>
                <Pressable onPress={() => runAction(action)} style={s.confirm}>
                  <Text style={s.ct}>Review & confirm</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  e: { ...typography.label, color: colors.green },
  t: { ...typography.h1, color: colors.ink, marginTop: 8 },
  sub: { ...typography.body, color: colors.inkMuted, marginTop: 8 },
  input: {
    minHeight: 120,
    marginTop: 20,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    textAlignVertical: "top",
    fontSize: 16,
  },
  button: {
    marginTop: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  bt: { ...typography.h3, color: colors.white },
  result: { marginTop: 20 },
  summary: { ...typography.h2, color: colors.ink },
  action: {
    marginTop: 12,
    padding: 18,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  title: { ...typography.h3, color: colors.ink },
  body: { ...typography.bodySmall, color: colors.inkMuted, marginTop: 5 },
  badge: { ...typography.label, color: colors.green },
  confirm: {
    marginTop: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: colors.lime,
  },
  ct: { ...typography.label, color: colors.greenDeep },
});
