<?php
/**
 * Contact Form Backend Logic
 */

// 1. Register Custom Post Type for Inquiries
function eurofert_register_inquiry_cpt() {
    $labels = array(
        'name'                  => _x( 'Inquiries', 'Post Type General Name', 'eurofert' ),
        'singular_name'         => _x( 'Inquiry', 'Post Type Singular Name', 'eurofert' ),
        'menu_name'             => __( 'Inquiries', 'eurofert' ),
        'name_admin_bar'        => __( 'Inquiry', 'eurofert' ),
        'archives'              => __( 'Inquiry Archives', 'eurofert' ),
        'attributes'            => __( 'Inquiry Attributes', 'eurofert' ),
        'parent_item_colon'     => __( 'Parent Inquiry:', 'eurofert' ),
        'all_items'             => __( 'All Inquiries', 'eurofert' ),
        'add_new_item'          => __( 'Add New Inquiry', 'eurofert' ),
        'add_new'               => __( 'Add New', 'eurofert' ),
        'new_item'              => __( 'New Inquiry', 'eurofert' ),
        'edit_item'             => __( 'Edit Inquiry', 'eurofert' ),
        'update_item'           => __( 'Update Inquiry', 'eurofert' ),
        'view_item'             => __( 'View Inquiry', 'eurofert' ),
        'view_items'            => __( 'View Inquiries', 'eurofert' ),
        'search_items'          => __( 'Search Inquiry', 'eurofert' ),
        'not_found'             => __( 'Not found', 'eurofert' ),
        'not_found_in_trash'    => __( 'Not found in Trash', 'eurofert' ),
    );
    $args = array(
        'label'                 => __( 'Inquiry', 'eurofert' ),
        'description'           => __( 'Contact Form Inquiries', 'eurofert' ),
        'labels'                => $labels,
        'supports'              => array( 'title', 'editor', 'custom-fields' ),
        'hierarchical'          => false,
        'public'                => false, // Only visible in admin
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 25,
        'menu_icon'             => 'dashicons-email',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => false,
        'can_export'            => true,
        'has_archive'           => false,
        'exclude_from_search'   => true,
        'publicly_queryable'    => false,
        'capability_type'       => 'post',
    );
    register_post_type( 'eurofert_inquiry', $args );
}
add_action( 'init', 'eurofert_register_inquiry_cpt', 0 );


// 2. Handle AJAX Form Submission
function handle_eurofert_contact_submission() {
    // Verify nonce for security
    if ( ! isset( $_POST['security'] ) || ! wp_verify_nonce( $_POST['security'], 'eurofert_contact_nonce' ) ) {
        wp_send_json_error( array( 'message' => 'Security check failed. Please refresh and try again.' ) );
        wp_die();
    }

    // Sanitize input fields
    $name    = sanitize_text_field( $_POST['user_name'] ?? '' );
    $email   = sanitize_email( $_POST['user_email'] ?? '' );
    $phone   = sanitize_text_field( $_POST['user_phone'] ?? '' );
    $subject = sanitize_text_field( $_POST['user_subject'] ?? '' );
    $message = sanitize_textarea_field( $_POST['user_message'] ?? '' );

    if ( empty( $name ) || empty( $email ) || empty( $message ) ) {
        wp_send_json_error( array( 'message' => 'Please fill in all required fields.' ) );
        wp_die();
    }

    if ( ! is_email( $email ) ) {
        wp_send_json_error( array( 'message' => 'Please enter a valid email address.' ) );
        wp_die();
    }

    // Format content for the post
    $post_content = "<strong>Name:</strong> {$name}<br/>";
    $post_content .= "<strong>Email:</strong> {$email}<br/>";
    $post_content .= "<strong>Phone:</strong> {$phone}<br/>";
    $post_content .= "<strong>Subject:</strong> {$subject}<br/><br/>";
    $post_content .= "<strong>Message:</strong><br/>" . nl2br( $message );

    // Create the Custom Post
    $post_data = array(
        'post_title'    => 'Inquiry from ' . $name . ' - ' . date('Y-m-d H:i:s'),
        'post_content'  => $post_content,
        'post_status'   => 'publish',
        'post_type'     => 'eurofert_inquiry',
    );

    $post_id = wp_insert_post( $post_data );

    if ( is_wp_error( $post_id ) ) {
        wp_send_json_error( array( 'message' => 'Failed to save your inquiry. Please try again later.' ) );
        wp_die();
    }

    // Save extra fields as post meta for cleaner admin viewing
    update_post_meta( $post_id, '_inquiry_name', $name );
    update_post_meta( $post_id, '_inquiry_email', $email );
    update_post_meta( $post_id, '_inquiry_phone', $phone );
    update_post_meta( $post_id, '_inquiry_subject', $subject );

    // Send Email
    $to = 'info@eurofert-fertilizers.com';
    $mail_subject = 'New Website Inquiry: ' . ( $subject ? $subject : 'No Subject' );
    $headers = array('Content-Type: text/html; charset=UTF-8', 'Reply-To: ' . $name . ' <' . $email . '>');
    
    wp_mail( $to, $mail_subject, $post_content, $headers );

    wp_send_json_success( array( 'message' => 'Thank you! Your message has been sent successfully. We will get back to you shortly.' ) );
    wp_die();
}

add_action( 'wp_ajax_submit_eurofert_contact', 'handle_eurofert_contact_submission' );
add_action( 'wp_ajax_nopriv_submit_eurofert_contact', 'handle_eurofert_contact_submission' );

// 3. Localize script for AJAX URL and Nonce
function eurofert_contact_scripts() {
    wp_localize_script( 'main-eurofert-js', 'eurofertContact', array(
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'nonce'    => wp_create_nonce( 'eurofert_contact_nonce' )
    ));
}
add_action( 'wp_enqueue_scripts', 'eurofert_contact_scripts', 100 ); // high priority to run after script enqueue
