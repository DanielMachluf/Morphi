import axios from "axios";
import { Persona } from "../Models/Persona";
import { appConfig } from "../Utils/AppConfig";

class PersonaService {
	public async getAllPersonas(): Promise<Persona[]> {
		const response = await axios.get<Persona[]>(appConfig.personasUrl);
		return response.data.map(persona => new Persona(persona));
	}

	public async createPersona(name: string, system_prompt: string): Promise<Persona> {
		const response = await axios.post<Persona>(appConfig.personasUrl, { name, system_prompt });
		return new Persona(response.data);
	}

	public async deletePersona(id: number): Promise<void> {
		await axios.delete(`${appConfig.personasUrl}/${id}`);
	}
}

export const personaService = new PersonaService();
