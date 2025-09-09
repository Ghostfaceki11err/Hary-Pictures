import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');
const appTsxPath = path.join(srcDir, 'App.tsx');

const BASE_URL = (process.argv.find(a => a.startsWith('--base='))?.split('=')[1]) || process.env.SITEMAP_BASE_URL || 'https://harypictures.netlify.app';

function toIsoDate(d) {
	return new Date(d).toISOString().split('T')[0];
}

async function fileMtime(filePath) {
	try {
		const stat = await fs.stat(filePath);
		return stat.mtime;
	} catch {
		return new Date();
	}
}

async function ensureDir(dir) {
	await fs.mkdir(dir, { recursive: true });
}

async function readText(file) {
	try {
		return await fs.readFile(file, 'utf8');
	} catch {
		return '';
	}
}

function uniquePaths(paths) {
	return Array.from(new Set(paths));
}

async function extractRoutesFromAppTsx() {
	const content = await readText(appTsxPath);
	if (!content) return [];
	// Match <Route path="/about" ... /> or <Route path='/about'
	const routeRegex = /<Route\s+path=\s*["']([^"']+)["']/g;
	const routes = [];
	let match;
	while ((match = routeRegex.exec(content)) !== null) {
		routes.push(match[1]);
	}
	return routes;
}

async function deriveRoutes() {
	let routes = await extractRoutesFromAppTsx();

	// Fallback: scan src/pages style folders if exist
	const pagesDir = path.join(srcDir, 'pages');
	try {
		const entries = await fs.readdir(pagesDir, { withFileTypes: true });
		for (const e of entries) {
			if (e.isFile() && /\.(tsx|jsx|ts|js|html)$/.test(e.name)) {
				const base = e.name.replace(/index\.(tsx|jsx|ts|js|html)$/i, '').replace(/\.(tsx|jsx|ts|js|html)$/i, '');
				if (base) routes.push(`/${base}`);
				else routes.push('/');
			}
		}
	} catch {}

	// Fallback: check dist for additional html files besides index
	try {
		const entries = await fs.readdir(distDir, { withFileTypes: true });
		for (const e of entries) {
			if (e.isFile() && e.name.endsWith('.html') && e.name !== 'index.html') {
				routes.push('/' + e.name.replace(/\.html$/, ''));
			}
		}
	} catch {}

	// Always include root
	if (!routes.includes('/')) routes.unshift('/');

	// Filter out admin or private routes
	routes = routes.filter(r => !r.startsWith('/admin'));

	return uniquePaths(routes);
}

async function buildUrlEntries(routes) {
	const entries = [];
	for (const route of routes) {
		const loc = `${BASE_URL.replace(/\/$/, '')}${route === '/' ? '/' : route}`;
		// Use mtime from a representative source file if possible
		let mtimeCandidate = appTsxPath;
		if (route !== '/') {
			// try component file match by name (About.tsx => /about)
			const componentName = route.replace(/^\//, '').replace(/\/.*/, '');
			const candidate = path.join(srcDir, 'components', `${componentName.charAt(0).toUpperCase()}${componentName.slice(1)}.tsx`);
			try { await fs.access(candidate); mtimeCandidate = candidate; } catch {}
		}
		const mtime = await fileMtime(mtimeCandidate);
		let priority = 0.7;
		let changefreq = 'monthly';
		if (route === '/') { priority = 1.0; changefreq = 'weekly'; }
		if (route === '/portfolio') { priority = 0.9; changefreq = 'weekly'; }
		if (route === '/about' || route === '/services') { priority = 0.8; }
		entries.push({ loc, lastmod: toIsoDate(mtime), changefreq, priority });
	}
	return entries;
}

function toXml(entries) {
	const urls = entries.map(e => `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`).join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
	try {
		await ensureDir(publicDir);
		const routes = await deriveRoutes();
		const entries = await buildUrlEntries(routes);
		const xml = toXml(entries);
		const outPath = path.join(publicDir, 'sitemap.xml');
		await fs.writeFile(outPath, xml, 'utf8');
		console.log(`Sitemap written: ${outPath}`);
		console.log(`Base URL: ${BASE_URL}`);
	} catch (err) {
		console.error('Failed to generate sitemap:', err);
		process.exit(1);
	}
}

main();
