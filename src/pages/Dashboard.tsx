import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ConvoyCard } from '@/components/convoy/ConvoyCard';
import { ConvoyDetailDialog } from '@/components/convoy/ConvoyDetailDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockNotifications } from '@/data/mockData';
import { Convoy, ConvoyStatus } from '@/types/convoy';
import { convoyService } from '@/services/convoyService';
import {
  Route,
  Truck,
  Users,
  CheckCircle,
  TrendingUp,
  Fuel,
  Wrench,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [selectedConvoy, setSelectedConvoy] = useState<Convoy | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [convoys, setConvoys] = useState<Convoy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConvoys = async () => {
      try {
        const data = await convoyService.getConvoys();
        
        // Map API response to Frontend Model (Mirrors Convoys.tsx logic)
        const mappedConvoys: Convoy[] = data.map((c: any) => {
            const mapStatus = (s: string): ConvoyStatus => {
                const lower = s?.toLowerCase();
                if (['active', 'pending', 'delayed', 'completed'].includes(lower)) return lower as ConvoyStatus;
                if (lower === 'planned') return 'pending';
                if (lower === 'in transit') return 'active';
                return 'pending';
            };

            const mapPriority = (p: string): any => {
                 const lower = p?.toLowerCase();
                 if (['high', 'medium', 'low'].includes(lower)) return lower;
                 return 'medium';
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
                    estimatedTime: (isString ? null : cp.estimatedTime) || new Date().toISOString(),
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
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConvoys();
  }, []);

  const activeConvoys = convoys.filter(c => c.status === 'active' || c.status === 'delayed');
  const recentNotifications = mockNotifications.slice(0, 4);

  // Dynamic Stats Calculation
  const dashboardStats = {
      activeConvoys: convoys.filter(c => c.status === 'active').length,
      totalVehicles: convoys.reduce((acc, c) => acc + c.vehicleCount, 0),
      totalPersonnel: convoys.reduce((acc, c) => acc + c.personnelCount, 0),
      onTimeDelivery: 98.5, // Mocked for now
      completedMissions: convoys.filter(c => c.status === 'completed').length,
      totalDistance: 12500, // Mocked
      fuelEfficiency: 92, // Mocked
      maintenanceScheduled: 3 // Mocked
  };

  const handleConvoyClick = (convoy: Convoy) => {
    setSelectedConvoy(convoy);
    setDetailOpen(true);
  };

  return (
    <DashboardLayout title="Dashboard" subtitle="Real-time overview of all convoy operations">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Active Convoys"
          value={dashboardStats.activeConvoys}
          icon={Route}
          change={convoys.length > 0 ? "Tracking real-time" : "No active missions"}
          changeType="positive"
        />
        <StatsCard
          title="Total Vehicles"
          value={dashboardStats.totalVehicles}
          icon={Truck}
          change="Deployed fleet"
          changeType="neutral"
        />
        <StatsCard
          title="Personnel Deployed"
          value={dashboardStats.totalPersonnel}
          icon={Users}
          change="Across all convoys"
          changeType="neutral"
        />
        <StatsCard
          title="On-Time Delivery"
          value={dashboardStats.onTimeDelivery}
          suffix="%"
          icon={CheckCircle}
          change="+2.5% this week"
          changeType="positive"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Completed Missions"
          value={dashboardStats.completedMissions}
          icon={TrendingUp}
          change="This year"
        />
        <StatsCard
          title="Total Distance"
          value={(dashboardStats.totalDistance / 1000).toFixed(0) + 'K'}
          suffix="km"
          icon={Route}
          change="All time"
        />
        <StatsCard
          title="Fuel Efficiency"
          value={dashboardStats.fuelEfficiency}
          suffix="%"
          icon={Fuel}
          change="Fleet average"
        />
        <StatsCard
          title="Maintenance Due"
          value={dashboardStats.maintenanceScheduled}
          icon={Wrench}
          change="vehicles this week"
          changeType="negative"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Convoys */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Convoys</h2>
            <Link to="/convoys">
              <Button variant="outline" size="sm" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4">
            {loading ? (
                 <div className="text-center py-8 text-muted-foreground">Loading specific operations data...</div>
            ) : activeConvoys.length === 0 ? (
                 <div className="text-center py-8 text-muted-foreground">No active convoys currently.</div>
            ) : (
                activeConvoys.slice(0, 3).map((convoy) => (
                <ConvoyCard
                    key={convoy.id}
                    convoy={convoy}
                    onClick={() => handleConvoyClick(convoy)}
                />
                ))
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Alerts</h2>
            <Link to="/notifications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <Card className="glass-card">
            <CardContent className="p-4 space-y-3">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.type === 'warning' ? 'bg-warning/10 border-warning/30' :
                    notification.type === 'error' ? 'bg-destructive/10 border-destructive/30' :
                    notification.type === 'success' ? 'bg-success/10 border-success/30' :
                    'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      notification.type === 'warning' ? 'text-warning' :
                      notification.type === 'error' ? 'text-destructive' :
                      notification.type === 'success' ? 'text-success' :
                      'text-info'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Convoy Detail Dialog */}
      <ConvoyDetailDialog
        convoy={selectedConvoy}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
