<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use App\Events\NewNotification;

class NotificationController extends Controller
{
    public function send(Request $request)
    {
        // dd($request->all());
        $notification = Notification::create([
            'title' => $request->title,
            'message' => $request->message,
            'user_id' => $request->user_id
        ]);

        event(new NewNotification($notification));

        return response()->json(['message' => 'Notification sent successfully']);
    }
}
