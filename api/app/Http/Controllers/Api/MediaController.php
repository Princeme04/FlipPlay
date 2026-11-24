<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMediaRequest;
use App\Http\Requests\UpdateMediaRequest;
use App\Http\Resources\MediaResource;
use App\Models\Media;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Media::query()->latest();

        if ($request->filled('search')) {
            $search = trim($request->string('search')->toString());
            $query->where('title', 'like', "%{$search}%");
        }

        return MediaResource::collection($query->paginate(15)->withQueryString());
    }

    public function show(Media $media): MediaResource
    {
        return new MediaResource($media->load('users'));
    }

    public function store(StoreMediaRequest $request): MediaResource
    {
        $data = $request->safe()->except('cover');

        if ($request->hasFile('cover')) {
            $data['cover_url'] = Storage::disk('public')->url($request->file('cover')->store('covers', 'public'));
        }

        return new MediaResource(Media::create($data));
    }

    public function update(UpdateMediaRequest $request, Media $media): MediaResource
    {
        $data = $request->safe()->except('cover');

        if ($request->hasFile('cover')) {
            if ($media->cover_url && str_starts_with($media->cover_url, '/storage/covers/')) {
                Storage::disk('public')->delete(substr($media->cover_url, strlen('/storage/')));
            }

            $data['cover_url'] = Storage::disk('public')->url($request->file('cover')->store('covers', 'public'));
        }

        $media->update($data);
        return new MediaResource($media->refresh());
    }

    public function destroy(Media $media): Response
    {
        if ($media->cover_url && str_starts_with($media->cover_url, '/storage/covers/')) {
            Storage::disk('public')->delete(substr($media->cover_url, strlen('/storage/')));
        }

        $media->delete();
        return response()->noContent();
    }
}
