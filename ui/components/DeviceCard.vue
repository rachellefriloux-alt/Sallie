<!-- Migrated and adapted from sallie_1.00/ui/components/DeviceCard.vue -->
<template>
  <div class="device-card">
    <h3>{{ device.name }}</h3>
    <p>Status: {{ device.status }}</p>
    <button @click="$emit('control', device)">Control</button>
  </div>
</template>
<script>
export default {
  props: {
    device: Object
  }
}
</script>
<style scoped>
.device-card {
  background: var(--background-secondary, #1e293b);
  border-radius: var(--border-radius, 8px);
  box-shadow: var(--shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  padding: 1em;
  margin: 1em 0;
  color: var(--text-primary, #f8fafc);
}
button {
  background: var(--sallie-success, #10b981);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1em;
  cursor: pointer;
  transition: var(--transition, all 0.2s ease-in-out);
}
button:hover {
  background: var(--sallie-accent, #06b6d4);
}
</style>
