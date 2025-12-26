import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Convoy } from '@/types/convoy';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  convoys: Convoy[];
  center?: [number, number];
  zoom?: number;
}

const RecenterMap = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const CustomMapContainer = ({ convoys, center = [20.5937, 78.9629], zoom = 5 }: MapProps) => {
  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={center} zoom={zoom} />
      {convoys.map((convoy) => (
        convoy.currentLocation && (
          <Marker 
            key={convoy.id} 
            position={[convoy.currentLocation.lat, convoy.currentLocation.lng]}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-primary">{convoy.name}</h3>
                <p className="text-xs text-muted-foreground">{convoy.id}</p>
                <div className="mt-2 text-xs">
                  <p><strong>Status:</strong> {convoy.status}</p>
                  <p><strong>Progress:</strong> {convoy.progress}%</p>
                  <p><strong>Commander:</strong> {convoy.commander}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default CustomMapContainer;
