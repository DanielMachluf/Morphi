import { Check, Copy, FileText, Image as ImageIcon, Mic } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Message } from "../../../Models/Message";
import { appConfig } from "../../../Utils/AppConfig";
import { extractFirstUrl, isImageUrl } from "../../../Utils/FileType";
import { renderMarkdown } from "../../../Utils/Markdown";
import { formatClockTime } from "../../../Utils/TimeAgo";
import "./MessageBubble.css";

interface MessageBubbleProps {
    message: Message;
    isStreaming?: boolean;
    showAvatar?: boolean;
}

function getImageUrl(message: Message, content: string): string {
    const rawUrl = message.file_url || extractFirstUrl(content) || "";
    if (!rawUrl) return "";
    if (/^(https?:|blob:|data:)/i.test(rawUrl)) return rawUrl;

    const uploadIndex = rawUrl.replaceAll("\\", "/").lastIndexOf("uploads/");
    const relativePath = uploadIndex >= 0 ? rawUrl.replaceAll("\\", "/").slice(uploadIndex) : rawUrl.replace(/^\/+/, "");
    return `${appConfig.serverUrl}/${relativePath}`;
}

function getImageQuestion(content: string): string {
    return content.replace(/^\[Image\]:\s*/i, "").trim();
}

export function MessageBubble({ message, isStreaming = false, showAvatar = true }: MessageBubbleProps) {
    const role = message.role || "assistant";
    const isUser = role === "user";
    const type = message.message_type || "text";
    const content = message.content || "";
    const imageUrl = type === "image" ? getImageUrl(message, content) : "";
    const imageQuestion = type === "image" ? getImageQuestion(content) : "";
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        const textToCopy = type === "image" ? imageQuestion || content : content;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    useEffect(() => {
        if (!isLightboxOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsLightboxOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [isLightboxOpen]);

    const lightbox = isLightboxOpen
        ? createPortal(
            <div
                className="MessageBubble-dialog-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`image-dialog-title-${message.id ?? "temp"}`}
                onClick={() => setIsLightboxOpen(false)}
            >
                <div
                    className="MessageBubble-dialog-content"
                    onClick={(event) => event.stopPropagation()}
                >
                    <button
                        type="button"
                        className="MessageBubble-dialog-close"
                        onClick={() => setIsLightboxOpen(false)}
                        aria-label="Close image preview"
                    >
                        ×
                    </button>
                    <h2
                        id={`image-dialog-title-${message.id ?? "temp"}`}
                        className="MessageBubble-dialog-title"
                    >
                        Image preview
                    </h2>
                    <img
                        src={imageUrl}
                        alt="Attached full size"
                        className="MessageBubble-dialog-image"
                    />
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <div className={"MessageBubble" + (isUser ? " MessageBubble--user" : " MessageBubble--ai")}>
            <div className="MessageBubble-inner">
                {!isUser && showAvatar && (
                    <div className="MessageBubble-avatar liquid-morph-ai" aria-hidden="true">
                    </div>
                )}

                <div className="MessageBubble-bubble">
                    {type === "image" && (
                        <div className="MessageBubble-media">
                            {imageUrl || isImageUrl(content) ? (
                                <>
                                    <button
                                        type="button"
                                        className="MessageBubble-image-button"
                                        onClick={() => setIsLightboxOpen(true)}
                                        aria-label="Open image preview"
                                    >
                                        {!isImageLoaded && <span className="MessageBubble-image-skeleton" />}
                                        <img
                                            src={imageUrl}
                                            alt="Attached"
                                            className={"MessageBubble-image" + (isImageLoaded ? " is-loaded" : "")}
                                            onLoad={() => setIsImageLoaded(true)}
                                        />
                                    </button>
                                    {imageQuestion && (
                                        <div className="MessageBubble-text MessageBubble-image-caption">
                                            {renderMarkdown(imageQuestion)}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="MessageBubble-text">
                                    <span className="MessageBubble-prefix" aria-hidden="true">
                                        <ImageIcon size={14} strokeWidth={2} />
                                    </span>
                                    {renderMarkdown(content)}
                                </div>
                            )}
                        </div>
                    )}

                    {type === "voice" && (
                        <div className="MessageBubble-text">
                            <span className="MessageBubble-prefix" aria-hidden="true">
                                <Mic size={14} strokeWidth={2} />
                            </span>
                            {renderMarkdown(content)}
                        </div>
                    )}

                    {type === "pdf" && (
                        <div className="MessageBubble-text">
                            <span className="MessageBubble-prefix" aria-hidden="true">
                                <FileText size={14} strokeWidth={2} />
                            </span>
                            {renderMarkdown(content)}
                        </div>
                    )}

                    {type === "text" && (
                        <div className="MessageBubble-text">
                            {renderMarkdown(content)}
                            {isStreaming && <span className="MessageBubble-cursor" aria-hidden="true" />}
                        </div>
                    )}

                    <span className="MessageBubble-time">{formatClockTime(message.created_at)}</span>
                </div>

                <button
                    type="button"
                    className={"MessageBubble-copy" + (isCopied ? " is-copied" : "")}
                    onClick={handleCopy}
                    aria-label={isCopied ? "Copied" : "Copy message"}
                >
                    <span className="MessageBubble-copy-icon MessageBubble-copy-icon--default">
                        <Copy size={12} strokeWidth={2} />
                    </span>
                    <span className="MessageBubble-copy-icon MessageBubble-copy-icon--check">
                        <Check size={12} strokeWidth={2.5} />
                    </span>
                </button>
            </div>
            {lightbox}
        </div>
    );
}
