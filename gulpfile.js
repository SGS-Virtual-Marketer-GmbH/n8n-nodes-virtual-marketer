const { src, dest } = require('gulp');

// Copies node/credential icons (png/svg) into the dist folder, preserving paths.
function buildIcons() {
	return src('nodes/**/*.{png,svg}').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
