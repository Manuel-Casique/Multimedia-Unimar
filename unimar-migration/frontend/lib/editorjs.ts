/**
 * Convierte JSON de EditorJS a HTML legible.
 * Si el contenido ya es HTML (no empieza con '{'), lo devuelve tal cual.
 */
export function editorJsToHtml(raw: string | null | undefined): string {
  if (!raw) return '';

  // Si ya es HTML plano, devolverlo tal cual
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return trimmed;

  try {
    const data = JSON.parse(trimmed);
    if (!data.blocks || !Array.isArray(data.blocks)) return trimmed;

    return data.blocks
      .map((block: any) => {
        const d = block.data || {};
        switch (block.type) {
          case 'paragraph':
            return `<p>${d.text || ''}</p>`;
          case 'header':
            const level = d.level || 2;
            return `<h${level}>${d.text || ''}</h${level}>`;
          case 'list': {
            const tag = d.style === 'ordered' ? 'ol' : 'ul';
            const items = (d.items || []).map((i: string) => `<li>${i}</li>`).join('');
            return `<${tag}>${items}</${tag}>`;
          }
          case 'image':
            const caption = d.caption ? `<figcaption>${d.caption}</figcaption>` : '';
            return `<figure><img src="${d.file?.url || d.url || ''}" alt="${d.caption || ''}" />${caption}</figure>`;
          case 'quote':
            return `<blockquote>${d.text || ''}</blockquote>`;
          case 'delimiter':
            return '<hr />';
          case 'code':
            return `<pre><code>${d.code || ''}</code></pre>`;
          case 'table': {
            const rows = (d.content || [])
              .map((row: string[]) => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`)
              .join('');
            return `<table>${rows}</table>`;
          }
          default:
            // Bloques desconocidos: intentar extraer text
            if (d.text) return `<p>${d.text}</p>`;
            return '';
        }
      })
      .filter(Boolean)
      .join('\n');
  } catch {
    // Si no es JSON válido, devolver el texto tal cual
    return trimmed;
  }
}

/**
 * Extrae solo el texto plano de un JSON de EditorJS,
 * útil para mostrar resúmenes/extractos en tarjetas.
 */
export function editorJsToPlainText(raw: string | null | undefined): string {
  if (!raw) return '';

  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) {
    // Quitar etiquetas HTML
    return trimmed.replace(/<[^>]*>/g, '');
  }

  try {
    const data = JSON.parse(trimmed);
    if (!data.blocks || !Array.isArray(data.blocks)) return trimmed;

    return data.blocks
      .map((block: any) => {
        const d = block.data || {};
        switch (block.type) {
          case 'paragraph':
          case 'header':
          case 'quote':
            return (d.text || '').replace(/<[^>]*>/g, '');
          case 'list':
            return (d.items || []).map((i: string) => i.replace(/<[^>]*>/g, '')).join('. ');
          case 'code':
            return d.code || '';
          default:
            return d.text ? d.text.replace(/<[^>]*>/g, '') : '';
        }
      })
      .filter(Boolean)
      .join(' ');
  } catch {
    return trimmed;
  }
}
