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

export function sanitizeImageUrl(url) {

  if (url && /^(https?|data):/.test(url)) {
    return url;
  }

  return null;
}