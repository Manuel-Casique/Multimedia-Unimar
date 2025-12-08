<?php
require './FPHP/conex.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['id'])) {
    $id = intval($_POST['id']);
    
    // Eliminar publicación (y posiblemente autores relacionados)
    $pdo->prepare("DELETE FROM mmu.publicacion_autor WHERE publicacion_id = ?")->execute([$id]);
    $pdo->prepare("DELETE FROM mmu.publicaciones WHERE id = ?")->execute([$id]);

    header("Location: admin_panel.php?page=ver-publicaciones&deleted=1");

    exit;
} else {
    echo "Acceso denegado.";
}
