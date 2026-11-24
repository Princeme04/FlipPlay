<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', 'unique:media,title'],
            'type' => ['required', Rule::in(['book'])],
            'format' => ['nullable', Rule::in(['novel', 'manga', 'light_novel'])],
            'genre' => ['nullable', 'string', 'max:100'],
            'creator' => ['nullable', 'string', 'max:150'],
            'release_year' => ['nullable', 'integer', 'between:1888,2100'],
            'description' => ['nullable', 'string', 'max:5000'],
            'cover_url' => ['nullable', 'url', 'max:2048'],
            'cover' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
