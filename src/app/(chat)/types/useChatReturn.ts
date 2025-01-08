export interface useChatReturn {
  isLoading: boolean;
  error: string | null;
  getBotResponse: (message: string) => Promise<string>;
}
