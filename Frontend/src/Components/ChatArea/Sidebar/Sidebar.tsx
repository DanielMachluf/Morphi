import { Archive, PanelLeft, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Conversation } from "../../../Models/Conversation";
import { timeAgo } from "../../../Utils/TimeAgo";
import "./Sidebar.css";

interface SidebarProps {
    conversations: Conversation[];
    activeConversationId: number | null;
    onSelect: (id: number) => void;
    onNewChat: () => void;
    onArchive: (id: number) => void;
    onDelete: (id: number) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Sidebar(props: SidebarProps) {
    const {
        conversations,
        activeConversationId,
        onSelect,
        onNewChat,
        onArchive,
        onDelete,
        isCollapsed,
        onToggleCollapse
    } = props;

    const sortedConversations = useMemo(() => {
        return [...conversations].sort((a, b) => {
            const at = a.updated_at || a.created_at || "";
            const bt = b.updated_at || b.created_at || "";
            return bt.localeCompare(at);
        });
    }, [conversations]);

    return (
        <aside className={"Sidebar" + (isCollapsed ? " is-collapsed" : "")}>
            <div className="Sidebar-top">
                {!isCollapsed && (
                    <button className="Sidebar-new" onClick={onNewChat} type="button">
                        <Plus size={16} strokeWidth={2.4} />
                        <span>New Chat</span>
                    </button>
                )}

                <button
                    className="Sidebar-collapse-btn"
                    onClick={onToggleCollapse}
                    type="button"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <PanelLeft size={16} strokeWidth={2.2} />
                </button>
            </div>

            <div className="Sidebar-list-wrap" aria-hidden={isCollapsed}>
                <div className="Sidebar-list">
                    {sortedConversations.length === 0 && (
                        <div className="Sidebar-empty">
                            <p>No conversations yet</p>
                            <span>Start by clicking New Chat</span>
                        </div>
                    )}

                    {sortedConversations.map((c, idx) => {
                        const isActive = c.id === activeConversationId;
                        return (
                            <div
                                key={c.id}
                                className={"Sidebar-item" + (isActive ? " is-active" : "")}
                                style={{ animationDelay: `${Math.min(idx, 20) * 0.04}s` }}
                                onClick={() => c.id != null && onSelect(c.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if ((e.key === "Enter" || e.key === " ") && c.id != null) {
                                        e.preventDefault();
                                        onSelect(c.id);
                                    }
                                }}
                            >
                                <div className="Sidebar-item-text">
                                    <span className="Sidebar-item-title">
                                        {c.title || "Untitled chat"}
                                    </span>
                                    <span className="Sidebar-item-meta">
                                        {timeAgo(c.updated_at || c.created_at)}
                                        {c.model ? ` • ${c.model}` : ""}
                                    </span>
                                </div>

                                <div className="Sidebar-item-actions">
                                    <button
                                        type="button"
                                        className="Sidebar-icon-btn"
                                        title="Archive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (c.id != null) onArchive(c.id);
                                        }}
                                    >
                                        <Archive size={14} strokeWidth={2} />
                                    </button>
                                    <button
                                        type="button"
                                        className="Sidebar-icon-btn Sidebar-icon-btn--danger"
                                        title="Delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (c.id == null) return;
                                            const confirmDelete = window.confirm("Are you sure you want to delete this conversation?");
                                            if (confirmDelete) onDelete(c.id);
                                        }}
                                    >
                                        <Trash2 size={14} strokeWidth={2} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="Sidebar-fade" aria-hidden="true" />
            </div>
        </aside>
    );
}
