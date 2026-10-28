<?php

namespace App\Http\Controllers;

use App\Enums\LeadStatus;
use App\Enums\SortDirection;
use App\Http\Requests\LeadIndexRequest;
use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Http\Requests\UpdateLeadStatusRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadController extends Controller
{
    /**
     * Display a listing of the leads.
     */
    public function index(LeadIndexRequest $request): Response
    {
        return $this->buildListingResponse($request);
    }

    /**
     * Search/filter leads (returns Inertia response with the same page component).
     */
    public function search(LeadIndexRequest $request): Response
    {
        return $this->buildListingResponse($request);
    }

    /**
     * Redirect GET /leads/search to /leads.
     */
    public function searchGet(): RedirectResponse
    {
        return redirect()->route('leads.index');
    }

    /**
     * Show the form for creating a new lead.
     */
    public function create(): Response
    {
        Gate::authorize('create', Lead::class);

        return Inertia::render('Leads/Create', [
            'statuses' => LeadStatus::options(),
        ]);
    }

    /**
     * Store a newly created lead in storage.
     */
    public function store(StoreLeadRequest $request): RedirectResponse
    {
        Gate::authorize('create', Lead::class);

        $request->user('web')->leads()->create($request->validated());

        return redirect()->route('leads.index')->with('success', 'Lead created successfully.');
    }

    /**
     * Show the form for editing the specified lead.
     */
    public function edit(Lead $lead): Response
    {
        Gate::authorize('update', $lead);

        return Inertia::render('Leads/Edit', [
            'lead' => [
                'id' => $lead->id,
                'name' => $lead->name,
                'email' => $lead->email,
                'phone' => $lead->phone,
                'status' => $lead->status->value,
            ],
            'statuses' => LeadStatus::options(),
        ]);
    }

    /**
     * Update the specified lead in storage.
     */
    public function update(UpdateLeadRequest $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('update', $lead);

        $lead->update($request->validated());

        return redirect()->route('leads.index')->with('success', 'Lead updated successfully.');
    }

    /**
     * Update the inline status of the specified lead.
     */
    public function status(UpdateLeadStatusRequest $request, Lead $lead): RedirectResponse
    {
        Gate::authorize('update', $lead);

        $lead->update(['status' => $request->validated('status')]);

        return back()->with('success', 'Lead status updated.');
    }

    /**
     * Remove the specified lead from storage (soft delete).
     */
    public function destroy(Lead $lead): RedirectResponse
    {
        Gate::authorize('delete', $lead);

        $lead->delete();

        return back()->with('success', 'Lead deleted successfully.');
    }

    /**
     * Bulk delete selected leads owned by the user.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'exists:leads,id'],
        ]);

        $user = $request->user('web');
        $leads = Lead::whereIn('id', $request->input('ids'))->get();

        $deletedCount = 0;
        foreach ($leads as $lead) {
            if ($user && $user->can('delete', $lead)) {
                $lead->delete();
                $deletedCount++;
            }
        }

        return back()->with('success', "{$deletedCount} lead(s) deleted successfully.");
    }

    /**
     * Export leads matching current filters as a streaming CSV download.
     */
    public function export(LeadIndexRequest $request): StreamedResponse
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $sortDirection = $request->input('sort_direction', SortDirection::Desc->value);

        $query = Lead::query()
            ->with('user')
            ->search($search)
            ->status($status)
            ->sortByCreated($sortDirection);

        $fileName = 'leads-export-' . now()->format('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Email', 'Phone', 'Status', 'Owner', 'Created At']);

            $query->chunk(200, function ($leads) use ($handle) {
                foreach ($leads as $lead) {
                    fputcsv($handle, [
                        $lead->id,
                        $lead->name,
                        $lead->email,
                        $lead->phone,
                        $lead->status->label(),
                        $lead->user?->name ?? 'N/A',
                        $lead->created_at?->format('Y-m-d H:i:s') ?? '',
                    ]);
                }
            });

            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
        ]);
    }

    /**
     * Build the Inertia listing response shared by index and search.
     */
    private function buildListingResponse(LeadIndexRequest $request): Response
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $sortDirection = $request->input('sort_direction', SortDirection::Desc->value);
        $requestedPage = (int) $request->input('page', 1);

        if ($requestedPage < 1) {
            $requestedPage = 1;
        }

        $query = Lead::query()
            ->with('user')
            ->search($search)
            ->status($status)
            ->sortByCreated($sortDirection);

        $paginator = $query->paginate(Lead::PER_PAGE, ['*'], 'page', $requestedPage);

        // Clamp page if beyond last page
        if ($paginator->currentPage() > $paginator->lastPage() && $paginator->lastPage() > 0) {
            $paginator = $query->paginate(Lead::PER_PAGE, ['*'], 'page', $paginator->lastPage());
        }

        return Inertia::render('Leads/Index', [
            'leads' => LeadResource::collection($paginator),
            'statuses' => LeadStatus::options(),
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
                'sort_direction' => $sortDirection,
                'page' => $paginator->currentPage(),
            ],
        ]);
    }
}
