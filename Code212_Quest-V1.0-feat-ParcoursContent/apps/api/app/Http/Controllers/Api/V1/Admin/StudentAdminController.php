<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\UserProfileResource;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\LevelService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Administration des comptes apprenants.
 */
class StudentAdminController extends Controller
{
    public function __construct(
        private readonly AuditLogger $audit,
        private readonly LevelService $levels,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageStudents', $request->user());

        $users = User::query()
            ->when($request->filled('recherche'), static fn ($q) => $q->where(function ($query) use ($request): void {
                $term = (string) $request->string('recherche');
                $query->where('name', 'ilike', '%'.$term.'%')
                    ->orWhere('email', 'ilike', '%'.$term.'%')
                    ->orWhere('uca_matricule', 'ilike', '%'.$term.'%');
            }))
            ->when($request->filled('role'), static fn ($q) => $q->where('roles', '?', json_encode([(string) $request->string('role')])))
            ->when($request->filled('voie'), static fn ($q) => $q->where('track_code', $request->string('voie')))
            ->orderBy('id')
            ->paginate((int) $request->integer('limite', 25));

        return ApiResponse::paginated($users, UserProfileResource::collection($users->getCollection()));
    }

    public function update(UpdateStudentRequest $request, User $student): JsonResponse
    {
        $payload = $request->validated();

        $mapping = [
            'nom' => 'name',
            'filiere' => 'filiere',
            'promotion' => 'promotion',
            'matricule' => 'uca_matricule',
            'voie' => 'track_code',
            'niveau' => 'level_no',
            'germes' => 'germes_balance',
        ];

        $changes = [];

        foreach ($mapping as $input => $column) {
            if (array_key_exists($input, $payload)) {
                $changes[$column] = $payload[$input];
            }
        }

        if (array_key_exists('roles', $payload)) {
            $changes['roles'] = array_values($payload['roles']);
        }

        $student->fill($changes)->save();

        $this->audit->log(
            $request->user(),
            'admin.student_updated',
            'user',
            $student->getKey(),
            $request->input('justification'),
            ['changements' => $changes]
        );

        return ApiResponse::resource(new UserProfileResource($student->refresh()));
    }
}
