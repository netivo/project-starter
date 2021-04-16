module.exports = {
    init: () => {

        let options = {
            name: '',
            description: '',
            namespace: '',
            wordpress: {
                host: '',
                muPluginsPath: '',
                themeName: '',
            },
            mysql: {
                name: '',
                user: '',
                password: '',
                rootPassword: ''
            }
        };

        let prompt = require('prompts');
        let slugify = require('slugify');

        return new Promise((resolve, reject) => {
            let questions  = [
                {
                    type: 'text',
                    name: 'project_name',
                    message: 'What is project name?',
                    validate: value => {
                        let reg = /^[a-zA-Z_\-]*$/;
                        return reg.test(value);
                    }
                },
                {
                    type: 'text',
                    name: 'description',
                    message: 'What is the project description?'
                },
                {
                    type: 'text',
                    name: 'namespace',
                    message: 'What is the project main namespace?'
                },
                {
                    type: 'text',
                    name: 'wordpress_host',
                    message: 'What is the project local development host (eg. test.local)',
                    validate: value => {
                        let reg = /^[a-z\-.]*$/;
                        return reg.test(value);
                    }
                },
                {
                    type: 'text',
                    name: 'wordpress_theme_name',
                    message: 'What is the WP Theme name?'
                },
                {
                    type: 'text',
                    name: 'wordpress_mu_plugins_path',
                    message: 'What is the mu-plugins path?'
                },
                {
                    type: 'text',
                    name: 'mysql_name',
                    message: 'What is the mysql DB name?'
                },
                {
                    type: 'text',
                    name: 'mysql_user',
                    message: 'What is the mysql DB user?'
                },
                {
                    type: 'text',
                    name: 'mysql_password',
                    message: 'What is the mysql DB user password?'
                },
                {
                    type: 'text',
                    name: 'mysql_root_password',
                    message: 'What is the mysql root password?'
                },
            ];
            prompt(questions).then(val => {
                options.name = val.project_name;
                options.description = val.description;
                options.namespace = val.namespace;
                options.wordpress.host = val.wordpress_host;
                options.wordpress.muPluginsPath = val.wordpress_mu_plugins_path;
                options.wordpress.themeName = val.wordpress_theme_name;
                options.mysql.name = val.mysql_name;
                options.mysql.user = val.mysql_user;
                options.mysql.password = val.mysql_password;
                options.mysql.rootPassword = val.mysql_root_password;
                resolve(options);
            }).catch(error => {
                reject(error);
            });
        });
    }
};