<?php
require './FPHP/conex.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $titulo = $_POST['titulo'] ?? '';
        $descripcion = $_POST['descripcion'] ?? '';
        $fecha = $_POST['fecha'] ?? '';
        $tipos = $_POST['tipos'] ?? [];
        $autores = $_POST['autores'] ?? [];

        // Validar campos obligatorios aquí si quieres

        // Procesar imagen subida
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $tmp_name = $_FILES['imagen']['tmp_name'];
            $name = basename($_FILES['imagen']['name']);
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'gif'];

            if (!in_array($ext, $allowed)) {
                throw new Exception("Formato de imagen no permitido.");
            }

            $newFileName = uniqid('img_') . '.' . $ext;
            $uploadDir = './Recursos/'; // Asegúrate que esta carpeta existe y tiene permisos
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            $destination = $uploadDir . $newFileName;

            if (!move_uploaded_file($tmp_name, $destination)) {
                throw new Exception("Error al mover la imagen subida.");
            }
        } else {
            throw new Exception("Debe subir una imagen.");
        }

        // Insertar publicación
        $pdo->beginTransaction();

        $stmtPub = $pdo->prepare("INSERT INTO mmu.publicaciones (titulo, descripcion, fecha_publicacion) VALUES (?, ?, ?)");
        $stmtPub->execute([$titulo, $descripcion, $fecha]);
        $publicacionId = $pdo->lastInsertId();

        // Insertar contenido (miniatura)
        $tipoMiniatura = 4; // miniatura
        $stmtCont = $pdo->prepare("INSERT INTO mmu.contenido (url, tipo_id, descripcion) VALUES (?, ?, ?)");
        $descMini = "Miniatura para $titulo";
        $stmtCont->execute([$destination, $tipoMiniatura, $descMini]);
        $contenidoId = $pdo->lastInsertId();

        // Relacionar contenido con publicación
        $stmtPubCont = $pdo->prepare("INSERT INTO mmu.publicacion_contenido (publicacion_id, contenido_id) VALUES (?, ?)");
        $stmtPubCont->execute([$publicacionId, $contenidoId]);

        // Insertar tipos de publicación
        $stmtTipo = $pdo->prepare("INSERT INTO mmu.publicacion_tipo (publicacion_id, tipo_id) VALUES (?, ?)");
        foreach ($tipos as $tipo) {
            $stmtTipo->execute([$publicacionId, $tipo]);
        }

        // Insertar autores
        $stmtAutor = $pdo->prepare("INSERT INTO mmu.publicacion_autor (publicacion_id, usuario_id) VALUES (?, ?)");
        foreach ($autores as $autor) {
            $stmtAutor->execute([$publicacionId, $autor]);
        }

        $pdo->commit();

        header('Location: admin_panel.php?page=agregar-publicacion&success=1');
        exit;
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        // Loguear error si quieres
        header('Location: admin_panel.php?page=agregar-publicacion&error=1');
        exit;
    }
} else {
    header('Location: admin_panel.php?page=agregar-publicacion');
    exit;
}
