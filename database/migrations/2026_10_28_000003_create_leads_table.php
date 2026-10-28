<?php

use App\Enums\LeadStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->string('name', 255);
            $table->string('email', 191)->unique();
            $table->string('phone', 20);
            $table->string('status', 20)->default(LeadStatus::New->value);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['deleted_at', 'status', 'created_at']);
            $table->index(['deleted_at', 'created_at']);
            $table->index(['user_id', 'deleted_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
