import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TODO {
  id: string;
  title: string;
  completed: boolean;
  editing?: boolean;
}

export default function Index() {
  const [todoList, setTodoList] = useState<TODO[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    saveData();
  }, [todoList, darkMode]);

  const loadData = async () => {
    try {
      const todos = await AsyncStorage.getItem("TODOS");
      const theme = await AsyncStorage.getItem("THEME");
      if (todos) setTodoList(JSON.parse(todos));
      if (theme) setDarkMode(JSON.parse(theme));
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    await AsyncStorage.setItem("TODOS", JSON.stringify(todoList));
    await AsyncStorage.setItem("THEME", JSON.stringify(darkMode));
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const toggleTodo = (id: string) => {
    setTodoList(
      todoList.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t,
      ),
    );
  };

  const confirmDelete = (id: string) => {
    Alert.alert("Delete Todo", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setTodoList(todoList.filter((t) => t.id !== id)),
      },
    ]);
  };

  const startEdit = (id: string) => {
    Alert.alert("Edit Todo", "Do you want to edit this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: () =>
          setTodoList(
            todoList.map((t) => (t.id === id ? { ...t, editing: true } : t)),
          ),
      },
    ]);
  };

  const saveEdit = (id: string, newTitle: string) => {
    setTodoList(
      todoList.map((t) =>
        t.id === id ? { ...t, title: newTitle, editing: false } : t,
      ),
    );
  };

  const addTodo = (title: string) => {
    if (!title.trim()) return;
    setTodoList([
      ...todoList,
      { id: Date.now().toString(), title, completed: false },
    ]);
  };

  if (loading)
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );

  const bg = darkMode ? styles.darkBg : styles.lightBg;

  return (
    <View style={[styles.container, bg]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text
          style={[
            styles.heading,
            darkMode ? styles.darkText : styles.lightText,
          ]}
        >
          MY TODO LIST
        </Text>
        <TouchableOpacity onPress={toggleDarkMode} style={{ padding: 6 }}>
          <Text
            style={[
              styles.modeIcon,
              darkMode ? { color: "#fff" } : { color: "#000" },
            ]}
          >
            {darkMode ? "🌙" : "☀️"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* TODO LIST */}
      <FlatList
        data={todoList}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No todos yet</Text>}
        renderItem={({ item }) => (
          <View
            style={[
              styles.todoItem,
              { borderColor: darkMode ? "#333" : "#ddd" },
            ]}
          >
            {/* CHECKBOX */}
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => toggleTodo(item.id)}
            >
              {item.completed && <Text style={styles.tick}>✓</Text>}
            </TouchableOpacity>

            {/* INLINE EDIT */}
            {item.editing ? (
              <TextInput
                value={item.title}
                onChangeText={(val) => saveEdit(item.id, val)}
                onSubmitEditing={() => saveEdit(item.id, item.title)}
                onBlur={() => saveEdit(item.id, item.title)}
                autoFocus
                style={[
                  styles.inputEdit,
                  darkMode && styles.inputEditDark,
                  item.completed && styles.completed,
                ]}
              />
            ) : (
              <Text
                style={[
                  styles.todoText,
                  darkMode ? { color: "#fff" } : { color: "#000" },
                  item.completed && styles.completed,
                ]}
              >
                {item.title}
              </Text>
            )}

            {/* EDIT BUTTON */}
            {!item.editing && (
              <TouchableOpacity onPress={() => startEdit(item.id)}>
                <Text
                  style={[
                    styles.edit,
                    darkMode ? { color: "#fff" } : { color: "#000" },
                  ]}
                >
                  ✎
                </Text>
              </TouchableOpacity>
            )}

            {/* DELETE BUTTON */}
            <TouchableOpacity onPress={() => confirmDelete(item.id)}>
              <Text style={styles.delete}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ADD NEW TODO */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter new task"
          placeholderTextColor={darkMode ? "#aaa" : "#666"}
          onSubmitEditing={(e) => addTodo(e.nativeEvent.text)}
          style={[styles.input, darkMode && styles.darkInput]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40 },
  lightBg: { backgroundColor: "#fff" },
  darkBg: { backgroundColor: "#121212" },
  lightText: { color: "#000" },
  darkText: { color: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  heading: { fontSize: 22, fontWeight: "bold" },
  modeIcon: { fontSize: 24 },

  inputRow: { flexDirection: "row", marginVertical: 15 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    color: "#000",
  },
  darkInput: { backgroundColor: "#1e1e1e", color: "#fff", borderColor: "#333" },

  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 4,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tick: { color: "#4CAF50", fontWeight: "bold", fontSize: 16, lineHeight: 16 },

  todoText: { flex: 1, fontSize: 16 },
  inputEdit: {
    flex: 1,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#4CAF50",
    paddingVertical: 2,
  },
  inputEditDark: { color: "#fff", borderColor: "#4CAF50" },

  completed: { textDecorationLine: "line-through", opacity: 0.6 },

  edit: { fontSize: 20, marginRight: 12, fontWeight: "bold" },
  delete: { fontSize: 18, color: "red" },

  empty: { textAlign: "center", marginTop: 40, color: "#888" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
