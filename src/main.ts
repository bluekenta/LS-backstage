import App from './App.vue';
import router from './router';
import { store } from '@/store';
import ElementPlus from 'element-plus';
import { useI18n } from '@/plugins/i18n';
import { getServerConfig } from './config';
import { createApp, Directive } from 'vue';
import { useEcharts } from "@/plugins/echarts";
import { injectResponsiveStorage } from '@/utils/responsive';

import Table from '@pureadmin/table';
// import PureDescriptions from "@pureadmin/descriptions";

// 引入重置样式
import './style/reset.scss';
// 导入公共样式
import './style/index.scss';
import 'plus-pro-components/es/components/search/style/css';
// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import './style/tailwind.css';
import 'element-plus/dist/index.css';
// 导入字体图标
import './assets/iconfont/iconfont.js';
import './assets/iconfont/iconfont.css';
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

const app = createApp(App);

// 自定义指令
import * as directives from '@/directives';
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// 全局注册`@iconify/vue`图标库
import {
  IconifyIconOffline,
  IconifyIconOnline,
  FontIcon
} from './components/ReIcon';
app.component('IconifyIconOffline', IconifyIconOffline);
app.component('IconifyIconOnline', IconifyIconOnline);
app.component('FontIcon', FontIcon);

// 全局注册按钮级别权限组件
import { Auth } from '@/components/ReAuth';
app.component('Auth', Auth);

//- 全局错误绑定
app.config.errorHandler = (err, vm, info) => {
  console.log('全局错误============:', err, vm, info);
};

getServerConfig(app).then(async config => {
  app.use(router);
  await router.isReady();
  injectResponsiveStorage(app, config as unknown as ServerConfigs);
  app.use(Table).use(store).use(useI18n).use(ElementPlus)
    .use(useEcharts);
  // .use(PureDescriptions);
  app.mount('#app');
});
