<script>
import { refreshApp, notifyReminders } from './store/app'
let clock
export default {
  onLaunch() {
    refreshApp()
  },
  onShow() {
    refreshApp()
    notifyReminders()
    clearInterval(clock)
    clock = setInterval(() => { refreshApp(); notifyReminders() }, 60000)
  },
  onHide() {
    clearInterval(clock)
  }
}
</script>

<style>
@import './styles/theme.css';
</style>
