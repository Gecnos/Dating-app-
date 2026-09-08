<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\CloudinaryService;
use Illuminate\Support\Facades\DB;

class MigrateImagesToCloudinary extends Command
{
    protected $signature = 'lumi:migrate-images';
    protected $description = 'Migrate local images to Cloudinary and update database';

    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        parent::__construct();
        $this->cloudinary = $cloudinary;
    }

    public function handle()
    {
        $this->info('Starting image migration to Cloudinary...');

        $users = User::all();
        $bar = $this->output->createProgressBar(count($users));

        foreach ($users as $user) {
            // Migrate Avatar
            if ($user->avatar && strpos($user->avatar, 'cloudinary') === false && strpos($user->avatar, 'ui-avatars') === false) {
                // Check if file exists locally
                $localPath = public_path($user->avatar);
                // Handle relative paths starting with /
                if (!file_exists($localPath)) {
                    $localPath = public_path(ltrim($user->avatar, '/'));
                }

                if (file_exists($localPath) && is_file($localPath)) {
                    try {
                        $url = $this->cloudinary->uploadImage($localPath);
                        $user->avatar = $url;
                        $user->save();
                    } catch (\Exception $e) {
                        $this->error("Failed to upload avatar for user {$user->id}: " . $e->getMessage());
                    }
                }
            }

            // Migrate Photos
            foreach ($user->photos as $photo) {
                if ($photo->url && strpos($photo->url, 'cloudinary') === false) {
                    $localPath = public_path($photo->url);
                    if (!file_exists($localPath)) {
                        $localPath = public_path(ltrim($photo->url, '/'));
                    }

                    if (file_exists($localPath) && is_file($localPath)) {
                        try {
                            $url = $this->cloudinary->uploadImage($localPath);
                            $photo->url = $url;
                            $photo->save();
                        } catch (\Exception $e) {
                            $this->error("Failed to upload photo {$photo->id}: " . $e->getMessage());
                        }
                    }
                }
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Migration completed!');
    }
}
