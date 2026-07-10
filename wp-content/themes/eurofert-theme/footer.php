    <!-- Footer Design updated v2.0 — redesign branch feat/footer-redesign -->

    <footer class="footer">
        <div class="footer-container">
            <div class="footer-upper">

                <!-- Column 1: Logo + tagline (unchanged logo src) -->
                <div class="footer-top-left-col">
                    <div class="content-wrapper">
                        <img class="footer-logo"
                            src="<?php echo get_template_directory_uri(); ?>/public/images/eurofert-logo.png"
                            alt="Eurofert Logo">
                        <p class="footer-subtitle">
                            Sustainable agricultural solutions. Trusted by farmers worldwide since 1985.
                        </p>
                    </div>
                </div>

                <!-- Column 2: Quick Links — horizontal nav -->
                <div class="footer-center-col">
                    <nav class="footer-quick-nav" aria-label="Quick Links">
                        <span class="footer-nav-label">Quick Links</span>
                        <ul class="footer-quick-nav-list">
                            <li><a href="<?php echo esc_url(home_url('/')); ?>">Home</a></li>
                            <li><a href="<?php echo esc_url(home_url('/contact-us/')); ?>">Contact Us</a></li>
                            <li><a href="<?php echo esc_url(home_url('/about')); ?>">About Us</a></li>
                            <li><a href="<?php echo esc_url(home_url('/product-categories')); ?>">Products Overview</a></li>
                        </ul>
                    </nav>
                </div>

                <!-- Column 3: Social badges (desktop upper-right) -->
                <div class="footer-end-col">
                    <div class="footer-social-block">
                        <span class="footer-nav-label">Follow Us</span>
                        <div class="footer-social-icons">
                            <a href="#" class="footer-social-icon" aria-label="LinkedIn">
                                <i class="fab fa-linkedin-in" aria-hidden="true"></i>
                            </a>
                            <a href="#" class="footer-social-icon" aria-label="Facebook">
                                <i class="fab fa-facebook-f" aria-hidden="true"></i>
                            </a>
                            <a href="#" class="footer-social-icon" aria-label="Instagram">
                                <i class="fab fa-instagram" aria-hidden="true"></i>
                            </a>
                            <a href="#" class="footer-social-icon" aria-label="YouTube">
                                <i class="fab fa-youtube" aria-hidden="true"></i>
                            </a>
                        </div>
                    </div>
                </div>

            </div><!-- /.footer-upper -->

            <hr class="footer-separator" aria-hidden="true" />

            <div class="footer-lower">

                <!-- Lower Col 1: Copyright -->
                <div class="footer-copyright-col">
                    <p class="copyright-text text-muted">
                        <strong>&copy; 2025 Eurofert. All rights reserved.</strong>
                    </p>
                </div>

                <!-- Lower Col 2: Legal links -->
                <div class="footer-legal-col">
                    <ul class="footer-legal-list">
                        <li><a href="#" class="footer-legal-link text-muted">Privacy Policy</a></li>
                        <li><a href="#" class="footer-legal-link text-muted">Terms of Service</a></li>
                        <li><a href="#" class="footer-legal-link text-muted">Cookie Policy</a></li>
                    </ul>
                </div>

                <!-- Lower Col 3: Get in Touch -->
                <div class="footer-cta-col">
                    <a href="<?php echo esc_url(home_url('/contact-us/')); ?>"
                        class="footer-cta-btn"
                        aria-label="Open contact form">
                        Get in Touch &rarr;
                    </a>
                </div>

            </div><!-- /.footer-lower -->

        </div><!-- /.footer-container -->
    </footer>


    <?php get_template_part('template-parts/components/back-to-top'); ?>
    <?php wp_footer(); ?>
    </body>


    </html>