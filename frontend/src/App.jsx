import { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import classnames from "classnames";
import {
  CheckCircle2,
  Circle,
  Trash2,
  Plus,
  ClipboardPaste,
  Copy,
  Clock,
  AlertCircle,
} from "lucide-react";
import SePayForm from "./SePayForm";

// Cấu hình Base API URL (dùng biến môi trường VITE_API_URL nếu có)
const API_PATH = "/api/todos";
const rawBase = import.meta.env.VITE_API_URL || "";
const API_BASE = rawBase.replace(/\/+$|\/a$/i, ""); // remove trailing slashes and accidental "/a"
const API_URL = `${API_BASE}${API_PATH}`;

// GIF URL mapping based on mood and progress
const GIF_COLLECTION = {
  cute: {
    sleeping: "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
    trying: "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
    happy: "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
    celebrating:
      "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGJ3dzZuN3pzb3NoY2Z0cnpsMzVrb3k4aGZrcHVpYXhteGdjbnc5aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/hwaFAsPi7wU6LHwn84/giphy.webp",
    noTasks:
      "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGJ3dzZuN3pzb3NoY2Z0cnpsMzVrb3k4aGZrcHVpYXhteGdjbnc5aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/FY8c5SKwiNf1EtZKGs/200w.webp",
  },
  chill: {
    sleeping: "https://media.giphy.com/media/26xBwdIuRJiAIqHwA/giphy.gif",
    trying: "https://media.giphy.com/media/xTiTnJ3BooiDs7gDbs/giphy.gif",
    happy: "https://media.giphy.com/media/3o6ZsYw1a4f8v6b9gY/giphy.gif",
    celebrating: "https://media.giphy.com/media/l0HlQ7LRal4x0wWQo/giphy.gif",
    noTasks:
      "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGJ3dzZuN3pzb3NoY2Z0cnpsMzVrb3k4aGZrcHVpYXhteGdjbnc5aSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/35DmVHlLURCWBxmK8j/200w.webp",
  },
  study: {
    sleeping: "https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif",
    trying: "https://media.giphy.com/media/3o6Zt8MgUuvSbkZYWc/giphy.gif",
    happy: "https://media.giphy.com/media/1BXa2alBjrCXC/giphy.gif",
    celebrating: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
    noTasks:
      "https://media2.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZHNocW4wOHJxZTh0dnYxbHNsNHhiaXE0d3M1YXRubmMycGd3ejk1biZlcD12MV9naWZzX3NlYXJjaCZjdD1n/KGfcnXIF8qHCThNb98/200w.webp",
  },
  work: {
    sleeping: "https://media.giphy.com/media/l0MYt6jHSVkPBC8Na/giphy.gif",
    trying: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
    happy: "https://media.giphy.com/media/l2JehQ2GitHGdVG9y/giphy.gif",
    celebrating:
      "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG1jdndkM2k0a2s5cmVwZDJnamlieHFmMDAxYjd6d2xhd2o1dDhvdyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/toXKzaJP3WIgM/200.webp",
    noTasks: "https://media.giphy.com/media/3o7TKU8FRaWFe89aSI/giphy.gif",
  },
  sleep: {
    sleeping: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
    trying: "https://media.giphy.com/media/l0MYt6jHSVkPBC8Na/giphy.gif",
    happy: "https://media.giphy.com/media/3o6ZsX2s8b6QH2bXy0/giphy.gif",
    celebrating: "https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif",
    noTasks:
      "https://media4.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTh0amE5YjR6NjJvY2NzbDA5N3VweWJqa3F2cnlycXR2NzM2ZGwwdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/gjsBu8ZUniOODwgPP5/giphy.webp",
  },
};

// Safe getter with fallback
const getGifUrl = (mood, key) => {
  if (!GIF_COLLECTION[mood] || !GIF_COLLECTION[mood][key]) {
    return getTimeBasedGifUrl(mood);
  }
  return GIF_COLLECTION[mood][key];
};

// Helper function to get time period GIF
const getTimeBasedGifUrl = (mood) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "https://media.giphy.com/media/3o6ZtpWz664SPLsJyM/giphy.gif"; // morning coffee
  } else if (hour >= 12 && hour < 17) {
    return "https://media.giphy.com/media/3o7TKB3VmT0A25dX8A/giphy.gif"; // afternoon relaxation
  } else if (hour >= 17 && hour < 21) {
    return "https://media.giphy.com/media/l0HlOY9x8FZo0XO1i/giphy.gif"; // evening activities
  } else {
    return "https://media.giphy.com/media/3o7TKSZeUUDMbOoRdq/giphy.gif"; // night sleep
  }
};

// Helper function to get GIF based on progress (uses safe getter)
const getProgressGif = (progress, mood) => {
  if (progress === 0) return getGifUrl(mood, "sleeping");
  if (progress < 50) return getGifUrl(mood, "trying");
  if (progress < 100) return getGifUrl(mood, "happy");
  return getGifUrl(mood, "celebrating");
};

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState(0);
  const [newTaskDueTime, setNewTaskDueTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copySourceDate, setCopySourceDate] = useState(new Date());
  const [userMood, setUserMood] = useState("cute");
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  const formattedDate = format(selectedDate, "yyyy-MM-dd");

  useEffect(() => {
    fetchAllTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [selectedDate, allTasks]); // re-filter tasks when date or allTasks changes

  const fetchAllTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/all`);
      setAllTasks(res.data);
    } catch (error) {
      console.error("Error fetching all tasks:", error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?date=${formattedDate}`);
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskContent.trim()) return;

    try {
      const res = await axios.post(API_URL, {
        content: newTaskContent.trim(),
        targetDate: formattedDate,
        completed: false,
        priority: newTaskPriority,
        dueTime: newTaskDueTime || null,
      });
      setAllTasks([...allTasks, res.data]);
      setNewTaskContent("");
      setNewTaskPriority(0);
      setNewTaskDueTime("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const res = await axios.put(`${API_URL}/${task.id}`, {
        ...task,
        completed: !task.completed,
      });
      setAllTasks(allTasks.map((t) => (t.id === task.id ? res.data : t)));

      // Show completion animation
      setShowCompletionAnimation(true);
      setTimeout(() => setShowCompletionAnimation(false), 1500);

      // Check if all tasks for today are now completed
      const updatedTasks = allTasks.map((t) =>
        t.id === task.id ? res.data : t,
      );
      const todayTasks = updatedTasks.filter(
        (t) => t.targetDate === format(selectedDate, "yyyy-MM-dd"),
      );
      if (todayTasks.length > 0 && todayTasks.every((t) => t.completed)) {
        setShowCompletionPopup(true);
      }
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setAllTasks(allTasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handlePasteTasks = async () => {
    if (!pasteText.trim()) return;
    const lines = pasteText
      .split("\n")
      .filter((line) => line.trim().length > 0);

    if (lines.length === 0) return;

    const newTasks = lines.map((line) => ({
      content: line.trim(),
      targetDate: formattedDate,
      completed: false,
      priority: 0,
    }));

    try {
      const res = await axios.post(`${API_URL}/batch`, newTasks);
      setAllTasks([...allTasks, ...res.data]);
      setPasteText("");
      setShowPasteArea(false);
    } catch (error) {
      console.error("Error batch importing tasks:", error);
    }
  };

  const handleCopyTasks = async (uncompletedOnly) => {
    try {
      const sourceDateStr = format(copySourceDate, "yyyy-MM-dd");
      const res = await axios.post(
        `${API_URL}/copy?fromDate=${sourceDateStr}&toDate=${formattedDate}&uncompletedOnly=${uncompletedOnly}`,
      );
      setAllTasks([...allTasks, ...res.data]);
      setShowCopyModal(false);
    } catch (error) {
      console.error("Error copying tasks:", error);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Compute color for calendar tile
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTasks = allTasks.filter((t) => t.targetDate === dateStr);
      if (dayTasks.length > 0) {
        const completed = dayTasks.filter((t) => t.completed).length;
        const total = dayTasks.length;
        const percent = total > 0 ? (completed / total) * 100 : 0;

        if (percent === 100)
          return "bg-pink-300 text-white rounded-lg shadow-sm font-bold border-2 border-pink-400"; // Pink for 100%
        if (percent >= 50)
          return "bg-yellow-300 text-gray-800 rounded-lg shadow-sm font-bold border-2 border-yellow-400"; // Yellow for >= 50%
        return "bg-red-400 text-white rounded-lg shadow-sm font-bold border-2 border-red-500"; // Red for < 50%
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 font-sans text-gray-800 relative">
      <SePayForm />
      {/* Completion Animation Overlay */}
      {showCompletionAnimation && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
          <div className="animate-bounce">
            <img
              src="https://media.giphy.com/media/3o85xIO33l7RlmLiI0/giphy.gif"
              alt="celebration"
              className="w-24 h-24"
            />
          </div>
        </div>
      )}

      {/* 100% Completion Popup */}
      {showCompletionPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 shadow-2xl text-center max-w-sm mx-4 animate-in fade-in scale-in">
            <img
              src={getGifUrl(userMood, "celebrating")}
              onError={(e) => {
                e.currentTarget.src = getTimeBasedGifUrl(userMood);
              }}
              alt="celebrating"
              className="w-full max-w-xs rounded-2xl mb-4 mx-auto"
            />
            <h2 className="text-3xl font-bold text-pink-600 mb-2">
              Hoàn thành hết rồi!
            </h2>
            <p className="text-lg text-gray-600 mb-6">Giỏi quá 🐾</p>
            <button
              onClick={() => setShowCompletionPopup(false)}
              className="px-6 py-3 bg-pink-400 text-white rounded-xl hover:bg-pink-500 font-bold"
            >
              Cảm ơn! 💕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl w-full bg-white rounded-[2rem] shadow-2xl p-6 md:p-10 flex flex-col md:flex-row gap-10">
        {/* LEFT COLUMN: Image & Calendar */}
        <div className="w-full md:w-5/12 flex flex-col items-center">
          {/* Mood Selector */}
          <div className="w-full mb-4 p-4 bg-gradient-to-r from-pink-50 to-amber-50 rounded-2xl border-2 border-pink-100">
            <p className="text-sm font-bold text-gray-600 mb-2">
              Tâm trạng hôm nay:
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {["cute", "chill", "study", "work", "sleep"].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setUserMood(mood)}
                  className={`px-4 py-2 rounded-xl font-bold transition ${
                    userMood === mood
                      ? "bg-pink-400 text-white shadow-md"
                      : "bg-white border-2 border-pink-100 text-gray-600 hover:bg-pink-50"
                  }`}
                >
                  {mood === "cute" && "🥰 Cute"}
                  {mood === "chill" && "😎 Chill"}
                  {mood === "study" && "📚 Study"}
                  {mood === "work" && "💼 Work"}
                  {mood === "sleep" && "😴 Sleep"}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Image based on Progress */}
          <div className="relative w-full max-w-sm">
            <img
              src={
                totalCount === 0
                  ? getGifUrl(userMood, "noTasks")
                  : getProgressGif(progress, userMood)
              }
              onError={(e) => {
                e.currentTarget.src = getTimeBasedGifUrl(userMood);
              }}
              alt="Status"
              className="w-full rounded-[2rem] mb-6 object-cover shadow-md border-4 border-pink-100 h-64 animate-fade-in"
              key={`${totalCount}-${progress}-${userMood}`}
            />
            {/* Progress indicator badge */}
            {totalCount > 0 && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border-2 border-pink-100">
                <p className="text-center">
                  <span className="text-2xl font-bold text-pink-600">
                    {progress}%
                  </span>
                  <br />
                  <span className="text-xs text-gray-600 font-bold">
                    hoàn thành
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="w-full cute-calendar-wrapper bg-white p-4 rounded-3xl shadow-inner border-2 border-pink-50">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={tileClassName}
              className="border-none w-full !font-sans rounded-2xl"
              prevLabel={
                <span className="text-pink-500 font-bold text-xl">‹</span>
              }
              nextLabel={
                <span className="text-pink-500 font-bold text-xl">›</span>
              }
              prev2Label={null}
              next2Label={null}
            />
          </div>

          {/* Chú thích màu sắc */}
          <div className="mt-4 flex gap-3 text-xs font-medium text-gray-500 justify-center w-full">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-pink-300"></div> Hoàn
              thành
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-300"></div> &ge;
              50%
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-400"></div> &lt; 50%
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Todo List */}
        <div className="w-full md:w-7/12 flex flex-col bg-amber-50/40 p-6 md:p-8 rounded-[2rem] border-2 border-amber-100">
          <div className="flex flex-col mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-amber-600 tracking-tight mb-2">
              Todo List 🐾
            </h1>
            <div className="text-lg font-bold text-gray-500 bg-white inline-block px-4 py-1.5 rounded-full shadow-sm self-start">
              {format(selectedDate, "dd/MM/yyyy")}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm">
            <div className="flex justify-between text-sm font-bold text-amber-600 mb-2">
              <span>Đang tiến hành...</span>
              <span>
                {completedCount} / {totalCount} ({progress}%)
              </span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-4 overflow-hidden border border-amber-200">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setShowPasteArea(!showPasteArea)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-amber-200 text-amber-700 rounded-xl hover:bg-amber-100 transition text-sm font-bold shadow-sm"
            >
              <ClipboardPaste size={16} /> Dán nhiều dòng
            </button>
            <button
              onClick={() => setShowCopyModal(!showCopyModal)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-amber-200 text-amber-700 rounded-xl hover:bg-amber-100 transition text-sm font-bold shadow-sm"
            >
              <Copy size={16} /> Sao chép từ ngày khác
            </button>
          </div>

          {/* Paste Area */}
          {showPasteArea && (
            <div className="mb-6 p-4 rounded-2xl bg-white shadow-sm border-2 border-amber-100">
              <textarea
                className="w-full p-3 border-2 border-amber-100 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 focus:outline-none mb-3 min-h-[100px] text-gray-700 font-medium"
                placeholder="Dán các công việc vào đây (mỗi việc 1 dòng)..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowPasteArea(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 font-bold rounded-xl"
                >
                  Huỷ
                </button>
                <button
                  onClick={handlePasteTasks}
                  className="px-5 py-2 bg-amber-400 text-white rounded-xl hover:bg-amber-500 font-bold shadow-md"
                >
                  Thêm tất cả
                </button>
              </div>
            </div>
          )}

          {/* Copy Modal */}
          {showCopyModal && (
            <div className="mb-6 p-5 rounded-2xl bg-white shadow-sm border-2 border-amber-100">
              <h3 className="font-bold text-amber-700 mb-3 text-lg">
                Sao chép công việc sang ngày{" "}
                {format(selectedDate, "dd/MM/yyyy")}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="font-medium text-gray-600">Lấy từ ngày:</span>
                <input
                  type="date"
                  value={format(copySourceDate, "yyyy-MM-dd")}
                  onChange={(e) => setCopySourceDate(parseISO(e.target.value))}
                  className="border-2 border-amber-200 rounded-xl px-3 py-2 text-gray-700 font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCopyTasks(false)}
                  className="px-4 py-2 bg-amber-50 border-2 border-amber-200 text-amber-700 rounded-xl hover:bg-amber-100 text-sm font-bold"
                >
                  Chép tất cả
                </button>
                <button
                  onClick={() => handleCopyTasks(true)}
                  className="px-4 py-2 bg-amber-400 text-white rounded-xl hover:bg-amber-500 text-sm font-bold shadow-sm"
                >
                  Chỉ chép việc chưa xong
                </button>
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="px-4 py-2 text-gray-400 hover:bg-gray-100 rounded-xl font-bold text-sm ml-auto"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {/* Add Task Input */}
          <form onSubmit={handleAddTask} className="flex flex-col gap-2 mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskContent}
                onChange={(e) => setNewTaskContent(e.target.value)}
                placeholder="Hôm nay bạn muốn làm gì thế? ✿"
                className="flex-1 p-4 border-2 border-amber-200 rounded-2xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 focus:outline-none text-gray-700 font-medium placeholder-gray-400 shadow-sm"
              />
              <button
                type="submit"
                disabled={!newTaskContent.trim()}
                className="p-4 bg-amber-400 text-white rounded-2xl hover:bg-amber-500 disabled:opacity-50 transition shadow-sm flex items-center justify-center"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>
            {/* Options */}
            <div className="flex gap-2">
              <input
                type="time"
                value={newTaskDueTime}
                onChange={(e) => setNewTaskDueTime(e.target.value)}
                className="p-2 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none text-gray-600 text-sm font-medium"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(Number(e.target.value))}
                className="p-2 border-2 border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none text-gray-600 text-sm font-medium cursor-pointer"
              >
                <option value={0}>Bình thường</option>
                <option value={1}>Quan trọng</option>
                <option value={2}>Gấp quá gòii</option>
              </select>
            </div>
          </form>

          {/* Task List */}
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-center text-amber-500 font-bold py-8 animate-pulse">
                Đang tải chụt một xíu...
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center text-amber-300 font-bold py-12 border-2 border-dashed border-amber-200 rounded-[2rem] bg-white/50 flex flex-col items-center gap-4">
                <img
                  src={getGifUrl(userMood, "noTasks")}
                  onError={(e) => {
                    e.currentTarget.src = getTimeBasedGifUrl(userMood);
                  }}
                  alt="no tasks"
                  className="w-32 h-32 rounded-xl object-cover"
                />
                <p>Hôm nay chưa có việc nào. Nghỉ ngơi nhé! (´｡• ω •｀)</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 group transition-all duration-200 shadow-sm ${
                    task.completed
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : "bg-white border-amber-100 hover:border-amber-300 hover:shadow-md"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => handleToggleTask(task)}
                  >
                    <button className="text-gray-300 focus:outline-none shrink-0 transition-colors">
                      {task.completed ? (
                        <CheckCircle2 className="text-green-500" size={26} />
                      ) : (
                        <Circle
                          className="hover:text-amber-400 text-amber-200"
                          size={26}
                          strokeWidth={2.5}
                        />
                      )}
                    </button>
                    <span
                      className={`text-lg font-medium transition-all ${
                        task.completed
                          ? "line-through text-gray-400"
                          : "text-gray-700"
                      }`}
                      style={{ wordBreak: "break-word" }}
                    >
                      {task.content}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none bg-red-50 hover:bg-red-100 rounded-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
