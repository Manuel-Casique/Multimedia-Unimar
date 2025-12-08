<?php
require './FPHP/conex.php';

try {
    $stmt = $pdo->query("SELECT id, CONCAT(nombre, ' ', apellido) AS nombre_completo FROM mmu.usuarios ORDER BY nombre_completo ASC");
    $autores = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $autores = [];
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Agregar Publicación</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <?php if (isset($_GET['success'])): ?>
<script>
Swal.fire({
  icon: 'success',
  title: '¡Publicación agregada!',
  text: 'La publicación fue registrada correctamente.',
  confirmButtonColor: '#3085d6'
});
</script>
<?php elseif (isset($_GET['error'])): ?>
<script>
Swal.fire({
  icon: 'error',
  title: 'Error al guardar',
  text: 'Ocurrió un problema al registrar la publicación.',
  confirmButtonColor: '#d33'
});
</script>
<?php endif; ?>

<div style="width: 100%; padding-left: 1rem; padding-right: 1rem; padding-top: 0.5rem; padding-bottom: 1rem;">
  <form action="insert_publicacion.php" method="POST" enctype="multipart/form-data" 
        class="p-3 border rounded shadow-sm" style="background-color: #f8f9fa;" 
        onsubmit="return validarFormulario()">

    <h3 class="mb-4">Agregar Publicación</h3>

    <div class="row g-3 align-items-center">
      <!-- Título -->
      <div class="col-12 col-md-4">
        <label for="titulo" class="form-label">Título</label>
        <input type="text" id="titulo" name="titulo" class="form-control" required>
      </div>

      <!-- Fecha -->
      <div class="col-12 col-md-3">
        <label for="fecha" class="form-label">Fecha de publicación</label>
        <input type="date" id="fecha" name="fecha" class="form-control" required>
      </div>

      <!-- Imagen -->
      <div class="col-12 col-md-5">
        <label for="imagen" class="form-label">Imagen de la publicación</label>
        <input type="file" id="imagen" name="imagen" class="form-control" accept="image/*" required>
      </div>
    </div>

    <!-- NUEVA FILA para alinear Descripción + Tipos + Autores -->
    <div class="row g-3 mt-3 align-items-start">
      <!-- Descripción -->
      <div class="col-12 col-md-6">
        <label for="descripcion" class="form-label">Descripción</label>
        <textarea id="descripcion" name="descripcion" class="form-control" rows="4" required></textarea>
      </div>

      <!-- Tipos de publicación -->
      <div class="col-12 col-md-3">
        <label for="tipos" class="form-label">Tipos de Publicación</label>
        <select id="tipos" name="tipos[]" class="form-select" multiple required size="4">
          <option value="1">Artículo</option>
          <option value="2">Evento</option>
          <option value="3">Noticia</option>
          <option value="4">Acto de grado</option>
          <option value="5">Curso extracurricular</option>
        </select>
        <small class="text-muted">Ctrl/Cmd para varios.</small>
      </div>

      <!-- Autores -->
      <div class="col-12 col-md-3">
        <label for="autores" class="form-label">Autores</label>
        <select id="autores" name="autores[]" class="form-select" multiple required size="4">
          <?php
            require './FPHP/conex.php';
            $stmt = $pdo->query("SELECT id, nombre, apellido FROM mmu.usuarios");
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                echo "<option value='{$row['id']}'>{$row['nombre']} {$row['apellido']}</option>";
            }
          ?>
        </select>
        <small class="text-muted">Selecciona al menos uno.</small>
      </div>
    </div>

    <!-- Botón -->
    <div class="row mt-3">
      <div class="col-12 text-end">
        <button type="submit" class="btn btn-primary px-4">Guardar</button>
      </div>
    </div>
  </form>
</div>



  <script>
    function validarFormulario() {
      const tipos = document.getElementById('tipos');
      const autores = document.getElementById('autores');

      const tiposSeleccionados = [...tipos.options].some(option => option.selected);
      const autoresSeleccionados = [...autores.options].some(option => option.selected);

      if (!tiposSeleccionados) {
        Swal.fire({
          icon: 'warning',
          title: 'Falta tipo de publicación',
          text: 'Debes seleccionar al menos un tipo de publicación.'
        });
        return false;
      }

      if (!autoresSeleccionados) {
        Swal.fire({
          icon: 'warning',
          title: 'Faltan autores',
          text: 'Debes seleccionar al menos un autor.'
        });
        return false;
      }

      return true;
    }
  </script>
</body>
</html>
