<template>
  <div ref="appWrapperRef" :class="['app-wrapper', set.classes]">
    <div
      v-show="
        set.device === 'mobile' &&
        set.sidebar.opened &&
        layout.includes('vertical')
      "
      class="app-mask"
      @click="useAppStoreHook().toggleSideBar()"
    />
    <Vertical
      v-show="
        !pureSetting.hiddenSideBar &&
        (layout.includes('vertical') || layout.includes('mix'))
      "
    />
    <div
      :class="[
        'main-container',
        pureSetting.hiddenSideBar ? 'main-hidden' : ''
      ]"
    >
      <div v-if="set.fixedHeader">
        <layout-header />
        <!-- 主体内容 -->
        <app-main :fixed-header="set.fixedHeader" />
      </div>
      <el-scrollbar v-else>
        <el-backtop
          title="回到顶部"
          target=".main-container .el-scrollbar__wrap"
        >
          <backTop />
        </el-backtop>
        <layout-header />
        <!-- 主体内容 -->
        <app-main :fixed-header="set.fixedHeader" />
      </el-scrollbar>
    </div>
    <!-- 系统设置 -->
    <setting />
  </div>
</template>

<script setup lang="ts">
import 'animate.css';
import '@/components/ReIcon/src/offlineIcon';
import { setType } from './types';
import { useLayout } from './hooks/useLayout';
import { useResizeObserver } from '@vueuse/core';
import { useAppStore, useAppStoreHook } from '@/store/app';
import { useSettingStoreHook } from '@/store/settings';
import {
  deviceDetection,
  useDark,
  useGlobal,
  useWatermark
} from '@pureadmin/utils';
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange';
import {
  h,
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeMount,
  defineComponent
} from 'vue';

import navbar from './components/navbar.vue';
import tag from './components/tag/index.vue';
import appMain from './components/appMain.vue';
import setting from './components/setting/index.vue';
import Vertical from './components/sidebar/vertical.vue';
import Horizontal from './components/sidebar/horizontal.vue';
import backTop from '@/assets/svg/back_top.svg?component';
import { useMatchStore } from '@/store/match';
import { useUserStore } from '@/store/user';
import dayjs from 'dayjs';

const appWrapperRef = ref();
const { isDark } = useDark();
const { layout } = useLayout();
const isMobile = deviceDetection();
const pureSetting = useSettingStoreHook();
const { $storage } = useGlobal<GlobalPropertiesApi>();
const matchStore = useMatchStore();
const appStore = useAppStore();
const { setWatermark, clear } = useWatermark();
const userState = useUserStore();

const set: setType = reactive({
  sidebar: computed(() => {
    return appStore.sidebar;
  }),

  device: computed(() => {
    return useAppStoreHook().device;
  }),

  fixedHeader: computed(() => {
    return pureSetting.fixedHeader;
  }),

  classes: computed(() => {
    return {
      hideSidebar: !appStore.sidebar.opened,
      openSidebar: appStore.sidebar.opened,
      withoutAnimation: appStore.sidebar.withoutAnimation,
      mobile: appStore.device === 'mobile'
    };
  }),

  hideTabs: computed(() => {
    return $storage?.configure.hideTabs;
  })
});

function setTheme(layoutModel: string) {
  window.document.body.setAttribute('layout', layoutModel);
  $storage.layout = {
    layout: `${layoutModel}`,
    theme: $storage.layout?.theme,
    darkMode: $storage.layout?.darkMode,
    sidebarStatus: $storage.layout?.sidebarStatus,
    epThemeColor: $storage.layout?.epThemeColor
  };
}

function toggle(device: string, bool: boolean) {
  useAppStoreHook().toggleDevice(device);
  useAppStoreHook().toggleSideBar(bool, 'resize');
}

// 判断是否可自动关闭菜单栏
let isAutoCloseSidebar = true;

useResizeObserver(appWrapperRef, entries => {
  if (isMobile) return;
  const entry = entries[0];
  const { width } = entry.contentRect;
  width <= 760 ? setTheme('vertical') : setTheme(useAppStoreHook().layout);
  /** width app-wrapper类容器宽度
   * 0 < width <= 760 隐藏侧边栏
   * 760 < width <= 990 折叠侧边栏
   * width > 990 展开侧边栏
   */
  if (width > 0 && width <= 760) {
    toggle('mobile', false);
    isAutoCloseSidebar = true;
  } else if (width > 760 && width <= 990) {
    if (isAutoCloseSidebar) {
      toggle('desktop', false);
      isAutoCloseSidebar = false;
    }
  } else if (width > 990 && !set.sidebar.isClickCollapse) {
    toggle('desktop', true);
    isAutoCloseSidebar = true;
  } else {
    toggle('desktop', false);
    isAutoCloseSidebar = false;
  }
});

onMounted(() => {
  if (isMobile) {
    toggle('mobile', false);
  }
  matchStore.set_countryList();
  nextTick(() => {
    setWatermark(
      `${userState.userInfo.name}-${userState.userInfo.dept}-${dayjs().format(
        'YYYY-MM-DD'
      )}`,
      {
        width: 350,
        globalAlpha: 0.3,
        height: 150
      }
    );
  });
});

onBeforeMount(() => {
  useDataThemeChange().dataThemeChange();
});

const layoutHeader = defineComponent({
  render() {
    return h(
      'div',
      {
        class: { 'fixed-header': set.fixedHeader },
        style: [
          set.hideTabs && layout.value.includes('horizontal')
            ? isDark.value
              ? 'box-shadow: 0 1px 4px #0d0d0d'
              : 'box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08)'
            : ''
        ]
      },
      {
        default: () => [
          !pureSetting.hiddenSideBar &&
          (layout.value.includes('vertical') || layout.value.includes('mix'))
            ? h(navbar)
            : null,
          !pureSetting.hiddenSideBar && layout.value.includes('horizontal')
            ? h(Horizontal)
            : null,
          h(tag)
        ]
      }
    );
  }
});

onBeforeUnmount(() => {
  clear();
});
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;

  &::after {
    display: table;
    clear: both;
    content: '';
  }

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.app-mask {
  position: absolute;
  top: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  background: #000;
  opacity: 0.3;
}

.re-screen {
  margin-top: 12px;
}
</style>
