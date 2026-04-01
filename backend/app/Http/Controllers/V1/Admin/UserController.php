<?php

namespace App\Http\Controllers\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Admin\UserRequest;
use App\Http\Resources\V1\Admin\PaginationResource;
use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Resources\V1\Admin\UserResource as V1UserResource;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'nullable|string|max:255',
                'role' => 'nullable|string|max:100',
                'sort' => 'nullable|in:created_at,name,email,last_activity,role,is_active',
                'order' => 'nullable|in:asc,desc',
                'per_page' => 'nullable',
            ], [
                'search.string' => __('The search must be a string.'),
                'search.max' => __('The search may not be greater than :max characters.'),
                'role.string' => __('The role must be a string.'),
                'role.max' => __('The role may not be greater than :max characters.'),
                'sort.in' => __('The sort must be one of the following: :values.'),
                'order.in' => __('The order must be one of the following: :values.'),
            ]);

            $sortBy = $validated['sort'] ?? 'created_at';
            $sortDirection = $validated['order'] ?? 'desc';
            $teamId = getPermissionsTeamId();

            $query = User::query()
                ->with('roles')
                ->when(Auth::id() !== 1, function ($query) use ($request) {
                    $query->whereNotIn('id', [1, 2, $request->user()->id]);
                })
                ->whereHas('roles', fn($q) => $q->where('model_has_roles.team_id', $teamId));

            if (!empty($validated['search'])) {
                $query->where(function ($q) use ($validated) {
                    $q->where('name', 'like', '%' . $validated['search'] . '%')
                        ->orWhere('email', 'like', '%' . $validated['search'] . '%')
                        ->orWhereHas('roles', fn($q) => $q->where('name', 'like', '%' . $validated['search'] . '%'));
                });
            }

            if (!empty($validated['role'])) {
                $query->whereHas('roles', fn($q) => $q->where('name', $validated['role']));
            }

            if ($sortBy === 'last_activity') {
                $query->addSelect([
                    'last_activity' => DB::table('sessions')
                        ->selectRaw('MAX(last_activity)')
                        ->whereColumn('user_id', 'users.id')
                ])->orderBy('last_activity', $sortDirection);
            } elseif ($sortBy === 'role') {
                $query->addSelect([
                    'role_name' => DB::table('model_has_roles')
                        ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                        ->select('roles.name')
                        ->whereColumn('model_has_roles.model_id', 'users.id')
                        ->orderBy('roles.name')
                        ->limit(1)
                ])->orderBy('role_name', $sortDirection);
            } else {
                $query->orderBy($sortBy, $sortDirection);
            }

            $perPageParam = $validated['per_page'] ?? null;
            if (is_string($perPageParam) && strtolower($perPageParam) === 'all') {
                $perPage = $query->count() ?: 1;
            } else {
                $perPage = $perPageParam ?? 10;
            }

            $users = $query->paginate($perPage);

            if ($sortBy !== 'last_activity') {
                $userIds = $users->pluck('id');
                $activities = DB::table('sessions')
                    ->select('user_id', DB::raw('MAX(last_activity) as last_activity'))
                    ->whereIn('user_id', $userIds)
                    ->groupBy('user_id')
                    ->pluck('last_activity', 'user_id');

                $users->getCollection()->transform(function ($user) use ($activities) {
                    $lastActivity = $activities[$user->id] ?? null;
                    $user->last_activity = $lastActivity ? Carbon::createFromTimestamp($lastActivity) : null;
                    return $user;
                });
            }

            return response()->json([
                'result' => true,
                'message' => __('Users retrieved successfully.'),
                'users' => V1UserResource::collection($users),
                'pagination' => new PaginationResource($users),
            ]);
        } catch (ValidationException $ve) {
            return response()->json([
                'result' => false,
                'message' => __('Validation failed.'),
                'errors' => $ve->errors(),
            ], 422);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve users.'), $e);
        }
    }

    public function show(User $user)
    {
        try {
            return response()->json([
                'result' => true,
                'message' => __('User found successfully.'),
                'user' => new V1UserResource($user),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to retrieve user.'), $e);
        }
    }

    public function destroy(User $user)
    {
        try {
            $user->delete();

            return response()->json([
                'result' => true,
                'message' => __('User deleted successfully.'),
            ]);
        } catch (Exception $e) {
            return $this->errorResponse(__('Failed to delete user.'), $e);
        }
    }

    public function create(UserRequest $request)
    {
        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
            ]);

            $user->syncRoles([$request->role]);

            if (!empty($request->permissions)) {
                $user->syncPermissions($request->permissions);
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('User created successfully.'),
                'user' => new V1UserResource($user),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to create user.'), $e);
        }
    }

    public function update(UserRequest $request, $id)
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);
            $user->name = $request->input('name', $user->name);
            $user->email = $request->input('email', $user->email);
            if ($request->filled('password')) {
                $user->password = bcrypt($request->password);
            }
            if ($request->has('is_active')) {
                $user->is_active = $request->boolean('is_active');
            }
            $user->save();

            if ($request->filled('role')) {
                $user->syncRoles([$request->role]);
            }

            if ($request->has('permissions')) {
                $user->syncPermissions($request->permissions);
            }

            DB::commit();

            return response()->json([
                'result' => true,
                'message' => __('User updated successfully.'),
                'user' => new V1UserResource($user),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return $this->errorResponse(__('Failed to update user.'), $e);
        }
    }
}
