<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
    private $diskName;
    private $backupName;

    public function __construct()
    {
        // Usa S3 si tienes credenciales, sino cae a local (usando la config general de Laravel/Spatie)
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

            // Order by timestamp descending
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
            // Llama a nuestro wrapper personalizado de Artisan de forma asincrónica si quieres que la API no se quede colgada
            // O directamente para esperar el resultado. Un backup con archivos a S3 puede tardar minutos,
            // por lo que es mejor devolver que inició y en background se corra.
            
            // Para el backend de PHP es común dispararlo por la cola de trabajos, pero si quieres algo simple ahora:
            // Usamos runInBackground si es Windows o exec indirecto, pero artisan queue es mejor.
            
            // Llama al schedule o directo (esperará que termine)
            Artisan::call('backup:unimar');

            return response()->json([
                'success' => true,
                'message' => 'Respaldo generado exitosamente.'
            ]);
        } catch (\Exception $e) {
            Log::error("Backup creation failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al generar respaldo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function download($filename)
    {
        // Sanitizar el filename para evitar Directory Traversal (solo nos quedamos con el nombre del archivo)
        $filename = basename($filename);
        $filepath = $this->backupName . '/' . $filename;

        $disk = Storage::disk($this->diskName);

        if ($disk->exists($filepath)) {
            // Si es Amazon S3, devuelve una URL temporal firmada para descarga directa desde AWS
            if ($this->diskName === 's3') {
                $url = $disk->temporaryUrl(
                    $filepath, now()->addMinutes(5)
                );
                return response()->json(['success' => true, 'url' => $url]);
            }

            // Si es local, lo descarga de manera convencional
            return $disk->download($filepath);
        }

        return response()->json(['success' => false, 'message' => 'Archivo no encontrado'], 404);
    }
    
    public function destroy($filename)
    {
        // Sanitizar nombre de archivo
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
