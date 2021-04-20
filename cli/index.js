#!/usr/bin/env node

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

const fs = require('fs');
const yaml = require('js-yaml');
const { parse, stringify } = require('envfile')
const path = require('path');
const replace = require('replace-in-file');
let get_data = require('./get_data');

let create_project = (opt) => {
    file_log('--- Creating project')
    options = opt;
    if(fs.existsSync(options.name)) {
        let files = fs.readdirSync(options.name);
        if(files.length > 0) {
            file_log('Directory already exists and is not empty!');
            process.exit();
        }
    } else {
        fs.mkdirSync(options.name);
    }
    file_log('--- Created project directory');
    create_structure();
    create_files();
    file_log('--- Project created');
};

let create_structure = () => {
    file_log('--- Creating project structure');

    fs.mkdirSync(options.name + '/config');
    fs.mkdirSync(options.name + '/sources');
    fs.mkdirSync(options.name + '/sources/javascript');
    fs.mkdirSync(options.name + '/sources/sass');
    fs.mkdirSync(options.name + '/sources/gutenberg');

    file_log('--- Done');
}

let create_files = () => {
    create_package_json();
    create_style_css();
    create_docker();
    create_php_structure();
}

let create_package_json = () => {
    file_log('--- Creating package.json');
    let structure = {
        "name": options.name,
        "version": "1.0.0",
        "description": options.description,
        "main": "./sources/js/index.js",
        "scripts": {
            "develop": "netivo-scripts develop",
            "build": "netivo-scripts build"
        },
        "gutenberg": "Netivo/"+options.namespace+"/Theme/Admin/views/gutenberg",
        "author": "Netivo <biuro@netivo.pl> (http://netivo.pl)",
        "license": "ISC",
        "dependencies": {
            "@netivo/base-scripts": "git+ssh://git@github.com:netivo/base-scripts.git",
            "@netivo/scripts": "git+ssh://git@github.com:netivo/scripts.git",
        }
    }
    let json_string = JSON.stringify(structure, null, 2);
    fs.writeFileSync(options.name+'/package.json', json_string);
    file_log('--- Done');
}

let create_style_css = () => {
    file_log('--- Creating style.css');
    let style_css =
        "/**\n" +
        " * Theme Name: "+options.wordpress.themeName+"\n" +
        " * Author: Netivo\n" +
        " * Author URI: http://netivo.pl/\n" +
        " * Description: "+options.description+"\n" +
        " * Version: 1.0\n" +
        " * Text Domain: "+options.name+"\n" +
        " */";

    fs.writeFileSync(options.name+'/style.css', style_css);
    file_log('--- Done');
}

let create_docker = () => {
    file_log('--- Creating docker config');
    let docker_compose = {
        version: "3.8",
        services: {
            database: {
                image: "mysql:5.7",
                command: [
                    "--character-set-server=utf8",
                    "--collation-server=utf8_polish_ci"
                ],
                environment: {
                    MYSQL_DATABASE: "${MYSQL_DB}",
                    MYSQL_USER: "${MYSQL_USER}",
                    MYSQL_PASSWORD: "${MYSQL_PASSWORD}",
                    MYSQL_ROOT_PASSWORD: "${MYSQL_ROOT_PASSWORD}"
                },
                ports: ["3306:3306"],
                container_name: "${PROJECT_NAME}_db"
            },
            wordpress: {
                depends_on: ['database'],
                image: "wordpress:latest",
                container_name: "${PROJECT_NAME}_wp",
                extra_hosts: ["${WORDPRESS_HOST}:127.0.0.1"],
                ports: ["80:80"],
                volumes: [
                    ".:/var/www/html/wp-content/themes/test",
                    "${MU_PLUGINS_PATH}:/var/www/html/wp-content/mu-plugins"
                ],
                environment: {
                    WORDPRESS_DB_HOST: "database:3306",
                    WORDPRESS_DB_USER: "${MYSQL_USER}",
                    WORDPRESS_DB_PASSWORD: "${MYSQL_PASSWORD}",
                    WORDPRESS_DB_NAME: "${MYSQL_DB}"
                }
            },
            phpmyadmin: {
                depends_on: ['database'],
                image: "phpmyadmin/phpmyadmin",
                extra_hosts: ["${WORDPRESS_HOST}:127.0.0.1"],
                ports: ["8081:80"],
                environment: {
                    PMA_HOST: "database",
                    PMA_PORT: 3306,
                    PMA_ARBITRARY: 1
                },
                container_name: "${PROJECT_NAME}_phpmyadmin"
            }
        }
    }
    let data = yaml.dump(docker_compose);
    fs.writeFileSync(options.name+'/docker-compose.yml', data);

    let env_data = {
        PROJECT_NAME: options.name,
        WORDPRESS_HOST:options.wordpress.host,
        MYSQL_DB:options.mysql.name,
        MYSQL_USER:options.mysql.user,
        MYSQL_PASSWORD:options.mysql.password,
        MYSQL_ROOT_PASSWORD:options.mysql.rootPassword,
        MU_PLUGINS_PATH:options.wordpress.muPluginsPath,
    }

    let env_string = stringify(env_data);
    fs.writeFileSync(options.name+'/.env', env_string);
    file_log('--- Done');
}

let create_php_structure = () => {
    file_log('--- Creating Wordpress files');
    fs.mkdirSync(options.name + '/Netivo');
    fs.mkdirSync(options.name + '/Netivo/' + options.namespace);
    fs.mkdirSync(options.name + '/Netivo/' + options.namespace + '/Theme');
    fs.mkdirSync(options.name + '/Netivo/' + options.namespace + '/Theme/Admin');

    fs.copyFileSync(path.join( path.dirname( __dirname ), 'templates','index.php'), options.name + '/index.php');
    fs.copyFileSync(path.join( path.dirname( __dirname ), 'templates','header.php'), options.name + '/header.php');
    fs.copyFileSync(path.join( path.dirname( __dirname ), 'templates','footer.php'), options.name + '/footer.php');
    fs.copyFileSync(path.join( path.dirname( __dirname ), 'templates','functions.php'), options.name + '/functions.php');
    fs.copyFileSync(path.join( path.dirname( __dirname ), 'templates','class_main.php'), options.name + '/Netivo/'+options.namespace+'/Theme/Main.php');
    fs.copyFileSync(path.join( path.dirname( __dirname ), 'templates','class_panel.php'), options.name + '/Netivo/'+options.namespace+'/Theme/Admin/Panel.php');

    file_log('--- Done copying files');

    let search = [/\${PROJECT_NAME}/g, /\${DATE}/g, /\${NAMESPACE}/g, /\${NAMESPACE_STRING}/g, /\${CLASS_PATH}/g];
    let rep = [options.wordpress.themeName, (new Date()).toUTCString(), '\\Netivo\\'+options.namespace+'\\Theme', '\\\\Netivo\\\\'+options.namespace+'\\\\Theme', '/Netivo/'+options.namespace+'/Theme'];

    try {
        let result = replace.sync({
            files: options.name + '/**/*.php',
            from: search,
            to: rep
        });
        file_log('--- Done replacing values');
    } catch (error){
        file_log('--- Error during replacing values: '+error);
    }

}

let file_log = (log) => {
    console.log('[' + (new Date()).toISOString().slice(0, 19).replace(/-/g, "/").replace("T", " ") + '] ' + log);
};

get_data.init().then(create_project).catch(error => {
    file_log(error);
});