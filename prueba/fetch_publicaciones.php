<?php
require './FPHP/conex.php';

$year = $_GET['year'] ?? null;
$category = $_GET['category'] ?? null;
$search = $_GET['search'] ?? null;

$page = isset($_GET['page']) && is_numeric($_GET['page']) ? intval($_GET['page']) : 1;

$results_per_page = 3;
$offset = ($page - 1) * $results_per_page;

$sql_base = "FROM mmu.vista_publicaciones_completa WHERE 1=1 ";
$params = [];

if ($year) {
    $sql_base .= "AND YEAR(fecha_publicacion) = :year ";
    $params[':year'] = $year;
}

if ($category) {
    $sql_base .= "AND tipos LIKE :category ";
    $params[':category'] = "%$category%";
}

if ($search) {
    $sql_base .= "AND (titulo LIKE :search1 OR descripcion LIKE :search2 OR autores LIKE :search3 OR tipos LIKE :search4) ";
    $params[':search1'] = "%$search%";
    $params[':search2'] = "%$search%";
    $params[':search3'] = "%$search%";
    $params[':search4'] = "%$search%";
}

// TOTAL PARA PAGINACIÓN
$sql_count = "SELECT COUNT(*) AS total " . $sql_base;
$stmt_count = $pdo->prepare($sql_count);

// Bind para el conteo
foreach ($params as $key => $val) {
    $stmt_count->bindValue($key, $val);
}
$stmt_count->execute();
$total = $stmt_count->fetchColumn();
$totalPages = ceil($total / $results_per_page);

// DATOS DE PUBLICACIONES
$sql = "SELECT * " . $sql_base . "ORDER BY fecha_publicacion DESC LIMIT :limit OFFSET :offset";
$stmt = $pdo->prepare($sql);

// Bind para publicaciones
foreach ($params as $key => $val) {
    $stmt->bindValue($key, $val);
}
$stmt->bindValue(':limit', $results_per_page, PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

$stmt->execute();
$publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

// MOSTRAR PUBLICACIONES
foreach ($publicaciones as $pub): ?>
    <a href="detalles.php?id=<?=htmlspecialchars($pub['id'])?>" class="text-decoration-none text-dark">
        <div class="card mb-3">
            <div class="row g-0 align-items-center">
                <div class="col-auto">
                    <div class="card-img-placeholder">
                        <img src="<?=htmlspecialchars($pub['imagen'])?>" class="img-fluid full-img" alt="Imagen de la publicación">
                    </div>
                </div>
                <div class="col">
                    <div class="card-body d-flex flex-column justify-content-between h-100">
                        <h5 class="card-title mb-3 m-0" style="text-align: start;">
                            <?=htmlspecialchars($pub['titulo'])?>
                        </h5>
                        <p class="card-text"><?=htmlspecialchars($pub['descripcion'])?></p>
                        <div class="d-flex justify-content-between pt-2 small text-muted mt-4" style="font-size: 0.85rem;">
                            <span>Autor(es): <strong><?=htmlspecialchars($pub['autores'])?></strong></span>
                            <span>Año: <strong><?=date('Y', strtotime($pub['fecha_publicacion']))?></strong></span>
                            <span>Tipo(s): <strong><?=htmlspecialchars($pub['tipos'])?></strong></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a>
<?php endforeach; ?>

<!-- PAGINACIÓN -->
<?php if ($totalPages > 1): ?>
<nav aria-label="Page navigation example" class="d-flex justify-content-center mt-4">
    <ul class="pagination">
        <li class="page-item <?= ($page <= 1) ? 'disabled' : '' ?>">
            <a class="page-link" href="?<?= http_build_query(array_merge($_GET, ['page' => max(1, $page - 1)])) ?>"
               aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>
        </li>
        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
            <li class="page-item <?= ($i == $page) ? 'active' : '' ?>">
                <a class="page-link" href="?<?= http_build_query(array_merge($_GET, ['page' => $i])) ?>">
                    <?= $i ?>
                </a>
            </li>
        <?php endfor; ?>
        <li class="page-item <?= ($page >= $totalPages) ? 'disabled' : '' ?>">
            <a class="page-link" href="?<?= http_build_query(array_merge($_GET, ['page' => min($totalPages, $page + 1)])) ?>"
               aria-label="Next"><span aria-hidden="true">&raquo;</span></a>
        </li>
    </ul>
</nav>
<?php endif; ?>
