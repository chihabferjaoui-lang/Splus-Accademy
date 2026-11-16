function goToApply(program) {
  const url = new URL("apply.html", window.location.href);
  url.searchParams.set("program", program);
  window.location.href = url.href;
}
