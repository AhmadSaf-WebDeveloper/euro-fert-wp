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
          src="<?php echo esc_url(get_theme_file_uri('/public/images/eurofert-logo.png')); ?>"
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
            <a class="nav-link" href="<?php echo esc_url(site_url('/contact-us/')); ?>" id="contact-modal-trigger" aria-haspopup="dialog" aria-controls="contact-modal"><span>Contact us</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="about.html"><span>About Us</span></a>
          </li>

          <!-- Dropdown list Product Categories-->
          <li class="nav-item has-dropdown" data-toggle="dropdown">
            <a class="nav-link parent-link">
              <span class="link-title">Products</span>
            </a>

            <!-- dropdown list Opener-->
            <span class="nav-opener" aria-label="Open submenu">
              <i class="fas fa-chevron-up arrow-icon"></i>
              <!-- arrow icon-->
            </span>

            <!-- Mobile and Desktop Categories Sub-menu -->
            <?php
            $cat_base = 'fertilizer_category';
            $product_categories = get_terms(array(
              'taxonomy'   => $cat_base,
              'hide_empty' => false,
              'orderby'    => 'name',
              'order'      => 'ASC',
            ));
            ?>
            <ul class="dropdown-menu submenu-items">
              <li class="submenu-item submenu-title">
                <a class="submenu__link" href="<?php echo esc_url(home_url('/product-category/')); ?>">
                  Products Overview</a>
              </li>

              <div>
                <?php
                if (!is_wp_error($product_categories) && !empty($product_categories)) :
                  foreach ($product_categories as $single_category) :
                    $url = esc_url(get_term_link($single_category));
                ?>
                  <li class="submenu-item">
                    <a href="<?php echo $url; ?>" class="submenu__link"><?php echo esc_html($single_category->name); ?></a>
                  </li>
                <?php
                  endforeach;
                endif;
                ?>
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

  <!-- ═══════════════════════════════════════════════════════════
       CONTACT US MODAL OVERLAY
       Position: fixed, full-screen, z-index: 9999
       Floats above the front-page hero. JS toggles .is-open
  ═══════════════════════════════════════════════════════════ -->
  <div id="contact-modal" class="contact-modal" role="dialog" aria-modal="true" aria-label="Contact Us" hidden>

    <!-- Backdrop: semi-transparent so the front-page hero shows through -->
    <div class="contact-modal__backdrop" id="contact-modal-backdrop"></div>

    <!-- Molecule watermarks: left & right, transparent SVG floats above the hero -->
    <div class="contact-modal__molecule contact-modal__molecule--left" aria-hidden="true"></div>
    <div class="contact-modal__molecule contact-modal__molecule--right" aria-hidden="true"></div>

    <!-- Mobile: tap-outside hint (desktop users have the X button + Escape) -->
    <div class="contact-modal__tap-hint" aria-hidden="true">Tap outside to close</div>

    <!-- Dialog wrapper allows placing elements outside the card without overflow cropping -->
    <div class="contact-modal__dialog">

      <!-- Close button -->
      <button class="contact-modal__close" id="contact-modal-close" aria-label="Close contact form">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <!-- Central contact card -->
      <div class="contact-modal__card">

        <div class="contact-modal__grid">

          <!-- LEFT: Brand Info (Solid Green) -->
          <div class="contact-modal__info">
            <div class="contact-modal__info-inner">
              <h2 class="contact-modal__brand">Eurofert Fertilizers &mdash; Egypt</h2>

              <ul class="contact-modal__list">
                <li class="contact-modal__list-item">
                  <span class="contact-modal__icon"><i class="fas fa-map-marker-alt"></i></span>
                  <div>
                    <strong>Headquarters &amp; Factory</strong>
                    <p>4th Industrial Zone, Block 16<br>Borg El Arab Industrial City, Alexandria, Egypt</p>
                  </div>
                </li>
                <li class="contact-modal__list-item">
                  <span class="contact-modal__icon"><i class="fas fa-phone-alt"></i></span>
                  <div>
                    <strong>Phone</strong>
                    <p>Tel.: 002 03 5890223 4 / 5 / 6</p>
                  </div>
                </li>
                <li class="contact-modal__list-item">
                  <span class="contact-modal__icon"><i class="fas fa-envelope"></i></span>
                  <div>
                    <strong>Email</strong>
                    <p><a href="mailto:info@eurofert-fertilizers.com" class="contact-modal__email">info@eurofert-fertilizers.com</a></p>
                  </div>
                </li>
              </ul>

              <div class="contact-modal__hours">
                <h4><i class="far fa-clock"></i> Opening Hours</h4>
                <p><span>Sunday &ndash; Thursday:</span> <strong>8:00 AM &ndash; 5:00 PM</strong></p>
                <p><span>Friday &ndash; Saturday:</span> <strong>Closed</strong></p>
              </div>
            </div>
          </div>

          <!-- RIGHT: Contact Form (Pure White) -->
          <div class="contact-modal__form-col">
            <h3 class="contact-modal__form-title">Send us a Message</h3>

            <form id="eurofert-contact-form" class="contact-modal__form" method="post" novalidate>
              <div id="contact-response-message" class="contact-modal__response" style="display:none;"></div>

              <div class="contact-modal__row">
                <div class="contact-modal__field">
                  <label for="user_name">Your Name</label>
                  <input type="text" id="user_name" name="user_name" placeholder="Full name" required>
                </div>
                <div class="contact-modal__field">
                  <label for="user_email">Your Email</label>
                  <input type="email" id="user_email" name="user_email" placeholder="email@domain.com" required>
                </div>
              </div>

              <div class="contact-modal__row">
                <div class="contact-modal__field">
                  <label for="user_phone">Phone Number</label>
                  <input type="tel" id="user_phone" name="user_phone" placeholder="+20 000 000 0000">
                </div>
                <div class="contact-modal__field">
                  <label for="user_subject">Subject</label>
                  <input type="text" id="user_subject" name="user_subject" placeholder="Inquiry about...">
                </div>
              </div>

              <div class="contact-modal__field contact-modal__field--full">
                <label for="user_message">Your Message</label>
                <textarea id="user_message" name="user_message" rows="4" placeholder="Write your message here..." required></textarea>
              </div>

              <button type="submit" class="contact-modal__submit">
                <span>Submit Inquiry</span>
                <i class="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>

        </div><!-- /.contact-modal__grid -->
      </div><!-- /.contact-modal__card -->
    </div><!-- /.contact-modal__dialog -->
  </div><!-- /#contact-modal -->