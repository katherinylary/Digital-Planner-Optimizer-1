import { useState } from "react";

type Task = {
  id: number;
  text: string;
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  function addTask() {
    if (!input.trim()) return;

    setTasks([...tasks, { id: Date.now(), text: input }]);
    setInput("");
  }

  function removeTask(id: number) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Meu Planner</h1>

      <div style={{ marginTop: 20 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nova tarefa"
        />
        <button onClick={addTask}>Adicionar</button>
      </div>

      <ul style={{ marginTop: 20 }}>
        {tasks.map(task => (
          <li key={task.id}>
            {task.text}
            <button onClick={() => removeTask(task.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
