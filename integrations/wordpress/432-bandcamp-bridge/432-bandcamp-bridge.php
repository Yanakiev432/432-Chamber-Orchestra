<?php
/**
 * Plugin Name: 432 Bandcamp Purchase Links
 * Description: Bandcamp-only sales for downloadable music. Keeps the historic WooCommerce catalogue and orders, disables new local sales and routes cart/checkout to Bandcamp.
 * Version: 1.0.4
 * Author: 432 Chamber Orchestra
 * License: GPL-2.0-or-later
 * Text Domain: c432-bandcamp-bridge
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Static, audited source-ID to official Bandcamp destination mapping.
 *
 * Each of 23 works has one English and one Bulgarian Polylang product.
 * We deliberately use source post IDs rather than slugs: historical slugs
 * contain typos, localized characters and -2 suffixes.
 *
 * @return array<int, string>
 */
function c432_bandcamp_map() {
    return array(
        769 => 'https://432orchestra.bandcamp.com/album/432-hz-quartet-music',
        796 => 'https://432orchestra.bandcamp.com/album/432-hz-quartet-music',
        806 => 'https://432orchestra.bandcamp.com/track/01-432-chamber-orchestras-quartet-mark-antonie-charpantier-te-deum-praelude-432-hz',
        807 => 'https://432orchestra.bandcamp.com/track/01-432-chamber-orchestras-quartet-mark-antonie-charpantier-te-deum-praelude-432-hz',
        810 => 'https://432orchestra.bandcamp.com/track/02-432-chamber-orchestras-quartet-georg-friedrich-handel-all-hornpie-watermusic-suite-in-d-dur-hw-349-part-ii-432-hz',
        811 => 'https://432orchestra.bandcamp.com/track/02-432-chamber-orchestras-quartet-georg-friedrich-handel-all-hornpie-watermusic-suite-in-d-dur-hw-349-part-ii-432-hz',
        812 => 'https://432orchestra.bandcamp.com/track/03-432-chamber-orchestras-quartet-georg-friedrich-handel-the-arrival-of-queen-of-sheba-solomon-hw-67-432-hz',
        813 => 'https://432orchestra.bandcamp.com/track/03-432-chamber-orchestras-quartet-georg-friedrich-handel-the-arrival-of-queen-of-sheba-solomon-hw-67-432-hz',
        814 => 'https://432orchestra.bandcamp.com/track/04-432-chamber-orchestras-quartet-caesar-frank-panis-angelicus-messe-solennelle-432-hz',
        815 => 'https://432orchestra.bandcamp.com/track/04-432-chamber-orchestras-quartet-caesar-frank-panis-angelicus-messe-solennelle-432-hz',
        816 => 'https://432orchestra.bandcamp.com/track/05-432-chamber-orchestras-quartet-al-borodin-notturno-string-quartet-no-2-part-iii-432-hz',
        817 => 'https://432orchestra.bandcamp.com/track/05-432-chamber-orchestras-quartet-al-borodin-notturno-string-quartet-no-2-part-iii-432-hz',
        818 => 'https://432orchestra.bandcamp.com/track/06-432-chamber-orchestras-quartet-modest-mussorgsky-hopak-sorochins-fair-432-hz',
        819 => 'https://432orchestra.bandcamp.com/track/06-432-chamber-orchestras-quartet-modest-mussorgsky-hopak-sorochins-fair-432-hz',
        820 => 'https://432orchestra.bandcamp.com/track/07-432-chamber-orchestras-quartet-peter-ilitch-tchaikovsky-trepak-nutkracker-suite-432-hz',
        821 => 'https://432orchestra.bandcamp.com/track/07-432-chamber-orchestras-quartet-peter-ilitch-tchaikovsky-trepak-nutkracker-suite-432-hz',
        822 => 'https://432orchestra.bandcamp.com/track/08-432-chamber-orchestras-quartet-claude-debussy-clair-de-lune-432-hz',
        823 => 'https://432orchestra.bandcamp.com/track/08-432-chamber-orchestras-quartet-claude-debussy-clair-de-lune-432-hz',
        898 => 'https://432orchestra.bandcamp.com/track/g-bizet-entracte-suite-carmen-432-hz',
        904 => 'https://432orchestra.bandcamp.com/track/g-bizet-entracte-suite-carmen-432-hz',
        919 => 'https://432orchestra.bandcamp.com/track/432-chamber-orchestra-w-a-mozart-divertimento-in-d-dur-kv-136-yanakiev-recording-from-rehearsal',
        921 => 'https://432orchestra.bandcamp.com/track/432-chamber-orchestra-w-a-mozart-divertimento-in-d-dur-kv-136-yanakiev-recording-from-rehearsal',
        922 => 'https://432orchestra.bandcamp.com/album/432-chamber-orchestra-antonio-vivaldi-concerto-alla-ristica-in-g-rv-151-432-hz-yanakiev-recording-from-rehearsal',
        923 => 'https://432orchestra.bandcamp.com/album/432-chamber-orchestra-antonio-vivaldi-concerto-alla-ristica-in-g-rv-151-432-hz-yanakiev-recording-from-rehearsal',
        924 => 'https://432orchestra.bandcamp.com/track/e-satie-gymnopedie-no-1-432-hz',
        930 => 'https://432orchestra.bandcamp.com/track/e-satie-gymnopedie-no-1-432-hz',
        931 => 'https://432orchestra.bandcamp.com/track/fr-schubert-moment-musicaux-no-3-d-780-432-hz',
        935 => 'https://432orchestra.bandcamp.com/track/fr-schubert-moment-musicaux-no-3-d-780-432-hz',
        937 => 'https://432orchestra.bandcamp.com/track/j-s-bach-2-air-orchestral-suite-no-3-432-hz',
        940 => 'https://432orchestra.bandcamp.com/track/j-s-bach-2-air-orchestral-suite-no-3-432-hz',
        941 => 'https://432orchestra.bandcamp.com/track/09-432-chamber-orchestras-quartet-pietro-mascagni-intermezzo-cavalleria-rusticana-432-hz',
        942 => 'https://432orchestra.bandcamp.com/track/09-432-chamber-orchestras-quartet-pietro-mascagni-intermezzo-cavalleria-rusticana-432-hz',
        943 => 'https://432orchestra.bandcamp.com/track/10-432-chamber-orchestras-quartet-scot-jopplinl-the-entertainer-432-hz',
        944 => 'https://432orchestra.bandcamp.com/track/10-432-chamber-orchestras-quartet-scot-jopplinl-the-entertainer-432-hz',
        945 => 'https://432orchestra.bandcamp.com/track/11-432-chamber-orchestras-quartet-carlos-gardel-pou-una-cabeza-432-hz-2',
        946 => 'https://432orchestra.bandcamp.com/track/11-432-chamber-orchestras-quartet-carlos-gardel-pou-una-cabeza-432-hz-2',
        947 => 'https://432orchestra.bandcamp.com/track/12-432-chamber-orchestras-quartet-giovanni-capurro-o-sole-mio-432-hz',
        948 => 'https://432orchestra.bandcamp.com/track/12-432-chamber-orchestras-quartet-giovanni-capurro-o-sole-mio-432-hz',
        949 => 'https://432orchestra.bandcamp.com/track/13-432-chamber-orchestras-quartet-armstrong-thiele-and-weiss-what-a-wonderful-world-432-hz',
        950 => 'https://432orchestra.bandcamp.com/track/13-432-chamber-orchestras-quartet-armstrong-thiele-and-weiss-what-a-wonderful-world-432-hz',
        951 => 'https://432orchestra.bandcamp.com/track/14-432-chamber-orchestras-quartet-the-beetles-yesterday-432-hz',
        952 => 'https://432orchestra.bandcamp.com/track/14-432-chamber-orchestras-quartet-the-beetles-yesterday-432-hz',
        953 => 'https://432orchestra.bandcamp.com/track/15-432-chamber-orchestras-quartet-matvey-blanter-katyusha-432-hz',
        955 => 'https://432orchestra.bandcamp.com/track/15-432-chamber-orchestras-quartet-matvey-blanter-katyusha-432-hz',
        956 => 'https://432orchestra.bandcamp.com/track/16-432-chamber-orchestras-quartet-vasily-solovyov-sedoi-podmoskovniye-vechera-432-hz',
        957 => 'https://432orchestra.bandcamp.com/track/16-432-chamber-orchestras-quartet-vasily-solovyov-sedoi-podmoskovniye-vechera-432-hz',
    );
}

/**
 * Return an allowed Bandcamp URL or an empty string.
 *
 * @param int $post_id WooCommerce product post ID.
 * @return string
 */
function c432_bandcamp_url( $post_id ) {
    $mapping = c432_bandcamp_map();
    $id      = absint( $post_id );

    if ( ! isset( $mapping[ $id ] ) ) {
        return '';
    }

    $url = $mapping[ $id ];
    if ( 0 !== strpos( $url, 'https://432orchestra.bandcamp.com/' ) ) {
        return '';
    }
    return $url;
}

/**
 * Get the product's Polylang language, with an explicit source-ID fallback.
 *
 * @param int $post_id Product ID.
 * @return string 'bg' or 'en'.
 */
function c432_bandcamp_lang( $post_id ) {
    if ( function_exists( 'pll_get_post_language' ) ) {
        $lang = pll_get_post_language( absint( $post_id ) );
        if ( 'bg' === $lang || 'en' === $lang ) {
            return $lang;
        }
    }

    $bulgarian_ids = array( 796, 807, 811, 813, 815, 817, 819, 821, 823, 904, 921, 923, 930, 935, 940, 942, 944, 946, 948, 950, 952, 955, 957 );
    return in_array( absint( $post_id ), $bulgarian_ids, true ) ? 'bg' : 'en';
}

/**
 * Resolve a product ID without changing global WooCommerce state.
 *
 * @return int
 */
function c432_bandcamp_product_id() {
    global $product;
    if ( is_object( $product ) && method_exists( $product, 'get_id' ) ) {
        return absint( $product->get_id() );
    }
    return absint( get_the_ID() );
}

/**
 * Single-product purchase CTA, immediately before default Add to basket.
 */
function c432_bandcamp_single_button() {
    $id = c432_bandcamp_product_id();
    $url = c432_bandcamp_checkout_destination( $id );
    if ( '' === $url ) {
        return;
    }

    $bg = 'bg' === c432_bandcamp_lang( $id );
    $label = $bg ? 'Слушайте и купете в Bandcamp' : 'Listen & buy on Bandcamp';
    $note = $bg
        ? 'Музиката се купува само през Bandcamp. Плащането и изтеглянето се извършват там.'
        : 'Music is sold only through Bandcamp. Payment and downloads are handled there.';

    echo '<div class="c432-bandcamp-single">';
    echo '<a class="c432-bandcamp-button" href="' . esc_url( $url ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $label ) . '</a>';
    echo '<p class="c432-bandcamp-note">' . esc_html( $note ) . '</p>';
    echo '</div>';
}

/**
 * Identify the main language of the current shop, not the language of
 * a product returned by a legacy mixed-language [products] shortcode.
 *
 * @param int $product_id Product ID for non-shop archive fallback.
 * @return string
 */
function c432_bandcamp_view_lang( $product_id = 0 ) {
    if ( function_exists( 'is_page' ) && is_page( 997 ) ) {
        return 'bg';
    }
    if ( function_exists( 'is_page' ) && is_page( 106 ) ) {
        return 'en';
    }
    // WooCommerce renders its English shop as a product archive, not a page.
    if ( function_exists( 'is_shop' ) && is_shop() ) {
        return 'en';
    }
    if ( $product_id ) {
        return c432_bandcamp_lang( $product_id );
    }
    $lang = function_exists( 'pll_current_language' ) ? pll_current_language() : '';
    if ( 'bg' === $lang || 'en' === $lang ) {
        return $lang;
    }
    return ( function_exists( 'get_locale' ) && 0 === strpos( get_locale(), 'bg' ) ) ? 'bg' : 'en';
}

/**
 * Only add the catalogue banner to the two actual shop pages.
 *
 * @return bool
 */
function c432_bandcamp_is_shop_context() {
    return ( function_exists( 'is_shop' ) && is_shop() )
        || ( function_exists( 'is_page' ) && is_page( array( 106, 997 ) ) );
}

/**
 * Shop/product-grid CTA, after the standard Add to basket control.
 */
function c432_bandcamp_loop_button() {
    $id = c432_bandcamp_product_id();
    $url = c432_bandcamp_checkout_destination( $id );
    if ( '' === $url ) {
        return;
    }

    $label = 'bg' === c432_bandcamp_view_lang( $id )
        ? 'Купете в Bandcamp'
        : 'Buy on Bandcamp';
    echo '<a class="c432-bandcamp-loop-button" href="' . esc_url( $url ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $label ) . '</a>';
}

/**
 * Make the releases absent from WooCommerce discoverable on the shop page.
 */
function c432_bandcamp_shop_banner() {
    static $shown = false;
    if ( $shown || ! c432_bandcamp_is_shop_context() ) {
        return;
    }
    $shown = true;
    $bg = 'bg' === c432_bandcamp_view_lang();
    $label = $bg ? 'Всичките 12 издания в Bandcamp' : 'Browse all 12 releases on Bandcamp';
    $intro = $bg
        ? 'В Bandcamp има и издания, които не са представени като отделни продукти в този магазин.'
        : 'Bandcamp also includes releases not listed as individual products in this shop.';

    echo '<div class="c432-bandcamp-shop">';
    echo '<p>' . esc_html( $intro ) . '</p>';
    echo '<a class="c432-bandcamp-button" href="https://432orchestra.bandcamp.com/music" target="_blank" rel="noopener noreferrer">' . esc_html( $label ) . '</a>';
    echo '</div>';
}

/**
 * Small, scoped stylesheet. No global theme, product, or checkout edits.
 */
function c432_bandcamp_styles() {
    wp_register_style( 'c432-bandcamp-bridge', false, array(), '1.0.4' );
    wp_enqueue_style( 'c432-bandcamp-bridge' );
    wp_add_inline_style(
        'c432-bandcamp-bridge',
        '.c432-bandcamp-single,.c432-bandcamp-shop{border:1px solid #b5b5b5;padding:14px;margin:14px 0;clear:both}.c432-bandcamp-button,.c432-bandcamp-loop-button{display:inline-block;box-sizing:border-box;background:#eadf9b;color:#202020!important;border:2px solid #eadf9b;border-radius:2px;padding:10px 15px;min-height:44px;text-decoration:none!important;font-size:14px;font-weight:700;line-height:21px}.c432-bandcamp-button:hover,.c432-bandcamp-loop-button:hover,.c432-bandcamp-button:focus,.c432-bandcamp-loop-button:focus{background:#fff2c0;color:#202020!important;border-color:#fff2c0;outline-offset:3px}.c432-bandcamp-loop-button{display:block;margin:8px 0 14px;text-align:center}.c432-bandcamp-note{margin:9px 0 0;font-size:13px;line-height:1.5;color:inherit}.c432-bandcamp-shop p{margin:0 0 12px}' .
        '.wpmenucartli,li.wpmenucartli,#wpmenucart{display:none!important}' .
        '@media (max-width:600px){body.woocommerce-shop .woocommerce ul.products,body.page-id-997 .woocommerce ul.products{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:24px!important;padding:0!important}body.woocommerce-shop .woocommerce ul.products li.product,body.page-id-997 .woocommerce ul.products li.product{float:none!important;clear:none!important;width:100%!important;max-width:100%!important;margin:0!important;min-width:0!important}body.woocommerce-shop .woocommerce ul.products li.product img,body.page-id-997 .woocommerce ul.products li.product img{width:100%!important;max-width:420px;height:auto}body.woocommerce-shop .woocommerce ul.products li.product .woocommerce-loop-product__title,body.page-id-997 .woocommerce ul.products li.product .woocommerce-loop-product__title{font-size:16px;line-height:1.45;overflow-wrap:anywhere}body.woocommerce-shop .woocommerce ul.products li.product audio,body.page-id-997 .woocommerce ul.products li.product audio{display:block;width:100%;max-width:100%}.c432-bandcamp-single .c432-bandcamp-button,.c432-bandcamp-shop .c432-bandcamp-button,.c432-bandcamp-loop-button{display:block;width:100%;text-align:center;white-space:normal;overflow-wrap:anywhere}}'
    );
}

add_action( 'woocommerce_single_product_summary', 'c432_bandcamp_single_button', 29 );
add_action( 'woocommerce_after_shop_loop_item', 'c432_bandcamp_loop_button', 11 );
add_action( 'woocommerce_before_shop_loop', 'c432_bandcamp_shop_banner', 5 );
add_action( 'woocommerce_shortcode_before_products_loop', 'c432_bandcamp_shop_banner', 5 );
add_action( 'wp_enqueue_scripts', 'c432_bandcamp_styles', 20 );


/**
 * Treat all published downloadable music as Bandcamp-only, including future
 * products and the historical downloadable-yet-not-virtual Joplin product.
 * Does not affect non-downloadable future merchandise.
 *
 * @param mixed $product A WooCommerce product or test double.
 * @return bool
 */
function c432_bandcamp_only_music_product( $product ) {
    if ( ! is_object( $product ) || ! method_exists( $product, 'get_id' ) ) {
        return false;
    }
    $id = absint( $product->get_id() );
    $map = c432_bandcamp_map();
    if ( isset( $map[ $id ] ) ) {
        return true;
    }
    return method_exists( $product, 'is_downloadable' ) && $product->is_downloadable();
}

/**
 * Public links never fall back to a fake track URL. Unmapped downloadable
 * music links to the official discography instead.
 */
function c432_bandcamp_checkout_destination( $product_id ) {
    $mapped = c432_bandcamp_url( $product_id );
    if ( '' !== $mapped ) {
        return $mapped;
    }
    $product = function_exists( 'wc_get_product' ) ? wc_get_product( absint( $product_id ) ) : null;
    return c432_bandcamp_only_music_product( $product )
        ? 'https://432orchestra.bandcamp.com/music'
        : '';
}

/** Keep music catalogue and product permalinks, remove Woo purchasability. */
function c432_bandcamp_disable_local_purchase( $purchasable, $product ) {
    return c432_bandcamp_only_music_product( $product ) ? false : $purchasable;
}

/** Suppress misleading legacy EUR prices: final prices live in Bandcamp. */
function c432_bandcamp_suppress_local_price( $price_html, $product ) {
    return c432_bandcamp_only_music_product( $product ) ? '' : $price_html;
}

/** Remove the original add-to-cart widget, including its "Read more" fallback. */
function c432_bandcamp_suppress_loop_cart_button( $html, $product ) {
    return c432_bandcamp_only_music_product( $product ) ? '' : $html;
}

/** Additional hard gate for direct ?add-to-cart and WooCommerce AJAX requests. */
function c432_bandcamp_reject_add_to_cart( $passed, $product_id, $quantity = 1, $variation_id = 0 ) {
    $product = function_exists( 'wc_get_product' ) ? wc_get_product( absint( $variation_id ? $variation_id : $product_id ) ) : null;
    $parent  = function_exists( 'wc_get_product' ) ? wc_get_product( absint( $product_id ) ) : null;
    if ( c432_bandcamp_only_music_product( $product ) || c432_bandcamp_only_music_product( $parent ) ) {
        if ( function_exists( 'wc_add_notice' ) ) {
            wc_add_notice( 'Digital music is purchased exclusively on Bandcamp: https://432orchestra.bandcamp.com/music', 'notice' );
        }
        return false;
    }
    return $passed;
}

/** Do not publish phantom WooCommerce Offers for Bandcamp-only music. */
function c432_bandcamp_remove_local_schema_offer( $markup, $product ) {
    if ( is_array( $markup ) && c432_bandcamp_only_music_product( $product ) ) {
        unset( $markup['offers'] );
    }
    return $markup;
}

/**
 * Remove old basket and checkout entries from both EN and BG navigation.
 * This does not delete pages, menus, orders or WooCommerce records.
 */
function c432_bandcamp_filter_legacy_cart_menu( $items ) {
    $old_page_ids = array( 107, 108, 461, 965 );
    foreach ( $items as $key => $item ) {
        $id = isset( $item->object_id ) ? absint( $item->object_id ) : 0;
        $url = isset( $item->url ) ? trim( (string) $item->url ) : '';
        $path = (string) parse_url( $url, PHP_URL_PATH );
        $host = (string) parse_url( $url, PHP_URL_HOST );
        $menu_cart = '#wpmenucart' === $url || false !== strpos( $url, '#wpmenucart' );
        $local = '' === $host || '432hz-orchestra.com' === strtolower( $host ) || 'www.432hz-orchestra.com' === strtolower( $host );
        $old_route = $local && preg_match( '~/(?:cart|checkout|checkout-2|кошница)/?$~ui', rawurldecode( $path ) );
        if ( in_array( $id, $old_page_ids, true ) || $menu_cart || $old_route ) {
            unset( $items[ $key ] );
        }
    }
    return $items;
}

/**
 * Legacy cart and checkout URLs lead to Bandcamp. Historical order-pay and
 * order-received endpoints stay available for already created orders.
 * Fixed trusted redirect: no request parameters are forwarded.
 */
function c432_bandcamp_redirect_legacy_checkout() {
    if ( is_admin() ) {
        return;
    }
    if ( function_exists( 'is_wc_endpoint_url' ) && ( is_wc_endpoint_url( 'order-pay' ) || is_wc_endpoint_url( 'order-received' ) ) ) {
        return;
    }
    $is_checkout = ( function_exists( 'is_cart' ) && is_cart() )
        || ( function_exists( 'is_checkout' ) && is_checkout() )
        || ( function_exists( 'is_page' ) && is_page( array( 107, 108, 461, 965 ) ) );
    if ( $is_checkout ) {
        wp_redirect( 'https://432orchestra.bandcamp.com/music', 302, '432 Chamber Orchestra' );
        exit;
    }
}

/** Preserve historic payment access; no gateways for a new local checkout. */
function c432_bandcamp_disable_new_payment_gateways( $gateways ) {
    if ( function_exists( 'is_admin' ) && is_admin() ) {
        return $gateways;
    }
    if ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'order-pay' ) ) {
        return $gateways;
    }
    return array();
}

add_filter( 'woocommerce_is_purchasable', 'c432_bandcamp_disable_local_purchase', 100, 2 );
add_filter( 'woocommerce_variation_is_purchasable', 'c432_bandcamp_disable_local_purchase', 100, 2 );
add_filter( 'woocommerce_loop_add_to_cart_link', 'c432_bandcamp_suppress_loop_cart_button', 100, 2 );
add_filter( 'woocommerce_get_price_html', 'c432_bandcamp_suppress_local_price', 100, 2 );
add_filter( 'woocommerce_add_to_cart_validation', 'c432_bandcamp_reject_add_to_cart', 100, 4 );
add_filter( 'woocommerce_structured_data_product', 'c432_bandcamp_remove_local_schema_offer', 100, 2 );
add_filter( 'woocommerce_available_payment_gateways', 'c432_bandcamp_disable_new_payment_gateways', 100, 1 );
add_filter( 'wp_nav_menu_objects', 'c432_bandcamp_filter_legacy_cart_menu', 100, 1 );
add_action( 'template_redirect', 'c432_bandcamp_redirect_legacy_checkout', 0 );
