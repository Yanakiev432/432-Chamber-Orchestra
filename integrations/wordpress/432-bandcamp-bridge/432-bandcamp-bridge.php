<?php
/**
 * Plugin Name: 432 Bandcamp Purchase Links
 * Description: Clear, bilingual links from the legacy WooCommerce products to their official Bandcamp purchase pages. Does not change WordPress checkout or product data.
 * Version: 1.0.0
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
    $url = c432_bandcamp_url( $id );
    if ( '' === $url ) {
        return;
    }

    $bg = 'bg' === c432_bandcamp_lang( $id );
    $label = $bg ? 'Слушайте и купете в Bandcamp' : 'Listen & buy on Bandcamp';
    $note = $bg
        ? 'Покупката се извършва в Bandcamp в нов раздел. Цената там може да се различава от тази в магазина.'
        : 'Checkout opens on Bandcamp in a new tab. The price there may differ from the price shown here.';

    echo '<div class="c432-bandcamp-single">';
    echo '<a class="c432-bandcamp-button" href="' . esc_url( $url ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $label ) . '</a>';
    echo '<p class="c432-bandcamp-note">' . esc_html( $note ) . '</p>';
    echo '</div>';
}

/**
 * Shop/product-grid CTA, after the standard Add to basket control.
 */
function c432_bandcamp_loop_button() {
    $id = c432_bandcamp_product_id();
    $url = c432_bandcamp_url( $id );
    if ( '' === $url ) {
        return;
    }

    $label = 'bg' === c432_bandcamp_lang( $id )
        ? 'Купете в Bandcamp'
        : 'Buy on Bandcamp';
    echo '<a class="c432-bandcamp-loop-button" href="' . esc_url( $url ) . '" target="_blank" rel="noopener noreferrer">' . esc_html( $label ) . '</a>';
}

/**
 * Make the releases absent from WooCommerce discoverable on the shop page.
 */
function c432_bandcamp_shop_banner() {
    $lang = function_exists( 'pll_current_language' ) ? pll_current_language() : '';
    if ( 'bg' !== $lang && 'en' !== $lang ) {
        $lang = ( function_exists( 'get_locale' ) && 0 === strpos( get_locale(), 'bg' ) ) ? 'bg' : 'en';
    }

    $bg = 'bg' === $lang;
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
    wp_register_style( 'c432-bandcamp-bridge', false, array(), '1.0.0' );
    wp_enqueue_style( 'c432-bandcamp-bridge' );
    wp_add_inline_style(
        'c432-bandcamp-bridge',
        '.c432-bandcamp-single,.c432-bandcamp-shop{border:1px solid #b5b5b5;padding:14px;margin:14px 0;clear:both}.c432-bandcamp-button,.c432-bandcamp-loop-button{display:inline-block;box-sizing:border-box;background:#262626;color:#fff!important;border:2px solid #262626;border-radius:2px;padding:10px 15px;min-height:44px;text-decoration:none!important;font-size:14px;font-weight:700;line-height:21px}.c432-bandcamp-button:hover,.c432-bandcamp-loop-button:hover,.c432-bandcamp-button:focus,.c432-bandcamp-loop-button:focus{background:#444;color:#fff!important;border-color:#444;outline-offset:3px}.c432-bandcamp-loop-button{display:block;margin:8px 0 14px;text-align:center}.c432-bandcamp-note{margin:9px 0 0;font-size:13px;line-height:1.5;color:inherit}.c432-bandcamp-shop p{margin:0 0 12px}'
    );
}

add_action( 'woocommerce_single_product_summary', 'c432_bandcamp_single_button', 29 );
add_action( 'woocommerce_after_shop_loop_item', 'c432_bandcamp_loop_button', 11 );
add_action( 'woocommerce_before_shop_loop', 'c432_bandcamp_shop_banner', 5 );
add_action( 'wp_enqueue_scripts', 'c432_bandcamp_styles', 20 );
