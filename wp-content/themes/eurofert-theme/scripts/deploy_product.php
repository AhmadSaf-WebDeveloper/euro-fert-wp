<?php
/**
 * Single Product Deployment Script
 *
 * This script exports a product from the local XAMPP database (via WordPress core)
 * and deploys it to the live production server using the WordPress REST API.
 *
 * Usage:
 *   C:\xampp\php\php.exe wp-content/themes/eurofert-theme/scripts/deploy_product.php [product-slug]
 *
 * Example:
 *   C:\xampp\php\php.exe wp-content/themes/eurofert-theme/scripts/deploy_product.php colfert-power-5-50-30
 */

// Prevent execution in browser for security
if (php_sapi_name() !== 'cli') {
    die("This script can only be run via the CLI (Terminal).\n");
}

// 1. BOOTSTRAP LOCAL WORDPRESS
// Path to local wp-load.php from this script directory
$wp_load_path = dirname(dirname(dirname(dirname(__DIR__)))) . '/wp-load.php';

if (!file_exists($wp_load_path)) {
    die("❌ Error: Could not locate wp-load.php at: $wp_load_path\n");
}

echo "🔌 Bootstrapping local WordPress...\n";
require_once $wp_load_path;

// 2. LOAD ENVIRONMENT VARIABLES FROM .ENV
$env_path = dirname(__DIR__) . '/.env';
if (!file_exists($env_path)) {
    die("❌ Error: Missing .env file in theme folder ($env_path)\n");
}

echo "📂 Loading environment configuration...\n";
$env = parse_env_file($env_path);

$live_server_url = $env['LIVE_SERVER_URL'] ?? '';
$wp_username = $env['WP_USERNAME'] ?? '';
$wp_app_password = $env['WP_APP_PASSWORD'] ?? '';

if (empty($live_server_url) || empty($wp_username) || empty($wp_app_password)) {
    die("❌ Error: Missing LIVE_SERVER_URL, WP_USERNAME, or WP_APP_PASSWORD in .env\n");
}

$auth_header = 'Basic ' . base64_encode("$wp_username:$wp_app_password");

// 3. DEFINE TARGET PRODUCT
// Get product slug from CLI argument, defaulting to 'colfert-power-5-50-30'
$target_slug = isset($argv[1]) ? trim($argv[1]) : 'colfert-power-5-50-30';

echo "🔍 Locating local product with slug: '$target_slug'...\n";

// Query the local database for the product
$local_posts = get_posts([
    'name' => $target_slug,
    'post_type' => 'eurofert_product',
    'post_status' => 'any',
    'numberposts' => 1
]);

if (empty($local_posts)) {
    die("❌ Error: Product with slug '$target_slug' not found in local database.\n");
}

$product = $local_posts[0];
$post_id = $product->ID;

echo "✅ Found local product: \"{$product->post_title}\" (ID: $post_id)\n";

// 4. RETRIEVE CATEGORY DETAILS
$terms = get_the_terms($post_id, 'fertilizer_category');
$category_slug = '';
if (!empty($terms) && !is_wp_error($terms)) {
    $category_slug = $terms[0]->slug;
    echo "🏷️  Local Category: \"{$terms[0]->name}\" (slug: '$category_slug')\n";
} else {
    echo "⚠️  Warning: No category assigned to this product locally.\n";
}

// 5. PROCESS FEATURED IMAGE
$remote_media_id = null;
$thumbnail_id = get_post_thumbnail_id($post_id);

if ($thumbnail_id) {
    $local_image_path = get_attached_file($thumbnail_id);
    if ($local_image_path && file_exists($local_image_path)) {
        $filename = basename($local_image_path);
        echo "🖼️  Found featured image: $filename\n";
        
        // Check if image already exists on production server
        echo "🔎 Checking if image is already on live server...\n";
        $remote_media_id = get_remote_media_id($live_server_url, $auth_header, $filename);
        
        if ($remote_media_id) {
            echo "♻️  Image already exists on live server (ID: $remote_media_id). Reusing.\n";
        } else {
            echo "⬆️  Uploading image to live server...\n";
            $remote_media_id = upload_media_to_live($live_server_url, $auth_header, $local_image_path);
            if ($remote_media_id) {
                echo "✅ Upload successful! Live Image ID: $remote_media_id\n";
            } else {
                echo "⚠️  Warning: Image upload failed. Proceeding without image.\n";
            }
        }
    } else {
        echo "⚠️  Warning: Featured image file does not exist locally at path: $local_image_path\n";
    }
} else {
    echo "ℹ️  No featured image set for this product.\n";
}

// 6. RESOLVE REMOTE CATEGORY ID
$remote_category_id = null;
if (!empty($category_slug)) {
    echo "🔎 Resolving remote Category ID for slug '$category_slug'...\n";
    $remote_category_id = get_remote_category_id($live_server_url, $auth_header, $category_slug);
    if ($remote_category_id) {
        echo "✅ Found remote category ID: $remote_category_id\n";
    } else {
        echo "⚠️  Warning: Category '$category_slug' does not exist on live server. The category link will be skipped.\n";
    }
}

// 7. PREPARE PAYLOAD
echo "📦 Formatting product data and custom fields...\n";

$payload = [
    'title'   => $product->post_title,
    'content' => $product->post_content,
    'slug'    => $product->post_name,
    'status'  => 'publish',
];

if ($remote_category_id) {
    $payload['fertilizer_category'] = [$remote_category_id];
}

if ($remote_media_id) {
    $payload['featured_media'] = $remote_media_id;
}

// Populate ACF Fields
$acf = [];
$acf_fields = [
    'subtitle',
    'key_benefits',
    'formula',
    'nutrient_table_rows',
    'packages_content',
    'application_notes'
];

foreach ($acf_fields as $field) {
    $value = get_post_meta($post_id, $field, true);
    // Convert newlines to standard format if applicable
    if ($value !== '') {
        $acf[$field] = $value;
    }
}

if (!empty($acf)) {
    $payload['acf'] = $acf;
}

// Populate custom Recommendations table (meta key: reco_rows)
$reco_rows = get_post_meta($post_id, 'reco_rows', true);
if (!empty($reco_rows)) {
    $payload['meta'] = ['reco_rows' => $reco_rows];
}

// 8. DEPLOY TO PRODUCTION (CREATE OR UPDATE)
echo "🔎 Checking if product already exists on production...\n";
$remote_product_id = get_remote_product_id($live_server_url, $auth_header, $target_slug);

if ($remote_product_id) {
    echo "🔄 Product already exists on production (ID: $remote_product_id). Updating...\n";
    $endpoint = $live_server_url . "/eurofert_product/{$remote_product_id}";
    $method = 'POST'; // WordPress API supports updating via POST or PUT. POST is more reliable across servers.
} else {
    echo "🆕 Product does not exist on production. Creating new...\n";
    $endpoint = $live_server_url . "/eurofert_product";
    $method = 'POST';
}

$response = wp_remote_post($endpoint, [
    'method'    => $method,
    'headers'   => [
        'Content-Type'  => 'application/json',
        'Authorization' => $auth_header,
    ],
    'body'      => json_encode($payload),
    'timeout'   => 15,
]);

if (is_wp_error($response)) {
    die("❌ Error: API request failed. " . $response->get_error_message() . "\n");
}

$response_code = wp_remote_retrieve_response_code($response);
$response_body = wp_remote_retrieve_body($response);
$response_data = json_decode($response_body, true);

if ($response_code === 200 || $response_code === 201) {
    echo "\n🎉 SUCCESS! \"{$product->post_title}\" is now live on the production server.\n";
    echo "📄 Live ID: " . ($response_data['id'] ?? 'Unknown') . "\n";
    echo "🔗 Live Link: " . ($response_data['link'] ?? 'Unknown') . "\n\n";
} else {
    echo "❌ Error: Server rejected product deployment (HTTP Code: $response_code)\n";
    echo "💬 Server Message: " . ($response_data['message'] ?? 'No message provided') . "\n";
    if (isset($response_data['code'])) {
        echo "🔑 Error Code: " . $response_data['code'] . "\n";
    }
}


// --- HELPER FUNCTIONS ---

/**
 * Parses simple .env files into an associative array
 */
function parse_env_file($path) {
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $env = [];
    foreach ($lines as $line) {
        $line = trim($line);
        // Skip comments
        if (empty($line) || $line[0] === '#') continue;
        
        // Split key and value
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            // Remove wrapping quotes if present
            $value = trim($value, '"\'');
            $env[$key] = $value;
        }
    }
    return $env;
}

/**
 * Query the remote server to see if a product slug already exists
 */
function get_remote_product_id($url, $auth, $slug) {
    $response = wp_remote_get($url . "/eurofert_product?slug=" . urlencode($slug), [
        'headers' => ['Authorization' => $auth]
    ]);
    
    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (is_array($data) && !empty($data)) {
            return $data[0]['id'];
        }
    }
    return null;
}

/**
 * Query the remote server to get a category ID by slug
 */
function get_remote_category_id($url, $auth, $slug) {
    $response = wp_remote_get($url . "/fertilizer_category?slug=" . urlencode($slug), [
        'headers' => ['Authorization' => $auth]
    ]);
    
    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (is_array($data) && !empty($data)) {
            return $data[0]['id'];
        }
    }
    return null;
}

/**
 * Check if the media file already exists on production by filename
 */
function get_remote_media_id($url, $auth, $filename) {
    // Search without extension for fuzzy matching
    $search_name = pathinfo($filename, PATHINFO_FILENAME);
    
    $response = wp_remote_get($url . "/media?search=" . urlencode($search_name) . "&per_page=10", [
        'headers' => ['Authorization' => $auth]
    ]);
    
    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (is_array($data)) {
            foreach ($data as $item) {
                if (isset($item['source_url']) && basename($item['source_url']) === $filename) {
                    return $item['id'];
                }
            }
        }
    }
    return null;
}

/**
 * Upload local file to live Media Library
 */
function upload_media_to_live($url, $auth, $filepath) {
    $filename = basename($filepath);
    $file_content = file_get_contents($filepath);
    if ($file_content === false) return null;
    
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $mime_type = ($ext === 'png') ? 'image/png' : 'image/jpeg';
    
    $response = wp_remote_post($url . "/media", [
        'headers' => [
            'Authorization'       => $auth,
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Content-Type'        => $mime_type,
        ],
        'body'    => $file_content,
        'timeout' => 30,
    ]);
    
    if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 201) {
        $data = json_decode(wp_remote_retrieve_body($response), true);
        return $data['id'] ?? null;
    }
    return null;
}
