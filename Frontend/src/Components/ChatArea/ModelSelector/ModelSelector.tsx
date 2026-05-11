import "./ModelSelector.css";

interface ModelSelectorProps {
    selectedModel: string;
    onSelect: (model: string) => void;
}

interface ModelOption {
    id: string;
    name: string;
    description: string;
    badge?: string;
}

const MODELS: ModelOption[] = [
    { id: "gpt-4o", name: "GPT-4o", description: "Most capable", badge: "Recommended" },
    { id: "gpt-4o-mini", name: "GPT-4o mini", description: "Fast + cheap" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Legacy" }
];

export function ModelSelector({ selectedModel, onSelect }: ModelSelectorProps) {
    return (
        <div className="ModelSelector">
            {MODELS.map((m, idx) => {
                const isSelected = m.id === selectedModel;
                return (
                    <button
                        key={m.id}
                        type="button"
                        className={"ModelSelector-card" + (isSelected ? " is-selected" : "")}
                        onClick={() => onSelect(m.id)}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                        <div className="ModelSelector-card-head">
                            <span className="ModelSelector-card-name">{m.name}</span>
                            {m.badge && (
                                <span className="ModelSelector-card-badge">{m.badge}</span>
                            )}
                        </div>
                        <span className="ModelSelector-card-desc">{m.description}</span>
                        <span className="ModelSelector-card-id">{m.id}</span>
                    </button>
                );
            })}
        </div>
    );
}
