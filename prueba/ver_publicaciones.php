<?php
require './FPHP/conex.php';

$stmt = $pdo->query("
    SELECT p.id, p.titulo, p.descripcion, p.fecha_publicacion,
           GROUP_CONCAT(CONCAT(u.nombre, ' ', u.apellido) SEPARATOR ', ') AS autores
    FROM mmu.publicaciones p
    LEFT JOIN mmu.publicacion_autor pa ON p.id = pa.publicacion_id
    LEFT JOIN mmu.usuarios u ON pa.usuario_id = u.id
    GROUP BY p.id
");

$publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ver Publicaciones</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css" rel="stylesheet">
</head>
<body class="p-4">

<div class="container-fluid px-3 py-4">
    <h2 class="mb-4">Listado de Publicaciones</h2>

    <!-- Barra de búsqueda 100% funcional -->
    <div class="mb-4">
    <div class="input-group w-100">
        <input type="text" id="searchInput" class="form-control" placeholder="Buscar..." aria-label="Buscar" style="height: 48px;">
        <button id="searchBtn" class="btn btn-primary d-flex align-items-center justify-content-center" type="button" style="height: 48px; width: 48px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" class="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.085.12l3.493 3.493a1 1 0 0 0 1.414-1.414l-3.493-3.493a1 1 0 0 0-.12-.085zM6.5 11A4.5 4.5 0 1 1 6.5 2a4.5 4.5 0 0 1 0 9"/>
        </svg>
        </button>
    </div>
    </div>


    <table id="tablaPublicaciones" class="table table-bordered table-striped">
        <thead class="thead-light">
            <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Fecha de Publicación</th>
                <th>Autores</th>
                <th>Acciones</th> 
            </tr>
        </thead>
        <tbody>
            <?php foreach ($publicaciones as $pub): ?>
            <tr>
                <td><?= $pub['id'] ?></td>
                <td><?= htmlspecialchars($pub['titulo']) ?></td>
                <td><?= htmlspecialchars($pub['descripcion']) ?></td>
                <td><?= date('Y-m-d', strtotime($pub['fecha_publicacion'])) ?></td>
                <td><?= htmlspecialchars($pub['autores']) ?></td>
                <td>
                    <div class="d-flex justify-content-center gap-2 flex-wrap">
                        <a href="admin_panel.php?page=editar-publicacion&id=<?= $pub['id'] ?>"
                           class="btn btn-sm btn-primary flex-fill text-center"
                           style="max-width: 7.5rem; min-width: 7.5rem;">
                           <i class="fas fa-edit me-1"></i> Editar
                        </a>

                        <form class="form-eliminar-publicacion" action="eliminar_publicacion.php" method="POST">
                            <input type="hidden" name="id" value="<?= $pub['id'] ?>">
                            <button type="submit"
                                    class="btn btn-sm btn-danger flex-fill text-center"
                                    style="max-width: 7.5rem; min-width: 7.5rem;">
                                <i class="fas fa-trash-alt me-1"></i> Eliminar
                            </button>
                        </form>
                    </div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<!-- JS scripts -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
    let tabla;

    $(document).ready(function() {
        tabla = $('#tablaPublicaciones').DataTable({
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            },
            dom: 'tp'
        });

        $('#searchBtn').on('click', function() {
            const value = $('#searchInput').val();
            tabla.search(value).draw();
        });

        $('#searchInput').on('keyup', function(e) {
            if (e.key === 'Enter') {
                $('#searchBtn').click();
            }
        });
    });

    // SweetAlert para eliminación
    document.addEventListener('DOMContentLoaded', function () {
        const forms = document.querySelectorAll('.form-eliminar-publicacion');

        forms.forEach(form => {
            form.addEventListener('submit', function (e) {
                e.preventDefault(); // Evita el envío inmediato

                Swal.fire({
                    title: '¿Estás seguro?',
                    text: 'Esta acción no se puede deshacer.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        form.submit(); // Envía el formulario solo si confirmó
                    }
                });
            });
        });
    });

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('deleted') === '1') {
        Swal.fire({
            icon: 'success',
            title: '¡Publicación eliminada!',
            text: 'La publicación fue eliminada correctamente.',
            confirmButtonColor: '#3085d6'
        });
        }
</script>

</body>
</html>
