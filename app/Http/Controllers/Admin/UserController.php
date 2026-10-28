<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SortDirection;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Requests\Admin\UserIndexRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public const PER_PAGE = 10;

    /**
     * Display a listing of the users.
     */
    public function index(UserIndexRequest $request): Response
    {
        return $this->buildListingResponse($request);
    }

    /**
     * Search/filter users.
     */
    public function search(UserIndexRequest $request): Response
    {
        return $this->buildListingResponse($request);
    }

    /**
     * Redirect GET /admin/users/search to admin.dashboard.
     */
    public function indexRedirect(): RedirectResponse
    {
        return redirect()->route('admin.dashboard');
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Users/Create');
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make($request->validated('password')),
        ]);

        return redirect()->route('admin.dashboard')->with('success', 'User created successfully.');
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = [
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->validated('password'));
        }

        $user->update($data);

        return redirect()->route('admin.dashboard')->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage (soft delete).
     * If user owns leads, reassigns them to another user of choice.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        $leadsCount = $user->leads()->count();

        if ($leadsCount > 0) {
            $request->validate([
                'reassign_to_user_id' => [
                    'required',
                    'integer',
                    Rule::exists('users', 'id')->whereNull('deleted_at'),
                    Rule::notIn([$user->id]),
                ],
            ], [
                'reassign_to_user_id.required' => "Please select another user to reassign this user's {$leadsCount} lead(s) to.",
            ]);

            $newOwnerId = (int) $request->input('reassign_to_user_id');

            DB::transaction(function () use ($user, $newOwnerId) {
                $user->leads()->update(['user_id' => $newOwnerId]);
                $user->delete();
            });

            return back()->with('success', "User deleted successfully. {$leadsCount} lead(s) were reassigned.");
        }

        $user->delete();

        return back()->with('success', 'User deleted successfully.');
    }

    /**
     * Build the Inertia listing response shared by index and search.
     */
    private function buildListingResponse(UserIndexRequest $request): Response
    {
        $search = $request->input('search');
        $sortDirection = $request->input('sort_direction', SortDirection::Desc->value);
        $requestedPage = (int) $request->input('page', 1);

        if ($requestedPage < 1) {
            $requestedPage = 1;
        }

        $query = User::query()->withCount('leads');

        if (filled($search)) {
            $escaped = addcslashes($search, '%_\\');
            $query->where(function (Builder $q) use ($escaped) {
                $q->where('name', 'like', "%{$escaped}%")
                  ->orWhere('email', 'like', "%{$escaped}%");
            });
        }

        $dir = strtolower($sortDirection) === 'asc' ? 'asc' : 'desc';
        $query->orderBy('created_at', $dir)->orderBy('id', $dir);

        $paginator = $query->paginate(self::PER_PAGE, ['*'], 'page', $requestedPage);

        if ($paginator->currentPage() > $paginator->lastPage() && $paginator->lastPage() > 0) {
            $paginator = $query->paginate(self::PER_PAGE, ['*'], 'page', $paginator->lastPage());
        }

        return Inertia::render('Admin/Users/Index', [
            'users' => UserResource::collection($paginator),
            'eligible_users' => User::query()
                ->select(['id', 'name', 'email'])
                ->orderBy('name')
                ->get(),
            'filters' => [
                'search' => $search ?? '',
                'sort_direction' => $dir,
                'page' => $paginator->currentPage(),
            ],
        ]);
    }
}
