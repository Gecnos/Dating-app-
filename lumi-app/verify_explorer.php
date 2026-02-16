<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Auth;

$me = User::first();
Auth::login($me);

echo "Testing Explorer Logic...\n";
echo "Current User: " . $me->name . " (ID: " . $me->id . ")\n";

// Mock a request
$request = new \Illuminate\Http\Request([
    'age_min' => 18,
    'age_max' => 60,
    'distance' => 100
]);

$query = User::with(['intention', 'photos'])->where('id', '!=', $me->id);

// Duplicate logic from Controller for verification
if ($request->filled('age_min')) {
    $query->whereRaw('EXTRACT(YEAR FROM AGE(date_of_birth)) >= ?', [$request->age_min]);
}
if ($request->filled('age_max')) {
    $query->whereRaw('EXTRACT(YEAR FROM AGE(date_of_birth)) <= ?', [$request->age_max]);
}

if ($me->latitude && $me->longitude) {
    $query->select('*')
          ->selectRaw("round((ST_DistanceSphere(ST_MakePoint(longitude, latitude), ST_MakePoint(?, ?)) / 1000)::numeric, 1) as distance_km", [
              $me->longitude, $me->latitude
          ]);
}

$profiles = $query->limit(5)->get();

echo "Found " . $profiles->count() . " profiles matching basic filters.\n";

foreach ($profiles as $profile) {
    echo "- " . $profile->name . ": Age " . ($profile->date_of_birth ? \Carbon\Carbon::parse($profile->date_of_birth)->age : 'N/A') . ", Distance " . ($profile->distance_km ?? 'N/A') . " km\n";
}

echo "\nVerification complete.\n";
