import { listInboxMessages, type InboxChannel } from "../../src/db/repository.inbox";
import { replyToMessage } from "./inbox-actions";

export async function InboxList({ channel, returnPath }: { channel: InboxChannel; returnPath: string }) {
  const messages = await listInboxMessages(channel);
  const open = messages.filter((m) => m.status === "OPEN");
  const resolved = messages.filter((m) => m.status === "RESOLVED");

  return <>
    {messages.length === 0 && <p>No messages yet.</p>}
    {[...open, ...resolved].map((m) => <article className="admin-inbox-item" key={m.id}>
      <header>
        <div><strong>{m.subject || "(no subject)"}</strong><br /><small>{m.name} &lt;{m.email}&gt; · {new Date(m.createdAt).toLocaleString()}</small></div>
        <span className={`status-badge ${m.status === "OPEN" ? "warn" : "ok"}`}>{m.status}</span>
      </header>
      <p>{m.message}</p>
      {m.status === "RESOLVED" ? (
        <div className="admin-inbox-reply"><strong>Reply sent {m.repliedAt ? new Date(m.repliedAt).toLocaleString() : ""}</strong><p>{m.replyBody}</p></div>
      ) : (
        <form action={replyToMessage} className="admin-form">
          <input type="hidden" name="id" value={m.id} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <label>Reply<textarea name="replyBody" required minLength={5} placeholder="Your reply, sent by email…" /></label>
          <button type="submit" className="admin-submit">Send reply</button>
        </form>
      )}
    </article>)}
  </>;
}
