import { useState, useEffect } from 'react';
import { convoyService } from '@/services/convoyService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConvoyCard } from '@/components/convoy/ConvoyCard';
import { CreateConvoyDialog } from '@/components/convoy/CreateConvoyDialog';
import { ConvoyDetailDialog } from '@/components/convoy/ConvoyDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Convoy, ConvoyStatus } from '@/types/convoy';
import { Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Convoys = () => {
  const { isAuthenticated, isAuthorized } = useAuth();
  const [convoys, setConvoys] = useState<Convoy[]>([]); // Initialize empty
  const [loading, setLoading] = useState(true); // Add loading state
  const [selectedConvoy, setSelectedConvoy] = useState<Convoy | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [convoyToEdit, setConvoyToEdit] = useState<Convoy | null>(null); // State for editing
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ConvoyStatus | 'all'>('all');
  
  // Import service
  const { getConvoys, deleteConvoy } = convoyService;

  const fetchConvoys = async () => {
    try {
      setLoading(true);
      const data = await getConvoys();
      console.log("Fetched Convoys from API:", data); // Debug Log
      
      // Map API response to Frontend Model
      const mappedConvoys: Convoy[] = data.map((c: any) => {
        // Safe Mapping Helpers
        const mapStatus = (s: string): ConvoyStatus => {
            const lower = s?.toLowerCase();
            if (['active', 'pending', 'delayed', 'completed'].includes(lower)) return lower as ConvoyStatus;
            if (lower === 'planned') return 'pending'; // Map planned -> pending
            if (lower === 'in transit') return 'active';
            return 'pending'; // Default
        };

        const mapPriority = (p: string): any => {
             const lower = p?.toLowerCase();
             if (['high', 'medium', 'low'].includes(lower)) return lower;
             if (lower === 'urgent' || lower === 'critical') return 'high';
             return 'medium'; // Default
        };

        return {
        id: c.id,
        name: c.name,
        origin: c.origin,
        destination: c.destination,
        status: mapStatus(c.status),
        priority: mapPriority(c.priority),
        departureTime: c.start_time,
        estimatedArrival: (() => {
            try {
                const start = new Date(c.start_time);
                if (isNaN(start.getTime())) return new Date().toISOString(); 
                return new Date(start.getTime() + 4 * 60 * 60 * 1000).toISOString();
            } catch (e) {
                return new Date().toISOString();
            }
        })(),
        vehicleCount: c.vehicle_count || (c.vehicles ? c.vehicles.length : 0),
        personnelCount: c.personnel_count || 0,
        commander: c.commander || "Unknown",
        unit: c.unit || "Logistics",
        cargo: c.cargo,
        cargoWeight: c.cargo_load || 0,
        notes: c.notes,
        checkpoints: (c.checkpoints || []).map((cp: any, idx: number) => {
            const isString = typeof cp === 'string';
            return {
                id: isString ? `cp-${idx}` : (cp.id || `cp-${idx}`),
                name: isString ? cp : (cp.name || `Checkpoint ${idx + 1}`),
                location: isString ? "" : (cp.location || "Unknown"),
                coordinates: (isString ? null : cp.coordinates) || { lat: 0, lng: 0 },
                estimatedTime: (isString ? null : cp.estimatedTime) || new Date(new Date(c.start_time).getTime() + (idx + 1) * 3600000).toISOString(),
                status: (isString ? 'pending' : (cp.status || 'pending'))
            };
        }),
        progress: 0,
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString()
      };
    });
      
      setConvoys(mappedConvoys);
    } catch (error) {
      console.error("Failed to fetch convoys:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchConvoys();
  }, []);

  const canCreate = isAuthenticated && isAuthorized(['admin', 'commander']);

  const filteredConvoys = convoys.filter((convoy) => {
    const matchesSearch = convoy.name.toLowerCase().includes(search.toLowerCase()) ||
      convoy.id.toLowerCase().includes(search.toLowerCase()) ||
      convoy.commander.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || convoy.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    try {
        await deleteConvoy(id);
        setConvoys(convoys.filter(c => c.id !== id));
        setDetailOpen(false);
        setSelectedConvoy(null);
    } catch (error) {
        console.error("Failed to delete convoy:", error);
    }
  };



  const handleEdit = (convoy: Convoy) => {
    setConvoyToEdit(convoy);
    setDetailOpen(false); // Close detail view
    setCreateOpen(true);  // Open form dialog
  };

  const handleConvoyClick = (convoy: Convoy) => {
    setSelectedConvoy(convoy);
    setDetailOpen(true);
  };

  const handleConvoyCreated = (newConvoy: Convoy) => {
     // Re-fetch to get consistent state or append mapped version
     fetchConvoys();
  };

  const stats = {
    total: convoys.length,
    active: convoys.filter(c => c.status === 'active').length,
    pending: convoys.filter(c => c.status === 'pending').length,
    delayed: convoys.filter(c => c.status === 'delayed').length,
    completed: convoys.filter(c => c.status === 'completed').length,
  };

  return (
    <DashboardLayout title="Convoy Management" subtitle="Track and manage all convoy operations">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search convoys by name, ID, or commander..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ConvoyStatus | 'all')}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="hero" onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Convoy
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="p-4 bg-card rounded-lg border border-border text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="p-4 bg-success/10 rounded-lg border border-success/30 text-center">
          <p className="text-2xl font-bold text-success">{stats.active}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </div>
        <div className="p-4 bg-warning/10 rounded-lg border border-warning/30 text-center">
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.delayed}</p>
          <p className="text-xs text-muted-foreground">Delayed</p>
        </div>
        <div className="p-4 bg-info/10 rounded-lg border border-info/30 text-center">
          <p className="text-2xl font-bold text-info">{stats.completed}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
      </div>

      {/* Convoy Grid */}
       {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading convoys...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConvoys.map((convoy) => (
            <ConvoyCard
                key={convoy.id}
                convoy={convoy}
                onClick={() => handleConvoyClick(convoy)}
            />
            ))}
        </div>
      )}


      {!loading && filteredConvoys.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No convoys found matching your criteria.</p>
        </div>
      )}

      {/* Dialogs */}
      <ConvoyDetailDialog
        convoy={selectedConvoy}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDelete={isAuthenticated && isAuthorized(['admin', 'commander']) ? handleDelete : undefined}
        onEdit={isAuthenticated && isAuthorized(['admin', 'commander']) ? handleEdit : undefined}
      />
      <CreateConvoyDialog
        open={createOpen}
        onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setConvoyToEdit(null); // Clear edit state on close
        }}
        onConvoyCreated={handleConvoyCreated}
        convoyToEdit={convoyToEdit}
      />
    </DashboardLayout>
  );
};

export default Convoys;
