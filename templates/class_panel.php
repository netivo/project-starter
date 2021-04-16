<?php
/**
 *  Created by Netivo for ${PROJECT_NAME}
 *  Creator: Netivo
 *  Creation date: ${DATE}
 */

namespace ${NAMESPACE}\Admin;

use Netivo\Core\Admin\Page;
use \Netivo\Core\Admin\Panel as Admin;

class Panel extends Admin
{
    protected function set_vars()
    {
        $this->include_path = get_stylesheet_directory().'${CLASS_PATH}/Admin';
        $this->uri = get_stylesheet_directory_uri().'${CLASS_PATH}/Admin';

        Page::$pages_path['${NAMESPACE_STRING}\\Admin\\Page'] = get_stylesheet_directory().'/';
    }

    protected function init()
    {
    }

    protected function custom_header(){}
}