const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

// FIX: too lazy to fix it the right way
delete colors.warmGray;
delete colors.lightBlue;
delete colors.coolGray;
delete colors.blueGray;
delete colors.trueGray;

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'media',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
		fontFamily: {
			sans: ['Proxima Nova', ...defaultTheme.fontFamily.sans]
		},
		colors: {
			primary: '#257fb4',
			...colors
		}
	},
	plugins: [require('tailwind-scrollbar')],
	variants: {
		scrollbar: ['dark']
	}
};
