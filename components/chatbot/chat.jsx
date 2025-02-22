'use client';

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingDots } from "@/components/ui/loading";
import {
  MessageSquare,
  Send,
  FileText,
  GraduationCap,
  PenBox,
  BarChart,
  X,
  MinusCircle,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

const options = [
  {
    id: "industry",
    title: "Industry Insights",
    icon: BarChart,
    description: "Get insights about your industry and career path",
    subOptions: [
      "Latest Tech Trends",
      "Salary Insights",
      "Growth Opportunities",
      "Skills in Demand",
    ],
    response: "Industry Insights provides data and analysis in these key areas:",
  },
  {
    id: "resume",
    title: "Resume Builder",
    icon: FileText,
    description: "Create a professional resume tailored to your industry",
    subOptions: [
      "Resume Templates",
      "ATS Optimization",
      "Skills Highlighting",
      "Work Experience Format",
    ],
    response: "Professional Resume Building includes these essential components:",
  },
  {
    id: "cover",
    title: "Cover Letter",
    icon: PenBox,
    description: "Generate a personalized cover letter",
    subOptions: [
      "Letter Templates",
      "Company Research",
      "Personal Branding",
      "Key Achievements",
    ],
    response: "Cover Letter Creation focuses on these key elements:",
  },
  {
    id: "interview",
    title: "Mock Interview",
    icon: GraduationCap,
    description: "Practice with AI-powered mock interviews",
    subOptions: [
      "Technical Questions",
      "Behavioral Questions",
      "Company Research",
      "Salary Negotiation",
    ],
    response: "Mock Interview Practice covers these critical areas:",
  },
];

const ChatMessage = ({ message, isUser, children }) => (
  <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
    <div
      className={`flex items-start gap-2.5 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-primary/10 text-primary"
        }`}
      >
        {isUser ? (
          "U"
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>
      <div
        className={`max-w-md p-4 rounded-2xl ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary/50 text-foreground"
        }`}
      >
        {message}
        {children}
      </div>
    </div>
  </div>
);

const ChatOption = ({ option, onSelect }) => (
  <button
    onClick={() => onSelect(option)}
    className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-primary/10 transition-all duration-200 flex items-center gap-3 group border border-primary/10 hover:border-primary/30"
  >
    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-primary/20">
      <option.icon className="w-6 h-6" />
    </div>
    <div className="text-left flex-1">
      <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
        {option.title}
      </h3>
      <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
        {option.description}
      </p>
    </div>
  </button>
);

const SubOption = ({ text }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors">
    <ChevronRight className="w-4 h-4 text-primary" />
    <span>{text}</span>
  </div>
);

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "Welcome to MaestroAI Career Assistant",
          isUser: false,
          showOptions: true,
        },
      ]);
    }
    scrollToBottom();
  }, [isOpen, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBack = () => {
    setSelectedType(null);
    setShowOptions(true);
    setMessages([
      {
        text: "Welcome to MaestroAI Career Assistant",
        isUser: false,
        showOptions: true,
      },
    ]);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue("");
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setLoading(true);

    setTimeout(() => {
      const selectedOption = options.find((opt) => opt.id === selectedType);
      if (selectedOption) {
        setMessages((prev) => [
          ...prev,
          {
            text: selectedOption.response,
            isUser: false,
            subOptions: selectedOption.subOptions,
          },
        ]);
      }
      setLoading(false);
    }, 1000);
  };

  const handleOptionSelect = async (option) => {
    setSelectedType(option.id);
    setMessages([
      {
        text: option.response,
        isUser: false,
        subOptions: option.subOptions,
      },
    ]);
    setShowOptions(false);
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setMinimized(false);
        }}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-purple-600 text-primary-foreground flex items-center justify-center shadow-lg hover:opacity-90 transition-all duration-200 z-50 group hover:scale-105"
      >
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div
          className={`fixed right-4 bottom-20 w-[400px] bg-background/95 backdrop-blur-sm border rounded-2xl shadow-xl transition-all duration-300 z-50 ${
            minimized ? "h-14" : "h-[600px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur-sm rounded-t-2xl">
            <div className="flex items-center gap-2">
              {!showOptions && (
                <button
                  onClick={handleBack}
                  className="p-1.5 hover:bg-secondary/50 rounded-lg transition-colors text-primary"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="relative">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              </div>
              <span className="font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                MaestroAI Assistant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMinimized(!minimized)}
                className="p-1.5 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <MinusCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="h-[440px] overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <ChatMessage key={index} message={msg.text} isUser={msg.isUser}>
                    {msg.showOptions && showOptions && (
                      <div className="mt-4 space-y-3">
                        {options.map((option) => (
                          <ChatOption
                            key={option.id}
                            option={option}
                            onSelect={handleOptionSelect}
                          />
                        ))}
                      </div>
                    )}
                    {msg.subOptions && (
                      <div className="mt-4 space-y-2 bg-background/50 rounded-lg p-3">
                        {msg.subOptions.map((subOpt, idx) => (
                          <SubOption key={idx} text={subOpt} />
                        ))}
                      </div>
                    )}
                  </ChatMessage>
                ))}
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <LoadingDots />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background/50 backdrop-blur-sm rounded-b-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputValue.trim() || loading}
                    className={loading ? "loading-button" : ""}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chat;
