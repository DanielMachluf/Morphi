import axios from "axios";
import { Message } from "../Models/Message";
import { appConfig } from "../Utils/AppConfig";

type FileType = "voice" | "pdf" | "image";

class MessagesService {
	public async getMessagesByConversation(id: number): Promise<Message[]> {
		const response = await axios.get<Message[]>(`${appConfig.conversationsUrl}/${id}/messages`);
		return response.data.map(message => new Message(message));
	}

	public async sendMessage(conversation_id: number, content: string): Promise<{ response: string }> {
		const response = await axios.post<{ response: string }>(
			`${appConfig.conversationsUrl}/${conversation_id}/messages`,
			{ content }
		);

		return response.data;
	}

	public async *sendMessageStream(conversation_id: number, content: string): AsyncGenerator<string> {
		const response = await axios.post<ReadableStream<Uint8Array>>(
			`${appConfig.conversationsUrl}/${conversation_id}/messages/stream`,
			{ content },
			{
				adapter: "fetch",
				responseType: "stream",
				headers: {
					"Content-Type": "application/json"
				}
			}
		);

		const reader = response.data.getReader();
		const decoder = new TextDecoder();
		let buffer = "";

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const events = buffer.split("\n\n");
			buffer = events.pop() || "";

			for (const event of events) {
				const line = event.split("\n").find((item) => item.startsWith("data: "));
				if (!line) continue;
				const data = line.slice(6);
				if (data === "[DONE]") return;
				yield JSON.parse(data) as string;
			}
		}
	}

	public async sendFileMessage(conversation_id: number, file: File, file_type: FileType, userText: string): Promise<{ response: string }> {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("file_type", file_type);
		formData.append("user_text", userText);

		const response = await axios.post<{ response: string }>(
			`${appConfig.conversationsUrl}/${conversation_id}/messages/file`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data"
				}
			}
		);

		return response.data;
	}
}

export const messagesService = new MessagesService();
