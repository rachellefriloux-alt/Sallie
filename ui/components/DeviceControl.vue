<!-- Migrated and enhanced from sallie_1.00/ui/components/DeviceControl.vue -->
<template>
  <div class="device-control">
    <h3>Device Control</h3>
    <slot></slot>
  </div>
</template>
<script>
export default {
}
</script>
<style scoped>
.device-control {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
}
</style>
