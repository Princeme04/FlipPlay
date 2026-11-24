<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $mediaId = $this->route('media')?->id;

        return [
            'title' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('media', 'title')->ignore($mediaId)],
            'type' => ['sometimes', 'required', Rule::in(['book'])],
            'format' => ['sometimes', 'nullable', Rule::in(['novel', 'manga', 'light_novel'])],
            'genre' => ['sometimes', 'nullable', 'string', 'max:100'],
            'creator' => ['sometimes', 'nullable', 'string', 'max:150'],
            'release_year' => ['sometimes', 'nullable', 'integer', 'between:1888,2100'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'cover_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'cover' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
