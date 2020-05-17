import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import theme from 'muse-ui/lib/theme';
import * as colors from 'muse-ui/lib/theme/colors';
import Toast from 'muse-ui-toast';
// import 'typeface-roboto'
// import './scrollbar'

/**
 * muse 主题
 */
theme.add('custom-theme', {
  primary: '#009688',
  secondary: colors.pinkA200,
  background: {
    default: '#263238'
  }
});
theme.use('custom-theme');
Vue.use(MuseUI);

Vue.use(Toast, {
  position: 'top',               // 弹出的位置
  time: 2000,                       // 显示的时长
  closeIcon: 'close',               // 关闭的图标
  close: false,                      // 是否显示关闭按钮
  successIcon: 'check_circle',      // 成功信息图标
  infoIcon: 'info',                 // 信息信息图标
  warningIcon: 'priority_high',     // 提醒信息图标
  errorIcon: 'warning',              // 错误信息图标
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
