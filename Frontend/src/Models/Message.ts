export class Message {
    id?:              number
    conversation_id?: number
    role?:            'user' | 'assistant' | 'system'
    content?:         string
    message_type?:    'text' | 'voice' | 'pdf' | 'image'
    file_url?:        string | null
    token_count?:     number | null
    created_at?:      string

    public constructor(init?: Partial<Message>) {
        Object.assign(this, init)
    }
}