"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function LogExperimentDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("experiments").insert({
      name,
      description: description || null,
    });

    setLoading(false);

    if (insertError) {
      setError("Could not save the experiment. Please try again.");
      return;
    }

    setName("");
    setDescription("");
    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Log Experiment
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsOpen(false)} />
          <DialogHeader>
            <DialogTitle>Log a new experiment</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-sm text-zinc-400">
            Record when you changed something (e.g. reordered booking steps) so the
            dashboard can split sessions into before/after this timestamp.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="experiment-name">Name *</Label>
              <Input
                id="experiment-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Catalog-first booking order"
                required
              />
            </div>
            <div>
              <Label htmlFor="experiment-description">What changed?</Label>
              <Textarea
                id="experiment-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Moved service selection ahead of contact info"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !name}>
                {loading ? "Saving..." : "Start tracking from now"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
