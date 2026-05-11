export class Persona {
    id?:            number
    name?:          string
    system_prompt?: string
    is_default?:    boolean

    public constructor(init?: Partial<Persona>) {
        Object.assign(this, init)
    }
}