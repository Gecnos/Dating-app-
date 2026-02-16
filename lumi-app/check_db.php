<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

$hasJob = Schema::hasColumn('users', 'job');
echo $hasJob ? "JOB_EXISTS\n" : "JOB_MISSING\n";
if (!$hasJob) {
    echo "Columns: " . implode(', ', Schema::getColumnListing('users')) . "\n";
}
