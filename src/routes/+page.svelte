<script>
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
  import { faTwitter, faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
</script>

<svelte:head>
  <title>Kannan Xiao - Portfolio</title>
  <meta name="description" content="Kannan Xiao's personal portfolio website." />
</svelte:head>

<div class="container mx-auto px-4 py-8 text-center">
  <img src="/favicon.png" alt="Kannan Xiao" class="rounded-full w-32 h-32 mx-auto mb-4" />
  <h1 class="text-4xl font-bold mb-4">Kannan Xiao</h1>
  <p class="text-gray-700 mb-4">
    SvelteKit expert and UI/UX designer.
  </p>
  <p class="text-gray-700 mb-4">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  </p>
  <div class="flex justify-center space-x-4">
    <a href="#" class="text-gray-500 hover:text-green-500 flex items-center">
      <FontAwesomeIcon icon={faTwitter} class="w-6 h-6 mr-2" />
      Twitter
    </a>
    <a href="#" class="text-gray-500 hover:text-green-500 flex items-center">
      <FontAwesomeIcon icon={faLinkedin} class="w-6 h-6 mr-2" />
      LinkedIn
    </a>
    <a href="#" class="text-gray-500 hover:text-green-500 flex items-center">
      <FontAwesomeIcon icon={faGithub} class="w-6 h-6 mr-2" />
      GitHub
    </a>
  </div>
</div>
