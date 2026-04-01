<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use App\Http\Resources\V1\Admin\ActivityLogResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use Exception;
use Illuminate\Support\Carbon;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'log_name' => 'nullable|string|max:100',
                'causer_type' => 'nullable|string|max:100',
                'from' => 'nullable|date',
                'to' => 'nullable|date|after_or_equal:from',
                'sort' => 'nullable|in:created_at,log_name,causer_type,subject_type',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.max' => __('The search may not be greater than :max characters.'),
                'log_name.max' => __('The log name may not be greater than :max characters.'),
                'causer_type.max' => __('The causer type may not be greater than :max characters.'),
                'to.after_or_equal' => __('The to date must be a date after or equal to from.'),
            ]);

            $query = Activity::with(['causer', 'subject']);

            if (!empty($validated['search'])) {
                $query->where(function ($q) use ($validated) {
                    $q->where('description', 'like', '%' . $validated['search'] . '%')
                        ->orWhere('subject_type', 'like', '%' . $validated['search'] . '%')
                        ->orWhere('causer_type', 'like', '%' . $validated['search'] . '%');
                });
            }

            if (!empty($validated['log_name'])) {
                $query->where('log_name', $validated['log_name']);
            }

            if (!empty($validated['causer_type'])) {
                $query->where('causer_type', $validated['causer_type']);
            }

            if (!empty($validated['from'])) {
                $query->whereDate('created_at', '>=', Carbon::parse($validated['from']));
            }

            if (!empty($validated['to'])) {
                $query->whereDate('created_at', '<=', Carbon::parse($validated['to']));
            }

            $sortBy = $validated['sort'] ?? 'created_at';
            $sortOrder = $validated['order'] ?? 'desc';

            $query->orderBy($sortBy, $sortOrder);

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 15;
            }

            $logs = $query->paginate($perPage);

            return response()->json([
                'result' => true,
                'message' => __('Activity logs retrieved successfully.'),
                'logs' => ActivityLogResource::collection($logs),
                'pagination' => new PaginationResource($logs),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve activity logs.'), $e);
        }
    }
}
