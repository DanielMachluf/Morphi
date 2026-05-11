import axios from "axios";
import { GptImageResponse } from "../Models/GptImageResponse";
import { appConfig } from "../Utils/AppConfig";

class GPTService {
	public async generateImage(prompt: string): Promise<GptImageResponse> {
		const response = await axios.post<GptImageResponse>(appConfig.gptGenerateImageUrl, { prompt });
		return new GptImageResponse(response.data);
	}
}

export const gptService = new GPTService();
export const gPTService = gptService;
