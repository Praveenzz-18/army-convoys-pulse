import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Convoy } from '@/types/convoy';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Clock,
  Users,
  Truck,
  Package,
  User,
  Building,
  Calendar,
  CheckCircle,
  Circle,
  AlertTriangle,
  Timer,
  Navigation,
} from 'lucide-react';

interface ConvoyDetailDialogProps {
  convoy: Convoy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
  onEdit?: (convoy: Convoy) => void;
}

const statusConfig = {
  active: { label: 'Active', className: 'status-active', icon: <Circle className="w-3 h-3 fill-current" /> },
  pending: { label: 'Pending', className: 'status-pending', icon: <Timer className="w-3 h-3" /> },
  delayed: { label: 'Delayed', className: 'status-delayed', icon: <AlertTriangle className="w-3 h-3" /> },
  completed: { label: 'Completed', className: 'status-completed', icon: <CheckCircle className="w-3 h-3" /> },
};

const priorityConfig = {
  high: { label: 'High Priority', className: 'bg-destructive/20 text-destructive border-destructive/30' },
  medium: { label: 'Medium', className: 'bg-warning/20 text-warning border-warning/30' },
  low: { label: 'Low', className: 'bg-muted text-muted-foreground border-muted' },
};

export const ConvoyDetailDialog = ({ convoy, open, onOpenChange, onDelete, onEdit }: ConvoyDetailDialogProps) => {
  if (!convoy) return null;

  const status = statusConfig[convoy.status];
  const priority = priorityConfig[convoy.priority];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{convoy.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{convoy.id}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={cn('gap-1.5', status.className)}>
                {status.icon}
                {status.label}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', priority.className)}>
                {priority.label}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Route Overview */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              Route Information
            </h3>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{convoy.origin}</span>
              </div>
              <div className="flex-1 border-t-2 border-dashed border-primary/30" />
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-destructive" />
                <span className="font-medium">{convoy.destination}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{convoy.progress}% Complete</span>
              </div>
              <Progress value={convoy.progress} className="h-3" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <Truck className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{convoy.vehicleCount}</p>
              <p className="text-xs text-muted-foreground">Vehicles</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <Users className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{convoy.personnelCount}</p>
              <p className="text-xs text-muted-foreground">Personnel</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <Package className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-bold">{convoy.cargoWeight || 0}<span className="text-sm font-normal text-muted-foreground ml-1">tons</span></p>
              <p className="text-xs text-muted-foreground">Load</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <Calendar className="w-5 h-5 text-primary mb-2" />
              <p className="text-lg font-bold">
                {new Date(convoy.departureTime).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">Departure</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <Clock className="w-5 h-5 text-primary mb-2" />
              <p className="text-lg font-bold">
                {new Date(convoy.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs text-muted-foreground">ETA</p>
            </div>
          </div>

          {/* Command Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Commander</span>
              </div>
              <p className="font-semibold">{convoy.commander}</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Unit</span>
              </div>
              <p className="font-semibold">{convoy.unit}</p>
            </div>
          </div>

          {/* Cargo */}
          {convoy.cargo && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cargo</span>
              </div>
              <p className="font-medium">{convoy.cargo}</p>
            </div>
          )}

          {/* Checkpoints */}
          <div className="space-y-3">
            <h3 className="font-semibold">Checkpoints</h3>
            <div className="space-y-2">
              {convoy.checkpoints.map((checkpoint, index) => (
                <div
                  key={checkpoint.id}
                  className={cn(
                    'flex items-center gap-4 p-3 rounded-lg border',
                    checkpoint.status === 'reached' && 'bg-success/10 border-success/30',
                    checkpoint.status === 'pending' && 'bg-muted/30 border-border',
                    checkpoint.status === 'skipped' && 'bg-muted/50 border-border opacity-60'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    checkpoint.status === 'reached' ? 'bg-success text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{checkpoint.name}</p>
                    {checkpoint.location && <p className="text-sm text-muted-foreground">{checkpoint.location}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {checkpoint.actualTime || checkpoint.estimatedTime}
                    </p>
                    <Badge variant="outline" className={cn(
                      'text-xs mt-1',
                      checkpoint.status === 'reached' && 'bg-success/20 text-success border-success/30',
                      checkpoint.status === 'pending' && 'bg-warning/20 text-warning border-warning/30'
                    )}>
                      {checkpoint.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {convoy.notes && (
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="font-semibold text-warning">Notes</span>
              </div>
              <p className="text-sm">{convoy.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {onEdit && (
                <Button variant="outline" onClick={() => onEdit(convoy)}>
                    Edit
                </Button>
            )}
            {onDelete && (
                <Button 
                    variant="destructive" 
                    onClick={() => {
                        if (confirm("Are you sure you want to delete this convoy?")) {
                            onDelete(convoy.id);
                        }
                    }}
                >
                    Delete
                </Button>
            )}
            <Button variant="hero">
              Track on Map
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
