
export function scrollIntoView(el) {
  if (typeof el.scrollIntoViewIfNeeded === 'function') {
    el.scrollIntoViewIfNeeded();
  } else {
    el.scrollIntoView({
      scrollMode: 'if-needed',
      block: 'nearest'
    });
  }
}

export function categoryChanged(currentTemplate, lastTemplate) {
  const currentCategory = currentTemplate && currentTemplate.category;
  const lastCategory = lastTemplate && lastTemplate.category;

  return (currentCategory && currentCategory.id) != (lastCategory && lastCategory.id);
}