<?php
/** Standalone offline checks, no WordPress bootstrapping or requests. */
define('ABSPATH', __DIR__ . '/');
$GLOBALS['filters_staged'] = [];
function add_filter($hook, $callback, $priority = 10) {
    $GLOBALS['filters_staged'][$hook] = $callback;
}
require __DIR__ . '/bg-shop-canonical-guard.php';

$tests = [
    ['BG main archive', '/bg/shop/', true, 'bg', 1, 'https://432hz-orchestra.com/', 'https://432hz-orchestra.com/bg/shop/'],
    ['BG main archive no slash', '/bg/shop', true, 'bg', 1, 'https://432hz-orchestra.com/', 'https://432hz-orchestra.com/bg/shop/'],
    ['BG archive page 2', '/bg/shop/page/2/', true, 'bg', 1, 'https://432hz-orchestra.com/', 'https://432hz-orchestra.com/bg/shop/page/2/'],
    ['BG archive page 3 with query', '/bg/shop/page/3/?utm_campaign=hi', true, 'bg', 1, 'https://432hz-orchestra.com/', 'https://432hz-orchestra.com/bg/shop/page/3/'],
    ['EN shop not changed', '/en/shop/', true, 'en', 1, 'https://432hz-orchestra.com/', null],
    ['Curated BG shop page not changed', '/bg/магазин/', false, 'bg', 1, 'https://432hz-orchestra.com/', null],
    ['BG /shop but no Woo archive', '/bg/shop/', false, 'bg', 1, 'https://432hz-orchestra.com/', null],
    ['Wrong multisite blog', '/bg/shop/', true, 'bg', 2, 'https://432hz-orchestra.com/', null],
    ['Wrong host', '/bg/shop/', true, 'bg', 1, 'https://example.com/', null],
    ['Insecure home URL', '/bg/shop/', true, 'bg', 1, 'http://432hz-orchestra.com/', null],
    ['Invalid pagination zero', '/bg/shop/page/0/', true, 'bg', 1, 'https://432hz-orchestra.com/', null],
    ['Invalid pagination negative', '/bg/shop/page/-1/', true, 'bg', 1, 'https://432hz-orchestra.com/', null],
    ['Other Bulgarian product', '/bg/product/bach-air/', false, 'bg', 1, 'https://432hz-orchestra.com/', null],
];
$count = 0;
foreach ($tests as $test) {
    [$label, $path, $shop, $lang, $blog, $home, $expected] = $test;
    $actual = c432_bg_shop_canonical_target($path, $shop, $lang, $blog, $home);
    if ($actual !== $expected) {
        fwrite(STDERR, "FAIL: $label\nExpected: " . var_export($expected, true) . "\nGot: " . var_export($actual, true) . "\n");
        exit(1);
    }
    echo "PASS: $label\n";
    $count++;
}
if (count($GLOBALS['filters_staged']) !== 3 ||
    !isset($GLOBALS['filters_staged']['wpseo_canonical']) ||
    !isset($GLOBALS['filters_staged']['wpseo_opengraph_url']) ||
    !isset($GLOBALS['filters_staged']['wpseo_schema_graph'])) {
    fwrite(STDERR, "FAIL: expected 3 Yoast hooks\n");
    exit(1);
}
echo "PASS: all three Yoast hooks registered\n";
$count++;
echo "BASELINE RESULT: $count PASS / 0 FAIL\n";

/** Independent stubs for wrapper-level tests. Never query a real WP instance. */
function is_admin() { return false; }
function is_shop() { return $GLOBALS['test_is_shop'] ?? false; }
function pll_current_language($arg) { return $GLOBALS['test_language'] ?? 'en'; }
function get_current_blog_id() { return $GLOBALS['test_blog_id'] ?? 1; }
function home_url($suffix) { return $GLOBALS['test_home_url'] ?? 'https://432hz-orchestra.com/'; }

$GLOBALS['test_is_shop'] = true;
$GLOBALS['test_language'] = 'bg';
$GLOBALS['test_blog_id'] = 1;
$_SERVER['REQUEST_URI'] = '/bg/shop/';
$_SERVER['HTTP_HOST'] = '432hz-orchestra.com';

$en = 'https://432hz-orchestra.com/en/shop/';
$bg = 'https://432hz-orchestra.com/bg/shop/';
$original = [
    ['@type' => 'WebPage', '@id' => $en, 'url' => $en,
      'isPartOf' => ['@id' => 'https://432hz-orchestra.com/bg/#website'],
      'primaryImageOfPage' => ['@id' => $en . '#primaryimage']],
    ['@type' => 'ImageObject', '@id' => $en . '#primaryimage',
      'url' => 'https://i0.wp.com/432hz-orchestra.com/wp-content/image.jpg'],
    ['@type' => 'BreadcrumbList', '@id' => $en . '#breadcrumb'],
];
$g1 = c432_bg_shop_filter_schema_graph($original);
if ($g1[0]['@id'] !== $bg || $g1[0]['url'] !== $bg ||
    $g1[0]['primaryImageOfPage']['@id'] !== $bg . '#primaryimage' ||
    $g1[1]['@id'] !== $bg . '#primaryimage' ||
    $g1[1]['url'] !== $original[1]['url'] ||
    $g1[2]['@id'] !== $bg . '#breadcrumb' ||
    $g1[0]['isPartOf'] !== $original[0]['isPartOf']) {
    fwrite(STDERR, "FAIL: BG page 1 nested Schema.org correction\n");
    exit(1);
}
echo "PASS: BG page 1 JSON-LD graph scoped rewrite\n";
$count++;

$_SERVER['REQUEST_URI'] = '/bg/shop/page/2/';
$p2 = 'https://432hz-orchestra.com/bg/shop/page/2/';
$e2 = 'https://432hz-orchestra.com/en/shop/page/2/';
$g2 = c432_bg_shop_filter_schema_graph($original);
if ($g2[0]['@id'] !== $p2 || $g2[0]['url'] !== $p2 ||
    $g2[0]['primaryImageOfPage']['@id'] !== $p2 . '#primaryimage' ||
    $g2[1]['@id'] !== $p2 . '#primaryimage' ||
    $g2[2]['@id'] !== $p2 . '#breadcrumb') {
    fwrite(STDERR, "FAIL: BG page 2 schema remains EN shop\n");
    exit(1);
}
echo "PASS: BG page 2 JSON-LD current URL rewrite\n";
$count++;
if (c432_bg_shop_rewrite_schema_refs(['@id' => $e2, 'fragment' => $e2 . '#breadcrumb'], $p2)
    !== ['@id' => $p2, 'fragment' => $p2 . '#breadcrumb']) {
    fwrite(STDERR, "FAIL: BG page 2 referenced English pagination\n");
    exit(1);
}
echo "PASS: English paginated schema references corrected\n";
$count++;

$GLOBALS['test_language'] = 'en';
$no_change = c432_bg_shop_filter_schema_graph($original);
if ($no_change !== $original) {
    fwrite(STDERR, "FAIL: EN language graph must stay unchanged\n");
    exit(1);
}
echo "PASS: EN language unchanged\n";
$count++;

$GLOBALS['test_language'] = 'bg';
$GLOBALS['test_blog_id'] = 2;
$no_change = c432_bg_shop_filter_schema_graph($original);
if ($no_change !== $original) {
    fwrite(STDERR, "FAIL: other multisite blog graph must stay unchanged\n");
    exit(1);
}
echo "PASS: other multisite site unchanged\n";
$count++;

$GLOBALS['test_blog_id'] = 1;
$GLOBALS['test_is_shop'] = false;
$no_change = c432_bg_shop_filter_schema_graph($original);
if ($no_change !== $original) {
    fwrite(STDERR, "FAIL: non-shop route graph must stay unchanged\n");
    exit(1);
}
echo "PASS: non-archive page unchanged\n";
$count++;


/** v9: exact HTTP_HOST scope tests; no WordPress state or network. */
$GLOBALS['test_is_shop'] = true;
$GLOBALS['test_language'] = 'bg';
$GLOBALS['test_blog_id'] = 1;
$_SERVER['REQUEST_URI'] = '/bg/shop/';
foreach (['evil.invalid', 'www.432hz-orchestra.com', '432hz-orchestra.com:443', ''] as $noncanonical) {
    $_SERVER['HTTP_HOST'] = $noncanonical;
    if (c432_bg_shop_runtime_target() !== null) {
        fwrite(STDERR, "FAIL: unexpected HTTP_HOST accepted\n"); exit(1);
    }
    echo "PASS: unexpected HTTP_HOST rejected\n"; $count++;
}
unset($_SERVER['HTTP_HOST']);
if (c432_bg_shop_runtime_target() !== null) {
    fwrite(STDERR, "FAIL: absent HTTP_HOST accepted\n"); exit(1);
}
echo "PASS: absent HTTP_HOST rejected\n"; $count++;
$_SERVER['HTTP_HOST'] = '432hz-orchestra.com';
if (c432_bg_shop_runtime_target() !== 'https://432hz-orchestra.com/bg/shop/') {
    fwrite(STDERR, "FAIL: exact canonical HTTP_HOST rejected\n"); exit(1);
}
echo "PASS: exact canonical HTTP_HOST accepted\n"; $count++;

echo "FULL RESULT: $count PASS / 0 FAIL\n";

