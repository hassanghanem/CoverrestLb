<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\V1\Admin\ClientSessionResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\ClientSession;

class ClientSessionController extends Controller
{
    /**
     * Update (activate/deactivate) a client session.
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|integer|exists:client_sessions,id',
            'is_active' => 'required|boolean',
        ]);

        $affected = DB::table('client_sessions')
            ->where('id', $validated['session_id'])
            ->update(['is_active' => $validated['is_active'] ? 1 : 0]);

        if ($affected) {
            return response()->json([
                'result' => true,
                'message' => $validated['is_active'] ? __('Session activated successfully.') : __('Session deactivated successfully.'),
            ]);
        } else {
            return response()->json([
                'result' => false,
                'message' => __('Session not found or not updated.'),
            ], 404);
        }
    }

    /**
     * Display a listing of client sessions.
     * Optionally filter by client_id or search by client name/email.
     */
    public function index(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|integer|exists:clients,id',
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1',
        ]);

        $query = ClientSession::with('client');

        if (!empty($validated['client_id'])) {
            $query->where('client_id', $validated['client_id']);
        }
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('client', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%$search%")
                            ->orWhere('email', 'like', "%$search%");
                    })
                    ->orWhere('id', 'like', "%$search%")
                    ->orWhere('ip_address', 'like', "%$search%")
                    ->orWhere('user_agent', 'like', "%$search%");
            });
        }

        $perPage = $validated['per_page'] ?? 15;
        $sessions = $query->orderByDesc('last_activity')->paginate($perPage);

        return response()->json([
            'result' => true,
            'message' => __('Client sessions retrieved successfully.'),
            'sessions' => ClientSessionResource::collection($sessions),
            'pagination' => new PaginationResource($sessions),
        ]);
    }
}
