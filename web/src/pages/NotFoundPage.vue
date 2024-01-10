<template>
  <h1>Error 404</h1>
  <p>Oops! The page you're looking doesn't exist.</p>
  <hr />
  <p>Site: ${applicationName}</p>
  <p>Version: ${releaseTag}</p>
  <p>Commit Hash: ${gitCommitHash}</p>
</template>

<script lang="ts" setup>

</script>

<style scoped>
body {
  text-align: center;
  padding-top: 100px;
}
hr {
  margin-top: 30px;
  margin-bottom: 30px;
}
</style>
