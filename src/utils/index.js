
export function scrollIntoView(el) {
  el.scrollIntoViewIfNeeded();
}

export function categoryChanged(currentTemplate, lastTemplate) {
  const currentCategory = currentTemplate && currentTemplate.category;
  const lastCategory = lastTemplate && lastTemplate.category;

  return (currentCategory && currentCategory.id) != (lastCategory && lastCategory.id);
}