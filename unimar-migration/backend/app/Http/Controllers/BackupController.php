<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
    private $backupDir;

    public function __construct()
    {
        $this->backupDir = storage_path('app/backups');
        if (!File::exists($this->backupDir)) {
            File::makeDirectory($this->backupDir, 0755, true);
        }
    }

    public function index()
    {
        $files = File::files($this->backupDir);
        $backups = [];

        foreach ($files as $file) {
            if ($file->getExtension() === 'sql') {
                $backups[] = [
                    'name' => $file->getFilename(),
                    'size' => $this->formatSize($file->getSize()),
                    'date' => date('d M, H:i', $file->getMTime()),
                    'timestamp' => $file->getMTime(),
                    'status' => 'Completado'
                ];
            }
        }

        // Sort by timestamp descending
        usort($backups, function ($a, $b) {
            return $b['timestamp'] <=> $a['timestamp'];
        });

        return response()->json([
            'success' => true,
            'data' => $backups
        ]);
    }

    public function store()
    {
        try {
            $dbName = env('DB_DATABASE');
            $dbUser = env('DB_USERNAME');
            $dbPass = env('DB_PASSWORD');
            $dbHost = env('DB_HOST', '127.0.0.1');
            $dbPort = env('DB_PORT', '3306');

            $filename = 'backup_unimar_' . date('Ymd_His') . '.sql';
            $filepath = $this->backupDir . '/' . $filename;

            // Find mysqldump path (fallback for Laragon Windows environments)
            $mysqldumpPath = 'mysqldump';
            if (File::exists('C:\laragon\bin\mysql')) {
                // Find mysqldump.exe inside laragon
                $dirs = glob('C:\laragon\bin\mysql\*\bin\mysqldump.exe');
                if (!empty($dirs)) {
                    $mysqldumpPath = '"' . $dirs[0] . '"';
                }
            }

            // Construct mysqldump command
            $passwordOption = empty($dbPass) ? '' : "-p\"{$dbPass}\"";
            $command = "{$mysqldumpPath} -h {$dbHost} -P {$dbPort} -u {$dbUser} {$passwordOption} {$dbName} > \"{$filepath}\" 2>&1";

            // Execute
            exec($command, $output, $returnVar);

            if ($returnVar !== 0) {
                Log::error("Mysqldump failed: " . implode("\n", $output));
                throw new \Exception("El comando mysqldump falló. Código: {$returnVar}");
            }

            // Ensure file was created
            if (!File::exists($filepath) || File::size($filepath) == 0) {
                throw new \Exception("El archivo de respaldo no se generó o está vacío.");
            }

            return response()->json([
                'success' => true,
                'message' => 'Respaldo generado exitosamente',
                'file' => $filename
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar respaldo: ' . $e->getMessage()
            ], 500);
        }
    }

    public function download($filename)
    {
        $filepath = $this->backupDir . '/' . $filename;

        if (File::exists($filepath)) {
            return Response::download($filepath);
        }

        return response()->json(['success' => false, 'message' => 'Archivo no encontrado'], 404);
    }
    
    public function destroy($filename)
    {
        $filepath = $this->backupDir . '/' . $filename;

        if (File::exists($filepath)) {
            File::delete($filepath);
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
