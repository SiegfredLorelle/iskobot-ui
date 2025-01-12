export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export type ChatAction = 
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'DELETE_LAST' }
  | { type: 'DELETE_ALL' };

export function chatReducer(state: ChatMessage[], action: ChatAction): ChatMessage[] {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [...state, action.payload];
    case 'DELETE_LAST':
      return state.slice(0, -1);
    case 'DELETE_ALL':
      return [];
    default:
      return state;
  }
}