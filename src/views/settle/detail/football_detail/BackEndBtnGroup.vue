<template>
  <div class="flex" v-if="!row.canceled">
    <template v-if="row.isShowCount && row.settleTimes < 1">
      <el-button
        :icon="useRenderIcon('uploadIcon')"
        link
        type="danger"
        @click="advanceSettlement"
        >{{ t('确认结算') }}</el-button
      >
    </template>
    <template v-else>
      <el-button
        v-if="row.settleTimes < 1 && hasAuth('CONFIRMSETTLE')"
        class="reset-margin"
        link
        type="danger"
        :disabled="
          index === 0
            ? false
            : index > 0 && dataList[index - 1]?.settleTimes < 1
        "
        :size="size"
        :icon="useRenderIcon('uploadIcon')"
        @click="handleChildrenData(row, 'upload', parentRow)"
      >
        {{ t('确认结算') }}
      </el-button>
      <el-button
        v-if="
          isShowCancelBtn &&
          (+row.t1 + +row.t2 !== 0 || row.matchPeriodId === 50) &&
          hasAuth('CANCELSETTLE')
        "
        class="reset-margin"
        link
        type="danger"
        size="small"
        :icon="useRenderIcon('cancelIcon')"
        @click="
          renderObj.reSettleStatus === 1
            ? saveCancelEventIds(row.id, dataList, index)
            : cancelMatchEvent(
                row.id,
                row.matchId,
                row.settleTimes,
                parentRow,
                index
              )
        "
      >
        {{ t('取消事件') }}
      </el-button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRenderIcon } from '@/components/ReIcon/src/hooks';
import { t } from '@/plugins/i18n';
import { hasAuth } from '@/router/utils';

const props = defineProps<{
  row: SattleDataAPI.MatchEventsList;
  parentRow: SattleDataAPI.getSettlementDataList;
  size: any;
  dataList: SattleDataAPI.MatchEventsList[];
  index: number;
  renderObj: SattleDataAPI.getSettlementDataList;
}>();

const emits = defineEmits([
  'changeSettleType',
  'handleChildrenData',
  'cancelMatchEvent',
  'advanceSettlement',
  'saveCancelEventIds'
]);

//- 是否已经结算
/* const isAllSettle = computed(() => {
  return props.dataList.every(_ => _.settleTimes !== 0);
}); */

const handleChildrenData = (...data) => emits('handleChildrenData', ...data);

const cancelMatchEvent = (...data) => emits('cancelMatchEvent', ...data);

//- 二次结算取消事件
const saveCancelEventIds = (...data) => emits('saveCancelEventIds', ...data);

const advanceSettlement = () =>
  emits('advanceSettlement', props.row, props.parentRow);

const isShowCancelBtn = computed(
  () =>
    props.index ===
    props.dataList
      .map((item: SattleDataAPI.MatchEventsList) => item.canceled)
      .lastIndexOf(0)
);
</script>

<style scoped></style>
