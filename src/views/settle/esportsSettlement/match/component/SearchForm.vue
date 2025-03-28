<template>
  <div class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
    <el-form ref="formRef" :inline="true" :model="form">
      <el-form-item :label="`${t('联赛')}:`" prop="leagueId">
        <el-select
          v-model="form.leagueId"
          clearable
          filterable
          remote
          @change="search"
          :remote-method="
            debounce(
              query => matchStore.search_league_list(query, form.sportId, 1),
              1000
            )
          "
          class="!w-[280px]"
          :placeholder="t('请选择联赛')"
          :loading="matchStore.matchSearchLoading"
        >
          <el-option
            v-for="item in matchStore.esportLeagueList"
            :key="item.leagueId"
            :label="item.leagueNameCn"
            :value="item.leagueId"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="`${t('游戏名称')}:`" prop="gameName">
        <el-select
          v-model="form.sportId"
          filterable
          clearable
          class="!w-[210px]"
          :placeholder="t('请选择游戏')"
        >
          <el-option
            v-for="item in ESPORT_ID_MAP"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="`${t('赛事ID')}:`" prop="matchId">
        <el-input
          v-model="form.matchId"
          :placeholder="t('请输入赛事ID')"
          v-enter="search"
          clearable
          :formatter="(v:string) => formatNumber(v)"
          class="!w-[180px]"
        />
      </el-form-item>

      <el-form-item :label="`${t('锁盘状态')}:`" prop="handicapStatus">
        <el-select
          class="!w-[150px]"
          v-model="form.handicapStatus"
          clearable
          :placeholder="t('请选择')"
          @change="search"
        >
          <el-option
            :label="item"
            :value="index"
            v-for="(item, index) in HANDICAP_STATUS"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="`${t('赛事状态')}:`" prop="status">
        <el-select
          class="!w-[180px]"
          v-model="form.status"
          clearable
          :placeholder="t('请选择')"
          @change="search"
        >
          <el-option
            v-for="(d, index) in NEW_MATCH_STATUS"
            :key="index"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="`${t('日期选择')}:`" prop="startTime">
        <!--  :disabled-date="disableDate" -->
        <!-- <el-date-picker
          class="ml-4 !w-[260px]"
          v-model="time"
          :start-placeholder="t('开始日期')"
          :end-placeholder="t('结束如期')"
          type="daterange"
          value-format="x"
          format="YYYY-MM-DD"
          @change="changeDate"
        /> -->
        <CustomDate v-model:val="time" @changeDate="changeDate" />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="search"
        >
          {{ t('筛选') }}
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          {{ t('重置') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { t } from '@/plugins/i18n';
import { useRenderIcon } from '@/components/ReIcon/src/hooks';
import Search from '@iconify-icons/ep/search';
import Refresh from '@iconify-icons/ep/refresh';
import type { FormInstance } from 'element-plus';
import { SearchFormType } from '../utils/types';
import dayjs from 'dayjs';
import { useMatchStore } from '@/store/match';
import { formatNumber } from '@/utils/formatNumber';
import CustomDate from '@/components/Form/Custom_date.vue';

import { ESPORT_ID_MAP, HANDICAP_STATUS } from '@/utils/maps/sports_map';
import { debounce } from '@pureadmin/utils';
import { NEW_MATCH_STATUS } from '@/views/settle/main/utils/map';

const formRef = ref();
const emits = defineEmits(['onSearch', 'changeMatchCondition']);
const matchStore = useMatchStore();
const time = ref('');
const props = withDefaults(
  defineProps<{
    loading: boolean;
    form: SearchFormType;
    matchCondition: number;
  }>(),
  {}
);

const changeDate = (t: number[]) => {
  if (!t) {
    props.form.startTime = '';
    props.form.endTime = '';
  } else {
    props.form.startTime = dayjs(t[0]).format('YYYY-MM-DD HH:mm:ss');
    props.form.endTime = dayjs(t[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss');
  }
  search();
};

const resetForm = (_formEl: FormInstance | undefined) => {
  Object.keys(props.form).forEach(
    (key: keyof SearchFormType) => (props.form[key] = '')
  );
  time.value = '';
  // formEl.resetFields();
  emits('onSearch', ...['reload']);
};

const search = () => {
  emits('onSearch', ...['reload']);
};
</script>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
