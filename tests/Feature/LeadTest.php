<?php

namespace Tests\Feature;

use App\Enums\LeadStatus;
use App\Enums\SortDirection;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LeadTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_lead_listing(): void
    {
        $user = User::factory()->create();
        Lead::factory()->count(5)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'web')->get(route('leads.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 5)
            ->has('statuses')
        );
    }

    public function test_post_search_by_name(): void
    {
        $user = User::factory()->create();
        Lead::factory()->create(['user_id' => $user->id, 'name' => 'Alexander Hamilton']);
        Lead::factory()->create(['user_id' => $user->id, 'name' => 'Thomas Jefferson']);

        $response = $this->actingAs($user, 'web')->post(route('leads.search'), [
            'search' => 'Hamilton',
        ]);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 1)
            ->where('leads.data.0.name', 'Alexander Hamilton')
        );
    }

    public function test_post_search_by_email(): void
    {
        $user = User::factory()->create();
        Lead::factory()->create(['user_id' => $user->id, 'email' => 'alex@hamilton.org']);
        Lead::factory()->create(['user_id' => $user->id, 'email' => 'tom@monticello.org']);

        $response = $this->actingAs($user, 'web')->post(route('leads.search'), [
            'search' => 'hamilton.org',
        ]);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 1)
            ->where('leads.data.0.email', 'alex@hamilton.org')
        );
    }

    public function test_post_filter_by_status(): void
    {
        $user = User::factory()->create();
        Lead::factory()->create(['user_id' => $user->id, 'status' => LeadStatus::New]);
        Lead::factory()->create(['user_id' => $user->id, 'status' => LeadStatus::Converted]);

        $response = $this->actingAs($user, 'web')->post(route('leads.search'), [
            'status' => LeadStatus::Converted->value,
        ]);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Leads/Index')
            ->has('leads.data', 1)
            ->where('leads.data.0.status.value', LeadStatus::Converted->value)
        );
    }

    public function test_sort_asc_and_desc(): void
    {
        $user = User::factory()->create();
        $older = Lead::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subDays(5),
        ]);
        $newer = Lead::factory()->create([
            'user_id' => $user->id,
            'created_at' => now()->subDay(),
        ]);

        // Descending (default)
        $descResponse = $this->actingAs($user, 'web')->post(route('leads.search'), [
            'sort_direction' => SortDirection::Desc->value,
        ]);
        $descResponse->assertInertia(fn (Assert $page) => $page
            ->where('leads.data.0.id', $newer->id)
            ->where('leads.data.1.id', $older->id)
        );

        // Ascending
        $ascResponse = $this->actingAs($user, 'web')->post(route('leads.search'), [
            'sort_direction' => SortDirection::Asc->value,
        ]);
        $ascResponse->assertInertia(fn (Assert $page) => $page
            ->where('leads.data.0.id', $older->id)
            ->where('leads.data.1.id', $newer->id)
        );
    }

    public function test_pagination_page_two_returns_next_set(): void
    {
        $user = User::factory()->create();
        Lead::factory()->count(15)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user, 'web')->post(route('leads.search'), [
            'page' => 2,
        ]);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('leads.meta.current_page', 2)
            ->has('leads.data', 5)
        );
    }

    public function test_pagination_clamps_when_page_past_end(): void
    {
        $user = User::factory()->create();
        Lead::factory()->count(12)->create(['user_id' => $user->id]);

        // Requesting page 99 should clamp to page 2 (last page for 12 items with per_page = 10)
        $response = $this->actingAs($user, 'web')->post(route('leads.search'), [
            'page' => 99,
        ]);

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->where('leads.meta.current_page', 2)
            ->where('leads.meta.last_page', 2)
        );
    }

    public function test_create_lead_validation_rules(): void
    {
        $user = User::factory()->create();

        // Empty payload
        $this->actingAs($user, 'web')
            ->post(route('leads.store'), [])
            ->assertSessionHasErrors(['name', 'email', 'phone', 'status']);

        // Invalid email
        $this->actingAs($user, 'web')
            ->post(route('leads.store'), [
                'name' => 'Valid Name',
                'email' => 'not-an-email',
                'phone' => '+1 555-0100',
                'status' => 'new',
            ])
            ->assertSessionHasErrors(['email']);

        // Invalid status
        $this->actingAs($user, 'web')
            ->post(route('leads.store'), [
                'name' => 'Valid Name',
                'email' => 'valid@email.com',
                'phone' => '+1 555-0100',
                'status' => 'nonexistent_status',
            ])
            ->assertSessionHasErrors(['status']);
    }

    public function test_duplicate_email_fails_including_soft_deleted_lead(): void
    {
        $user = User::factory()->create();
        $existing = Lead::factory()->create([
            'user_id' => $user->id,
            'email' => 'duplicate@example.com',
        ]);
        $existing->delete(); // Soft delete

        // Reusing the email of a soft-deleted lead must trigger a validation error
        $response = $this->actingAs($user, 'web')->post(route('leads.store'), [
            'name' => 'Another Person',
            'email' => 'duplicate@example.com',
            'phone' => '+1 555-0199',
            'status' => LeadStatus::New->value,
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    public function test_owner_can_update_lead(): void
    {
        $owner = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($owner, 'web')->put(route('leads.update', $lead), [
            'name' => 'Updated Name',
            'email' => $lead->email,
            'phone' => '+1 555-0188',
            'status' => LeadStatus::Contacted->value,
        ]);

        $response->assertRedirect(route('leads.index'));
        $this->assertDatabaseHas('leads', [
            'id' => $lead->id,
            'name' => 'Updated Name',
            'status' => LeadStatus::Contacted->value,
        ]);
    }

    public function test_non_owner_cannot_update_lead_403(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser, 'web')->put(route('leads.update', $lead), [
            'name' => 'Malicious Update',
            'email' => $lead->email,
            'phone' => '+1 555-0188',
            'status' => LeadStatus::Converted->value,
        ]);

        $response->assertForbidden();
    }

    public function test_owner_can_update_lead_status(): void
    {
        $owner = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $owner->id, 'status' => LeadStatus::New]);

        $response = $this->actingAs($owner, 'web')->patch(route('leads.status', $lead), [
            'status' => LeadStatus::Converted->value,
        ]);

        $response->assertRedirect();
        $this->assertEquals(LeadStatus::Converted, $lead->fresh()->status);
    }

    public function test_non_owner_cannot_update_lead_status_403(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $owner->id, 'status' => LeadStatus::New]);

        $response = $this->actingAs($otherUser, 'web')->patch(route('leads.status', $lead), [
            'status' => LeadStatus::Converted->value,
        ]);

        $response->assertForbidden();
    }

    public function test_owner_can_soft_delete_lead(): void
    {
        $owner = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($owner, 'web')->delete(route('leads.destroy', $lead));

        $response->assertRedirect();
        $this->assertSoftDeleted('leads', ['id' => $lead->id]);
    }

    public function test_non_owner_cannot_delete_lead_403(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $lead = Lead::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser, 'web')->delete(route('leads.destroy', $lead));

        $response->assertForbidden();
        $this->assertNotSoftDeleted('leads', ['id' => $lead->id]);
    }

    public function test_bulk_delete_only_deletes_owned_leads(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();

        $ownedLead1 = Lead::factory()->create(['user_id' => $owner->id]);
        $ownedLead2 = Lead::factory()->create(['user_id' => $owner->id]);
        $otherLead = Lead::factory()->create(['user_id' => $otherUser->id]);

        $response = $this->actingAs($owner, 'web')->post(route('leads.bulk-delete'), [
            'ids' => [$ownedLead1->id, $ownedLead2->id, $otherLead->id],
        ]);

        $response->assertRedirect();
        $this->assertSoftDeleted('leads', ['id' => $ownedLead1->id]);
        $this->assertSoftDeleted('leads', ['id' => $ownedLead2->id]);
        $this->assertNotSoftDeleted('leads', ['id' => $otherLead->id]);
    }

    public function test_export_streams_csv_with_applied_filters(): void
    {
        $user = User::factory()->create();
        Lead::factory()->create(['user_id' => $user->id, 'name' => 'Target Person', 'email' => 'target@example.com']);
        Lead::factory()->create(['user_id' => $user->id, 'name' => 'Other Person', 'email' => 'other@example.com']);

        $response = $this->actingAs($user, 'web')->post(route('leads.export'), [
            'search' => 'Target',
        ]);

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('attachment; filename=leads-export-', (string) $response->headers->get('content-disposition'));
    }
}
