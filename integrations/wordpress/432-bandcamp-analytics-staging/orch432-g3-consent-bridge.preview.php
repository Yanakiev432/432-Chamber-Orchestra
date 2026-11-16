<?php
/**
 * 432 Chamber Orchestra G3 — STAGING PREVIEW ONLY, NOT INSTALLED.
 * This assumes orch432-g3-legacy-guard.preview.php and this file reside
 * together with the .mjs imports in one future, separately approved site-local
 * integration package. This file is INERT without the exact feature flag.
 *
 * No WordPress option updates, network plugin deactivation, or advertising.
 */
if ( ! defined( 'ABSPATH' ) ||
     ! defined( 'ORCH432_G3_STAGING_BRIDGE_ENABLED' ) ||
     ORCH432_G3_STAGING_BRIDGE_ENABLED !== true ) {
    return;
}

function orch432_g3_bridge_scope() {
    return function_exists( 'orch432_g3_legacy_scope' ) &&
           orch432_g3_legacy_scope() &&
           function_exists( 'is_ssl' ) && is_ssl();
}

/** Fail closed if ANY known legacy emitter remains registered. */
function orch432_g3_bridge_hooks_clear() {
    $checks = array(
        array( 'wp_head', 'exactmetrics_tracking_script' ),
        array( 'template_redirect', 'exactmetrics_events_tracking' ),
        array( 'wp_head', 'add_google_analytics' ),
        array( 'wp_print_scripts', 'ga_external_tracking_js' ),
    );
    foreach ( $checks as $item ) {
        if ( false !== has_action( $item[0], $item[1] ) ) {
            return false;
        }
    }
    return true;
}

/**
 * In-memory Cookie Notice per-blog options, set only after the legacy guard
 * has removed four known Analytics emitters. This does not persist settings.
 */
function orch432_g3_bridge_prepare() {
    $GLOBALS['orch432_g3_bridge_ready'] = false;
    if ( ! orch432_g3_bridge_scope() || ! orch432_g3_bridge_hooks_clear() ||
         ! function_exists( 'Cookie_Notice' ) ) {
        return;
    }
    $cn = Cookie_Notice();
    if ( ! is_object( $cn ) || ! isset( $cn->options['general'] ) ||
         ! is_array( $cn->options['general'] ) ||
         $cn->get_status() === 'active' ) {
        return;
    }

    $language = 'en';
    if ( function_exists( 'pll_current_language' ) ) {
        $current = pll_current_language( 'slug' );
        if ( $current === 'bg' || $current === 'en' ) {
            $language = $current;
        }
    }
    // This site routes /bg/... and /en/...; prefer the explicit public path.
    $path = parse_url( isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '/', PHP_URL_PATH );
    if ( is_string( $path ) && preg_match( '~^/(bg|en)(?:/|$)~', $path, $m ) ) {
        $language = $m[1];
    }

    $labels = array(
        'en' => array(
            'message_text' => 'Optional analytics cookies are used only with your consent. You can change your choice at any time.',
            'accept_text' => 'Accept analytics',
            'refuse_text' => 'Reject analytics',
            'revoke_message_text' => 'Change analytics cookie consent',
            'revoke_text' => 'Change choice',
        ),
        'bg' => array(
            'message_text' => 'Незадължителните аналитични бисквитки се използват само с Вашето съгласие. Можете да промените избора си по всяко време.',
            'accept_text' => 'Приемам аналитичните',
            'refuse_text' => 'Отказвам аналитичните',
            'revoke_message_text' => 'Промяна на съгласието за аналитични бисквитки',
            'revoke_text' => 'Промяна на избора',
        ),
    );

    foreach ( $labels[$language] as $key => $label ) {
        $cn->options['general'][$key] = $label;
    }
    $cn->options['general']['refuse_opt'] = true;
    $cn->options['general']['revoke_cookies'] = true;
    $cn->options['general']['revoke_cookies_opt'] = 'automatic';
    $cn->options['general']['on_click'] = false;
    $cn->options['general']['on_scroll'] = false;

    $GLOBALS['orch432_g3_bridge_ready'] = true;
}

/** Only enqueue a locally hosted ES module after scoped in-memory checks. */
function orch432_g3_bridge_enqueue() {
    if ( empty( $GLOBALS['orch432_g3_bridge_ready'] ) ||
         ! orch432_g3_bridge_scope() || ! orch432_g3_bridge_hooks_clear() ) {
        return;
    }
    $handle = 'orch432-g3-consent-first-entry';
    wp_enqueue_script(
        $handle,
        plugins_url( 'consent-first-entry.preview.js', __FILE__ ),
        array(),
        '20261116-preview',
        true
    );
    wp_add_inline_script(
        $handle,
        'window.__ORCH432_G3_APPROVED__ = ' .
        wp_json_encode( array(
            'revision' => 'G3-BASIC-20261116',
            'enabled' => true,
            'uiChoicesVerified' => true,
            'legacyHooksRemoved' => true,
            'measurementId' => 'G-YMLKYY9HGT',
        ) ) . ';',
        'before'
    );
}

function orch432_g3_bridge_script_type( $tag, $handle, $src ) {
    if ( $handle !== 'orch432-g3-consent-first-entry' ||
         ! orch432_g3_bridge_scope() ||
         empty( $GLOBALS['orch432_g3_bridge_ready'] ) ) {
        return $tag;
    }
    return preg_replace( '/<script\b/', '<script type="module"', $tag, 1 );
}

// Loaded only if explicitly enabled and after the default-off PHP guard.
// WordPress core's 'wp' hook runs before template_redirect, wp_head and
// wp_enqueue_scripts; this action is intentionally after guard wp@1.
add_action( 'wp', 'orch432_g3_bridge_prepare', 2 );
add_action( 'wp_enqueue_scripts', 'orch432_g3_bridge_enqueue', 20 );
add_filter( 'script_loader_tag', 'orch432_g3_bridge_script_type', 10, 3 );
