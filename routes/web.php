<?php

use App\Http\Controllers\LeadController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('leads.index');
});

Route::redirect('/dashboard', '/leads')->name('dashboard');

Route::middleware('auth:web')->group(function () {
    Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
    Route::post('/leads/search', [LeadController::class, 'search'])->name('leads.search');
    Route::get('/leads/search', [LeadController::class, 'searchGet'])->name('leads.search.get');
    Route::get('/leads/create', [LeadController::class, 'create'])->name('leads.create');
    Route::post('/leads', [LeadController::class, 'store'])->name('leads.store');
    Route::get('/leads/{lead}/edit', [LeadController::class, 'edit'])->name('leads.edit');
    Route::put('/leads/{lead}', [LeadController::class, 'update'])->name('leads.update');
    Route::patch('/leads/{lead}/status', [LeadController::class, 'status'])->name('leads.status');
    Route::delete('/leads/{lead}', [LeadController::class, 'destroy'])->name('leads.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
