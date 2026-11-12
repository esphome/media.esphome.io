import fs from 'node:fs';
import path from 'node:path';

export interface FileTreeItem {
  name: string;
  type: 'directory' | 'file';
  path: string;
  size?: number;
  prefix: string;
}

const assetsDir = path.resolve('assets');

/** Recursively build a flat, ordered list of the assets directory with tree prefixes. */
export function buildFileTree(dir: string = assetsDir, prefix = ''): FileTreeItem[] {
  if (!fs.existsSync(dir)) {
    return [];
  }

  let tree: FileTreeItem[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach((item: fs.Dirent, index: number): void => {
    const isLast = index === items.length - 1;
    const itemPath = path.join(dir, item.name);
    const relativePath = path.relative(assetsDir, itemPath).split(path.sep).join('/');

    if (item.isDirectory()) {
      tree.push({
        name: item.name,
        type: 'directory',
        path: relativePath,
        prefix: prefix + (isLast ? '└── ' : '├── '),
      });
      tree = tree.concat(buildFileTree(itemPath, prefix + (isLast ? '    ' : '│   ')));
    } else {
      tree.push({
        name: item.name,
        type: 'file',
        path: relativePath,
        size: fs.statSync(itemPath).size,
        prefix: prefix + (isLast ? '└── ' : '├── '),
      });
    }
  });

  return tree;
}
