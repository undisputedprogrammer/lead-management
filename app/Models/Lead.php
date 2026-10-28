<?php

namespace App\Models;

use App\Enums\LeadStatus;
use App\Enums\SortDirection;
use Database\Factories\LeadFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Lead extends Model
{
    /** @use HasFactory<LeadFactory> */
    use HasFactory, SoftDeletes;

    public const PER_PAGE = 10;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => LeadStatus::class,
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to search by name or email.
     *
     * @param Builder<Lead> $query
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (blank($search)) {
            return $query;
        }

        $escaped = addcslashes($search, '%_\\');

        return $query->where(function (Builder $q) use ($escaped) {
            $q->where('name', 'like', "%{$escaped}%")
              ->orWhere('email', 'like', "%{$escaped}%");
        });
    }

    /**
     * Scope a query to filter by status.
     *
     * @param Builder<Lead> $query
     */
    public function scopeStatus(Builder $query, LeadStatus|string|null $status): Builder
    {
        if ($status === null || $status === '') {
            return $query;
        }

        $val = $status instanceof LeadStatus ? $status->value : $status;

        return $query->where('status', $val);
    }

    /**
     * Scope a query to sort by created_at with deterministic id tie-breaker.
     *
     * @param Builder<Lead> $query
     */
    public function scopeSortByCreated(Builder $query, SortDirection|string|null $direction = SortDirection::Desc): Builder
    {
        $dir = $direction instanceof SortDirection ? $direction->value : ($direction ?: 'desc');
        $dir = strtolower($dir) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy('created_at', $dir)
                     ->orderBy('id', $dir);
    }

    /**
     * Initials accessor (first letters of up to two words of the name, uppercase).
     */
    protected function initials(): Attribute
    {
        return Attribute::make(
            get: function () {
                $words = preg_split('/\s+/', trim($this->name ?? ''));
                if (empty($words) || empty($words[0])) {
                    return '';
                }

                if (count($words) === 1) {
                    return Str::upper(mb_substr($words[0], 0, min(2, mb_strlen($words[0]))));
                }

                return Str::upper(mb_substr($words[0], 0, 1) . mb_substr($words[1], 0, 1));
            }
        );
    }

    /**
     * Handle accessor ('@' . Str::before($email, '@')).
     */
    protected function handle(): Attribute
    {
        return Attribute::make(
            get: fn () => '@' . Str::before($this->email ?? '', '@')
        );
    }
}
