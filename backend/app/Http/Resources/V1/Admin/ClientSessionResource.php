<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use Jenssegers\Agent\Agent;

class ClientSessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        $agent = new Agent();
        $agent->setUserAgent($this->user_agent);

        return [
            'id' => $this->id,
            'client_name' => $this->client->name ?? null,
            'client_email' => $this->client->email ?? null,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'device' => [
                'is_mobile' => $agent->isMobile(),
                'is_tablet' => $agent->isTablet(),
                'is_desktop' => $agent->isDesktop(),
                'platform' => $agent->platform(),
                'platform_version' => $agent->version($agent->platform()),
                'browser' => $agent->browser(),
                'browser_version' => $agent->version($agent->browser()),
                'device' => $agent->device(),
            ],
            'is_active' => isset($this->is_active) ? (bool)$this->is_active : null,
            'last_activity' => $this->last_activity ? Carbon::parse($this->last_activity)->format('Y-m-d H:i:s') : null,
            'latitude' => $this->latitude ?? null,
            'longitude' => $this->longitude ?? null,
            'screen_resolution' => $this->screen_resolution ?? null,
            'language' => $this->language ?? null,
            'referrer' => $this->referrer ?? null,
            'current_page' => $this->current_page ?? null,
            'timezone' => $this->timezone ?? null,
            'created_at' => $this->created_at ? Carbon::parse($this->created_at)->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? Carbon::parse($this->updated_at)->toDateTimeString() : null,
        ];
    }
}
