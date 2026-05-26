import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Persona } from "../../../Models/Persona";
import { ModelSelector } from "../ModelSelector/ModelSelector";
import { PersonaSelector } from "../PersonaSelector/PersonaSelector";
import "./NewChatModal.css";

interface NewChatModalProps {
    open: boolean;
    personas: Persona[];
    isCreating: boolean;
    onClose: () => void;
    onConfirm: (personaId: number, model: string) => void;
    onPersonaCreated: (persona: Persona) => void;
}

const DEFAULT_MODEL = "gpt-4o";

export function NewChatModal(props: NewChatModalProps) {
    const { open, personas, isCreating, onClose, onConfirm, onPersonaCreated } = props;

    const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
    const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);

    
    useEffect(() => {
        if (!open) return;
        if (personas.length === 0) {
            setSelectedPersona(null);
            return;
        }
        if (selectedPersona && personas.some((p) => p.id === selectedPersona.id)) return;
        const firstDefault = personas.find((p) => p.is_default) || personas[0];
        setSelectedPersona(firstDefault);
    }, [open, personas, selectedPersona]);

    
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const canConfirm = selectedPersona?.id != null && !isCreating;

    return (
        <div className="NewChatModal-overlay" onClick={onClose} role="presentation">
            <div
                className="NewChatModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="newchat-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="NewChatModal-header">
                    <div>
                        <h2 id="newchat-title" className="NewChatModal-title">
                            Start a new chat
                        </h2>
                        <p className="NewChatModal-sub">
                            Pick a persona and model to begin.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="NewChatModal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={16} strokeWidth={2.2} />
                    </button>
                </div>

                <div className="NewChatModal-body">
                    <section className="NewChatModal-section">
                        <h3 className="NewChatModal-section-title">Persona</h3>
                        <PersonaSelector
                            personas={personas}
                            selectedPersona={selectedPersona}
                            onSelect={setSelectedPersona}
                            onPersonaCreated={onPersonaCreated}
                        />
                    </section>

                    <section className="NewChatModal-section">
                        <h3 className="NewChatModal-section-title">Model</h3>
                        <ModelSelector
                            selectedModel={selectedModel}
                            onSelect={setSelectedModel}
                        />
                    </section>
                </div>

                <div className="NewChatModal-footer">
                    <button
                        type="button"
                        className="NewChatModal-cancel"
                        onClick={onClose}
                        disabled={isCreating}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="NewChatModal-confirm"
                        onClick={() => {
                            if (selectedPersona?.id == null) return;
                            onConfirm(selectedPersona.id, selectedModel);
                        }}
                        disabled={!canConfirm}
                    >
                        {isCreating ? "Creating…" : "Start Chat"}
                    </button>
                </div>
            </div>
        </div>
    );
}
