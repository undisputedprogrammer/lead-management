<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login_from_lead_routes(): void
    {
        $this->get(route('leads.index'))->assertRedirect(route('login'));
        $this->get(route('leads.create'))->assertRedirect(route('login'));
        $this->post(route('leads.store'), [])->assertRedirect(route('login'));
        $this->post(route('leads.search'), [])->assertRedirect(route('login'));
    }

    public function test_guests_are_redirected_to_admin_login_from_admin_routes(): void
    {
        $this->get(route('admin.dashboard'))->assertRedirect(route('admin.login'));
        $this->get(route('admin.users.create'))->assertRedirect(route('admin.login'));
        $this->post(route('admin.users.search'), [])->assertRedirect(route('admin.login'));
    }

    public function test_web_users_cannot_access_admin_routes(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get(route('admin.dashboard'))
            ->assertRedirect(route('admin.login'));
    }

    public function test_admins_cannot_access_lead_routes(): void
    {
        $admin = Admin::factory()->create();

        $this->actingAs($admin, 'admin')
            ->get(route('leads.index'))
            ->assertRedirect(route('login'));
    }
}

