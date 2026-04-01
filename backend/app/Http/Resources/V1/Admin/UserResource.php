<?php

namespace App\Http\Resources\V1\Admin;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Session as UserSession;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        $sessions = UserSession::where('user_id', $this->id)->get();
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'is_active' => $this->is_active==1?true:false,
            'role' => $this->getRoleNames()[0],
            'permissions' => $this->getAllPermissions()->pluck('name'),
            'sessions' => SessionResource::collection($sessions),
            'teams' => $this->teams(),
        ];
    }
}
