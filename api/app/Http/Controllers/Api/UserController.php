<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;

class UserController extends Controller
{
    public function store(StoreUserRequest $request): UserResource
    {
        $user = User::create($request->safe()->only(['name', 'email', 'password']));

        return new UserResource($user);
    }
}
