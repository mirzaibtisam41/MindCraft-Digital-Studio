const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtmlUtil({ value }) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}
