class AppConfig {
    public readonly serverUrl = "http://localhost:4000";
    public readonly personasUrl = `${this.serverUrl}/api/personas`;
    public readonly conversationsUrl = `${this.serverUrl}/api/conversations`;
    public readonly gptUrl = `${this.serverUrl}/api/gpt`;
    public readonly gptGenerateImageUrl = `${this.gptUrl}/generate-image`;
}

export const appConfig = new AppConfig(); // Singleton
