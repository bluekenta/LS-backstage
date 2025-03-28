<template>
  <div class="select-none">
    <span style="display: none">aaa{{ test }}</span>
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
      <LanguageNav />
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <h2 class="outline-none">{{ title }}</h2>

          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
          >
            <el-form-item prop="username">
              <el-input
                clearable
                v-model="ruleForm.username"
                :placeholder="t('输入您的用户名')"
                :prefix-icon="useRenderIcon(User)"
                @keyup.enter="onLogin(ruleFormRef)"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                clearable
                show-password
                v-model="ruleForm.password"
                :placeholder="t('输入密码')"
                :prefix-icon="useRenderIcon(Lock)"
                @keyup.enter="onLogin(ruleFormRef)"
              />
            </el-form-item>
            <el-form-item :prop="buildType === 'pro' ? 'ukeyPassword' : 'none'">
              <el-input
                clearable
                v-enter="() => onLogin(ruleFormRef)"
                maxlength="30"
                v-model.trim="ruleForm.ukeyPassword"
                :placeholder="t('请输入U盾密码')"
                :prefix-icon="useRenderIcon(Lock)"
                @keyup.enter="onLogin(ruleFormRef)"
              />
            </el-form-item>

            <el-button
              class="w-full mt-4"
              size="default"
              type="primary"
              :loading="loading"
              @click="onLogin(ruleFormRef)"
            >
              {{ t('登录') }}
            </el-button>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message } from '@/utils/message';
import { loginRules } from './utils/rule';
import { useNav } from '@/layout/hooks/useNav';
import type { FormInstance } from 'element-plus';
import { useLayout } from '@/layout/hooks/useLayout';
import { getTopMenu, initRouter } from '@/router/utils';
import { bg, avatar, illustration } from './utils/static';
import { useRenderIcon } from '@/components/ReIcon/src/hooks';
import { toRaw } from 'vue';
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange';
import dayIcon from '@/assets/svg/day.svg?component';
import darkIcon from '@/assets/svg/dark.svg?component';
import Lock from '@iconify-icons/ri/lock-fill';
import User from '@iconify-icons/ri/user-3-fill';
import { addPathMatch } from '@/router/utils';
import { usePermissionStoreHook } from '@/store/permission';
import LanguageNav from '@/components/LanguageNav/index.vue';
import { useUserStore } from '@/store/user';
import { t } from '@/plugins/i18n';
import { getMD5 } from '@/utils/caypto';
import { useResetPasswordHook } from '@/hooks/resetPasswordHook';
import { REGEXP_PWD } from '@/components/ResetDialog/rule';

defineOptions({ name: 'Login' });
const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();
const { initStorage } = useLayout();
initStorage();
const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();
const { title } = useNav();
const userStore = useUserStore();
const buildType = import.meta.env.VITE_BUILD_TYPE;
const ruleForm = reactive({
  username: '',
  password: '',
  ukeyPassword: ''
});

const onLogin = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate((valid: boolean) => {
    if (valid) {
      _loginRequest();
    } else {
      loading.value = false;
    }
  });
};

const _loginRequest = async () => {
  usePermissionStoreHook().handleWholeMenus([]);
  addPathMatch();
  try {
    const res: UserAPI.Login = await API.login({
      name: ruleForm.username,
      pwd: getMD5(ruleForm.password),
      ukeyPassword: ruleForm.ukeyPassword
    });
    loading.value = false;
    if (res.code) return message(res.msg, { type: 'error' });
    //- 第一次登录强制弹出充值密码弹窗
    userStore.setUserInfo(res.data);

    if (!REGEXP_PWD.test(ruleForm.password) || res.data.flag === 1) {
      ruleForm.password = '';
      return openResetDialog();
    }

    initRouter()
      .then(async () => {
        message(t('登录成功'), { type: 'success' });
        router.push(getTopMenu(true).path as string);
      })
      .catch(err => {
        message(err, { type: 'error' });
        loading.value = false;
        userStore.clearUserInfo();
      });
  } catch (error: any) {
    message(error.message, { type: 'error' });
    loading.value = false;
  }
};

const test = ref('');
onMounted(() => {
  test.value = import.meta.env.VITE_BUILD_TYPE;
});

const { openResetDialog } = useResetPasswordHook();
</script>

<style scoped>
@import url('@/style/login.css');
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
