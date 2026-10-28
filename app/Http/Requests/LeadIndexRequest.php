<?php

namespace App\Http\Requests;

use App\Enums\LeadStatus;
use App\Enums\SortDirection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeadIndexRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', Rule::enum(LeadStatus::class)],
            'sort_direction' => ['nullable', Rule::enum(SortDirection::class)],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
