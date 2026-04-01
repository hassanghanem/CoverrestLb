<?php

namespace App\Http\Resources\V1\Admin;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Jenssegers\Agent\Agent;
use Stevebauman\Location\Facades\Location;

class SessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $agent = new Agent();
        $agent->setUserAgent($this->user_agent ?? '');

        $location = $this->ip_address ? Location::get($this->ip_address) : null;
        $lastActivity = $this->last_activity ?? Carbon::now()->timestamp;

        return [
            'id' => $this->id,
            'ip_address' => $this->ip_address ?? 'Unknown',
            'user_agent' => $this->user_agent ?? 'Unknown',
            'last_activity' => $lastActivity,
            'last_activity_human' => Carbon::createFromTimestamp($lastActivity)->diffForHumans(),
            'browser' => $agent->browser() ?? 'Unknown',
            'platform' => $agent->platform() ?? 'Unknown',
            'device' => $agent->device() ?? 'Unknown',
            'is_mobile' => $agent->isMobile(),
            'is_tablet' => $agent->isTablet(),
            'is_desktop' => $agent->isDesktop(),
            'is_robot' => $agent->isRobot(),
            'is_current_device' =>  $this->isCurrentSession($request),
            'location' => ($location->countryName ?? 'Unknown') . ' - ' . ($location->cityName ?? 'Unknown'),
            'longitude'          => $this->longitude,
            'latitude'          => $this->latitude,
        ];
    }
}
