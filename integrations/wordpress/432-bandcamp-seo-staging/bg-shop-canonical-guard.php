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
function c432_bg_shop_runtime_target()
{
    if (is_admin() || !function_exists('is_shop') || !function_exists('pll_current_language')) {
        return null;
    }
    // Refuse incoming host aliases; WordPress home_url alone does not prove the actual request host.
    if (!isset($_SERVER['HTTP_HOST']) || $_SERVER['HTTP_HOST'] !== '432hz-orchestra.com') {
        return null;
    }
    return c432_bg_shop_canonical_target(
        isset($_SERVER['REQUEST_URI']) ? (string) $_SERVER['REQUEST_URI'] : '',
        (bool) is_shop(),
        (string) pll_current_language('slug'),
        (int) get_current_blog_id(),
        (string) home_url('/')
    );
}

function c432_bg_shop_filter_yoast_url($url)
{
    $target = c432_bg_shop_runtime_target();
    return $target === null ? $url : $target;
}

/**
 * Yoast 19.8 also emits a linked Schema.org JSON-LD graph.
 * On the Bulgarian Woo archive, WebPage, ImageObject and BreadcrumbList
 * references may still point to the English archive. Repair only URLs
 * that equal the incorrectly emitted English shop URL, have its fragment,
 * or match the English page-2 route of this same archive.
 *
 * Never rewrite general /en/ links, website/organization identifiers,
 * media URLs, product permalinks or an unrelated schema graph.
 */
function c432_bg_shop_rewrite_schema_refs($value, $target)
{
    if (is_array($value)) {
        foreach ($value as $key => $entry) {
            $value[$key] = c432_bg_shop_rewrite_schema_refs($entry, $target);
        }
        return $value;
    }
    if (!is_string($value)) {
        return $value;
    }

    $english_root = 'https://432hz-orchestra.com/en/shop/';
    if ($value === $english_root || strpos($value, $english_root . '#') === 0) {
        return $target . substr($value, strlen($english_root));
    }

    // Yoast may also use the English paginated URL on archive page 2.
    if (preg_match('#^https://432hz-orchestra\.com/en/shop/page/([2-9]|[1-9][0-9]{1,3})/(\#.*)?$#D', $value)) {
        $fragment_pos = strpos($value, '#');
        return $target . ($fragment_pos === false ? '' : substr($value, $fragment_pos));
    }
    return $value;
}

function c432_bg_shop_filter_schema_graph($graph)
{
    $target = c432_bg_shop_runtime_target();
    if ($target === null || !is_array($graph)) {
        return $graph;
    }
    return c432_bg_shop_rewrite_schema_refs($graph, $target);
}

if (function_exists('add_filter')) {
    add_filter('wpseo_canonical', 'c432_bg_shop_filter_yoast_url', 99);
    add_filter('wpseo_opengraph_url', 'c432_bg_shop_filter_yoast_url', 99);
    add_filter('wpseo_schema_graph', 'c432_bg_shop_filter_schema_graph', 99);
}
