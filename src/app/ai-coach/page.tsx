"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import logo from "@/assets/logo-transparent.png";
import {
  X,
  Sparkles,
  Video,
  Building,
  ShieldCheck,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Play,
  CheckCircle2,
  PhoneCall,
  PhoneOff,
  Copy,
} from "lucide-react";
import { SupportedLanguage, SUPPORTED_LANGUAGES, detectLanguage } from "@/lib/nutrition/translator";
import { StructuredNutritionResponse } from "@/lib/nutrition/llm-formatter";

interface ChatItem {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  spokenText?: string;
  detectedLanguage?: SupportedLanguage;
  doctorCard?: {
    name: string;
    specialty: string;
    hospital: string;
    experience: string;
    availability: string;
    avatar: string;
    rating: string;
    consultationFee: string;
    availableSlots?: string[];
  };
  workoutCard?: {
    title: string;
    duration: string;
    intensity: string;
    focus: string;
  };
  nutritionData?: StructuredNutritionResponse;
}

export default function AIChatPage() {
  const router = useRouter();
  const { showNotification, startWorkout, logMeal } = useApp();

  // Chat State
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([]);

  // Voice Call Mode State (ChatGPT Voice / Gemini Live Style)
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallStatus, setVoiceCallStatus] = useState<"listening" | "thinking" | "speaking" | "idle">("idle");

  // Voice Language & Continuous Speech Recognition State
  const [voiceLang, setVoiceLang] = useState<"ta-IN" | "en-IN">("ta-IN");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const speechAccumulatorRef = useRef<string>("");
  const isSendingRef = useRef<boolean>(false);
  const lastSentRef = useRef<{ text: string; time: number }>({ text: "", time: 0 });

  // Web Speech API TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Doctor Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeDoctor, setActiveDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState("Today, 2:30 PM");
  const [consultType, setConsultType] = useState<"telehealth" | "clinic">("telehealth");

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition on Mount / when voiceLang changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {}
        }

        const recognition = new SpeechRecognition();
        // On Android WebKit/Chrome, continuous mode often interrupts after 1 phrase; setting false gives reliable capture
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = voiceLang;

        recognition.onstart = () => {
          setIsListening(true);
          speechAccumulatorRef.current = "";
          if (isVoiceCallActive) setVoiceCallStatus("listening");
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = 0; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + " ";
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const fullCaptured = (finalTranscript + interimTranscript).trim();
          speechAccumulatorRef.current = fullCaptured;
          setInputText(fullCaptured);

          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const textToSend = speechAccumulatorRef.current.trim();
            if (textToSend && !isSendingRef.current) {
              speechAccumulatorRef.current = "";
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
                silenceTimerRef.current = null;
              }
              try {
                recognition.stop();
              } catch (e) {}
              setIsListening(false);
              handleSendMessage(textToSend);
            }
          }, 2000);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            showNotification("⚠️ Microphone permission is required. Please enable mic access in your Android/browser settings.");
          } else if (event.error !== "no-speech") {
            showNotification(`⚠️ Voice error (${event.error}). Please type your message.`);
          }
          setIsListening(false);
          if (isVoiceCallActive) setVoiceCallStatus("idle");
        };

        recognition.onend = () => {
          setIsListening(false);
          // If text was gathered before onend, auto-dispatch
          const captured = speechAccumulatorRef.current.trim();
          if (captured && !isSendingRef.current) {
            speechAccumulatorRef.current = "";
            handleSendMessage(captured);
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [voiceLang, isVoiceCallActive]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Start / Stop Microphone Listening with Android Permission Check
  const toggleListening = async () => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) {
      showNotification("⚠️ Voice input is not supported in this browser. Please type your message.");
      return;
    }

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (isListening) {
      // User tapped to finish: immediately send the gathered sentence
      try {
        if (recognitionRef.current) recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
      if (isVoiceCallActive) setVoiceCallStatus("idle");

      const captured = speechAccumulatorRef.current.trim() || inputText.trim();
      if (captured) {
        speechAccumulatorRef.current = "";
        handleSendMessage(captured);
      }
      return;
    }

    // Android Chrome microphone permission probe
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          showNotification("⚠️ Microphone blocked. Please allow microphone permissions in Android/browser settings.");
          return;
        }
      }
    }

    try {
      stopSpeaking();
      speechAccumulatorRef.current = "";
      if (recognitionRef.current) {
        recognitionRef.current.lang = voiceLang;
        recognitionRef.current.start();
        showNotification(voiceLang === "ta-IN" ? "🎙️ தமிழில் பேசுங்கள்..." : "🎙️ Listening... speak your question.");
      }
    } catch (err) {
      console.error("Error starting speech recognition:", err);
      showNotification("🎙️ Microphone started. Please speak your question.");
    }
  };

  // Text-to-Speech (TTS) in Auto-Detected Language
  const speakText = (text: string, langCode: SupportedLanguage = "en", msgId?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Clean markdown for speech
    const cleanText = text
      .replace(/[*#_`>~-]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = SUPPORTED_LANGUAGES[langCode]?.voiceLangCode || "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (msgId) setSpeakingMsgId(msgId);
      if (isVoiceCallActive) setVoiceCallStatus("speaking");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      if (isVoiceCallActive) {
        setVoiceCallStatus("idle");
        // Automatically prompt to listen again in voice call mode
        setTimeout(() => {
          if (isVoiceCallActive) toggleListening();
        }, 600);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      if (isVoiceCallActive) setVoiceCallStatus("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      if (isVoiceCallActive) setVoiceCallStatus("idle");
    }
  };

  // Main Message Dispatcher with Automatic Language Intelligence and Deduplication Lock
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    // Prevent duplicate triggers if already dispatching or identical message sent within 2 seconds
    const now = Date.now();
    if (isSendingRef.current) return;
    if (lastSentRef.current.text === text && now - lastSentRef.current.time < 2000) {
      return;
    }

    isSendingRef.current = true;
    lastSentRef.current = { text, time: now };

    // Clear any active silence timer and accumulated speech buffer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    speechAccumulatorRef.current = "";
    setInputText("");

    // Stop recognition if active
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }

    // Automatic Language Detection from query content
    const autoLang = detectLanguage(text);

    const userMsg: ChatItem = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: text,
      detectedLanguage: autoLang,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    if (isVoiceCallActive) setVoiceCallStatus("thinking");

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language: autoLang,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();
      const aiMsg: ChatItem = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.reply,
        spokenText: data.spokenText || data.reply,
        detectedLanguage: data.detectedLanguage || autoLang,
        doctorCard: data.doctorCard,
        workoutCard: data.workoutCard,
        nutritionData: data.nutritionData,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // In Voice Call mode, automatically speak the answer in detected language
      if (isVoiceCallActive) {
        speakText(aiMsg.spokenText || aiMsg.text, aiMsg.detectedLanguage, aiMsg.id);
      }
    } catch (e) {
      const errorReply: ChatItem = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: "I'm experiencing a brief network sync interruption. Please try asking again!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorReply]);
      if (isVoiceCallActive) setVoiceCallStatus("idle");
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        isSendingRef.current = false;
      }, 500);
    }
  };

  // Log Meal to Diary
  const handleLogNutritionToDiary = (data: StructuredNutritionResponse) => {
    logMeal({
      name: `${data.foodName} (${data.servingSize})`,
      mealType: "Lunch",
      calories: data.macros.calories,
      protein: data.macros.protein,
      carbs: data.macros.carbs,
      fats: data.macros.fat,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ingredients: [`Source: ${data.sourceAttribution}`, `Fiber: ${data.macros.fiber}g`],
    });
    showNotification(`🥗 Logged "${data.foodName}" to daily nutrition diary!`);
  };

  // Start Live Workout
  const handleStartWorkoutFromCard = (card: any) => {
    showNotification(`⚡ Initialized workout: ${card.title}`);
    startWorkout({
      id: `ai_workout_${Date.now()}`,
      title: card.title,
      subtitle: card.intensity || "AI Personalized Split",
      category: "Hypertrophy",
      durationMinutes: 45,
      estimatedBurnKcal: 420,
      intensity: "High",
      targetMuscles: ["Chest", "Triceps", "Anterior Delts"],
      exercises: [
        {
          exerciseId: "ex_bench",
          name: "Incline DB Bench Press",
          targetSets: 4,
          targetReps: "10-12",
          restSeconds: 90,
          sets: [
            { setNumber: 1, weightKg: 28, reps: 12, completed: false },
            { setNumber: 2, weightKg: 30, reps: 10, completed: false },
            { setNumber: 3, weightKg: 32, reps: 10, completed: false },
            { setNumber: 4, weightKg: 32, reps: 8, completed: false },
          ],
        },
        {
          exerciseId: "ex_dips",
          name: "Weighted Chest Dips",
          targetSets: 3,
          targetReps: "8-10",
          restSeconds: 90,
          sets: [
            { setNumber: 1, weightKg: 10, reps: 10, completed: false },
            { setNumber: 2, weightKg: 15, reps: 8, completed: false },
            { setNumber: 3, weightKg: 15, reps: 8, completed: false },
          ],
        },
      ],
    });
    router.push("/workout-tracker");
  };

  // Doctor Consultation Confirm
  const handleConfirmDoctorBooking = () => {
    setShowBookingModal(false);
    showNotification(`✅ Appointment booked with ${activeDoctor?.name || "Dr. Sarah Chen"} for ${selectedSlot}!`);

    const confirmMsg: ChatItem = {
      id: `ai-doc-${Date.now()}`,
      sender: "ai",
      text: `Appointment confirmed with **${activeDoctor?.name || "Dr. Sarah Chen"}** for **${selectedSlot}** (${consultType === "telehealth" ? "Telehealth HD Video" : "In-Clinic Visit"}). A calendar invite has been synced.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, confirmMsg]);
  };

  // Reset / Clear Chat
  const handleResetChat = () => {
    setMessages([]);
    showNotification("✨ Started new chat session.");
  };

  // Copy Message to Clipboard
  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification("📋 Copied message to clipboard!");
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased selection:bg-primary-fixed selection:text-white">
      {/* ========================================================================= */}
      {/* TOP BAR: BRANDED WITH APP LOGO AND "AI ERA" (CLEAN CONTROLS)              */}
      {/* ========================================================================= */}
      <header className="bg-surface border-b border-outline shadow-sm sticky top-0 z-40 px-4 h-16 w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>

          {/* Unified AI Era Brand Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-surface-container border border-outline flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <Image
                src={logo}
                alt="AI Era Logo"
                width={36}
                height={36}
                priority
                style={{
                  width: "36px",
                  height: "36px",
                  objectFit: "contain",
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-on-surface leading-tight">
                  AI Era
                </h1>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-primary-container text-primary-fixed uppercase flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Auto-Language AI
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Your AI Health Coach • Online
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: New Chat */}
        <div className="flex items-center gap-2">
          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleResetChat}
            className="px-3.5 py-1.5 rounded-xl bg-surface border border-outline hover:bg-surface-container text-on-surface text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Start New Chat Session"
          >
            <Plus className="w-4 h-4 text-primary-fixed" />
            <span>New Chat</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 space-y-4 pb-32">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-on-surface-variant gap-4">
            <div className="w-14 h-14 rounded-3xl bg-primary-container/60 border border-primary-fixed/30 flex items-center justify-center text-primary-fixed shadow-sm">
              <Sparkles className="w-7 h-7 text-primary-fixed animate-pulse" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-lg font-bold text-on-surface font-headline">How can AI Era assist you?</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Ask in <strong>English, தமிழ் (Tamil), हिंदी (Hindi), or മലയാളம் (Malayalam)</strong>. Tap any quick prompt below or speak into the microphone.
              </p>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2 text-left">
              {[
                { title: "2 Boiled Eggs & Steamed Rice Macros", icon: "🥗", query: "2 boiled eggs with 1 cup steamed rice" },
                { title: "Upper Body Hypertrophy Routine", icon: "💪", query: "give me an upper body hypertrophy workout routine" },
                { title: "My Clinical Blood Biomarkers", icon: "🩺", query: "how is my blood test report and testosterone?" },
                { title: "Calculate TDEE & Daily Water Needs", icon: "💧", query: "calculate my TDEE and water intake" },
                { title: "Creatine & Protein Supplement Guide", icon: "⚡", query: "creatine monohydrate and whey protein dosage" },
                { title: "Book Doctor Consultation", icon: "👨‍⚕️", query: "I need to consult a doctor for joint pain" },
              ].map((chip) => (
                <button
                  key={chip.title}
                  type="button"
                  onClick={() => handleSendMessage(chip.query)}
                  className="p-3 rounded-xl bg-surface border border-outline hover:border-primary-fixed/50 hover:bg-surface-container text-xs font-semibold text-on-surface flex items-center gap-2.5 transition-all shadow-xs group cursor-pointer"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">{chip.icon}</span>
                  <span className="truncate">{chip.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message List */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-2xl p-4 md:p-5 rounded-2xl shadow-sm text-sm ${
                  msg.sender === "user"
                    ? "bg-primary-fixed text-white rounded-br-none"
                    : "bg-surface border border-outline text-on-surface rounded-bl-none"
                }`}
              >
                {/* Text Content */}
                <div className="prose prose-sm max-w-none text-inherit leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* ========================================================================= */}
                {/* EMBEDDED INTERACTIVE NUTRITION CARD (USDA & IFCT)                         */}
                {/* ========================================================================= */}
                {msg.nutritionData && (
                  <div className="mt-4 pt-4 border-t border-outline/50 space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px] font-mono font-bold text-emerald-700">
                          {msg.nutritionData.sourceAttribution}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-on-surface-variant">
                        {msg.nutritionData.servingSize}
                      </span>
                    </div>

                    {/* Macro Split Percentage Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                        <span className="text-primary-fixed">
                          Protein {msg.nutritionData.macroSplitPercentage.proteinPct}%
                        </span>
                        <span className="text-amber-600">
                          Carbs {msg.nutritionData.macroSplitPercentage.carbsPct}%
                        </span>
                        <span className="text-rose-500">
                          Fat {msg.nutritionData.macroSplitPercentage.fatPct}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex">
                        <div
                          className="bg-primary-fixed transition-all"
                          style={{ width: `${msg.nutritionData.macroSplitPercentage.proteinPct}%` }}
                        />
                        <div
                          className="bg-amber-500 transition-all"
                          style={{ width: `${msg.nutritionData.macroSplitPercentage.carbsPct}%` }}
                        />
                        <div
                          className="bg-rose-500 transition-all"
                          style={{ width: `${msg.nutritionData.macroSplitPercentage.fatPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Macro Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-surface-container border border-outline">
                        <span className="text-[9px] font-mono text-on-surface-variant block uppercase">
                          Calories
                        </span>
                        <span className="font-bold text-on-surface text-base">
                          {msg.nutritionData.macros.calories}
                          <span className="text-[10px] font-normal text-on-surface-variant ml-0.5">kcal</span>
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-container border border-outline">
                        <span className="text-[9px] font-mono text-on-surface-variant block uppercase">
                          Protein
                        </span>
                        <span className="font-bold text-primary-fixed text-base">
                          {msg.nutritionData.macros.protein}g
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-container border border-outline">
                        <span className="text-[9px] font-mono text-on-surface-variant block uppercase">
                          Carbs
                        </span>
                        <span className="font-bold text-amber-600 text-base">
                          {msg.nutritionData.macros.carbs}g
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-container border border-outline">
                        <span className="text-[9px] font-mono text-on-surface-variant block uppercase">
                          Fats
                        </span>
                        <span className="font-bold text-rose-500 text-base">
                          {msg.nutritionData.macros.fat}g
                        </span>
                      </div>
                    </div>

                    {/* Health Benefits Snippet */}
                    {msg.nutritionData.healthBenefits.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 space-y-1">
                        <div className="font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Clinical Benefits:</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {msg.nutritionData.healthBenefits[0]}
                        </p>
                      </div>
                    )}

                    {/* Action Button: Log to Diary */}
                    <button
                      type="button"
                      onClick={() => handleLogNutritionToDiary(msg.nutritionData!)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-500 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Log to Daily Nutrition Diary</span>
                    </button>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* EMBEDDED INTERACTIVE DOCTOR CONSULTATION CARD                             */}
                {/* ========================================================================= */}
                {msg.doctorCard && (
                  <div className="mt-4 pt-4 border-t border-outline/50 space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <img
                        src={msg.doctorCard.avatar}
                        alt={msg.doctorCard.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary-fixed shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-on-surface text-sm">{msg.doctorCard.name}</h4>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                            {msg.doctorCard.rating}
                          </span>
                        </div>
                        <p className="text-xs text-primary-fixed">{msg.doctorCard.specialty}</p>
                        <p className="text-[11px] text-on-surface-variant">{msg.doctorCard.hospital}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDoctor(msg.doctorCard);
                        setShowBookingModal(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-primary-fixed text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-fixed/90 shadow-sm transition-all cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Book Telehealth / In-Clinic Consultation</span>
                    </button>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* EMBEDDED INTERACTIVE WORKOUT ROUTINE CARD                                 */}
                {/* ========================================================================= */}
                {msg.workoutCard && (
                  <div className="mt-4 pt-4 border-t border-outline/50 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-primary-fixed uppercase font-bold">
                          Personalized Training Routine
                        </span>
                        <h4 className="text-sm font-bold text-on-surface">{msg.workoutCard.title}</h4>
                      </div>
                      <span className="text-xs font-mono text-on-surface-variant">
                        {msg.workoutCard.duration}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container border border-outline text-xs text-on-surface space-y-1">
                      <p className="font-mono text-xs">{msg.workoutCard.focus}</p>
                      <p className="text-[11px] text-on-surface-variant">{msg.workoutCard.intensity}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartWorkoutFromCard(msg.workoutCard)}
                      className="w-full py-2.5 rounded-xl bg-primary-fixed text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary-fixed/90 shadow-sm transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Workout in Live Tracker</span>
                    </button>
                  </div>
                )}

                {/* Footer Controls per message */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-on-surface-variant/70 border-t border-outline/30 pt-2">
                  <span className="font-mono text-[10px]">{msg.timestamp}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.text)}
                      className="hover:text-on-surface transition-colors cursor-pointer"
                      title="Copy Message"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {msg.sender === "ai" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSpeaking && speakingMsgId === msg.id) {
                            stopSpeaking();
                          } else {
                            speakText(msg.spokenText || msg.text, msg.detectedLanguage || detectLanguage(msg.text), msg.id);
                          }
                        }}
                        className={`hover:text-primary-fixed transition-colors cursor-pointer ${
                          isSpeaking && speakingMsgId === msg.id ? "text-primary-fixed font-bold animate-pulse" : ""
                        }`}
                        title="Read aloud"
                      >
                        {isSpeaking && speakingMsgId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="p-3.5 rounded-2xl bg-surface border border-outline shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-fixed animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-primary-fixed animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-primary-fixed animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM INPUT DOCK (FIXED & FULLY VISIBLE)                                 */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 pb-safe bg-surface/95 backdrop-blur-md border-t border-outline z-50 md:pl-64 shadow-2xl">
        {/* Active Listening Status Banner */}
        {isListening && (
          <div className="max-w-4xl mx-auto mb-2.5 flex items-center justify-between px-3.5 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-600 animate-pulse">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              <span>{voiceLang === "ta-IN" ? "🎙️ முழுமையாகப் பேசுங்கள் (தமிழில் கேட்கிறது)..." : "🎙️ Speak your full question in English..."}</span>
            </span>
            <span className="text-[11px] font-mono text-red-700 hidden sm:inline">பேசி முடித்ததும் Mic அழுத்தவும்</span>
          </div>
        )}

        <div className="max-w-4xl mx-auto flex items-center gap-2">
          {/* Voice Language Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const next = voiceLang === "ta-IN" ? "en-IN" : "ta-IN";
              setVoiceLang(next);
              showNotification(next === "ta-IN" ? "🇮🇳 குரல் மொழி: தமிழ் (ta-IN)" : "🌐 Voice Language: English (en-IN)");
            }}
            className="px-2.5 py-3 rounded-xl bg-surface border border-outline hover:bg-surface-container text-xs font-mono font-bold text-on-surface flex items-center gap-1 shadow-xs cursor-pointer shrink-0"
            title="Toggle Voice Recognition Language (Tamil / English)"
          >
            <span>{voiceLang === "ta-IN" ? "🇮🇳 தமிழ்" : "🌐 EN"}</span>
          </button>

          {/* Microphone STT Trigger */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              isListening
                ? "bg-red-500 text-white border-red-600 animate-pulse ring-4 ring-red-500/20"
                : "bg-surface border-outline text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
            title={isListening ? "Listening... (Click to finish and send)" : "Voice Query (Click to speak in full sentence)"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Input Text Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={voiceLang === "ta-IN" ? "தமிழிலோ அல்லது ஆங்கிலத்திலோ கேளுங்கள்..." : "Ask AI Era in English, தமிழ், हिंदी, or മലയാളം..."}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-outline text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary-fixed focus:ring-2 focus:ring-primary-fixed/20 shadow-sm"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-5 py-3 rounded-xl bg-primary-fixed text-white font-bold text-sm hover:bg-primary-fixed/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Send</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DOCTOR BOOKING MODAL                                                      */}
      {/* ========================================================================= */}
      {showBookingModal && activeDoctor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-outline shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <h3 className="font-bold text-base text-on-surface">Confirm Doctor Appointment</h3>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={activeDoctor.avatar}
                alt={activeDoctor.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary-fixed shrink-0"
              />
              <div>
                <h4 className="font-bold text-sm text-on-surface">{activeDoctor.name}</h4>
                <p className="text-xs text-primary-fixed">{activeDoctor.specialty}</p>
                <p className="text-[11px] text-on-surface-variant">{activeDoctor.hospital}</p>
              </div>
            </div>

            {/* Consultation Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-on-surface-variant uppercase">
                Consultation Format:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConsultType("telehealth")}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    consultType === "telehealth"
                      ? "border-primary-fixed bg-primary-container text-primary-fixed font-bold"
                      : "border-outline text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>HD Telehealth Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConsultType("clinic")}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    consultType === "clinic"
                      ? "border-primary-fixed bg-primary-container text-primary-fixed font-bold"
                      : "border-outline text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>In-Clinic Visit</span>
                </button>
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-on-surface-variant uppercase">
                Select Time Slot:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(activeDoctor.availableSlots || ["Today, 2:30 PM", "Tomorrow, 10:00 AM"]).map(
                  (slot: string) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-lg border text-xs text-center cursor-pointer ${
                        selectedSlot === slot
                          ? "border-primary-fixed bg-primary-container text-primary-fixed font-bold"
                          : "border-outline text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      {slot}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container border border-outline text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Fee:</span>
                <span className="font-bold text-on-surface">{activeDoctor.consultationFee}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Coverage:</span>
                <span className="font-bold">100% Covered by EraFit Platinum</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-outline text-xs font-semibold text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDoctorBooking}
                className="flex-1 py-2.5 rounded-xl bg-primary-fixed text-white font-bold text-xs hover:bg-primary-fixed/90 shadow-sm"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
