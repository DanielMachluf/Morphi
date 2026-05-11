export class Conversation {
    id?:         number
    persona_id?: number
    title?:      string
    model?:      string
    status?:     string
    created_at?: string
    updated_at?: string

    public constructor(init?: Partial<Conversation>) {
        Object.assign(this, init)
    }
}