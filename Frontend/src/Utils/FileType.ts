
export type FileType = "voice" | "pdf" | "image";


export const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a";


export function detectFileType(file: File): FileType | null {
    const name = file.name.toLowerCase();
    if (name.endsWith(".pdf")) return "pdf";
    if (
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".webp")
    ) {
        return "image";
    }
    if (name.endsWith(".mp3") || name.endsWith(".wav") || name.endsWith(".m4a")) {
        return "voice";
    }
    return null;
}


export function isImageUrl(text: string): boolean {
    return /^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg)(\?\S*)?$/i.test(text.trim());
}


export function extractFirstUrl(text: string): string | null {
    const match = text.match(/https?:\/\/\S+/);
    return match ? match[0] : null;
}
