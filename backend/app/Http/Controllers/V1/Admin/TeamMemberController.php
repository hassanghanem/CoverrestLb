<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\TeamMemberRequest;
use App\Http\Resources\V1\Admin\TeamMemberResource;
use App\Http\Resources\V1\Admin\PaginationResource;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Exception;

class TeamMemberController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search'   => 'nullable|string|max:255',
                'sort'     => 'nullable|in:created_at,name,occupation,arrangement,is_active',
                'order'    => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $locales = config('app.locales', ['en']);

            $query = TeamMember::query()
                ->when($validated['search'] ?? null, function ($query, $search) use ($locales) {
                    $query->where(function ($q) use ($search, $locales) {
                        foreach ($locales as $locale) {
                            $q->orWhere("name->$locale", 'like', "%$search%")
                              ->orWhere("occupation->$locale", 'like', "%$search%");
                        }
                    });
                })
                ->orderBy($validated['sort'] ?? 'created_at', $validated['order'] ?? 'desc');

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $teamMembers = $query->paginate($perPage);

            return response()->json([
                'result'        => true,
                'message'       => __('Team members retrieved successfully.'),
                'team_members'  => TeamMemberResource::collection($teamMembers),
                'pagination'    => new PaginationResource($teamMembers),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve team members.'), $e);
        }
    }

    public function show(TeamMember $teamMember)
    {
        return response()->json([
            'result' => true,
            'message' => __('Team member found successfully.'),
            'team_member' => new TeamMemberResource($teamMember),
        ]);
    }

    public function store(TeamMemberRequest $request)
    {
        try {
            DB::beginTransaction();

            $teamMember = new TeamMember([
                'name' => $request->input('name'),
                'occupation' => $request->input('occupation'),
                'is_active' => $request->boolean('is_active', true),
                'arrangement' => TeamMember::getNextArrangement(),
            ]);

            if ($request->hasFile('image')) {
                $teamMember->image = TeamMember::storeImage($request->file('image'));
            }

            $teamMember->save();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Team member created successfully.'),
                'team_member' => new TeamMemberResource($teamMember),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create team member.'), $e);
        }
    }

    public function update(TeamMemberRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $teamMember = TeamMember::findOrFail($id);

            $teamMember->fill([
                'name' => $request->input('name'),
                'occupation' => $request->input('occupation'),
                'is_active' => $request->boolean('is_active', $teamMember->is_active),
                'arrangement' => TeamMember::updateArrangement($teamMember, $request->input('arrangement', $teamMember->arrangement)),
            ]);

            if ($request->hasFile('image')) {
                TeamMember::deleteImage($teamMember->getRawOriginal('image'));
                $teamMember->image = TeamMember::storeImage($request->file('image'));
            }

            $teamMember->save();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Team member updated successfully.'),
                'team_member' => new TeamMemberResource($teamMember),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update team member.'), $e);
        }
    }

    public function destroy(TeamMember $teamMember)
    {
        try {
            DB::beginTransaction();

            TeamMember::rearrangeAfterDelete($teamMember->arrangement);
            TeamMember::deleteImage($teamMember->getRawOriginal('image'));
            $teamMember->delete();

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('Team member deleted successfully.'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to delete team member.'), $e);
        }
    }
}
