<template>
  <el-form
    ref="formRef"
    :inline="true"
    :model="form"
    class="search-form bg-bg_color w-[99/100] px-8 pt-[12px]"
  >
    <div class="mb-6 font-bold">{{ t('用户信息') }}</div>
    <div class="flex">
      <div class="mb-10 w-2/3 grid grid-rows-3 grid-flow-col">
        <el-row
          class="mb-2.5"
          v-for="(item, index) in userInfo(userData)"
          :key="index"
        >
          <div class="flex">
            <div class="mr-8 text-sm flex-shrink-0">{{ item.title }}</div>
            <div class="text-sm flex" v-html="item.value"></div>
          </div>
        </el-row>
      </div>
      <el-button
        v-if="hasAuth('changAccountAmount'.toUpperCase())"
        class="ml-auto"
        type="primary"
        @click="openModifyBalanceDialog()"
      >
        {{ t('修改余额') }}
      </el-button>
    </div>

    <!-- <el-form-item prop="accountChangeTypeCode">
      <el-select
        v-model="form.accountChangeTypeCode"
        :placeholder="`${t('请选择账变类型')}`"
        clearable
        class="!w-[200px]"
        multiple
      >
        <el-option :label="t('全部')" :value="' '" />
        <el-option
          :label="item.label"
          :value="item.value"
          v-for="item in accountChangeTypeCodeList"
          :key="item.value"
        />
      </el-select>
    </el-form-item> -->

    <el-form-item prop="accountChangeTypeCode">
      <el-tree-select
        v-model="form.accountChangeTypeCode"
        :placeholder="t('请选择账变类型')"
        :data="
          accountChangeTypeCodeList.map(item => ({
            value: item.value,
            label: item.label
          }))
        "
        @change="search"
        filterable
        clearable
        multiple
        collapse-tags
        :render-after-expand="false"
        show-checkbox
        check-strictly
        check-on-click-node
        style="width: 250px"
      >
        <template #header>
          <el-checkbox v-model="checkAllAcc" @change="handleCheckAllAcc">
            {{ t('全选') }}
          </el-checkbox>
          <el-checkbox
            v-model="removeAllAcc"
            @change="handleRemoveAllAcc"
            :disabled="form?.accountChangeTypeCode.length == 0"
          >
            {{ t('全不选') }}
          </el-checkbox>
          <el-checkbox v-model="checkRevertAcc" @change="handleCheckRevertAcc">
            {{ t('反选') }}
          </el-checkbox>
        </template>
      </el-tree-select>
    </el-form-item>

    <el-form-item :label="`${t('账变时间')}:`" prop="createTimeStart">
      <el-date-picker
        type="datetimerange"
        format="YYYY-MM-DD HH:mm:ss"
        v-model="selectDate"
        :start-placeholder="dayjs().startOf('month').format('YYYY-MM-DD')"
        :end-placeholder="dayjs().endOf('day').format('YYYY-MM-DD')"
        @change="changeDate"
      />
    </el-form-item>

    <el-form-item>
      <el-button :icon="useRenderIcon(RefreshIcon)" @click="resetForm(formRef)">
        {{ t('重置') }}
      </el-button>
      <el-button
        type="primary"
        :icon="useRenderIcon(SearchIcon)"
        :loading="loading"
        @click="search"
      >
        {{ t('筛选') }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { t } from '@/plugins/i18n';
import SearchIcon from '@iconify-icons/ep/search';
import RefreshIcon from '@iconify-icons/ep/refresh';
import { useRenderIcon } from '@/components/ReIcon/src/hooks';
import type { FormInstance, CheckboxValueType } from 'element-plus';
import dayjs from 'dayjs';
import { accountChangeRecordSearchFormType, userDataType } from './util/types';
import { accountChangeTypeCodeList } from './columns';
import { addThousandSeparator } from '@/utils/formatNumber';
import { hasAuth } from '@/router/utils';

const props = defineProps<{
  loading: boolean;
  form: accountChangeRecordSearchFormType;
  userData: userDataType;
}>();

// const userInfo = ref(props.userData);

const formRef = ref();
const selectDate = ref();

const checkAllAcc = ref(false);
const removeAllAcc = ref(false);
const checkRevertAcc = ref(false);

watch(
  () => props.form.accountChangeTypeCode,
  val => {
    if (!val || val.length === 0) {
      checkAllAcc.value = false;
    } else if (val.length === accountChangeTypeCodeList.length) {
      checkAllAcc.value = true;
      removeAllAcc.value = false;
    }
  }
);

const handleCheckAllAcc = (val: CheckboxValueType) => {
  if (val) {
    props.form.accountChangeTypeCode = accountChangeTypeCodeList.map(
      _ => _.value
    );
    removeAllAcc.value = false;
    checkRevertAcc.value = false;
  } else {
    props.form.accountChangeTypeCode = [];
  }
};

const handleRemoveAllAcc = () => {
  props.form.accountChangeTypeCode = [];
  removeAllAcc.value = false;
  checkRevertAcc.value = false;
};

const handleCheckRevertAcc = () => {
  if (true) {
    const oldArray = props.form.accountChangeTypeCode
      ? [...props.form.accountChangeTypeCode]
      : [];
    props.form.accountChangeTypeCode = accountChangeTypeCodeList
      .filter(_ => !oldArray.includes(_.value))
      .map(_ => _.value);
  }
};

const userInfo = (data: userDataType) => [
  { title: t('用户名'), value: data.userName },
  { title: t('用户ID'), value: data.userId },
  { title: t('用户币种'), value: t('人民币') },
  {
    title: t('可用余额'),
    value: addThousandSeparator(data.balance.toFixed(2))
  },
  { title: t(''), value: '' },
  { title: t(''), value: '' },
  { title: t('所属商户'), value: data.tenantName },
  { title: t(''), value: '' },
  { title: t(''), value: '' }
];

const emits = defineEmits([
  'onSearch',
  'exportFile',
  'openModifyBalanceDialog'
]);
const resetForm = (formEl: FormInstance | undefined) => {
  formEl.resetFields();
  selectDate.value = '';
  props.form.startCreatedAt = '';
  props.form.endCreatedAt = '';
  // props.form.startCreatedAt = dayjs()
  //   .startOf('month')
  //   .format('YYYY-MM-DD HH:mm:ss');
  // props.form.endCreatedAt = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss');
  search();
};

const exportFile = () => {
  emits('exportFile');
};

const changeDate = t => {
  if (!t) {
    props.form.startCreatedAt = '';
    props.form.endCreatedAt = '';
  } else {
    props.form.startCreatedAt = dayjs(t[0]).format('YYYY-MM-DD HH:mm:ss');

    props.form.endCreatedAt = dayjs(t[1]).format('YYYY-MM-DD HH:mm:ss');
  }
  search();
};

const search = () => {
  emits('onSearch', ...['reload']);
};

const openModifyBalanceDialog = () => {
  emits('openModifyBalanceDialog', ...[t('修改余额')]);
};
</script>
<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
.min-w100 {
  min-width: 100px;
}
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
.arrange2 {
  margin-left: -25px;
}
</style>
