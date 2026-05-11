import { ArrowRight, FileText, Image as ImageIcon, Mic, Paperclip, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ACCEPTED_FILE_TYPES, detectFileType, type FileType } from "../../../Utils/FileType";
import "./MessageInput.css";

interface MessageInputProps {
    onSend: (content: string, file?: File, fileType?: FileType) => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function MessageInput(props: MessageInputProps) {
    const { onSend, isLoading, disabled = false } = props;
    const [text, setText] = useState("");
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [attachedFileType, setAttachedFileType] = useState<FileType | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const textRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto-resize textarea up to a max height.
    useEffect(() => {
        const el = textRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }, [text]);

    const isBlocked = disabled || isLoading;
    const canSend = !isBlocked && (text.trim().length > 0 || attachedFile !== null);

    const handleSend = () => {
        if (!canSend) return;
        const trimmed = text.trim();
        if (attachedFile && attachedFileType) {
            onSend(trimmed, attachedFile, attachedFileType);
            setAttachedFile(null);
            setAttachedFileType(null);
            setText("");
            return;
        }
        if (trimmed.length === 0) return;
        onSend(trimmed);
        setText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ftype = detectFileType(file);
        if (!ftype) {
            e.target.value = "";
            return;
        }
        setAttachedFile(file);
        setAttachedFileType(ftype);
        e.target.value = "";
    };

    const renderChipIcon = () => {
        if (attachedFileType === "pdf") return <FileText size={14} strokeWidth={2} />;
        if (attachedFileType === "image") return <ImageIcon size={14} strokeWidth={2} />;
        if (attachedFileType === "voice") return <Mic size={14} strokeWidth={2} />;
        return null;
    };

    return (
        <div className={"MessageInput" + (isBlocked ? " is-disabled" : "")}>
            <div className="MessageInput-inner">
                {attachedFile && (
                    <div className="MessageInput-chip">
                        <span className="MessageInput-chip-icon" aria-hidden="true">
                            {renderChipIcon()}
                        </span>
                        <span className="MessageInput-chip-name">{attachedFile.name}</span>
                        <button
                            type="button"
                            className="MessageInput-chip-remove"
                            onClick={() => {
                                setAttachedFile(null);
                                setAttachedFileType(null);
                            }}
                            aria-label="Remove file"
                        >
                            <X size={12} strokeWidth={2.4} />
                        </button>
                    </div>
                )}

                <div className="MessageInput-row">
                    <button
                        type="button"
                        className="MessageInput-attach"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isBlocked}
                        title="Attach file"
                        aria-label="Attach file"
                    >
                        <Paperclip size={18} strokeWidth={2} />
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_FILE_TYPES}
                        onChange={handleFilePick}
                        className="MessageInput-file-hidden"
                        tabIndex={-1}
                    />

                    <textarea
                        ref={textRef}
                        className="MessageInput-textarea"
                        placeholder="Message Morphi..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isBlocked}
                        rows={1}
                    />

                    <button
                        type="button"
                        className={"MessageInput-send" + (canSend ? " is-active" : "")}
                        onClick={handleSend}
                        disabled={!canSend}
                        title="Send"
                        aria-label="Send message"
                    >
                        <ArrowRight size={16} strokeWidth={2.4} />
                    </button>
                </div>
            </div>
        </div>
    );
}
