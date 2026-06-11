<?php get_header();
/**
 * taxonomy-fertilizer_category.php
 * Purpose: WP version of products.html (category -> products page) */

/* NEW START: Current category (taxonomy term) context
 This template is loaded when visiting:
 /product-category/<term-slug>*/


$category_obj = get_queried_object();
$category_name = isset($category_obj->name) ? (string) $category_obj->name : 'Product Category';


$category_desc_input = isset($category_obj->description) ? (string) $category_obj->description : 'Description of Category';
$category_desc_input = trim($category_desc_input);

$category_desc = ($category_desc_input !== '')
  ? trim($category_desc_input)
  : 'Explore our range of products within this category.';


// Hero image: read per-category ACF field 'category_featured_image'.
// Falls back to ID 52 (generic bottles image, derivatives intact) if field is empty.
$category_hero_id = 0;
if ( function_exists( 'get_field' ) && isset( $category_obj->term_id ) ) {
  $hero_field = get_field( 'category_featured_image', 'term_' . $category_obj->term_id );
  if ( is_array( $hero_field ) && isset( $hero_field['ID'] ) ) {
    $category_hero_id = (int) $hero_field['ID'];
  } elseif ( is_numeric( $hero_field ) ) {
    $category_hero_id = (int) $hero_field;
  } elseif ( is_object( $hero_field ) && isset( $hero_field->ID ) ) {
    $category_hero_id = (int) $hero_field->ID;
  }
}
if ( ! $category_hero_id ) {
  $category_hero_id = 52; // Fallback: eurofert-category-hero-bottles-hd (derivatives exist)
}

// Category Brochure — ACF field 'category_brochure' returns a file attachment ID.
// We resolve it to a URL so we can build a real download link.
$brochure_url = '';
if (function_exists('get_field') && isset($category_obj->term_id)) {
  $brochure_id = get_field('category_brochure', 'term_' . $category_obj->term_id);
  if ($brochure_id) {
    $brochure_url = wp_get_attachment_url((int) $brochure_id);
  }
}
?>
<main class="content">
  <section class="category-hero">
    <div class="container category-hero__layout">

      <div class="category-hero__content">
        <h1 class="category-hero__title fw-bold">
          <?php echo esc_html($category_name); ?>
        </h1>
        
        <div class="category-hero__description" id="pageHeaderLead">
          <div class="category-hero__description-text is-truncated" id="heroDescText">
            <?php echo wpautop(esc_html($category_desc)); ?>
          </div>
          <button class="category-hero__read-more" id="heroReadMoreBtn" aria-expanded="false" style="display: none;">
            Read more <span class="read-more-arrows">&raquo;</span>
          </button>
        </div>
        
        <?php if ($brochure_url): ?>
        <div class="category-hero__actions">
          <a href="<?php echo esc_url($brochure_url); ?>" class="btn btn-primary btn-attention" download>
            <i class="fas fa-file-pdf me-2"></i>Download Brochure
          </a>
        </div>
        <?php endif; ?>
      </div>

      <div class="category-hero__media">
        <?php if ($category_hero_id):
          echo wp_get_attachment_image(
            $category_hero_id,
            'full',
            false,
            array(
              'class' => 'category-hero__img',
              'alt' => '',
              'aria-hidden' => 'true',
              'loading' => 'eager',
              'decoding' => 'async',
              'sizes' => '(max-width: 767.98px) 100vw, (max-width: 1199.98px) 50vw, 800px'
            )
          );
        // END wp_get_attachment_image()
        endif;
        ?>
      </div>
      
    </div>
  </section>

  <!-- Product Grid -->
  <section class="product-section" id="productGridContainer">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center m-4">
        <a class="back-nav-link"
           href="<?php echo esc_url(home_url('/#categories-grid')); ?>"
           aria-label="Back to product categories on the homepage">
          <span class="back-nav-link__arrow" aria-hidden="true">
            <i class="fa-solid fa-arrow-left"></i>
          </span>
          <span class="back-nav-link__label">Back to Home</span>
        </a>
      </div>

      <div class="product-grid" id="productGrid">
        <?php
        /** 1 check if current taxonomy term have products */
        if (have_posts()):
          while (have_posts()):
            the_post();

            $product_url = get_permalink();
            $product_formula = function_exists('get_field') ? get_field('formula') : '';
        ?>
            <a class="product-grid__col card product-grid__item" href="<?php echo esc_url($product_url); ?>">
              <div class="product-grid__media">
                <?php
                $product_image_id = get_post_thumbnail_id(get_the_ID());

                if ($product_image_id) {
                  echo wp_get_attachment_image(
                    $product_image_id,
                    'product_portrait_thumb',
                    false,
                    array(
                      'class' => 'product-grid__img',
                      'alt' => get_the_title(),
                      'loading' => 'lazy',
                      'decoding' => 'async'
                    )
                  );
                }
                ?>
              </div>
              <div class="product-grid__content">
                <div class="card-body product-grid__body">
                  <h5 class="product-grid__title"> <?php echo esc_html(get_product_base_name(get_the_title())); ?></h5>
                  <?php if (!empty($product_formula)): ?>
                    <p class="product-grid__formula">
                      <?php echo esc_html($product_formula) ?>
                    </p>
                  <?php endif; ?>
                </div>
                <div class="product-grid__footer">
                  <small class="product-grid__cta text-primary fw-bold">View Details</small>
                  <i class="fas fa-arrow-right text-primary product-grid__arrow"></i>
                </div>
              </div>


            </a>


          <?php endwhile;

        else: ?>
          <div class="col-12">
            <p class="text-muted mb-0">
              <?php echo esc_html__('No products found in this category yet.', 'eurofert'); ?>
            </p>
          </div>
        <?php endif; // END if (have_posts()) 
        ?>

      </div>
    </div>
  </section>
</main>
<?php
get_footer();
?>