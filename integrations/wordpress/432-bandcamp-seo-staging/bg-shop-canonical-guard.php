<?php
/**
 * 432 Chamber Orchestra — BG Woo archive canonical guard, STAGING ONLY.
 * This is NOT an installed WordPress plugin or approved production change.
 * Target environment: WordPress multisite blog 1, PHP 7.4+, Polylang, WooCommerce, Yoast SEO.
 * It must not be injected, deployed or activated without separate production approval.
 */
if (!defined('ABSPATH')) {
    return;
}

/**
 * Pure deterministic route logic. Null means do not alter existing SEO output.
 *
 * @param string $request_uri Request URI (path + optional query string).
 * @param bool   $is_shop     True when WooCommerce identifies a shop archive.
 * @param string $language    Polylang language slug.
 * @param int    $blog_id     WordPress multisite blog ID.
 * @param string $home_url    Home URL from WordPress, not from request host.
 * @return string|null
 */
function c432_bg_shop_canonical_target($request_uri, $is_shop, $language, $blog_id, $home_url)
{
    if (!$is_shop || $language !== 'bg' || $blog_id !== 1) {
        return null;
    }
    if (!is_string($request_uri) || !is_string($home_url)) {
        return null;
    }
    $host = parse_url($home_url, PHP_URL_HOST);
    $scheme = parse_url($home_url, PHP_URL_SCHEME);
    if ($host !== '432hz-orchestra.com' || $scheme !== 'https') {
        return null;
    }
    $path = parse_url($request_uri, PHP_URL_PATH);
    if (!is_string($path)) {
        return null;
    }
    if (preg_match('#^/bg/shop/?$#D', $path)) {
        return rtrim($home_url, '/') . '/bg/shop/';
    }
    // Page 1 has its own canonical; a paginated archive stays on its matching page.
    if (preg_match('#^/bg/shop/page/([2-9]|[1-9][0-9]{1,3})/?$#D', $path, $match)) {
        return rtrim($home_url, '/') . '/bg/shop/page/' . $match[1] . '/';
    }
    return null;
}

/**
 * Read-only for all other routes. Preserve native Yoast output unless every
 * environment guard and an exact Bulgarian shop archive path match.
 */
function c432_bg_shop_filter_yoast_url($url)
{
    if (is_admin() || !function_exists('is_shop') || !function_exists('pll_current_language')) {
        return $url;
    }
    $target = c432_bg_shop_canonical_target(
        isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '',
        (bool) is_shop(),
        (string) pll_current_language('slug'),
        (int) get_current_blog_id(),
        (string) home_url('/')
    );
    return $target === null ? $url : $target;
}

if (function_exists('add_filter')) {
    add_filter('wpseo_canonical', 'c432_bg_shop_filter_yoast_url', 99);
    add_filter('wpseo_opengraph_url', 'c432_bg_shop_filter_yoast_url', 99);
}
