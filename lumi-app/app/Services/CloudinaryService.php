<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class CloudinaryService
{
    /**
     * Télécharge une image sur Cloudinary ou localement et retourne l'URL.
     */
    public function uploadImage($imagePath, $applyBlur = false)
    {
        // Si Cloudinary n'est pas configuré (valeur par défaut dans le .env), on passe en local
        if (!$this->isCloudinaryConfigured()) {
            return $this->uploadLocal($imagePath);
        }

        try {
            $uploadedFile = Cloudinary::upload($imagePath, [
                'folder' => 'lumi_profiles',
            ]);

            $url = $uploadedFile->getSecurePath();

            if ($applyBlur) {
                return $this->getBlurredUrl($url);
            }

            return $url;
        } catch (\Exception $e) {
            // En cas d'erreur API, on se rabat aussi sur le local
            return $this->uploadLocal($imagePath);
        }
    }

    /**
     * Upload base64 encoded media to Cloudinary or local storage.
     */
    public function uploadBase64($base64Data)
    {
        if (!$this->isCloudinaryConfigured()) {
            return $this->uploadLocal($base64Data);
        }

        try {
            $uploadedFile = Cloudinary::upload($base64Data, [
                'folder' => 'lumi_media',
                'resource_type' => 'auto',
            ]);

            return $uploadedFile->getSecurePath();
        } catch (\Exception $e) {
            return $this->uploadLocal($base64Data);
        }
    }

    /**
     * Sauvegarde une image localement (fallback).
     */
    protected function uploadLocal($data)
    {
        $dir = public_path('uploads/profiles');
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }

        // Si c'est du base64
        if (strpos($data, 'data:image') === 0) {
            $format = explode('/', explode(':', substr($data, 0, strpos($data, ';')))[1])[1];
            $filename = uniqid() . '.' . $format;
            $data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $data));
            file_put_contents($dir . '/' . $filename, $data);
            return asset('uploads/profiles/' . $filename);
        }

        // Si c'est un chemin de fichier ou un objet UploadedFile
        // (Simplifié pour le besoin actuel du base64 dans l'onboarding)
        return $data; 
    }

    /**
     * Vérifie si Cloudinary est réellement configuré.
     */
    protected function isCloudinaryConfigured()
    {
        $url = config('cloudinary.cloudinary_url') ?: env('CLOUDINARY_URL');
        return $url && strpos($url, 'API_KEY') === false;
    }

    /**
     * Applique une transformation de flou.
     */
    public function getBlurredUrl($url)
    {
        if (strpos($url, 'cloudinary.com') !== false) {
            return str_replace('/upload/', '/upload/e_blur:2000/', $url);
        }
        
        // Pas de transformation de flou facile en local sans bibliothèque type Intervention Image
        return $url;
    }
}
