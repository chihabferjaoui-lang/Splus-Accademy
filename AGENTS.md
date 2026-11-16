# Project instructions

- This is a static, multi-page site built with HTML, CSS, and vanilla JavaScript. Keep changes framework-free and do not add dependencies or build tooling unless requested.
- Make page-specific changes in the relevant HTML file. The homepage, booking, application, and level-test pages contain their own styles and scripts; do not assume edits to `css/style.css` or `js/main.js` affect them.
- `css/style.css` is shared by `programs.html` and `blog.html`. `js/main.js` is loaded by `programs.html` and provides the program-to-application navigation. Check where a shared file is loaded before changing it.
- Preserve the homepage translation system: keep existing `data-i18n` keys aligned with the translation dictionary and update every supported language when changing translated copy.
- Preserve page navigation, URL query parameters, form submission destinations, and contact links unless the requested change requires otherwise. Keep relative asset and page links valid from the repository root.
- Follow the existing visual style and responsive layouts. Use semantic HTML, accessible names for interactive controls, and the page's existing interaction patterns.
- There is no package manifest or automated test suite. After changes, inspect the affected page in a browser when available and exercise the changed navigation, form, or interactive flow; do not assume a build or test command exists.
