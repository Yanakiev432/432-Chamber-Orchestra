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
if (count($GLOBALS['filters_staged']) !== 2 ||
    !isset($GLOBALS['filters_staged']['wpseo_canonical']) ||
    !isset($GLOBALS['filters_staged']['wpseo_opengraph_url'])) {
    fwrite(STDERR, "FAIL: expected 2 Yoast hooks\n");
    exit(1);
}
echo "PASS: both Yoast hooks registered\n";
$count++;
echo "RESULT: $count PASS / 0 FAIL\n";
