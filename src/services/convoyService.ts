const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/convoys";

export interface ConvoyDTO {
    id?: string;
    name: string;
    origin: string;
    destination: string;
    priority: string;
    start_time: string;
    
    // Extended fields
    status?: string;
    vehicle_count?: number;
    personnel_count?: number;
    commander?: string;
    unit?: string;
    cargo?: string;
    notes?: string;
    checkpoints?: any[];
    
    // Deprecated/Compatibility
    vehicles?: any[];
    cargo_load?: number;
}

export const convoyService = {
    // POST /api/convoys/
    createConvoy: async (convoyData: ConvoyDTO) => {
        const response = await fetch(`${API_BASE_URL}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(convoyData),
        });
        if (!response.ok) {
            throw new Error(`Failed to create convoy: ${response.statusText}`);
        }
        return response.json();
    },

    // GET /api/convoys/ (List)
    getConvoys: async (filters?: { status?: string; origin?: string }) => {
        let url = `${API_BASE_URL}/`;
        if (filters) {
            const params = new URLSearchParams();
            if (filters.status && filters.status !== 'all') params.append("status", filters.status);
            if (filters.origin) params.append("origin", filters.origin);
            url += `?${params.toString()}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to get convoys: ${response.statusText}`);
        }
        return response.json();
    },

    // GET /api/convoys/{id}
    getConvoy: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error(`Failed to get convoy: ${response.statusText}`);
        }
        return response.json();
    },

    // PUT /api/convoys/{id}
    updateConvoy: async (id: string, updates: Partial<ConvoyDTO>) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            throw new Error(`Failed to update convoy: ${response.statusText}`);
        }
        return response.json();
    },

    // DELETE /api/convoys/{id}
    deleteConvoy: async (id: string) => {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error(`Failed to delete convoy: ${response.statusText}`);
        }
    }
    // Note: GET / (list) was removed from backend, so we can't fetch all convoys via API currently 
    // depending on the previous instructions. 
    // However, for the dashboard list, we usually NEED a list endpoint.
    // The user said "remove the get convoy endpoint... to get info by id only".
    // This implies the dashboard LIST functionality will break unless we iterate IDs or user meant something else.
    // I will notify the user about this potential issue after creating the service.
};
