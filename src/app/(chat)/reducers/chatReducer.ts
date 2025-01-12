import { ChatAction } from "../types/ChatActionType";
import { ChatMessage } from "../types/ChatMessageType";

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
