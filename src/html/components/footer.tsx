export const Footer = () => {
  return (
    <footer>
      <div class="columns">
        <div class="span-4">
          <p>Marca Tatem</p>
          <p class="build-info">Build [revision], took [took]ms</p>
        </div>
        <div class="span-2">
          <p class="contact">
            <a href="tel:+(415)-523-2810">(415) 523 2810</a>
          </p>
        </div>
        <div class="span-2">
          <p class="contact">
            <a href="mailto:marca@me.com">marca@me.com</a>
          </p>
        </div>
        <div class="span-4 ">
          <p class="back-to-top">
            <a href="#about" class="smooth">Back to top</a>
          </p>
        </div>
      </div>
      <div class="compact">
        <div class="contact">
          <p>Marca Tatem</p>
          <p>
            <a href="tel:+(415)-523-2810">(415) 523 2810</a>
          </p>
          <p>
            <a href="mailto:marca@me.com">marca@me.com</a>
          </p>
          <p class="build-info">Build [revision], took [took]ms</p>
        </div>
        <div class="tools">
          <p class="back-to-top">
            <a href="#about" class="smooth">Back to top</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
