module.exports = function (grunt)
{
	grunt.initConfig(
	{
		pkg: grunt.file.readJSON('package.json'),
		settings:
		{
			srcFiles: ['src/**/*.js']
		},
		concat:
		{
			options:
			{
				separator: ';'
			},
			dist:
			{
				src: ['src/**/*.js'],
				dest: 'dist/<%= pkg.name %>.js'
			}
		},
		copy:
		{
			main:
			{
				files:
				[
					{ expand: true, cwd: 'src/', src: ['**/*.js'], dest: 'dist/'},
					{ expand: true, cwd: 'src/', src: ['**/*.js'], dest: 'demo/js/'}
				]
			}
		},
		jshint:
		{
			files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
			options:
			{
				// options here to override JSHint defaults
				globals:
				{
					jQuery: true,
					console: true,
					module: true,
					document: true
				}
			}
		},
		watch:
		{
			files: ['<%= settings.srcFiles %>'],
			tasks: ['jshint', 'copy']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['jshint', 'copy']);
};
