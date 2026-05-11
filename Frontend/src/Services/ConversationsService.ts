import axios from "axios";
import { Conversation } from "../Models/Conversation";
import { appConfig } from "../Utils/AppConfig";

class ConversationsService {
	public async getAllConversations(): Promise<Conversation[]> {
		const response = await axios.get<Conversation[]>(appConfig.conversationsUrl);
		return response.data.map(conversation => new Conversation(conversation));
	}

	public async createConversation(persona_id: number, model: string): Promise<Conversation> {
		const response = await axios.post<Conversation>(appConfig.conversationsUrl, { persona_id, model });
		return new Conversation(response.data);
	}

	public async archiveConversation(id: number): Promise<Conversation> {
		const response = await axios.patch<Conversation>(`${appConfig.conversationsUrl}/${id}/archive`);
		return new Conversation(response.data);
	}

	public async deleteConversation(id: number): Promise<void> {
		await axios.delete(`${appConfig.conversationsUrl}/${id}`);
	}
}

export const conversationsService = new ConversationsService();
