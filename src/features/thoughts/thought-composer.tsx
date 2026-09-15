import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateThoughtMutation } from "@/features/thoughts/api";

const MAX_LENGTH = 1000;

export function ThoughtComposer({ onPosted }: { onPosted?: () => void }) {
  const [body, setBody] = useState("");
  const [createThought, state] = useCreateThoughtMutation();

  const trimmed = body.trim();
  const valid = trimmed.length > 0 && trimmed.length <= MAX_LENGTH;

  async function submit() {
    if (!valid || state.isLoading) {
      return;
    }

    await createThought({ body: trimmed }).unwrap();
    setBody("");
    onPosted?.();
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={MAX_LENGTH}
        rows={3}
        placeholder="Share a thought..."
        aria-label="New thought"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-ink-subtle">
          {trimmed.length}/{MAX_LENGTH}
        </span>
        <Button
          type="button"
          size="sm"
          disabled={!valid || state.isLoading}
          onClick={() => void submit()}
        >
          {state.isLoading ? "Posting..." : "Post"}
        </Button>
      </div>
      {state.isError ? (
        <p className="mt-2 text-xs text-danger-ink">
          Could not post your thought. Please try again.
        </p>
      ) : null}
    </div>
  );
}
