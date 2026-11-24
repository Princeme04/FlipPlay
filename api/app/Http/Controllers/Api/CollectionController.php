<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MediaResource;
use App\Http\Resources\UserResource;
use App\Models\Media;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CollectionController extends Controller
{
    public function index(User $user): AnonymousResourceCollection
    {
        return MediaResource::collection($user->mediaCollection()->latest('media_user.created_at')->paginate(15));
    }

    public function store(User $user, Media $media): UserResource
    {
        $user->mediaCollection()->syncWithoutDetaching([$media->id]);
        return new UserResource($user->load('mediaCollection'));
    }

    public function destroy(User $user, Media $media): UserResource
    {
        $user->mediaCollection()->detach($media->id);
        return new UserResource($user->load('mediaCollection'));
    }
}
