import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockConvoys } from '@/data/mockData';
import { MapPin, Navigation, RefreshCw, Maximize2, Layers } from 'lucide-react';
import MapContainer from '@/components/map/MapContainer';
import { db } from '@/database/firebase/client';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Convoy } from '@/types/convoy';

const LiveMap = () => {
  const [convoys, setConvoys] = useState<Convoy[]>(mockConvoys);
  const activeConvoys = convoys.filter(c => c.status === 'active' || c.status === 'delayed');

  useEffect(() => {
    // Real-time listener for convoys in Firestore
    const convoysRef = collection(db, 'convoys');
    const q = query(convoysRef, where('status', 'in', ['active', 'delayed']));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedConvoys = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Convoy[];
      
      if (updatedConvoys.length > 0) {
        setConvoys(prev => {
          // Merge real data with mock for demo purposes if needed
          const merged = [...prev];
          updatedConvoys.forEach(uc => {
            const index = merged.findIndex(c => c.id === uc.id);
            if (index !== -1) merged[index] = uc;
            else merged.push(uc);
          });
          return merged;
        });
      }
    }, (error) => {
      console.warn("Firestore error (using mock data):", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout title="Live Map" subtitle="Real-time convoy tracking and positioning">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-3">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border">
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary" />
                Convoy Positions
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Layers className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[600px] bg-muted/30">
                <MapContainer convoys={activeConvoys} />
                
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 z-[1000]">
                  <p className="text-xs font-semibold mb-2">Legend</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span>Active Convoy</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span>Delayed Convoy</span>
                    </div>
                  </div>
                </div>

                {/* Map Notice */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 z-[1000]">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Navigation className="w-3 h-3 text-primary animate-pulse" />
                    Real-time Tracking Enabled (Leaflet + Firestore)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Convoy List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Active Convoys ({activeConvoys.length})</h3>
          <div className="space-y-3">
            {activeConvoys.map((convoy) => (
              <Card key={convoy.id} className="glass-card cursor-pointer hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm">{convoy.name}</p>
                      <p className="text-xs text-muted-foreground">{convoy.id}</p>
                    </div>
                    <Badge className={convoy.status === 'delayed' ? 'status-delayed' : 'status-active'}>
                      {convoy.status}
                    </Badge>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {convoy.origin}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Navigation className="w-3 h-3" />
                      {convoy.destination}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{convoy.vehicleCount} vehicles</span>
                    <span className="text-primary font-medium">{convoy.progress}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveMap;
