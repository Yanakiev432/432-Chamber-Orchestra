<?php
/**
 * 432 Chamber Orchestra — G3 PHP 7.4 legacy analytics suppression candidate.
 *
 * STAGING ONLY. NOT INSTALLED ON WORDPRESS. DO NOT DEPLOY ON ITS OWN:
 * this suppresses two known legacy emission paths, but provides NO CMP
 * Accept/Reject/Withdraw UI and NO single consent-aware GA4 loader.
 * Deployment needs explicit owner GO and browser-network regression QA.
 */
if ( ! defined( 'ABSPATH' ) ) {
    return;
}
if ( ! defined( 'ORCH432_G3_STAGING_LEGACY_GUARD_ENABLED' ) || ORCH432_G3_STAGING_LEGACY_GUARD_ENABLED !== true ) {
    return;
}

/**
 * Fail-closed site scope: exclude administrator, other WordPress blogs
 * and cloned or alternate hostnames. Never change network plugin options.
 */
function orch432_g3_legacy_scope() {
    if ( ! function_exists( 'get_current_blog_id' ) || (int) get_current_blog_id() !== 1 ) {
        return false;
    }
    if ( function_exists( 'is_admin' ) && is_admin() ) {
        return false;
    }
    if ( ! function_exists( 'home_url' ) ) {
        return false;
    }
    $home_host = parse_url( home_url( '/' ), PHP_URL_HOST );
    $request_host = isset( $_SERVER['HTTP_HOST'] ) ? strtolower( trim( (string) $_SERVER['HTTP_HOST'] ) ) : '';
    // home_url() alone is not sufficient: another Host header can route to
    // this same WordPress blog while home_url() remains canonical.
    return is_string( $home_host ) &&
           strtolower( $home_host ) === '432hz-orchestra.com' &&
           $request_host === '432hz-orchestra.com';
}

/**
 * After plugins register their actions, but before template_redirect and
 * wp_head, remove just the known per-request callbacks for blog 1.
 */
function orch432_g3_legacy_unregister() {
    if ( ! orch432_g3_legacy_scope() ) {
        return;
    }
    remove_action( 'wp_head', 'exactmetrics_tracking_script', 6 );
    remove_action( 'template_redirect', 'exactmetrics_events_tracking', 9 );
    remove_action( 'wp_head', 'add_google_analytics', 99 );
    remove_action( 'wp_print_scripts', 'ga_external_tracking_js', 99999 );
}

/** Additional defense for the two known enqueued event scripts. */
function orch432_g3_legacy_dequeue() {
    if ( ! orch432_g3_legacy_scope() ) {
        return;
    }
    wp_dequeue_script( 'exactmetrics-frontend-script' );
    wp_dequeue_script( 'ga-external-tracking' );
}

add_action( 'wp', 'orch432_g3_legacy_unregister', 1 );
add_action( 'wp_enqueue_scripts', 'orch432_g3_legacy_dequeue', 999999 );
add_action( 'wp_print_scripts', 'orch432_g3_legacy_dequeue', 999999 );
