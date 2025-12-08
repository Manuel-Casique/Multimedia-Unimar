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

    return ['code' => $httpCode, 'response' => $response];
}

echo "--- Probando IA de MMU (Gemini) ---\n\n";

$textToImprove = "hola manuel como estas espero que bien estamos probando la inteligencia artificial";
echo "Enviando texto para mejorar:\n'$textToImprove'\n\n";

$result = callApi('POST', '/ai/improve', ['text' => $textToImprove]);

echo "Status: " . $result['code'] . "\n";
$json = json_decode($result['response'], true);
if (isset($json['message'])) {
    echo "ERROR DETALLADO: " . $json['message'] . "\n";
} else {
    echo "Respuesta:\n" . substr($result['response'], 0, 1000) . "\n";
}

file_put_contents('last_response.txt', $result['response']);
echo "Response saved to last_response.txt\n";

if ($result['code'] == 500) {
    echo "\n[SUGERENCIA] Si el error menciona 'Found', prueba cambiar el modelo en .env a 'gemini-1.5-flash'\n";
}

