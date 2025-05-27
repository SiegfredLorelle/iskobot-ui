// components/SessionHistory.tsx
import { useChat } from "@/app/(chat)/contexts/ChatContext";

export const SessionHistory = () => {
  const { sessions, loadingSessions, switchSession, currentSession } =
    useChat();

  if (loadingSessions) return <div>Loading history...</div>;

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => {}}
          className="p-4 rounded-lg bg-[var(--primary-clr)]"
        >
          <div className="font-medium">{session.title}</div>
          <div className="text-sm text-[var(--text-clr)]/60">
            {new Date(session.updated_at).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </div>
          {session.last_message && session.last_message.trim() !== "" && (
            <div className="text-sm text-[var(--text-clr)]/60 truncate">
              Last message: {session.last_message}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
