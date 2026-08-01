'use client';
import { useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, Autocomplete } from '@react-google-maps/api';
import { FiMapPin } from 'react-icons/fi';

// Servimos Norte Base Location (Cl. 142 #17 A -5, Local 2)
const BASE_LAT = 4.7235;
const BASE_LNG = -74.0487;

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];

// Coverage Boundaries
const BOUNDS = {
    minLat: 4.6900, // Approx Calle 116
    maxLat: 4.7600, // Approx Calle 187
    minLng: -74.0800, // Approx Av Boyacá
    maxLng: -74.0200, // Approx Carrera 7
};

interface DeliveryMapProps {
    onLocationSelect: (data: { address: string; deliveryCost: number; inCoverage: boolean }) => void;
    initialAddress?: string;
}

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function DeliveryMap({ onLocationSelect, initialAddress = '' }: DeliveryMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [position, setPosition] = useState<{lat: number, lng: number} | null>(null);
    const [address, setAddress] = useState(initialAddress);
    const [cost, setCost] = useState<number | null>(null);
    const [inCoverage, setInCoverage] = useState(true);
    const [searchWarning, setSearchWarning] = useState(false);

    const mapRef = useRef<google.maps.Map | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onLoadMap = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const onUnmountMap = useCallback(() => {
        mapRef.current = null;
    }, []);

    const onLoadAutocomplete = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newAddress = place.formatted_address || place.name || address;
                setAddress(newAddress);

                if (mapRef.current) {
                    mapRef.current.panTo({ lat, lng });
                    mapRef.current.setZoom(16);
                }

                checkLocation(lat, lng, newAddress, false);
                setSearchWarning(true);
            }
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setSearchWarning(false);

            // Reverse geocode with Google Maps Geocoder (si la Geocoding API está
            // habilitada en el proyecto de Google Cloud; si no, la ubicación y el
            // costo se registran igual y el cliente escribe su dirección manualmente)
            try {
                const geocoder = new window.google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                    let fetchedAddress = address;
                    if (status === 'OK' && results && results[0]) {
                        fetchedAddress = results[0].formatted_address;
                        setAddress(fetchedAddress);
                    }
                    checkLocation(lat, lng, fetchedAddress, true);
                });
            } catch {
                checkLocation(lat, lng, address, true);
            }
        }
    };

    // Propagar la dirección escrita manualmente al checkout
    const handleAddressInput = (value: string) => {
        setAddress(value);
        if (position) {
            onLocationSelect({ address: value, deliveryCost: cost || 0, inCoverage });
        }
    };

    const checkLocation = (lat: number, lng: number, currentAddress: string, fromMapClick = false) => {
        setPosition({ lat, lng });

        // 1. Check Bounding Box
        if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat || lng < BOUNDS.minLng || lng > BOUNDS.maxLng) {
            setInCoverage(false);
            setCost(0);
            onLocationSelect({ address: currentAddress, deliveryCost: 0, inCoverage: false });
            return;
        }

        // 2. Calculate Distance
        const distance = calculateDistance(BASE_LAT, BASE_LNG, lat, lng);

        // 3. Calculate Cost (Proportional 5,000 to 15,000)
        const maxDistance = 5.2;

        let deliveryCost = 5000 + (Math.min(distance, maxDistance) / maxDistance) * (15000 - 5000);

        // Round to nearest 100 pesos
        deliveryCost = Math.round(deliveryCost / 100) * 100;

        setInCoverage(true);
        setCost(deliveryCost);

        onLocationSelect({ address: currentAddress, deliveryCost, inCoverage: true });
    };

    if (loadError) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">Error al cargar Google Maps. Verifique su API Key o revise la consola de su navegador.</div>;
    }

    if (!isLoaded) {
        return <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">Cargando Google Maps...</div>;
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="label text-sm flex items-center gap-2">
                    <FiMapPin /> Confirme su ubicación en el mapa
                </label>
                <p className="text-xs text-gray-500 mb-2">
                    Cobertura: De Calle 116 a 187, y de Carrera 7 a Av. Boyacá.
                    Toque el mapa para calcular el costo de envío.
                </p>
                <div className="h-[450px] w-full rounded-xl overflow-hidden border-2 border-primary-100 relative z-0">
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={{ lat: BASE_LAT, lng: BASE_LNG }}
                        zoom={13}
                        onLoad={onLoadMap}
                        onUnmount={onUnmountMap}
                        onClick={handleMapClick}
                        options={{
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: true,
                            clickableIcons: false,
                        }}
                    >
                        {/* Servimos Norte Location */}
                        <Circle
                            center={{ lat: BASE_LAT, lng: BASE_LNG }}
                            radius={5000}
                            options={{ fillColor: '#DE073F', fillOpacity: 0.1, strokeColor: '#DE073F', strokeWeight: 1, clickable: false }}
                        />
                        <Marker
                            position={{ lat: BASE_LAT, lng: BASE_LNG }}
                            label={{ text: '🏪', fontSize: '20px' }}
                            title="Servimos Norte"
                        />

                        {/* User Selection */}
                        {position && (
                            <Marker position={position} />
                        )}
                    </GoogleMap>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="label text-sm">Dirección exacta de entrega *</label>
                <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                        componentRestrictions: { country: 'co' },
                        bounds: {
                            east: BOUNDS.maxLng,
                            north: BOUNDS.maxLat,
                            south: BOUNDS.minLat,
                            west: BOUNDS.minLng,
                        },
                        strictBounds: true
                    }}
                >
                    <input
                        className="input w-full"
                        placeholder="Escriba su dirección (Ej. Calle 142 #18-20, Apto 301)"
                        value={address}
                        onChange={(e) => handleAddressInput(e.target.value)}
                    />
                </Autocomplete>
                <p className="text-xs text-gray-400">
                    Toque el mapa para calcular el costo del domicilio y escriba aquí su dirección exacta (apartamento, torre, referencias).
                </p>
            </div>

            {searchWarning && (
                <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200 animate-fadeIn">
                    ℹ️ <strong>Ubicación aproximada.</strong> Si el pin no quedó en el punto exacto, por favor <strong>toque el mapa</strong> para ajustarlo a su puerta.
                </div>
            )}

            {!inCoverage && position && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                    ⚠️ Lo sentimos, esta ubicación está fuera de nuestra zona de cobertura para domicilios. Por favor contacte con nosotros por WhatsApp.
                </div>
            )}
            {inCoverage && cost !== null && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200 flex justify-between font-bold">
                    <span>Costo de domicilio calculado:</span>
                    <span>${cost.toLocaleString('es-CO')}</span>
                </div>
            )}
        </div>
    );
}
