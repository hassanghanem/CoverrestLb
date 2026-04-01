<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Team;

class AuthActionsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $teamIdFromHeader = $request->header('X-Team-ID');

        if (!$user || !$teamIdFromHeader) {
            return response()->json([
                'result' => false,
                'message' => __('Missing user or team information.'),
            ], 401);
        }

        $team = Team::find($teamIdFromHeader);
        if (!$team) {
            return response()->json([
                'result' => false,
                'message' => __('Team not found.'),
            ], 404);
        }

        // Uncomment if you want to enforce user access check
        // if (!$user->hasAccessToTeam($teamIdFromHeader)) {
        //     return response()->json([
        //         'result' => false,
        //         'message' => __('User does not belong to this team.'),
        //     ], 403);
        // }

        setPermissionsTeamId($teamIdFromHeader);

        return $next($request);
    }
}
