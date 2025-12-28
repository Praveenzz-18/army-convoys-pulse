export type ConvoyStatus = 'active' | 'pending' | 'delayed' | 'completed';
export type VehicleType = 'truck' | 'tanker' | 'ambulance' | 'apc' | 'jeep' | 'bus';
export type Priority = 'high' | 'medium' | 'low';

export interface Checkpoint {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  estimatedTime: string;
  actualTime?: string;
  status: 'pending' | 'reached' | 'skipped';
}

export interface Convoy {
  id: string;
  name: string;
  origin: string;
  destination: string;
  status: ConvoyStatus;
  priority: Priority;
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  vehicleCount: number;
  personnelCount: number;
  commander: string;
  unit: string;
  checkpoints: Checkpoint[];
  currentLocation?: { lat: number; lng: number };
  progress: number;
  notes?: string;
  cargo?: string;
  cargoWeight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: VehicleType;
  model: string;
  status: 'available' | 'in-mission' | 'maintenance' | 'retired';
  fuelLevel: number;
  lastService: string;
  nextServiceDue: string;
  assignedConvoy?: string;
  driver?: string;
  capacity: number;
  mileage: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  convoyId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'commander' | 'operator' | 'viewer';
  unit: string;
  rank: string;
  avatar?: string;
}
