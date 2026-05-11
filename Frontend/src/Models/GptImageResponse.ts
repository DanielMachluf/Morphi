export class GptImageResponse {
    url?: string
    revised_prompt?: string

    public constructor(init?: Partial<GptImageResponse>) {
        Object.assign(this, init)
    }
}