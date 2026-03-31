<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    private $diskName;
    private $backupName;

    public function __construct()
    {
        $this->diskName = env('BACKUP_DISK', config('backup.backup.destination.disks')[0] ?? 'local');
        $this->backupName = config('backup.backup.name');
    }

    public function index()
    {
        try {
            $disk = Storage::disk($this->diskName);
            $files = $disk->files($this->backupName);
            $backups = [];

            foreach ($files as $file) {
                if (pathinfo($file, PATHINFO_EXTENSION) === 'zip') {
                    $backups[] = [
                        'name' => basename($file),
                        'size' => $this->formatSize($disk->size($file)),
                        'date' => date('d M, H:i', $disk->lastModified($file)),
                        'timestamp' => $disk->lastModified($file),
                        'status' => 'Completado'
                    ];
                }
            }

            usort($backups, function ($a, $b) {
                return $b['timestamp'] <=> $a['timestamp'];
            });

            return response()->json([
                'success' => true,
                'data' => $backups,
                'disk' => $this->diskName
            ]);
        } catch (\Exception $e) {
            Log::error("Error reading backups from {$this->diskName}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al leer los respaldos',
                'data' => []
            ], 500);
        }
    }

    public function store()
    {
        try {
            // If a backup is already running, reject the request
            if (Cache::get('backup_status') === 'running') {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya hay un respaldo en progreso. Por favor espera a que termine.'
                ], 429);
            }

            // Mark as running immediately so the frontend can start polling
            Cache::put('backup_status', 'running', now()->addMinutes(30));

            // Launch as a background OS process (no queue worker needed)
            $phpBinary = PHP_BINARY ?: 'php';
            $artisan = base_path('artisan');
            $cmd = sprintf('%s %s backup:unimar > /dev/null 2>&1 &', $phpBinary, $artisan);
            exec($cmd);

            return response()->json([
                'success' => true,
                'message' => 'El respaldo ha comenzado en segundo plano.'
            ]);
        } catch (\Exception $e) {
            Cache::forget('backup_status');
            Log::error("Backup creation failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar respaldo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Return the current status of the backup process.
     * Used by the frontend for polling.
     */
    public function status()
    {
        $status = Cache::get('backup_status', 'idle');

        return response()->json([
            'success' => true,
            'status' => $status, // idle | running | completed | failed
        ]);
    }

    /**
     * Check if the Laravel scheduler (schedule:work) is running.
     * Looks for the process in the OS process list.
     */
    public function schedulerStatus()
    {
        $active = false;

        try {
            // Works on Linux (Docker container environment)
            $output = shell_exec('ps aux 2>/dev/null || true');
            if ($output && (
                str_contains($output, 'schedule:work') ||
                str_contains($output, 'schedule:run')
            )) {
                $active = true;
            }
        } catch (\Throwable $e) {
            // Ignore — can't detect on this platform
        }

        return response()->json([
            'success' => true,
            'active' => $active,
        ]);
    }

    /**
     * Get backup schedule settings.
     */
    public function getSchedule()
    {
        $time = Setting::getValue('backup_time', '03:00');

        return response()->json([
            'success' => true,
            'backup_time' => $time,
        ]);
    }

    /**
     * Update backup schedule settings.
     */
    public function updateSchedule(Request $request)
    {
        $request->validate([
            'backup_time' => ['required', 'regex:/^([01]\d|2[0-3]):([0-5]\d)$/'],
        ]);

        Setting::setValue('backup_time', $request->backup_time);

        return response()->json([
            'success' => true,
            'message' => 'Hora de respaldo automático actualizada.',
            'backup_time' => $request->backup_time,
        ]);
    }

    public function download($filename)
    {
        $filename = basename($filename);
        $filepath = $this->backupName . '/' . $filename;

        $disk = Storage::disk($this->diskName);

        if ($disk->exists($filepath)) {
            if ($this->diskName === 's3') {
                $url = $disk->temporaryUrl(
                    $filepath, now()->addMinutes(5)
                );
                return response()->json(['success' => true, 'url' => $url]);
            }

            return $disk->download($filepath);
        }

        return response()->json(['success' => false, 'message' => 'Archivo no encontrado'], 404);
    }
    
    public function destroy($filename)
    {
        $filename = basename($filename);
        $filepath = $this->backupName . '/' . $filename;

        $disk = Storage::disk($this->diskName);

        if ($disk->exists($filepath)) {
            $disk->delete($filepath);
            return response()->json(['success' => true, 'message' => 'Respaldo eliminado']);
        }

        return response()->json(['success' => false, 'message' => 'Archivo no encontrado'], 404);
    }

    private function formatSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 1) . ' ' . $units[$pow];
    }
}
