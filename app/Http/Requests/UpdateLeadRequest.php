<?php

namespace App\Http\Requests;

use App\Enums\LeadStatus;
use App\Models\Lead;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var Lead $lead */
        $lead = $this->route('lead');

        return $this->user('web') !== null && $this->user('web')->can('update', $lead);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Lead $lead */
        $lead = $this->route('lead');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:191',
                Rule::unique('leads', 'email')->ignore($lead ? $lead->id : null),
            ],
            'phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s()]{7,20}$/'],
            'status' => ['required', Rule::enum(LeadStatus::class)],
        ];
    }
}

