<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

$hasJob = Schema::hasColumn('users', 'job');
$cols = Schema::getColumnListing('users');

$output = "Has job: " . ($hasJob ? "YES" : "NO") . "\n";
$output .= "Columns: " . implode(", ", $cols) . "\n";

file_put_contents('db_result.txt', $output);
echo "Result written to db_result.txt\n";
