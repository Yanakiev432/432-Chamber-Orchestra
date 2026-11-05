<?php
// No real WordPress site or customer data is loaded by this isolated test.
error_reporting( E_ALL );
define( 'ABSPATH', __DIR__ . '/' );
$GLOBALS['c432_hooks'] = array();
$GLOBALS['c432_filters'] = array();
function add_action( $hook, $callback, $priority = 10 ) { $GLOBALS['c432_hooks'][] = array($hook,$callback,$priority); }
function add_filter( $hook, $callback, $priority = 10, $accepted_args = 1 ) { $GLOBALS['c432_filters'][] = array($hook,$callback,$priority,$accepted_args); }
function absint( $value ) { return abs( (int) $value ); }
function esc_url( $value ) { return htmlspecialchars( $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' ); }
function esc_html( $value ) { return htmlspecialchars( $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8' ); }
function get_the_ID() { return isset( $GLOBALS['c432_id'] ) ? $GLOBALS['c432_id'] : 0; }
function get_locale() { return 'en_US'; }
function is_shop() { return ! empty( $GLOBALS['c432_test_is_shop'] ); }
function is_admin() { return false; }
function is_wc_endpoint_url( $endpoint ) { return ! empty( $GLOBALS['c432_test_endpoint'] ) && $GLOBALS['c432_test_endpoint'] === $endpoint; }
function wc_get_product( $id ) { return isset($GLOBALS['c432_products'][$id]) ? $GLOBALS['c432_products'][$id] : null; }
function wc_add_notice( $message, $type ) { $GLOBALS['c432_notices'][] = array($message,$type); }
function is_page( $ids ) { return in_array( $GLOBALS['c432_test_page_id'] ?? 0, (array) $ids, true ); }

function pll_get_post_language( $id ) { return in_array( $id, array( 796, 807, 811, 813, 815, 817, 819, 821, 823, 904, 921, 923, 930, 935, 940, 942, 944, 946, 948, 950, 952, 955, 957 ), true ) ? 'bg' : 'en'; }
function pll_current_language() { return 'en'; }
function wp_register_style() {}
function wp_enqueue_style() {}
function wp_add_inline_style( $handle, $css ) { $GLOBALS['c432_styles'][ $handle ] = $css; }
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
assert_c432( 6 === count( $GLOBALS['c432_hooks'] ), 'six expected WordPress actions' );
assert_c432( 8 === count( $GLOBALS['c432_filters'] ), 'eight hardening filters for Bandcamp-only checkout' );
assert_c432( in_array( array( 'template_redirect', 'c432_bandcamp_redirect_legacy_checkout', 0 ), $GLOBALS['c432_hooks'], true ), 'route legacy cart/checkout to Bandcamp' );
assert_c432( in_array( array( 'woocommerce_shortcode_before_products_loop', 'c432_bandcamp_shop_banner', 5 ), $GLOBALS['c432_hooks'], true ), 'nonpaginated shortcode shop hook registered' );

class C432_Test_Product { private $id; private $downloadable; public function __construct( $id, $downloadable = false ) { $this->id = $id; $this->downloadable = $downloadable; } public function get_id() { return $this->id; } public function is_downloadable() { return $this->downloadable; } }
$GLOBALS['product'] = new C432_Test_Product( 806 );
ob_start();
c432_bandcamp_single_button();
$single_en = ob_get_clean();
assert_c432( false !== strpos( $single_en, 'Listen &amp; buy on Bandcamp' ), 'EN single label' );
assert_c432( false !== strpos( $single_en, 'target="_blank" rel="noopener noreferrer"' ), 'noopener' );
assert_c432( false !== strpos( $single_en, 'Payment and downloads are handled there' ), 'Bandcamp exclusive notice' );
$GLOBALS['product'] = new C432_Test_Product( 807 );
ob_start(); c432_bandcamp_single_button(); $single_bg = ob_get_clean();
assert_c432( false !== strpos( $single_bg, 'Слушайте и купете в Bandcamp' ), 'BG single label' );
$GLOBALS['product'] = new C432_Test_Product( 941 );
ob_start(); c432_bandcamp_loop_button(); $loop = ob_get_clean();
assert_c432( false !== strpos( $loop, 'Buy on Bandcamp' ), 'loop CTA' );
$GLOBALS['product'] = new C432_Test_Product( 999 );
ob_start(); c432_bandcamp_single_button(); $unmapped = ob_get_clean();
assert_c432( '' === $unmapped, 'unmapped posts unchanged' );
$GLOBALS['c432_test_page_id'] = 106;
ob_start(); c432_bandcamp_shop_banner(); $banner = ob_get_clean();
assert_c432( false !== strpos( $banner, 'Browse all 12 releases on Bandcamp' ), 'full catalog shop banner' );
ob_start(); c432_bandcamp_shop_banner(); $duplicate = ob_get_clean();
assert_c432( '' === $duplicate, 'shop banner not duplicated' );
$GLOBALS['c432_test_page_id'] = 997;
$GLOBALS['product'] = new C432_Test_Product( 806 ); // Legacy BG shop shows some EN products.
ob_start(); c432_bandcamp_loop_button(); $bg_shop_loop = ob_get_clean();
assert_c432( false !== strpos( $bg_shop_loop, 'Купете в Bandcamp' ), 'BG shop context overrides EN product ID' );
assert_c432( 'bg' === c432_bandcamp_view_lang( 806 ), 'BG page language wins over product language' );
$GLOBALS['c432_test_page_id'] = 0;
$GLOBALS['c432_test_is_shop'] = true;
$GLOBALS['product'] = new C432_Test_Product( 807 ); // Mixed-language product on EN archive.
ob_start(); c432_bandcamp_loop_button(); $en_shop_loop = ob_get_clean();
assert_c432( false !== strpos( $en_shop_loop, 'Buy on Bandcamp' ), 'English archive context overrides BG product ID' );
assert_c432( 'en' === c432_bandcamp_view_lang( 807 ), 'EN shop archive wins over product language' );
$GLOBALS['c432_test_is_shop'] = false;

// Mobile storefront regression: the English Woo archive and the Bulgarian
// translated shortcode page must both collapse to one product per row.
c432_bandcamp_styles();
$css = $GLOBALS['c432_styles']['c432-bandcamp-bridge'] ?? '';
assert_c432( false !== strpos( $css, '@media (max-width:600px)' ), 'mobile breakpoint exists' );
assert_c432( false !== strpos( $css, 'body.woocommerce-shop .woocommerce ul.products' ), 'English archive scoped CSS' );
assert_c432( false !== strpos( $css, 'body.page-id-997 .woocommerce ul.products' ), 'BG translated shop scoped CSS' );
assert_c432( false !== strpos( $css, 'grid-template-columns:minmax(0,1fr)!important' ), 'mobile one-column grid' );
assert_c432( false !== strpos( $css, '.c432-bandcamp-loop-button{display:block;width:100%' ), 'mobile full-width Bandcamp CTA' );
assert_c432( false !== strpos( $css, 'background:#eadf9b;color:#202020!important' ), 'visible warm-gold CTA on dark theme' );
assert_c432( false !== strpos( $css, 'background:#fff2c0;color:#202020!important' ), 'high-contrast hover CTA on dark theme' );

// All legacy music products and any future downloadable music are Bandcamp-only.
$productMapped = new C432_Test_Product( 943, true ); // historic English Joplin was non-virtual.
$productNewDownload = new C432_Test_Product( 20000, true );
$productMerchandise = new C432_Test_Product( 20001, false );
$GLOBALS['c432_products'] = array(943=>$productMapped,20000=>$productNewDownload,20001=>$productMerchandise);
assert_c432( c432_bandcamp_only_music_product( $productMapped ), 'mapped historic digital product identified' );
assert_c432( c432_bandcamp_only_music_product( $productNewDownload ), 'future downloadable product identified' );
assert_c432( ! c432_bandcamp_only_music_product( $productMerchandise ), 'physical merchandise excluded' );
assert_c432( ! c432_bandcamp_disable_local_purchase( true, $productMapped ), 'mapped purchase blocked' );
assert_c432( ! c432_bandcamp_disable_local_purchase( true, $productNewDownload ), 'future music blocked' );
assert_c432( c432_bandcamp_disable_local_purchase( true, $productMerchandise ), 'unrelated merchandise not blocked' );
assert_c432( '' === c432_bandcamp_suppress_local_price( '€5.00', $productMapped ), 'no obsolete local EUR price' );
assert_c432( '€5.00' === c432_bandcamp_suppress_local_price( '€5.00', $productMerchandise ), 'nonmusic price unaffected' );
assert_c432( '' === c432_bandcamp_suppress_loop_cart_button( '<a>Add to cart</a>', $productMapped ), 'legacy add cart removed' );
assert_c432( '<a>More</a>' === c432_bandcamp_suppress_loop_cart_button( '<a>More</a>', $productMerchandise ), 'nonmusic loop unchanged' );
assert_c432( ! c432_bandcamp_reject_add_to_cart( true, 943 ), 'direct add-to-cart blocked' );
assert_c432( ! c432_bandcamp_reject_add_to_cart( true, 20000 ), 'new music direct add-to-cart blocked' );
assert_c432( ! c432_bandcamp_reject_add_to_cart( true, 20001, 1, 20000 ), 'downloadable variation blocked' );
assert_c432( c432_bandcamp_reject_add_to_cart( true, 20001 ), 'unrelated merch add-to-cart allowed' );
assert_c432( 'https://432orchestra.bandcamp.com/music' === c432_bandcamp_checkout_destination(20000), 'unmapped digital album fallback' );
assert_c432( '' === c432_bandcamp_checkout_destination(20001), 'nonmusic has no fake bandcamp destination' );
assert_c432( ! isset( c432_bandcamp_remove_local_schema_offer( array('offers'=>'old-price'), $productMapped )['offers'] ), 'hide obsolete local structured offer' );
assert_c432( c432_bandcamp_disable_new_payment_gateways( array('paypal'=>'active') ) === array(), 'new Woo payments disabled' );
$GLOBALS['c432_test_endpoint'] = 'order-pay';
assert_c432( count(c432_bandcamp_disable_new_payment_gateways(array('paypal'=>'old-order'))) === 1, 'historic order-pay access preserved' );
$GLOBALS['c432_test_endpoint'] = '';
$menu = array(
  (object) array('object_id'=>107,'url'=>'https://432hz-orchestra.com/en/cart/'),
  (object) array('object_id'=>461,'url'=>'https://432hz-orchestra.com/en/checkout-2/'),
  (object) array('object_id'=>0,'url'=>'#wpmenucart'),
  (object) array('object_id'=>0,'url'=>'https://432hz-orchestra.com/bg/кошница/'),
  (object) array('object_id'=>0,'url'=>'https://432hz-orchestra.com/en/shop/')
);
assert_c432( count(c432_bandcamp_filter_legacy_cart_menu($menu))===1, 'cart/checkout links hidden in EN and BG menus' );
assert_c432( false !== strpos( $css, '#wpmenucart{display:none!important}' ), 'plugin cart icon hidden' );
assert_c432( in_array(array('woocommerce_add_to_cart_validation','c432_bandcamp_reject_add_to_cart',100,4),$GLOBALS['c432_filters'],true), 'server cart hard block registered' );
echo "PASS: 46 mapped works / all downloads Bandcamp-only / local cart blocked / menu removed / historic orders untouched\n";
