import { useState, useEffect } from 'react';
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
  convoyToEdit?: Convoy | null;
}

export const CreateConvoyDialog = ({ open, onOpenChange, onConvoyCreated, convoyToEdit }: CreateConvoyDialogProps) => {
  const { toast } = useToast();
  const { isAuthorized, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '', 
    name: '',
    origin: '',
    destination: '',
    status: 'pending' as 'pending' | 'active' | 'completed' | 'delayed',
    priority: 'medium' as Priority,
    departureTime: '',
    vehicleCount: '',
    personnelCount: '',
    commander: '',
    unit: '',
    cargo: '',
    cargoWeight: '',
    notes: '',
  });

  const [checkpoints, setCheckpoints] = useState<{ name: string; location: string }[]>([]);

  // Effect to population form when convoyToEdit changes
  useEffect(() => {
    if (convoyToEdit) {
        setFormData({
            id: convoyToEdit.id,
            name: convoyToEdit.name,
            origin: convoyToEdit.origin,
            destination: convoyToEdit.destination,
            status: convoyToEdit.status,
            priority: convoyToEdit.priority,
            departureTime: convoyToEdit.departureTime,
            vehicleCount: convoyToEdit.vehicleCount.toString(),
            personnelCount: convoyToEdit.personnelCount.toString(),
            commander: convoyToEdit.commander,
            unit: convoyToEdit.unit,
            cargo: convoyToEdit.cargo || '',
            cargoWeight: (convoyToEdit.cargoWeight || 0).toString(),
            notes: convoyToEdit.notes || '',
        });
        setCheckpoints(convoyToEdit.checkpoints.map(cp => ({
            name: cp.name,
            location: 'location' in cp ? (cp as any).location : ''
        })));
    } else {
        // Reset if null (Create mode)
        setFormData({
            id: '',
            name: '',
            origin: '',
            destination: '',
            status: 'pending',
            priority: 'medium',
            departureTime: '',
            vehicleCount: '',
            personnelCount: '',
            commander: '',
            unit: '',
            cargo: '',
            cargoWeight: '',
            notes: '',
        });
        setCheckpoints([]);
    }
  }, [convoyToEdit, open]); // Re-run when opening or changing target

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

    setLoading(true);

    try {
      // Import service dynamically
      const { convoyService } = await import('@/services/convoyService');

      const payload = {
        name: formData.name,
        origin: formData.origin,
        destination: formData.destination,
        priority: formData.priority,
        start_time: formData.departureTime,
        status: formData.status,
        
        // Mapped fields
        vehicle_count: parseInt(formData.vehicleCount) || 0,
        personnel_count: parseInt(formData.personnelCount) || 0,
        commander: formData.commander,
        unit: formData.unit,
        cargo: formData.cargo,
        cargo_load: parseFloat(formData.cargoWeight) || 0,
        notes: formData.notes,
        checkpoints: checkpoints.map((cp, index) => ({
             id: `cp-${Date.now()}-${index}`,
             name: cp.name,
             location: cp.location,
             coordinates: { lat: 0, lng: 0 },
             estimatedTime: new Date(new Date(formData.departureTime).getTime() + (index + 1) * 3600000).toISOString(),
             status: 'pending'
        })),
      };

      let resultConvoy;

      if (convoyToEdit) {
          // Check if ID is being changed
          if (formData.id && formData.id !== convoyToEdit.id) {
               // ID Change Handling: Create new -> Delete old
               const createPayload = { ...payload, id: formData.id };
               const createdData = await convoyService.createConvoy(createPayload);
               
               // Delete old record
               await convoyService.deleteConvoy(convoyToEdit.id);
               
               resultConvoy = { ...createdData, departureTime: createdData.start_time, status: payload.status, checkpoints: []};
               toast({ title: 'Convoy ID Updated', description: `Renamed from ${convoyToEdit.id} to ${formData.id}.` });
          } else {
               // Standard Update (Same ID)
               await convoyService.updateConvoy(convoyToEdit.id, payload);
               resultConvoy = { ...convoyToEdit, ...formData, ...payload, departureTime: payload.start_time };
               toast({ title: 'Convoy Updated', description: `${formData.name} updated successfully.` });
          }
      } else {
          // Create Mode
          const createPayload = { ...payload, id: formData.id || undefined };
          const createdData = await convoyService.createConvoy(createPayload);
           // Simple mapping for immediate UI feedback (simulated)
           resultConvoy = { 
               ...createdData, 
               departureTime: createdData.start_time,
               status: 'pending',
               checkpoints: [] 
            };
           toast({ title: 'Convoy Created', description: `${formData.name} created successfully.` });
      }

      onConvoyCreated(resultConvoy as Convoy); // Triggers refresh
      onOpenChange(false);
      
      // Form reset handled by effect

    } catch (error) {
      console.error("Failed to save convoy:", error);
      toast({
        title: 'Error',
        description: 'Failed to save convoy. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
          <DialogTitle className="text-xl">{convoyToEdit ? 'Edit Convoy' : 'Create New Convoy'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="id">Convoy ID (Optional)</Label>
              <Input
                id="id"
                placeholder="Leave empty for auto-generation"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              />
            </div>
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
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v: 'pending' | 'active' | 'completed' | 'delayed') => setFormData({ ...formData, status: v })}
                disabled={!convoyToEdit} // Optional: Disable for new convoys if you want forcing pending, but user asked to move to active so let's allow it
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active (In Transit)</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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

          <div>
            <Label htmlFor="cargoWeight">Cargo Load (Tons)</Label>
            <Input
              id="cargoWeight"
              type="number"
              placeholder="0.0"
              value={formData.cargoWeight}
              onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })}
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
              {loading ? (convoyToEdit ? 'Updating...' : 'Creating...') : (convoyToEdit ? 'Update Convoy' : 'Create Convoy')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
