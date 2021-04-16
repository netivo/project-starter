<?php
/**
 *  Created by Netivo for ${PROJECT_NAME}
 *  Creator: Netivo
 *  Creation date: ${DATE}
 */
if (!defined('ABSPATH')) {
    header('HTTP/1.0 404 Forbidden');
    exit;
}

global $netivo_loader;
$netivo_loader->addIncludePath('${NAMESPACE_STRING}', get_stylesheet_directory());

${NAMESPACE}\Main::$admin_panel = ${NAMESPACE}\Admin\Panel::class;
${NAMESPACE}\Main::get_instance();
