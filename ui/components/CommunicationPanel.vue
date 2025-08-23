<!-- Migrated and enhanced from sallie_1.00/ui/components/CommunicationPanel.vue -->
<template>
  <div class="communication-panel">
    <h2>Communication</h2>
    <slot></slot>
  </div>
</template>
<script>
export default {
}
</script>
<style scoped>
.communication-panel {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
  padding: 2em;
  margin: 2em 0;
  color: var(--text-primary, #f8fafc);
}
</style>
