import { useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";
import { Conversation } from "../../../Models/Conversation";
import { Message } from "../../../Models/Message";
import { Persona } from "../../../Models/Persona";
import { conversationsService } from "../../../Services/ConversationsService";
import { messagesService } from "../../../Services/MessagesService";
import { personaService } from "../../../Services/PersonaService";
import { notify } from "../../../Utils/Notify";
import { ChatWindow } from "../../ChatArea/ChatWindow/ChatWindow";
import { MessageInput } from "../../ChatArea/MessageInput/MessageInput";
import { NewChatModal } from "../../ChatArea/NewChatModal/NewChatModal";
import { Sidebar } from "../../ChatArea/Sidebar/Sidebar";
import "./Chat.css";

type FileType = "voice" | "pdf" | "image";

const DEFAULT_PERSONA_ID = 1;
const DEFAULT_MODEL = "gpt-4o";

export function Chat() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState<boolean>(false);
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [isCreatingConversation, setIsCreatingConversation] = useState<boolean>(false);
    const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

    // Load conversations + personas on mount.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [convos, ppl] = await Promise.all([
                    conversationsService.getAllConversations(),
                    personaService.getAllPersonas()
                ]);
                if (cancelled) return;
                setConversations(convos);
                setPersonas(ppl);
            } catch (err) {
                if (!cancelled) notify.error(err);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const refreshConversations = async () => {
        try {
            const convos = await conversationsService.getAllConversations();
            setConversations(convos);
        } catch (err) {
            notify.error(err);
        }
    };

    const handleSelectConversation = async (id: number) => {
        if (id === activeConversationId) return;
        setActiveConversationId(id);
        setMessages([]);
        try {
            const msgs = await messagesService.getMessagesByConversation(id);
            setMessages(msgs);
        } catch (err) {
            notify.error(err);
        }
    };

    const handleOpenNewChat = () => setIsNewChatModalOpen(true);

    const handleCloseNewChat = () => {
        if (isCreatingConversation) return;
        setIsNewChatModalOpen(false);
    };

    const handleConfirmNewChat = async (personaId: number, model: string) => {
        try {
            setIsCreatingConversation(true);
            const created = await conversationsService.createConversation(personaId, model);
            setConversations((prev) => [created, ...prev]);
            if (created.id != null) {
                setActiveConversationId(created.id);
                setMessages([]);
            }
            setIsNewChatModalOpen(false);
        } catch (err) {
            notify.error(err);
        } finally {
            setIsCreatingConversation(false);
        }
    };

    const handlePersonaCreated = (p: Persona) => {
        setPersonas((prev) => [...prev, p]);
    };

    const handleArchive = async (id: number) => {
        try {
            await conversationsService.archiveConversation(id);
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (id === activeConversationId) {
                setActiveConversationId(null);
                setMessages([]);
            }
            notify.success("Conversation archived");
        } catch (err) {
            notify.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await conversationsService.deleteConversation(id);
            setConversations((prev) => prev.filter((c) => c.id !== id));
            if (id === activeConversationId) {
                setActiveConversationId(null);
                setMessages([]);
            }
            notify.success("Conversation deleted");
        } catch (err) {
            notify.error(err);
        }
    };

    const handleSend = async (content: string, file?: File, fileType?: FileType) => {
        let conversationId = activeConversationId;
        const hasFile = file != null && fileType != null;
        const messageType = hasFile ? fileType : "text";
        const displayContent = hasFile ? `[${fileType === "image" ? "Image" : fileType === "pdf" ? "PDF" : "Voice Message"}]: ${content || "Please analyze this."}` : content;
        const previewUrl = hasFile && fileType === "image" ? URL.createObjectURL(file) : null;
        setIsLoading(true);
        let optimisticUser: Message | null = null;
        let assistantMessageId: number | null = null;
        try {
            if (conversationId == null) {
                const newConversation = await conversationsService.createConversation(DEFAULT_PERSONA_ID, DEFAULT_MODEL);
                setConversations((prev) => [newConversation, ...prev]);
                setActiveConversationId(newConversation.id ?? null);
                conversationId = newConversation.id ?? null;
            }

            if (conversationId == null) return;

            // Optimistically append the user message so it appears immediately.
            const userMessage = new Message({
                conversation_id: conversationId,
                role: "user",
                content: displayContent,
                message_type: messageType,
                file_url: previewUrl,
                created_at: new Date().toISOString()
            });
            optimisticUser = userMessage;
            setMessages((prev) => [...prev, userMessage]);

            if (!hasFile) {
                assistantMessageId = -Date.now();
                const streamingAssistant: Message = new Message({
                    id: assistantMessageId,
                    conversation_id: conversationId,
                    role: "assistant",
                    content: "",
                    message_type: "text",
                    created_at: new Date().toISOString()
                });
                setMessages((prev) => [...prev, streamingAssistant]);
                setStreamingMessageId(assistantMessageId);

                for await (const chunk of messagesService.sendMessageStream(conversationId, content)) {
                    setMessages((prev) => prev.map((message) => {
                        if (message.id !== assistantMessageId) return message;
                        return new Message({
                            ...message,
                            content: (message.content || "") + chunk
                        });
                    }));
                }

                refreshConversations();
                return;
            }

            const result = await messagesService.sendFileMessage(conversationId, file, fileType, content || "Please analyze this.");
            const aiReply: Message = new Message({
                conversation_id: conversationId,
                role: "assistant",
                content: result.response,
                message_type: "text",
                created_at: new Date().toISOString()
            });
            setMessages((prev) => [...prev, aiReply]);
            // Title may have updated server-side after first messages.
            refreshConversations();
        } catch (err) {
            // Roll back the optimistic user message on failure.
            setMessages((prev) => prev.filter((m) => m !== optimisticUser && m.id !== assistantMessageId));
            notify.error(err);
        } finally {
            setStreamingMessageId(null);
            setIsLoading(false);
        }
    };

    return (
        <div className="Chat">
            <Sidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelect={handleSelectConversation}
                onNewChat={handleOpenNewChat}
                onArchive={handleArchive}
                onDelete={handleDelete}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            />

            <section className="Chat-main">
                <button
                    type="button"
                    className={"Chat-sidebar-toggle" + (isSidebarCollapsed ? " is-collapsed" : "")}
                    onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                    aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <PanelLeft size={18} strokeWidth={2.2} />
                </button>

                <ChatWindow
                    messages={messages}
                    isLoading={isLoading}
                    streamingMessageId={streamingMessageId}
                />
                <MessageInput
                    onSend={handleSend}
                    isLoading={isLoading}
                />
            </section>

            <NewChatModal
                open={isNewChatModalOpen}
                personas={personas}
                isCreating={isCreatingConversation}
                onClose={handleCloseNewChat}
                onConfirm={handleConfirmNewChat}
                onPersonaCreated={handlePersonaCreated}
            />
        </div>
    );
}
