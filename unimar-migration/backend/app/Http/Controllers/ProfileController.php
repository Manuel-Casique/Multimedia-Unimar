<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Update the user's profile photo.
     */
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'photo' => ['required', 'image', 'max:2048'], // Max 2MB
        ]);

        $user = $request->user();

        if ($request->file('photo')) {
            // Delete old photo if exists and stored locally (not a URL)
            if ($user->avatar && !filter_var($user->avatar, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('photo')->store('profile-photos', 'public');

            $user->update([
                'avatar' => $path,
            ]);

            return response()->json([
                'message' => 'Foto de perfil actualizada',
                'avatar_url' => Storage::url($path),
            ]);
        }

        return response()->json(['message' => 'No se proporcionó ninguna foto'], 400);
    }
}
