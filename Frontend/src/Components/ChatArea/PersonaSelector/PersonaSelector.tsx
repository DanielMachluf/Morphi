import { Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Persona } from "../../../Models/Persona";
import { personaService } from "../../../Services/PersonaService";
import { notify } from "../../../Utils/Notify";
import "./PersonaSelector.css";

interface PersonaSelectorProps {
    personas: Persona[];
    selectedPersona: Persona | null;
    onSelect: (persona: Persona) => void;
    onPersonaCreated: (persona: Persona) => void;
}

export function PersonaSelector(props: PersonaSelectorProps) {
    const { personas, selectedPersona, onSelect, onPersonaCreated } = props;

    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const { defaults, mine } = useMemo(() => {
        const d: Persona[] = [];
        const m: Persona[] = [];
        for (const p of personas) {
            if (p.is_default) d.push(p);
            else m.push(p);
        }
        return { defaults: d, mine: m };
    }, [personas]);

    const handleSave = async () => {
        const trimmedName = name.trim();
        const trimmedPrompt = systemPrompt.trim();
        if (!trimmedName || !trimmedPrompt) {
            notify.error("Name and prompt are required.");
            return;
        }
        try {
            setIsSaving(true);
            const created = await personaService.createPersona(trimmedName, trimmedPrompt);
            onPersonaCreated(created);
            onSelect(created);
            setIsCreating(false);
            setName("");
            setSystemPrompt("");
            notify.success("Persona created");
        } catch (err) {
            notify.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const renderItem = (p: Persona, idx: number) => {
        const isSelected = selectedPersona?.id === p.id;
        return (
            <button
                key={p.id ?? `p-${idx}`}
                type="button"
                className={"PersonaSelector-item" + (isSelected ? " is-selected" : "")}
                style={{ animationDelay: `${idx * 0.04}s` }}
                onClick={() => onSelect(p)}
            >
                <div className="PersonaSelector-item-dot" aria-hidden="true" />
                <div className="PersonaSelector-item-text">
                    <span className="PersonaSelector-item-name">{p.name}</span>
                    {p.system_prompt && (
                        <span className="PersonaSelector-item-prompt">
                            {p.system_prompt.length > 90
                                ? p.system_prompt.slice(0, 90) + "…"
                                : p.system_prompt}
                        </span>
                    )}
                </div>
                {isSelected && (
                    <span className="PersonaSelector-item-check" aria-hidden="true">
                        <Check size={14} strokeWidth={3} />
                    </span>
                )}
            </button>
        );
    };

    return (
        <div className="PersonaSelector">
            <div className="PersonaSelector-section-label">Default Presets</div>
            <div className="PersonaSelector-list">
                {defaults.length === 0 && (
                    <div className="PersonaSelector-empty">No defaults available</div>
                )}
                {defaults.map((p, i) => renderItem(p, i))}
            </div>

            <div className="PersonaSelector-section-label">My Personas</div>
            <div className="PersonaSelector-list">
                {mine.length === 0 && (
                    <div className="PersonaSelector-empty">No custom personas yet</div>
                )}
                {mine.map((p, i) => renderItem(p, defaults.length + i))}
            </div>

            {!isCreating && (
                <button
                    type="button"
                    className="PersonaSelector-create"
                    onClick={() => setIsCreating(true)}
                >
                    <Plus size={14} strokeWidth={2.2} />
                    Create New Persona
                </button>
            )}

            {isCreating && (
                <div className="PersonaSelector-form">
                    <label className="PersonaSelector-label">
                        Name
                        <input
                            type="text"
                            className="PersonaSelector-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Code Reviewer"
                            maxLength={60}
                            autoFocus
                        />
                    </label>
                    <label className="PersonaSelector-label">
                        System Prompt
                        <textarea
                            className="PersonaSelector-textarea"
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="You are a senior engineer who…"
                            rows={4}
                        />
                    </label>
                    <div className="PersonaSelector-form-actions">
                        <button
                            type="button"
                            className="PersonaSelector-cancel"
                            onClick={() => {
                                setIsCreating(false);
                                setName("");
                                setSystemPrompt("");
                            }}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="PersonaSelector-save"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving…" : "Save Persona"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
