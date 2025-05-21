<script lang="ts">
  import '../app.css';
</script>

<div class="min-h-screen flex flex-col">
  <header class="bg-green-500 text-white py-4">
    <div class="container mx-auto px-4 flex items-center justify-between">
      <a href="/" class="text-2xl font-bold">Kannan Xiao</a>
      <nav>
        <ul class="flex space-x-4 list-none">
          <li><a href="/about" class="hover:text-green-200">About</a></li>
          <li><a href="/works" class="hover:text-green-200">Works</a></li>
          <li><a href="/portfolio" class="hover:text-green-200">Portfolio</a></li>
        </ul>
      </nav>
    </div>
  </header>
  <main class="container mx-auto px-4 py-8 flex-1">
    <slot />
  </main>
</div>
