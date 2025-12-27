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
  map?: string;
  room_id?: string;
  room_password?: string;
  per_kill_prize?: number;
  win_prize?: number;
  description?: string;
}

const tournamentTypes = [
  { value: "solo", label: "Solo", icon: "👤", defaultPlayers: 48, maxLimit: 50, minLimit: 12, description: "48 players battle royale" },
  { value: "duo", label: "Duo", icon: "👥", defaultPlayers: 24, maxLimit: 25, minLimit: 6, description: "24 teams (48 players)" },
  { value: "squad", label: "Squad", icon: "🎮", defaultPlayers: 12, maxLimit: 13, minLimit: 4, description: "12 squads (48 players)" },
  { value: "clash_squad", label: "Clash Squad", icon: "⚔️", defaultPlayers: 8, maxLimit: 12, minLimit: 4, description: "4v4 tactical mode" },
  { value: "br_ranked", label: "BR Ranked", icon: "🏆", defaultPlayers: 48, maxLimit: 50, minLimit: 12, description: "Ranked battle royale" },
  { value: "lone_wolf", label: "Lone Wolf", icon: "🐺", defaultPlayers: 2, maxLimit: 2, minLimit: 2, description: "1v1 duel mode" },
];

const getModeConfig = (mode: string) => {
  return tournamentTypes.find(t => t.value === mode) || tournamentTypes[0];
};

const mapOptions = [
  { value: "bermuda", label: "Bermuda" },
  { value: "purgatory", label: "Purgatory" },
  { value: "kalahari", label: "Kalahari" },
  { value: "alpine", label: "Alpine" },
  { value: "nextera", label: "Nextera" },
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
    map: "bermuda",
    room_id: "",
    room_password: "",
    per_kill_prize: 0,
    win_prize: 0,
    description: "",
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
        map: tournament.map || "bermuda",
        room_id: tournament.room_id || "",
        room_password: tournament.room_password || "",
        per_kill_prize: tournament.per_kill_prize || 0,
        win_prize: tournament.win_prize || 0,
        description: tournament.description || "",
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
        map: "bermuda",
        room_id: "",
        room_password: "",
        per_kill_prize: 0,
        win_prize: 0,
        description: "",
      });
    }
  }, [tournament, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
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
              <Label htmlFor="type">Game Mode</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  const config = getModeConfig(value);
                  setFormData({ 
                    ...formData, 
                    type: value,
                    max_players: config.defaultPlayers
                  });
                }}
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {tournamentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {getModeConfig(formData.type).description}
              </p>
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
              <Label htmlFor="max_players">
                Max Players/Teams
                <span className="text-xs text-muted-foreground ml-2">
                  ({getModeConfig(formData.type).minLimit}-{getModeConfig(formData.type).maxLimit})
                </span>
              </Label>
              <Input
                id="max_players"
                type="number"
                min={getModeConfig(formData.type).minLimit}
                max={getModeConfig(formData.type).maxLimit}
                value={formData.max_players}
                onChange={(e) => {
                  const config = getModeConfig(formData.type);
                  const value = Math.min(Math.max(Number(e.target.value), config.minLimit), config.maxLimit);
                  setFormData({ ...formData, max_players: value });
                }}
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

          {/* Map Selection */}
          <div className="space-y-2">
            <Label htmlFor="map">Map</Label>
            <Select
              value={formData.map}
              onValueChange={(value) =>
                setFormData({ ...formData, map: value })
              }
            >
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select map" />
              </SelectTrigger>
              <SelectContent>
                {mapOptions.map((map) => (
                  <SelectItem key={map.value} value={map.value}>
                    {map.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prize Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="per_kill_prize">Per Kill Prize (₹)</Label>
              <Input
                id="per_kill_prize"
                type="number"
                min="0"
                value={formData.per_kill_prize}
                onChange={(e) =>
                  setFormData({ ...formData, per_kill_prize: Number(e.target.value) })
                }
                className="bg-muted border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="win_prize">Winner Prize (₹)</Label>
              <Input
                id="win_prize"
                type="number"
                min="0"
                value={formData.win_prize}
                onChange={(e) =>
                  setFormData({ ...formData, win_prize: Number(e.target.value) })
                }
                className="bg-muted border-border"
              />
            </div>
          </div>

          {/* Room Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_id">Room ID</Label>
              <Input
                id="room_id"
                value={formData.room_id}
                onChange={(e) =>
                  setFormData({ ...formData, room_id: e.target.value })
                }
                placeholder="Enter room ID"
                className="bg-muted border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_password">Room Password</Label>
              <Input
                id="room_password"
                value={formData.room_password}
                onChange={(e) =>
                  setFormData({ ...formData, room_password: e.target.value })
                }
                placeholder="Enter password"
                className="bg-muted border-border"
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

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tournament description..."
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
