const fs = require('fs');
const path = require('path');

module.exports = function(eleventyConfig) {
  // Copy assets directory contents to root of output
  eleventyConfig.addPassthroughCopy({ "assets": "/" });

  // Add date filter for formatting dates
  eleventyConfig.addFilter("date", (value, format) => {
    const date = value === 'now' ? new Date() : new Date(value);
    if (format === 'YYYY' || format === 'Y') {
      return date.getFullYear();
    }
    return date.toLocaleDateString();
  });

  // Add a global data function to get the file tree
  eleventyConfig.addGlobalData("fileTree", () => {
    const assetsDir = path.join(__dirname, 'assets');

    // Function to recursively build file tree
    function buildTree(dir, prefix = '') {
      let tree = [];

      if (!fs.existsSync(dir)) {
        return tree;
      }

      const items = fs.readdirSync(dir, { withFileTypes: true });

      items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const itemPath = path.join(dir, item.name);
        const relativePath = path.relative(assetsDir, itemPath);

        if (item.isDirectory()) {
          tree.push({
            name: item.name,
            type: 'directory',
            path: relativePath,
            prefix: prefix + (isLast ? '└── ' : '├── ')
          });

          const children = buildTree(itemPath, prefix + (isLast ? '    ' : '│   '));
          tree = tree.concat(children);
        } else {
          const stats = fs.statSync(itemPath);
          tree.push({
            name: item.name,
            type: 'file',
            path: relativePath,
            size: stats.size,
            prefix: prefix + (isLast ? '└── ' : '├── ')
          });
        }
      });

      return tree;
    }

    return buildTree(assetsDir);
  });

  // Add a global data function to get the assets license content
  eleventyConfig.addGlobalData("assetsLicense", () => {
    const licensePath = path.join(__dirname, 'assets', 'LICENSE.md');

    if (!fs.existsSync(licensePath)) {
      return '';
    }

    // Read the license file and increment all heading levels by 1
    const content = fs.readFileSync(licensePath, 'utf8');
    // Replace # with ##, ## with ###, etc. (using word boundary to prevent cascading)
    return content
      .replace(/^#### /gm, '##### ')
      .replace(/^### /gm, '#### ')
      .replace(/^## /gm, '### ')
      .replace(/^# /gm, '## ');
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
