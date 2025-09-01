<?php
/**
 * Plugin Name:       Data Table - AAG
 * Description:       Dynamic data table block for WordPress. For CSV files.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Andre Gagnon
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       data-table-aag
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Registers the block using a `blocks-manifest.php` file, which improves the performance of block type registration.
 * Behind the scenes, it also registers all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function create_block_data_table_aag_block_init() {
	/**
	 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
	 * based on the registered block metadata.
	 * Added in WordPress 6.8 to simplify the block metadata registration process added in WordPress 6.7.
	 *
	 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
	 */
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
		return;
	}

	/**
	 * Registers the block(s) metadata from the `blocks-manifest.php` file.
	 * Added to WordPress 6.7 to improve the performance of block type registration.
	 *
	 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
	 */
	if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
		wp_register_block_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
	}
	/**
	 * Registers the block type(s) in the `blocks-manifest.php` file.
	 *
	 * @see https://developer.wordpress.org/reference/functions/register_block_type/
	 */
	$manifest_data = require __DIR__ . '/build/blocks-manifest.php';
	foreach ( array_keys( $manifest_data ) as $block_type ) {
		register_block_type( __DIR__ . "/build/{$block_type}" );
	}
}
add_action( 'init', 'create_block_data_table_aag_block_init' );


/**
 * Passes the data file URL to our React scripts using `wp_localize_script`.
 * This makes the data URL available globally in our JS.
 * We'll use a more reliable hook for this.
 */
function data_table_aag_localize_data() {
    // Get the block's handle from the block.json name.
    $block_name = 'data-table-aag/dynamic-data-table';
    $script_handle = 'data-table-aag-dynamic-data-table-view-script';

    // The wp_add_inline_script function will automatically detect the handle from the block.json
    // and link to it. This is a more reliable way.
    $csv_url = plugins_url( 'data.csv', __FILE__ );
    $data_to_pass = array( 'csvUrl' => $csv_url );

    wp_localize_script(
        $script_handle,
        'AAG_PLUGIN_DATA',
        $data_to_pass
    );
}

// Use a hook that runs after all block assets are enqueued on the front end.
add_action( 'enqueue_block_assets', 'data_table_aag_localize_data' );

/**
 * Passes the data file URL to the editor script as well.
 */
function data_table_aag_localize_editor_data() {
    $editor_script_handle = 'data-table-aag-dynamic-data-table-editor-script';
    $csv_url = plugins_url( 'data.csv', __FILE__ );
    $data_to_pass = array( 'csvUrl' => $csv_url );

    wp_localize_script(
        $editor_script_handle,
        'AAG_PLUGIN_DATA',
        $data_to_pass
    );
}

// Use a hook that runs after all block editor assets are enqueued.
add_action( 'enqueue_block_editor_assets', 'data_table_aag_localize_editor_data' );

