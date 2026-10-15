"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Image as ImageIcon, Smile, Loader2, Sparkles, User, Paperclip, X, Download } from "lucide-react";
import toast from "react-hot-toast";
import { useRealtimeSubscription } from "@/lib/realtimeClient";
import { useLanguage } from "@/lib/languageContext";

interface TeamChatProps {
  teamId: string;
  teamName: string;
}

export default function TeamChat({ teamId, teamName }: TeamChatProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const currentUserId = (session?.user as any)?.id;
  const currentUserName = (session?.user as any)?.name || "Me";

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; expires: number }>>({});
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial message history
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchMessages();
    }
  }, [teamId]);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Clean up expired typing indicators every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const uid in next) {
          if (next[uid].expires <= now) {
            delete next[uid];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time subscription for chat messages and typing
  const { isConnected, provider } = useRealtimeSubscription({
    channel: `team-${teamId}`,
    onEvent: (event, data) => {
      if (event === "chat:message" && data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
        // Clear typing indicator for this sender
        if (data.senderId) {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[data.senderId];
            return next;
          });
        }
      } else if (event === "chat:typing" && data) {
        if (data.userId && data.userId !== currentUserId) {
          if (data.isTyping) {
            setTypingUsers((prev) => ({
              ...prev,
              [data.userId]: {
                name: data.userName || "Teammate",
                expires: Date.now() + 3000,
              },
            }));
          } else {
            setTypingUsers((prev) => {
              const next = { ...prev };
              delete next[data.userId];
              return next;
            });
          }
        }
      }
    },
  });

  // Handle typing broadcast
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Broadcast typing event with debounce
    if (!typingTimeoutRef.current) {
      fetch(`/api/teams/${teamId}/chat/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping: true }),
      }).catch(() => {});
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      fetch(`/api/teams/${teamId}/chat/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping: false }),
      }).catch(() => {});
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // Handle image / file attachment conversion to DataURL
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAttachment({
        url: dataUrl,
        name: file.name,
      });
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachment) || isSending) return;

    const content = inputText.trim();
    const currentAttachment = attachment;

    setInputText("");
    setAttachment(null);
    setIsSending(true);

    try {
      const res = await fetch(`/api/teams/${teamId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          fileUrl: currentAttachment?.url || null,
          fileName: currentAttachment?.name || null,
        }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        // Optimistically update
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      } else {
        toast.error("Failed to send message");
        // restore text
        setInputText(content);
        setAttachment(currentAttachment);
      }
    } catch {
      toast.error("Network error sending message");
      setInputText(content);
      setAttachment(currentAttachment);
    } finally {
      setIsSending(false);
    }
  };

  const activeTypers = Object.values(typingUsers).map((u) => u.name);

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-[2.5rem] border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-500 to-secondary-500 text-white flex items-center justify-center font-black shadow-sm">
            💬
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              {teamName} {t("tabChat")}
            </h3>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400"} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-amber-500"}`}></span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {isConnected ? `Real-time Active (${provider.toUpperCase()})` : "Connecting..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/30 to-white">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-8">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-600 text-sm">No messages in team chat yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Say hello to your teammates and start collaborating in real-time!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {!isMe && (
                  <div
                    className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs border border-slate-200/80"
                    title={msg.sender?.name || "Member"}
                  >
                    {msg.sender?.name?.charAt(0).toUpperCase() || "M"}
                  </div>
                )}

                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-extrabold text-slate-700">
                      {isMe ? "You" : msg.sender?.name || "Member"}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`rounded-3xl px-4 py-3 text-sm font-medium shadow-sm transition-all ${
                      isMe
                        ? "theme-gradient-btn text-white rounded-tr-none shadow-primary-500/10"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-slate-100"
                    }`}
                  >
                    {/* Text content */}
                    {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}

                    {/* File / Image Attachment */}
                    {msg.fileUrl && (
                      <div className="mt-2 rounded-2xl overflow-hidden border border-white/20">
                        {msg.fileUrl.startsWith("data:image/") || msg.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                          <img
                            src={msg.fileUrl}
                            alt={msg.fileName || "Attachment"}
                            className="max-h-64 rounded-xl object-cover hover:scale-102 transition-transform cursor-pointer"
                            onClick={() => window.open(msg.fileUrl, "_blank")}
                          />
                        ) : (
                          <a
                            href={msg.fileUrl}
                            download={msg.fileName || "attachment"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-black/10 rounded-xl text-xs hover:bg-black/20 transition-colors"
                          >
                            <Paperclip className="w-4 h-4" />
                            <span className="truncate max-w-[180px] font-bold">
                              {msg.fileName || "Download file"}
                            </span>
                            <Download className="w-3.5 h-3.5 ml-auto" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator Bar */}
      {activeTypers.length > 0 && (
        <div className="px-6 py-1.5 bg-slate-50/80 border-t border-slate-100 text-[11px] font-semibold text-slate-500 flex items-center gap-2 animate-pulse">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <span>
            {activeTypers.join(", ")} {activeTypers.length > 1 ? t("severalTyping") : t("typing")}
          </span>
        </div>
      )}

      {/* Attachment Preview */}
      {attachment && (
        <div className="px-6 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-bold text-slate-700 truncate max-w-xs">{attachment.name}</span>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
          title="Attach image or file"
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={t("chatPlaceholder")}
          className="flex-1 px-5 py-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all shadow-inner"
        />

        <button
          type="submit"
          disabled={isSending || (!inputText.trim() && !attachment)}
          className="p-3.5 rounded-2xl theme-gradient-btn text-white font-bold shadow-md shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0"
          title={t("send")}
        >
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
