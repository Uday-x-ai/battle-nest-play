import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Tournament } from "@/hooks/useTournaments";

interface TournamentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament?: Tournament | null;
  onSubmit: (data: TournamentFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface TournamentFormData {
  title: string;
  type: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  start_time: string;
  status: string;
  image_url?: string;
}

const tournamentTypes = [
  { value: "solo", label: "Solo" },
  { value: "duo", label: "Duo" },
  { value: "squad", label: "Squad" },
];

const tournamentStatuses = [
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function TournamentForm({
  open,
  onOpenChange,
  tournament,
  onSubmit,
  isLoading = false,
}: TournamentFormProps) {
  const [formData, setFormData] = useState<TournamentFormData>({
    title: "",
    type: "solo",
    entry_fee: 0,
    prize_pool: 0,
    max_players: 100,
    start_time: "",
    status: "upcoming",
    image_url: "",
  });

  const isEditing = !!tournament;

  useEffect(() => {
    if (tournament) {
      setFormData({
        title: tournament.title,
        type: tournament.type,
        entry_fee: tournament.entry_fee || 0,
        prize_pool: tournament.prize_pool || 0,
        max_players: tournament.max_players,
        start_time: new Date(tournament.start_time).toISOString().slice(0, 16),
        status: tournament.status || "upcoming",
        image_url: tournament.image_url || "",
      });
    } else {
      setFormData({
        title: "",
        type: "solo",
        entry_fee: 0,
        prize_pool: 0,
        max_players: 100,
        start_time: "",
        status: "upcoming",
        image_url: "",
      });
    }
  }, [tournament, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Tournament" : "Create Tournament"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the tournament details below."
              : "Fill in the details to create a new tournament."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tournament Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter tournament name"
              className="bg-muted border-border"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {tournamentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {tournamentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_fee">Entry Fee (₹)</Label>
              <Input
                id="entry_fee"
                type="number"
                min="0"
                value={formData.entry_fee}
                onChange={(e) =>
                  setFormData({ ...formData, entry_fee: Number(e.target.value) })
                }
                className="bg-muted border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prize_pool">Prize Pool (₹)</Label>
              <Input
                id="prize_pool"
                type="number"
                min="0"
                value={formData.prize_pool}
                onChange={(e) =>
                  setFormData({ ...formData, prize_pool: Number(e.target.value) })
                }
                className="bg-muted border-border"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_players">Max Players</Label>
              <Input
                id="max_players"
                type="number"
                min="2"
                value={formData.max_players}
                onChange={(e) =>
                  setFormData({ ...formData, max_players: Number(e.target.value) })
                }
                className="bg-muted border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className="bg-muted border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (Optional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) =>
                setFormData({ ...formData, image_url: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="bg-muted border-border"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="fire" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Tournament"
              ) : (
                "Create Tournament"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
