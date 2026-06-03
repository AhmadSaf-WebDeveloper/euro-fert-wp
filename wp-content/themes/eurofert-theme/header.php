<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <?php wp_head(); ?>

</head>


<body <?php body_class('has-fixed-header'); ?>>

  <!-- Header -->
  <header class="header" id="header">

    <nav class="site-nav">
      <a class="brand-logo" href="<?php echo esc_url(home_url('/')); ?>">
        <img
          src="<?php echo esc_url(get_theme_file_uri('/images/eurofert-logo.png')); ?>"
          alt="Eurofert Logo"
          class="logo"
          loading="eager"
          width="185"
          height="auto" />
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <!-- navbar collapse parent -->
      <div class="main-menu collapse navbar-collapse-container" id="navbarSupportedContent">
        <div class="menu-header">
          <h5 class="menu-title">Menu Navigation</h5>
        </div>

        <!-- Nav menu list-->
        <ul class="nav-menu">
          <li class="nav-item">
            <a class="nav-link active" href="<?php echo esc_url(home_url('/')); ?>"><span>Home</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="services.html"><span>Contact us</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="about.html"><span>About Us</span></a>
          </li>

          <!-- Dropdown list Product Categories-->
          <li class="nav-item has-dropdown" data-toggle="dropdown">
            <a class="nav-link parent-link">
              <span class="link-title">Product Categories</span>
            </a>

            <!-- dropdown list Opener-->
            <span class="nav-opener" aria-label="Open submenu">
              <i class="fas fa-chevron-up arrow-icon"></i>
              <!-- arrow icon-->
            </span>

            <!-- Mobile and Desktop Categories Sub-menu -->
            <?php
            // Build category URLs dynamically from WP taxonomy slugs
            $cat_base = 'fertilizer_category';
            $cats = array(
              array( 'slug' => 'colfert-essential',  'label' => 'Colfert Essential'  ),
              array( 'slug' => 'colfert-power',      'label' => 'Colfert Power NP'   ),
              array( 'slug' => 'colfert-npk',        'label' => 'Colfert NPK'        ),
              array( 'slug' => 'colfert-foliar',     'label' => 'Colfert Foliar'     ),
              array( 'slug' => 'colfert-trace',      'label' => 'Colfert Trace'      ),
              array( 'slug' => 'colfert-special',    'label' => 'Colfert Special'    ),
              array( 'slug' => 'colfert-terra',      'label' => 'Colfert Terra'      ),
            );
            ?>
            <ul class="dropdown-menu submenu-items">
              <li class="submenu-item submenu-title">
                <a class="submenu__link" href="<?php echo esc_url( home_url( '/product-category/' ) ); ?>">
                  Product Categories Overview</a>
              </li>

              <div>
                <?php foreach ( $cats as $cat ) :
                  $term = get_term_by( 'slug', $cat['slug'], $cat_base );
                  $url  = $term ? esc_url( get_term_link( $term ) ) : '#';
                ?>
                <li class="submenu-item">
                  <a href="<?php echo $url; ?>" class="submenu__link"><?php echo esc_html( $cat['label'] ); ?></a>
                </li>
                <?php endforeach; ?>
              </div>
            </ul>
          </li>
        </ul>
      </div>
      <!-- navbar collapse wrapper end-->
      <div
        class="drawer-backdrop"
        data-drawer-backdrop
        aria-hidden="true"></div>
    </nav>

  </header>