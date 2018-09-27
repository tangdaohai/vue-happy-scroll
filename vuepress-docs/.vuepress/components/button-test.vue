<template>
  <div style="margin: 20px;">
    <button class="h-button mdc-button--raised mdc-elevation--1">
      Button
    </button>
  </div>
</template>
<script>
  import {MDCRipple} from '@material/ripple';
  import './import.js'
  export default {
    mounted () {
      const ripple = new MDCRipple(document.querySelector('.foo-button'));
    }
  }
</script>
