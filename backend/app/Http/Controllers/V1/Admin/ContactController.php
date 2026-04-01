<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\Admin\ContactResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Exception;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'sort' => 'nullable|in:created_at,name,email,is_view',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $query = Contact::query()
                ->when($validated['search'] ?? null, function ($q, $search) {
                    $q->where('name', 'like', "%$search%")
                        ->orWhere('email', 'like', "%$search%")
                        ->orWhere('subject', 'like', "%$search%");
                })
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $contacts = $query->paginate($perPage);

            Contact::where('is_view', false)->update(['is_view' => true]);

            return response()->json([
                'result' => true,
                'message' => __('Contacts retrieved successfully.'),
                'contacts' => ContactResource::collection($contacts),
                'pagination' => new PaginationResource($contacts),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve contact data.'), $e);
        }
    }
}
