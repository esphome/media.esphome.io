---
layout: base.njk
title: ESPHome Media
---

# ESPHome Media

This server hosts static media files for ESPHome websites, code repositories, and related projects.

## Usage

All files in the assets directory are accessible via HTTPS at:

`https://media.esphome.io/<path-to-file>`

For example:
- `assets/images/logo.png` → `https://media.esphome.io/images/logo.png`
- `assets/css/styles.css` → `https://media.esphome.io/css/styles.css`

{{ assetsLicense }}

## Available Files

<pre class="file-tree">assets/
{% for item in fileTree -%}
{{ item.prefix }}{% if item.type == 'file' %}<a href="/{{ item.path }}">{{ item.name }}</a> ({{ (item.size / 1024) | round(2) }} KB){% else %}<span class="directory">{{ item.name }}</span>{% endif %}
{% endfor %}</pre>

---

*Powered by [11ty](https://www.11ty.dev/)*
