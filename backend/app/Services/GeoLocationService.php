<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeoLocationService
{
    /**
     * Get location data from latitude and longitude.
     *
     * @param float $latitude
     * @param float $longitude
     * @return array|null
     */
    public function getLocationFromCoordinates(float $latitude, float $longitude): ?array
    {
        if (empty($latitude) || empty($longitude)) {
            return null;
        }

        $geoResponse = Http::withHeaders([
            'User-Agent' => 'jays/1.0 (info@jay-s.co)'
        ])->get("https://nominatim.openstreetmap.org/reverse", [
            'lat' => $latitude,
            'lon' => $longitude,
            'format' => 'json',
            'addressdetails' => 1,
        ]);

        if (! $geoResponse->ok()) {
            return null;
        }

        $geoData = $geoResponse->json();
        $address = $geoData['address'] ?? [];

        return [
            'country'      => $address['country'] ?? 'Unknown',
            'country_code' => strtoupper($address['country_code'] ?? ''),
            'region'       => $address['state'] ?? 'Unknown',
            'city'         => $address['city']
                ?? $address['town']
                ?? $address['village']
                ?? 'Unknown',
            'zip'          => $address['postcode'] ?? 'Unknown',
            'timezone'     => $geoData['timezone'] ?? 'Unknown',
        ];
    }
}
