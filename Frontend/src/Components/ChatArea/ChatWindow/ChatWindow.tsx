import { useEffect, useRef } from "react";
import { Message } from "../../../Models/Message";
import { MessageBubble } from "../MessageBubble/MessageBubble";
import "./ChatWindow.css";

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
    streamingMessageId: number | null;
}

export function ChatWindow({ messages, isLoading, streamingMessageId }: ChatWindowProps) {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, isLoading]);

    const isEmpty = messages.length === 0 && !isLoading;

    
    const lastAssistantIndex = (() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if ((messages[i].role || "assistant") === "assistant") return i;
        }
        return -1;
    })();

    return (
        <div className="ChatWindow" ref={scrollRef}>
            <div className="ChatWindow-inner">
                {isEmpty && (
                    <div className="ChatWindow-empty">
                        <div className="ChatWindow-empty-glow" aria-hidden="true" />
                        <div className="ChatWindow-empty-icon liquid-morph-ai" aria-hidden="true">
                        </div>
                        <h2 className="ChatWindow-empty-title">What can I help you with?</h2>
                        <p className="ChatWindow-empty-sub">Start typing below</p>
                    </div>
                )}

                {messages.map((m, idx) => (
                    <MessageBubble
                        key={m.id ?? `m-${idx}`}
                        message={m}
                        isStreaming={m.id === streamingMessageId}
                        showAvatar={idx === lastAssistantIndex}
                    />
                ))}

                {isLoading && streamingMessageId == null && (
                    <div className="ChatWindow-typing">
                        <div className="ChatWindow-typing-avatar" aria-hidden="true">
                            <span />
                        </div>
                        <div className="ChatWindow-typing-bubble">
                            <span className="ChatWindow-dot" />
                            <span className="ChatWindow-dot" />
                            <span className="ChatWindow-dot" />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
