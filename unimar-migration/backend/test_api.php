<?php

$baseUrl = 'http://localhost:8000/api';

function callApi($method, $url, $data = null) {
    global $baseUrl;
    $ch = curl_init($baseUrl . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "[$method] $url - Status: $httpCode\n";
    echo "Response: " . substr($response, 0, 500) . (strlen($response) > 500 ? "..." : "") . "\n\n";
}

echo "--- Probando API MMU ---\n\n";

// 1. Listar Publicaciones (Público)
callApi('GET', '/publications');

// 2. Ver Tipos de Publicación (Público)
callApi('GET', '/publication-types');

// 3. Probar IA (Requiere API Key válida, simularemos error o éxito según config)
// Nota: Si no hay API KEY real, esto fallará con 500, lo cual es útil para 'debuguear'
echo "Probando endpoint de IA (Mejorar texto)...\n";
callApi('POST', '/ai/improve', ['text' => 'hola mundo esta es una prueba de texto mal escribido']);

