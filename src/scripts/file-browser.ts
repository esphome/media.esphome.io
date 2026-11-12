// Client-side directory browser: the page is served for every directory URL,
// and this script renders the matching slice of the build-time file tree.

interface TreeItem {
  name: string;
  type: 'directory' | 'file';
  path: string;
  size?: number;
  prefix: string;
}

const container = document.getElementById('file-tree');
const titleEl = document.getElementById('page-title');
const headingEl = document.getElementById('files-heading');

function readTree(): TreeItem[] | null {
  try {
    const data = JSON.parse(container?.dataset.tree ?? 'null');
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

const fullFileTree = readTree();

if (!fullFileTree) {
  console.error('Invalid file tree data');
} else {
  const tree: TreeItem[] = fullFileTree;

  // Check if a path exists in the tree
  const pathExists = (path: string): boolean =>
    !path || tree.some((item) => item.path === path || item.path.startsWith(path + '/'));

  // Only items that are children of the base path (not the base path itself)
  const filterTree = (basePath: string): TreeItem[] =>
    basePath ? tree.filter((item) => item.path.startsWith(basePath + '/')) : tree;

  // Rebuild tree prefixes for the filtered items
  function rebuildPrefixes(items: TreeItem[], basePath: string): TreeItem[] {
    if (items.length === 0) return items;

    const getParentPath = (path: string): string => path.split('/').slice(0, -1).join('/');
    const relative = (path: string): string => (basePath ? path.slice(basePath.length + 1) : path);

    // The last sibling under each parent gets a corner connector
    const lastItems = new Set<string>();
    const itemsByParent: Record<string, TreeItem[]> = {};
    items.forEach((item: TreeItem): void => {
      (itemsByParent[getParentPath(item.path)] ??= []).push(item);
    });
    Object.values(itemsByParent).forEach((siblings: TreeItem[]): void => {
      lastItems.add(siblings[siblings.length - 1].path);
    });

    return items.map((item) => {
      const parts = relative(item.path).split('/');
      let currentPathBuild = basePath;
      let prefix = '';

      parts.forEach((part: string, i: number): void => {
        if (i === parts.length - 1) {
          prefix += lastItems.has(item.path) ? '└── ' : '├── ';
        } else {
          currentPathBuild += (currentPathBuild ? '/' : '') + part;
          prefix += lastItems.has(currentPathBuild) ? '    ' : '│   ';
        }
      });

      return { ...item, prefix };
    });
  }

  function navigateLink(link: HTMLAnchorElement, path: string): void {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState({ path }, '', path ? `/${path}/` : '/');
      navigateTo(path);
    });
  }

  function renderTree(items: TreeItem[], basePath: string): void {
    // If any required element is missing, do not proceed
    if (!container || !titleEl || !headingEl) {
      return;
    }

    // Update title and heading based on path
    if (basePath) {
      titleEl.textContent = `ESPHome Media: /${basePath}/`;
      headingEl.textContent = `Files in /${basePath}/`;
      document.title = `ESPHome Media: /${basePath}/`;
    } else {
      titleEl.textContent = 'ESPHome Media';
      headingEl.textContent = 'Available Files';
      document.title = 'ESPHome Media';
    }

    container.innerHTML = '';
    container.appendChild(document.createTextNode(`${basePath ? `${basePath}/` : 'assets/'}\n`));

    // Add parent directory link when in a subdirectory
    if (basePath) {
      const parentPath = basePath.split('/').slice(0, -1).join('/');
      const parentLink = document.createElement('a');
      parentLink.href = parentPath ? `/${parentPath}/` : '/';
      parentLink.className = 'directory';
      parentLink.textContent = '..';
      navigateLink(parentLink, parentPath);
      container.appendChild(document.createTextNode(items.length > 0 ? '├── ' : '└── '));
      container.appendChild(parentLink);
      container.appendChild(document.createTextNode('\n'));
    }

    items.forEach((item: TreeItem): void => {
      if (item.prefix) {
        container.appendChild(document.createTextNode(item.prefix));
      }

      const link = document.createElement('a');
      if (item.type === 'file') {
        link.href = `/${item.path}`;
        link.textContent = item.name;
        container.appendChild(link);
        container.appendChild(document.createTextNode(` (${((item.size ?? 0) / 1024).toFixed(2)} KB)\n`));
      } else {
        link.href = `/${item.path}/`;
        link.className = 'directory';
        link.textContent = item.name;
        navigateLink(link, item.path);
        container.appendChild(link);
        container.appendChild(document.createTextNode('\n'));
      }
    });

    // Show a message if no files/directories are found (excluding parent link)
    if (items.length === 0 && basePath) {
      container.appendChild(
        document.createTextNode(pathExists(basePath) ? '    (empty directory)\n' : '    (directory not found)\n'),
      );
    }
  }

  function navigateTo(path: string): void {
    renderTree(rebuildPrefixes(filterTree(path), path), path);
  }

  const currentPath = (): string => window.location.pathname.replace(/^\/|\/$/g, '');

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    navigateTo(event.state?.path ?? currentPath());
  });

  navigateTo(currentPath());
}
