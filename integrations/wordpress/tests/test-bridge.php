<?php
// No real WordPress site or customer data is loaded by this isolated test.
error_reporting( E_ALL );
define( 'ABSPATH', __DIR__ . '/' );
$GLOBALS['c432_hooks'] = array();
function add_action( $hook, $callback, $priority = 10 ) { $GLOBALS['c432_hooks'][] = array($hook,$callback,$priority); }
function absint( $value ) { return abs( (int) $value ); }
function esc_url( $value ) { return htmlspecialchars( $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' ); }
function esc_html( $value ) { return htmlspecialchars( $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' ); }
function get_the_ID() { return isset( $GLOBALS['c432_id'] ) ? $GLOBALS['c432_id'] : 0; }
function get_locale() { return 'en_US'; }
function pll_get_post_language( $id ) { return in_array( $id, array( 796, 807, 811, 813, 815, 817, 819, 821, 823, 904, 921, 923, 930, 935, 940, 942, 944, 946, 948, 950, 952, 955, 957 ), true ) ? 'bg' : 'en'; }
function pll_current_language() { return 'en'; }
function wp_register_style() {}
function wp_enqueue_style() {}
function wp_add_inline_style() {}
require __DIR__ . '/../432-bandcamp-bridge/432-bandcamp-bridge.php';

function assert_c432( $condition, $message ) {
    if ( ! $condition ) { fwrite( STDERR, "FAIL: {$message}\n" ); exit( 1 ); }
}

$map = c432_bandcamp_map();
assert_c432( 46 === count( $map ), 'must map exactly 46 Polylang product posts' );
assert_c432( 23 === count( array_unique( array_values( $map ) ) ), '23 distinct Bandcamp purchase targets' );
assert_c432( '' === c432_bandcamp_url( 999999 ), 'unmapped product has no CTA' );
foreach ( $map as $id => $url ) {
    assert_c432( $url === c432_bandcamp_url( $id ), "correct url for {$id}" );
    assert_c432( 0 === strpos( $url, 'https://432orchestra.bandcamp.com/' ), "official domain for {$id}" );
}
assert_c432( c432_bandcamp_url(769) === c432_bandcamp_url(796), '769/796 translation pair' );
assert_c432( c432_bandcamp_url(806) === c432_bandcamp_url(807), '806/807 translation pair' );
assert_c432( c432_bandcamp_url(810) === c432_bandcamp_url(811), '810/811 translation pair' );
assert_c432( c432_bandcamp_url(812) === c432_bandcamp_url(813), '812/813 translation pair' );
assert_c432( c432_bandcamp_url(814) === c432_bandcamp_url(815), '814/815 translation pair' );
assert_c432( c432_bandcamp_url(816) === c432_bandcamp_url(817), '816/817 translation pair' );
assert_c432( c432_bandcamp_url(818) === c432_bandcamp_url(819), '818/819 translation pair' );
assert_c432( c432_bandcamp_url(820) === c432_bandcamp_url(821), '820/821 translation pair' );
assert_c432( c432_bandcamp_url(822) === c432_bandcamp_url(823), '822/823 translation pair' );
assert_c432( c432_bandcamp_url(898) === c432_bandcamp_url(904), '898/904 translation pair' );
assert_c432( c432_bandcamp_url(919) === c432_bandcamp_url(921), '919/921 translation pair' );
assert_c432( c432_bandcamp_url(922) === c432_bandcamp_url(923), '922/923 translation pair' );
assert_c432( c432_bandcamp_url(924) === c432_bandcamp_url(930), '924/930 translation pair' );
assert_c432( c432_bandcamp_url(931) === c432_bandcamp_url(935), '931/935 translation pair' );
assert_c432( c432_bandcamp_url(937) === c432_bandcamp_url(940), '937/940 translation pair' );
assert_c432( c432_bandcamp_url(941) === c432_bandcamp_url(942), '941/942 translation pair' );
assert_c432( c432_bandcamp_url(943) === c432_bandcamp_url(944), '943/944 translation pair' );
assert_c432( c432_bandcamp_url(945) === c432_bandcamp_url(946), '945/946 translation pair' );
assert_c432( c432_bandcamp_url(947) === c432_bandcamp_url(948), '947/948 translation pair' );
assert_c432( c432_bandcamp_url(949) === c432_bandcamp_url(950), '949/950 translation pair' );
assert_c432( c432_bandcamp_url(951) === c432_bandcamp_url(952), '951/952 translation pair' );
assert_c432( c432_bandcamp_url(953) === c432_bandcamp_url(955), '953/955 translation pair' );
assert_c432( c432_bandcamp_url(956) === c432_bandcamp_url(957), '956/957 translation pair' );
assert_c432( 'bg' === c432_bandcamp_lang( 807 ), 'Polylang BG' );
assert_c432( 'en' === c432_bandcamp_lang( 806 ), 'Polylang EN' );
assert_c432( 4 === count( $GLOBALS['c432_hooks'] ), 'four expected WordPress hooks' );

class C432_Test_Product { private $id; public function __construct( $id ) { $this->id = $id; } public function get_id() { return $this->id; } }
$GLOBALS['product'] = new C432_Test_Product( 806 );
ob_start();
c432_bandcamp_single_button();
$single_en = ob_get_clean();
assert_c432( false !== strpos( $single_en, 'Listen &amp; buy on Bandcamp' ), 'EN single label' );
assert_c432( false !== strpos( $single_en, 'target="_blank" rel="noopener noreferrer"' ), 'noopener' );
assert_c432( false !== strpos( $single_en, 'The price there may differ' ), 'cross-checkout price note' );
$GLOBALS['product'] = new C432_Test_Product( 807 );
ob_start(); c432_bandcamp_single_button(); $single_bg = ob_get_clean();
assert_c432( false !== strpos( $single_bg, 'Слушайте и купете в Bandcamp' ), 'BG single label' );
$GLOBALS['product'] = new C432_Test_Product( 941 );
ob_start(); c432_bandcamp_loop_button(); $loop = ob_get_clean();
assert_c432( false !== strpos( $loop, 'Buy on Bandcamp' ), 'loop CTA' );
$GLOBALS['product'] = new C432_Test_Product( 999 );
ob_start(); c432_bandcamp_single_button(); $unmapped = ob_get_clean();
assert_c432( '' === $unmapped, 'unmapped posts unchanged' );
ob_start(); c432_bandcamp_shop_banner(); $banner = ob_get_clean();
assert_c432( false !== strpos( $banner, 'Browse all 12 releases on Bandcamp' ), 'full catalog shop banner' );
echo "PASS: 46 posts / 23 pairs / CTA render / no external call / no Woo state change\n";
