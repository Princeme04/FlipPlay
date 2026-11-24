<?php

use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\UserController;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::apiResource('media', MediaController::class)->parameters(['media' => 'media']);

Route::get('/users', fn () => UserResource::collection(User::query()->with('mediaCollection')->paginate(15)));
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{user}', fn (User $user) => new UserResource($user->load('mediaCollection')));
Route::get('/users/{user}/collection', [CollectionController::class, 'index']);
Route::post('/users/{user}/collection/{media}', [CollectionController::class, 'store']);
Route::delete('/users/{user}/collection/{media}', [CollectionController::class, 'destroy']);
