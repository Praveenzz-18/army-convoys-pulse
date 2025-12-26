import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Convoy, Priority } from '@/types/convoy';
import { Plus, X, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { getRouteRecommendation } from '@/services/aiService';

interface CreateConvoyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConvoyCreated: (convoy: Convoy) => void;
}

export const CreateConvoyDialog = ({ open, onOpenChange, onConvoyCreated }: CreateConvoyDialogProps) => {
  const { toast } = useToast();
  const { isAuthorized, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    destination: '',
    priority: 'medium' as Priority,
    departureTime: '',
    vehicleCount: '',
    personnelCount: '',
    commander: '',
    unit: '',
    cargo: '',
    notes: '',
  });

  const [checkpoints, setCheckpoints] = useState<{ name: string; location: string }[]>([]);

  const canCreate = isAuthenticated && isAuthorized(['admin', 'commander']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreate) {
      toast({
        title: 'Access Denied',
        description: 'Only authorized personnel (Admin/Commander) can create convoys.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name || !formData.origin || !formData.destination || !formData.departureTime) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newConvoy: Convoy = {
      id: `CNV-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      name: formData.name,
      origin: formData.origin,
      destination: formData.destination,
      status: 'pending',
      priority: formData.priority,
      departureTime: formData.departureTime,
      estimatedArrival: new Date(new Date(formData.departureTime).getTime() + 12 * 60 * 60 * 1000).toISOString(),
      vehicleCount: parseInt(formData.vehicleCount) || 0,
      personnelCount: parseInt(formData.personnelCount) || 0,
      commander: formData.commander,
      unit: formData.unit,
      cargo: formData.cargo,
      notes: formData.notes,
      progress: 0,
      checkpoints: checkpoints.map((cp, index) => ({
        id: `CP-${index + 1}`,
        name: cp.name,
        location: cp.location,
        coordinates: { lat: 0, lng: 0 },
        estimatedTime: '',
        status: 'pending' as const,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onConvoyCreated(newConvoy);
    setLoading(false);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      name: '',
      origin: '',
      destination: '',
      priority: 'medium',
      departureTime: '',
      vehicleCount: '',
      personnelCount: '',
      commander: '',
      unit: '',
      cargo: '',
      notes: '',
    });
    setCheckpoints([]);

    toast({
      title: 'Convoy Created',
      description: `${newConvoy.name} has been successfully created and scheduled.`,
    });
  };

  const addCheckpoint = () => {
    setCheckpoints([...checkpoints, { name: '', location: '' }]);
  };

  const removeCheckpoint = (index: number) => {
    setCheckpoints(checkpoints.filter((_, i) => i !== index));
  };

  const updateCheckpoint = (index: number, field: 'name' | 'location', value: string) => {
    const updated = [...checkpoints];
    updated[index][field] = value;
    setCheckpoints(updated);
  };

  const handleAiRecommendation = async () => {
    if (!formData.origin || !formData.destination) {
      toast({
        title: 'Missing Information',
        description: 'Please provide origin and destination for AI recommendation.',
        variant: 'destructive',
      });
      return;
    }

    setAiLoading(true);
    try {
      const recommendation = await getRouteRecommendation(formData.origin, formData.destination);
      setFormData({
        ...formData,
        notes: `${recommendation.recommendation}\n\nEstimated Distance: ${recommendation.distance}\nEstimated Time: ${recommendation.estimatedTime}\nSafety Score: ${recommendation.safetyScore}/100`,
        cargo: formData.cargo || `Distance: ${recommendation.distance}`,
      });
      
      // Update checkpoints if Gemini suggested something (mocked as hazards for now)
      if (recommendation.hazards.length > 0) {
        setCheckpoints(recommendation.hazards.map(h => ({ name: 'Caution: ' + h, location: '' })));
      }

      toast({
        title: 'AI Recommendation Ready',
        description: 'Optimized route and tactical advice have been generated.',
      });
    } catch (error) {
      toast({
        title: 'AI Error',
        description: 'Failed to get route recommendation. Please check your API key.',
        variant: 'destructive',
      });
    } finally {
      setAiLoading(false);
    }
  };

  if (!canCreate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Access Restricted</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              You must be logged in as an Admin or Commander to create new convoys.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Convoy</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Mission Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Operation Supply Line Alpha"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="origin">Origin *</Label>
              <Input
                id="origin"
                placeholder="Starting location"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="destination">Destination *</Label>
              <div className="flex gap-2">
                <Input
                  id="destination"
                  placeholder="End location"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={handleAiRecommendation}
                  disabled={aiLoading}
                  className="shrink-0 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary"
                  title="Get AI Route Recommendation"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="departureTime">Departure Time *</Label>
              <Input
                id="departureTime"
                type="datetime-local"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(v: Priority) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleCount">Number of Vehicles</Label>
              <Input
                id="vehicleCount"
                type="number"
                placeholder="0"
                value={formData.vehicleCount}
                onChange={(e) => setFormData({ ...formData, vehicleCount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="personnelCount">Personnel Count</Label>
              <Input
                id="personnelCount"
                type="number"
                placeholder="0"
                value={formData.personnelCount}
                onChange={(e) => setFormData({ ...formData, personnelCount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="commander">Commander</Label>
              <Input
                id="commander"
                placeholder="e.g., Col. John Smith"
                value={formData.commander}
                onChange={(e) => setFormData({ ...formData, commander: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="e.g., 14th Infantry Division"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
          </div>

          {/* Cargo */}
          <div>
            <Label htmlFor="cargo">Cargo Description</Label>
            <Input
              id="cargo"
              placeholder="e.g., Medical Supplies, Ammunition"
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
            />
          </div>

          {/* Checkpoints */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Route Checkpoints</Label>
              <Button type="button" variant="outline" size="sm" onClick={addCheckpoint}>
                <Plus className="w-4 h-4 mr-1" /> Add Checkpoint
              </Button>
            </div>
            {checkpoints.map((cp, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <Input
                  placeholder="Checkpoint name"
                  value={cp.name}
                  onChange={(e) => updateCheckpoint(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Location"
                  value={cp.location}
                  onChange={(e) => updateCheckpoint(index, 'location', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCheckpoint(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? 'Creating...' : 'Create Convoy'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
