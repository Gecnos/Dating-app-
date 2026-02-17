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
        $dir = public_path('uploads/media');
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }

        // Si c'est du base64 (Data URI)
        if (strpos($data, 'data:') === 0) {
            // Extraction du format et de l'extension
            preg_match('/data:([^;]+);base64,(.*)/', $data, $matches);
            
            if (count($matches) === 3) {
                $mimeType = $matches[1];
                $base64Content = $matches[2];
                
                $extension = explode('/', $mimeType)[1] ?? 'bin';
                // Cas spéciaux pour les extensions
                if ($extension === 'jpeg') $extension = 'jpg';
                if ($extension === 'plain') $extension = 'txt';
                if (strpos($extension, 'webm') !== false) $extension = 'webm';
                if (strpos($extension, 'wav') !== false) $extension = 'wav';

                $filename = uniqid() . '.' . $extension;
                $decodedData = base64_decode($base64Content);
                
                file_put_contents($dir . '/' . $filename, $decodedData);
                return '/uploads/media/' . $filename;
            }
        }
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
     * Supprime une image de Cloudinary.
     */
    public function deleteImage($url)
    {
        if (!$this->isCloudinaryConfigured() || strpos($url, 'cloudinary.com') === false) {
            return;
        }

        try {
            $parts = explode('/upload/', $url);
            if (count($parts) < 2) return;
            
            $pathParts = explode('/', $parts[1]);
            if (strpos($pathParts[0], 'v') === 0 && is_numeric(substr($pathParts[0], 1))) {
                array_shift($pathParts);
            }
            
            $idWithExtension = implode('/', $pathParts);
            $publicId = pathinfo($idWithExtension, PATHINFO_DIRNAME) . '/' . pathinfo($idWithExtension, PATHINFO_FILENAME);
            if ($publicId[0] === '/') $publicId = substr($publicId, 1);

            Cloudinary::destroy($publicId);
        } catch (\Exception $e) {
        }
    }
}
