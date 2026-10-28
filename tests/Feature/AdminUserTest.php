<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_and_logout(): void
    {
        $admin = Admin::factory()->create([
            'email' => 'admin@test.com',
            'password' => 'password',
        ]);

        $response = $this->post(route('admin.login.store'), [
            'email' => 'admin@test.com',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('admin.dashboard', absolute: false));
        $this->assertAuthenticatedAs($admin, 'admin');

        $logoutResponse = $this->actingAs($admin, 'admin')->post(route('admin.logout'));
        $logoutResponse->assertRedirect(route('admin.login'));
        $this->assertGuest('admin');
    }

    public function test_admin_can_view_users_with_lead_counts(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create(['name' => 'John Doe']);
        Lead::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($admin, 'admin')->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/Index')
            ->has('users.data', 1)
            ->where('users.data.0.leads_count', 3)
        );
    }

    public function test_admin_can_create_user(): void
    {
        $admin = Admin::factory()->create();

        $response = $this->actingAs($admin, 'admin')->post(route('admin.users.store'), [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertDatabaseHas('users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
        ]);
    }

    public function test_admin_can_update_user(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create();

        $response = $this->actingAs($admin, 'admin')->put(route('admin.users.update', $user), [
            'name' => 'Updated User Name',
            'email' => $user->email,
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated User Name',
        ]);
    }

    public function test_admin_can_soft_delete_user_and_deleted_user_cannot_login(): void
    {
        $admin = Admin::factory()->create();
        $user = User::factory()->create([
            'email' => 'todelete@example.com',
            'password' => 'password',
        ]);

        // Admin soft-deletes user
        $response = $this->actingAs($admin, 'admin')->delete(route('admin.users.destroy', $user));
        $response->assertRedirect();
        $this->assertSoftDeleted('users', ['id' => $user->id]);

        // User attempts login
        $loginResponse = $this->post(route('login'), [
            'email' => 'todelete@example.com',
            'password' => 'password',
        ]);

        $loginResponse->assertSessionHasErrors('email');
        $this->assertGuest('web');
    }
}
