import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import theme from 'muse-ui/lib/theme';
import * as colors from 'muse-ui/lib/theme/colors';
import Toast from 'muse-ui-toast';
import 'muse-ui-loading/dist/muse-ui-loading.css'; // load css
import 'muse-ui-message/dist/muse-ui-message.css';

import Loading from 'muse-ui-loading';
import Message from 'muse-ui-message';

import axios from 'axios';

// 给Vue实例添加一个是个属性，这样在每个实例中就可以使用this.$http来访问axios实例了
Vue.prototype.$http = axios

// 请求拦截器：在发送请求前拦截

axios.interceptors.request.use(config => {
  //console.log('请求发送前拦截')
  config.headers.common['AccessToken'] = 'token'
  return config;
}, error => {
  return Promise.reject(error)
})

// 响应拦截器：在请求响应之后拦截
axios.interceptors.response.use(response => {
  //console.log('请求响应后处理')
  return response;
}, error => {
  return Promise.reject(error)
})

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
Vue.use(Loading);
Vue.use(Message);

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
