---
layout: base.njk
title: ESPHome Media
---

<h1 id="page-title">ESPHome Media</h1>

<div id="intro-section">
This server hosts static media files for ESPHome websites, code repositories, and related projects.

## Usage

All files in the assets directory are accessible via HTTPS at:

`https://media.esphome.io/<path-to-file>`

For example:
- `assets/images/logo.png` → `https://media.esphome.io/images/logo.png`
- `assets/css/styles.css` → `https://media.esphome.io/css/styles.css`

{{ assetsLicense }}
</div>

## <span id="files-heading">Available Files</span>

<pre class="file-tree" id="file-tree"></pre>

<script>
(function() {
  // Full file tree data from build
  const fullFileTree = {{ fileTree | dump | safe }};

  // Get current path from URL (remove leading/trailing slashes)
  const currentPath = window.location.pathname.replace(/^\/|\/$/g, '');

  // Filter file tree based on current path
  function filterTree(tree, basePath) {
    if (!basePath) {
      return tree;
    }

    // Filter to only items that are children of the base path (not the base path itself)
    const filtered = tree.filter(item => {
      return item.path.startsWith(basePath + '/');
    });

    return filtered;
  }

  // Rebuild tree prefixes for filtered items
  function rebuildPrefixes(items, basePath) {
    if (items.length === 0) return items;

    // Build a hierarchical structure to compute correct prefixes
    const result = [];

    // Group items by their parent directory
    function getDepth(path, base) {
      const relativePath = base ? path.slice(base.length + 1) : path;
      if (!relativePath) return 0;
      return relativePath.split('/').length;
    }

    function getParentPath(path) {
      const parts = path.split('/');
      parts.pop();
      return parts.join('/');
    }

    // Track which items are last in their parent
    const itemsByParent = {};
    items.forEach(item => {
      const parent = getParentPath(item.path);
      if (!itemsByParent[parent]) {
        itemsByParent[parent] = [];
      }
      itemsByParent[parent].push(item);
    });

    // Mark last items
    const lastItems = new Set();
    Object.values(itemsByParent).forEach(siblings => {
      if (siblings.length > 0) {
        lastItems.add(siblings[siblings.length - 1].path);
      }
    });

    // Compute prefix for each item
    items.forEach(item => {
      const depth = getDepth(item.path, basePath);
      let prefix = '';

      if (depth > 0) {
        // Build prefix based on ancestry
        const parts = (basePath ? item.path.slice(basePath.length + 1) : item.path).split('/');
        let currentPathBuild = basePath || '';

        for (let i = 0; i < parts.length; i++) {
          if (i === parts.length - 1) {
            // Current item
            const isLast = lastItems.has(item.path);
            prefix += isLast ? '└── ' : '├── ';
          } else {
            // Ancestor
            currentPathBuild += (currentPathBuild ? '/' : '') + parts[i];
            const isLast = lastItems.has(currentPathBuild);
            prefix += isLast ? '    ' : '│   ';
          }
        }
      }

      result.push({
        ...item,
        prefix: prefix
      });
    });

    return result;
  }

  // Render the file tree
  function renderTree(items, basePath) {
    const container = document.getElementById('file-tree');
    const titleEl = document.getElementById('page-title');
    const headingEl = document.getElementById('files-heading');

    // Update title and heading based on path
    if (basePath) {
      titleEl.textContent = `ESPHome Media: /${basePath}/`;
      headingEl.textContent = `Files in /${basePath}/`;
      document.title = `ESPHome Media: /${basePath}/`;
    } else {
      headingEl.textContent = 'Available Files';
      document.title = 'ESPHome Media';
    }

    // Clear previous content
    container.innerHTML = '';

    // Build root label
    const rootLabel = basePath ? `${basePath.split('/').pop()}/` : 'assets/';
    const rootLabelNode = document.createTextNode(`${rootLabel}\n`);
    container.appendChild(rootLabelNode);

    // Add file/directory entries
    items.forEach(item => {
      if (item.prefix) {
        container.appendChild(document.createTextNode(item.prefix));
      }

      if (item.type === 'file') {
        const link = document.createElement('a');
        link.href = `/${item.path}`;
        link.textContent = item.name;
        container.appendChild(link);

        const sizeKB = (item.size / 1024).toFixed(2);
        container.appendChild(document.createTextNode(` (${sizeKB} KB)\n`));
      } else {
        const link = document.createElement('a');
        link.href = `/${item.path}/`;
        link.className = 'directory';
        link.dataset.dir = item.path;
        link.textContent = item.name;

        // Add click handler for client-side navigation
        link.addEventListener('click', (e) => {
          e.preventDefault();
          history.pushState(null, '', `/${item.path}/`);
          navigateTo(item.path);
        });

        container.appendChild(link);
        container.appendChild(document.createTextNode('\n'));
      }
    });
  }

  // Navigate to a path and update the view
  function navigateTo(path) {
    const filtered = filterTree(fullFileTree, path);
    const rebuilt = rebuildPrefixes(filtered, path);
    renderTree(rebuilt, path);
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    navigateTo(path);
  });

  // Initial render
  navigateTo(currentPath);
})();
</script>

---

*Powered by [11ty](https://www.11ty.dev/)*
