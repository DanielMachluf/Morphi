// Allowed file types for the chat input picker.
export type FileType = "voice" | "pdf" | "image";

// File extensions accepted by the file input element.
export const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png,.webp,.mp3,.wav,.m4a";

// Detect the logical file type based on the file extension.
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

// Check whether a string of text is a direct URL pointing to an image asset.
export function isImageUrl(text: string): boolean {
    return /^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg)(\?\S*)?$/i.test(text.trim());
}

// Pull the first http(s) URL out of a free-form string, or null if none found.
export function extractFirstUrl(text: string): string | null {
    const match = text.match(/https?:\/\/\S+/);
    return match ? match[0] : null;
}
