<?php
require './FPHP/conex.php';

if (!isset($_GET['id'])) {
    echo "ID de publicación no proporcionado.";
    exit;
}

$id = intval($_GET['id']);

// Compatibilidad con ONLY_FULL_GROUP_BY
$pdo->exec("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))");

// Obtener datos de la publicación
$stmt = $pdo->prepare("
    SELECT p.*, 
           c.id AS miniatura_id, c.url AS miniatura_url,
           GROUP_CONCAT(DISTINCT u.id) AS autor_ids,
           GROUP_CONCAT(DISTINCT t.id) AS tipo_ids
    FROM mmu.publicaciones p
    LEFT JOIN mmu.publicacion_contenido pc ON pc.publicacion_id = p.id
    LEFT JOIN mmu.contenido c ON c.id = pc.contenido_id AND c.tipo_id = 4
    LEFT JOIN mmu.publicacion_autor pa ON pa.publicacion_id = p.id
    LEFT JOIN mmu.usuarios u ON u.id = pa.usuario_id
    LEFT JOIN mmu.publicacion_tipo pt ON pt.publicacion_id = p.id
    LEFT JOIN mmu.tipos_publicacion t ON t.id = pt.tipo_id
    WHERE p.id = ?
    GROUP BY p.id
");
$stmt->execute([$id]);
$pub = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$pub) {
    echo "Publicación no encontrada.";
    exit;
}

$usuarios = $pdo->query("SELECT id, CONCAT(nombre, ' ', apellido) AS nombre FROM mmu.usuarios")->fetchAll(PDO::FETCH_ASSOC);
$tipos = $pdo->query("SELECT id, nombre FROM mmu.tipos_publicacion")->fetchAll(PDO::FETCH_ASSOC);

// Procesar edición
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titulo = $_POST['titulo'];
    $descripcion = $_POST['descripcion'];
    $fecha = $_POST['fecha'];
    $autores = $_POST['autores'] ?? [];
    $tipos_pub = $_POST['tipos'] ?? [];

    $pdo->beginTransaction();

    // 1. Actualizar publicación
    $pdo->prepare("UPDATE mmu.publicaciones SET titulo=?, descripcion=?, fecha_publicacion=?, fecha_actualizacion=NOW() WHERE id=?")
        ->execute([$titulo, $descripcion, $fecha, $id]);

    // 2. Autores
    $pdo->prepare("DELETE FROM mmu.publicacion_autor WHERE publicacion_id=?")->execute([$id]);
    $stmtAutor = $pdo->prepare("INSERT INTO mmu.publicacion_autor (publicacion_id, usuario_id) VALUES (?, ?)");
    foreach ($autores as $uid) {
        $stmtAutor->execute([$id, $uid]);
    }

    // 3. Tipos
    $pdo->prepare("DELETE FROM mmu.publicacion_tipo WHERE publicacion_id=?")->execute([$id]);
    $stmtTipo = $pdo->prepare("INSERT INTO mmu.publicacion_tipo (publicacion_id, tipo_id) VALUES (?, ?)");
    foreach ($tipos_pub as $tid) {
        $stmtTipo->execute([$id, $tid]);
    }

    // 4. Imagen nueva (opcional)
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $tmp = $_FILES['imagen']['tmp_name'];
        $name = basename($_FILES['imagen']['name']);
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        $permitidas = ['jpg', 'jpeg', 'png', 'gif'];

        if (in_array($ext, $permitidas)) {
            $newName = uniqid('img_') . '.' . $ext;
            $destino = './Recursos/' . $newName;
            move_uploaded_file($tmp, $destino);

            // Insertar imagen
            $stmtCont = $pdo->prepare("INSERT INTO mmu.contenido (url, tipo_id, descripcion) VALUES (?, 4, ?)");
            $stmtCont->execute([$destino, "Miniatura para $titulo"]);
            $nuevoId = $pdo->lastInsertId();

            // Reemplazar miniatura
            $pdo->prepare("DELETE FROM mmu.publicacion_contenido WHERE publicacion_id=?")->execute([$id]);
            $pdo->prepare("INSERT INTO mmu.publicacion_contenido (publicacion_id, contenido_id) VALUES (?, ?)")->execute([$id, $nuevoId]);
        }
    }

    $pdo->commit();

    header("Location: admin_panel.php?page=editar-publicacion&id=$id&success=1");
    exit;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Editar Publicación</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
<div class="container my-4">
  <form method="POST" enctype="multipart/form-data" class="p-4 border rounded shadow-sm bg-light">
    <h3 class="mb-4">Editar Publicación</h3>

    <div class="row g-3 align-items-center">
      <div class="col-md-4">
        <label for="titulo" class="form-label">Título</label>
        <input type="text" id="titulo" name="titulo" class="form-control" required value="<?= htmlspecialchars($pub['titulo']) ?>">
      </div>
      <div class="col-md-3">
        <label for="fecha" class="form-label">Fecha de publicación</label>
        <input type="date" id="fecha" name="fecha" class="form-control" required value="<?= date('Y-m-d', strtotime($pub['fecha_publicacion'])) ?>">
      </div>
      <div class="col-md-5">
        <label for="imagen" class="form-label">Reemplazar imagen (opcional)</label>
        <input type="file" id="imagen" name="imagen" class="form-control" accept="image/*">
        <?php if ($pub['miniatura_url']): ?>
          <small class="text-muted">Actual:</small>
          <img src="<?= $pub['miniatura_url'] ?>" class="img-thumbnail mt-1" style="max-height: 100px;">
        <?php endif; ?>
      </div>
    </div>

    <div class="row g-3 mt-3 align-items-start">
      <div class="col-md-6">
        <label for="descripcion" class="form-label">Descripción</label>
        <textarea id="descripcion" name="descripcion" class="form-control" rows="4" required><?= htmlspecialchars($pub['descripcion']) ?></textarea>
      </div>

      <div class="col-md-3">
        <label for="tipos" class="form-label">Tipos de Publicación</label>
        <select id="tipos" name="tipos[]" class="form-select" multiple required size="4">
          <?php foreach ($tipos as $tipo): ?>
            <option value="<?= $tipo['id'] ?>" <?= in_array($tipo['id'], explode(',', $pub['tipo_ids'])) ? 'selected' : '' ?>>
              <?= htmlspecialchars($tipo['nombre']) ?>
            </option>
          <?php endforeach; ?>
        </select>
        <small class="text-muted">Ctrl/Cmd para varios</small>
      </div>

      <div class="col-md-3">
        <label for="autores" class="form-label">Autores</label>
        <select id="autores" name="autores[]" class="form-select" multiple required size="4">
          <?php foreach ($usuarios as $autor): ?>
            <option value="<?= $autor['id'] ?>" <?= in_array($autor['id'], explode(',', $pub['autor_ids'])) ? 'selected' : '' ?>>
              <?= htmlspecialchars($autor['nombre']) ?>
            </option>
          <?php endforeach; ?>
        </select>
        <small class="text-muted">Selecciona al menos uno</small>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12 text-end">
        <button type="submit" class="btn btn-success px-4">Guardar</button>
        <a href="admin_panel.php?page=ver-publicaciones" class="btn btn-secondary">Cancelar</a>
      </div>
    </div>
  </form>
</div>

<?php if (isset($_GET['success'])): ?>
<script>
  Swal.fire({
    icon: 'success',
    title: '¡Publicación actualizada!',
    text: 'Los cambios se guardaron correctamente.',
    confirmButtonColor: '#3085d6'
  });
</script>
<?php endif; ?>
</body>
</html>
