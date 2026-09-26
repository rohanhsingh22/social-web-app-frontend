import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  REPORT_REASONS,
  reportReasonLabel,
  useCreateReportMutation,
  type ReportReason,
} from "@/rtk/safety/safety-api";

export type ReportTarget =
  | { targetUserId: string }
  | { targetChannelMessageId: string }
  | { targetDirectMessageId: string };

// Shared report dialog: reason + optional details, success confirmation.
// Exactly one target id must be set (backend enforces REPORT_TARGET_REQUIRED).
export function ReportDialog({
  target,
  title,
  onClose,
}: {
  target: ReportTarget | null;
  title: string;
  onClose: () => void;
}) {
  const [createReport, createState] = useCreateReportMutation();
  const [reason, setReason] = useState<ReportReason>("spam");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (target) {
      setReason("spam");
      setDetails("");
      setDone(false);
      setFailed(false);
    }
  }, [target]);

  async function handleSubmit() {
    if (!target || createState.isLoading) {
      return;
    }
    setFailed(false);
    try {
      await createReport({
        ...target,
        reason,
        details: details.trim() ? details.trim() : undefined,
      }).unwrap();
      setDone(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogTitle>{done ? "Report sent" : title}</DialogTitle>
        <DialogDescription>
          {done
            ? "Thanks — moderators will review this."
            : "Tell us what's wrong. Reports are reviewed by moderators."}
        </DialogDescription>

        {done ? (
          <Button type="button" className="w-full" onClick={onClose}>
            Done
          </Button>
        ) : (
          <div className="grid gap-3">
            <Label className="grid gap-2">
              <span>Reason</span>
              <Select
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as ReportReason)
                }
              >
                {REPORT_REASONS.map((option) => (
                  <option key={option} value={option}>
                    {reportReasonLabel(option)}
                  </option>
                ))}
              </Select>
            </Label>

            <Label className="grid gap-2">
              <span>Details (optional)</span>
              <Textarea
                value={details}
                maxLength={1000}
                rows={3}
                placeholder="Anything moderators should know"
                onChange={(event) => setDetails(event.target.value)}
              />
            </Label>

            {failed ? (
              <p className="rounded-md border border-danger bg-danger-soft p-3 text-sm text-danger-ink">
                Could not send the report. Please try again.
              </p>
            ) : null}

            <Button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={createState.isLoading}
            >
              {createState.isLoading ? "Sending..." : "Send report"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
