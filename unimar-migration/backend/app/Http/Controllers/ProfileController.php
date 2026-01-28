<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

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
            // Delete old photo if exists and is not a default/external one
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }

            $path = $request->file('photo')->store('profile-photos', 'public');
            
            $user->update([
                'profile_photo_path' => $path,
            ]);

            return response()->json([
                'message' => 'Profile photo updated successfully',
                'profile_photo_url' => Storage::url($path),
            ]);
        }

        return response()->json(['message' => 'No photo provided'], 400);
    }
}
