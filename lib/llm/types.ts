export interface LLMRequest {
  system: string;
  user: string;
  /** 要求模型輸出符合此 JSON Schema 的 JSON */
  jsonSchema?: Record<string, unknown>;
}

export interface LLMProvider {
  /** 例如 "deepseek:deepseek-chat" */
  name: string;
  complete(req: LLMRequest): Promise<string>;
}
