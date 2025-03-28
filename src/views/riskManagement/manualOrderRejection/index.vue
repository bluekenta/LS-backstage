<template>
  <div class="main">
    <SearchForm
      :form="form"
      :loading="loading"
      :downloading="downloading"
      :category="0"
      @on-search="onSearch"
      @exportFile="exportFile"
      :tenantList="tenantList"
    />
    <PureTableBar
      :title="t('温馨提示：点击任一关的“拒接注单”按钮，即拒绝整个串关注单。')"
      :columns="columns"
      class="relative"
      :isShowHeader="false"
      @refresh="onSearch('reload')"
    >
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          align-whole="center"
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="tableHeaderStyle"
          @selection-change="handleSelectionChange"
          @page-size-change="handleTableWidthChange"
          @page-current-change="handleCurrentChange"
        >
          <template #userMessage="{ row }">
            <div
              class="item_line cursor-pointer"
              @click="
                copyTest(
                  row.userId,
                  t('用户ID：{value}', { value: row.userId })
                )
              "
            >
              <span>{{ t('用户ID：') }}</span
              >{{ row.userId }}
            </div>
            <div
              class="item_line cursor-pointer"
              @click="
                copyTest(
                  row.userName,
                  t('用户名：{value}', { value: row.userName })
                )
              "
            >
              <span>{{ t('用户名：') }}</span
              >{{ row.userName }}
            </div>
            <div
              class="item_line cursor-pointer"
              @click="
                copyTest(
                  row.tenantId,
                  t('商户编码：{value}', {
                    value: tenantObj[row.tenantId]?.name
                  })
                )
              "
            >
              <span>{{ t('商户编码：') }}</span
              >{{ tenantObj[row.tenantId]?.name }}
            </div>
            <div
              class="item_line cursor-pointer"
              @click="
                copyTest(
                  row.tenantId,
                  t('商户名：{value}', {
                    value: tenantObj[row.tenantId]?.tenantName
                  })
                )
              "
            >
              <span>{{ t('商户名：') }}</span
              >{{ tenantObj[row.tenantId]?.tenantName }}
            </div>
            <div
              v-if="row.combineOrderDetails.length > 1"
              class="item_line mt-2 color_blue"
            >
              {{ String(row.seriesType).slice(-3) === '001' ? '串关' : '复式' }}
              <span>{{
                formatSeriesType(
                  row?.seriesType,
                  row.combineOrderDetails.length
                )
              }}</span>
              <span class="ml-1"
                >总计：{{
                  `${calculateSeriesTypeTotalBets(row?.seriesType)}注 每注：${
                    row.orderAmount
                  }`
                }}</span
              >
            </div>
          </template>

          <template #matchMessage="{ row }">
            <div
              class="match_item eq-height"
              v-for="item in row.combineOrderDetails"
              :key="item.betItemId"
            >
              <div
                v-if="
                  item.kindsCode?.includes('Outright') ||
                  item.kindsCode?.includes('moutright')
                "
                class="item_line"
              >
                <span>冠军赛事</span>
              </div>
              <div v-else class="item_line">
                <span
                  class="cursor-pointer"
                  @click="
                    copyTest(
                      item.homeTeamNameCn,
                      t('主队：{value}', { value: item.homeTeamNameCn })
                    )
                  "
                  >{{ item.homeTeamNameCn }}</span
                >
                vs
                <span
                  class="cursor-pointer"
                  @click="
                    copyTest(
                      item.awayTeamNameCn,
                      t('客队：{value}', { value: item.awayTeamNameCn })
                    )
                  "
                  >{{ item.awayTeamNameCn }}</span
                >
              </div>
              <div
                class="item_line cursor-pointer"
                @click="
                  copyTest(
                    item.leagueNameCn,
                    t('联赛名：{value}', { value: item.leagueNameCn })
                  )
                "
              >
                {{ item.sportNameCn }}/{{ item.leagueNameCn }}
              </div>
              <div
                class="item_line cursor-pointer"
                @click="
                  copyTest(
                    item.matchId,
                    t('赛事ID：{value}', { value: item.matchId })
                  )
                "
              >
                {{ t('赛事ID:') }} {{ item.matchId }}
                <span class="inline-block">
                  <IconifyIconOffline :icon="Copy" />
                </span>
              </div>
              <div class="item_line">
                {{ t('开赛时间:')
                }}{{
                  dayjs(item.beginTime ?? Date.now()).format('MM-DD HH:mm:ss')
                }}
              </div>
            </div>
          </template>

          <template #betDetail="{ row }">
            <div
              class="match_item eq-height"
              v-for="item in row.combineOrderDetails"
              :key="item.betItemId"
            >
              <div class="item_line">
                {{
                  `玩法：${useSportFormatDetail(item)[4]} ${getIsInplay(
                    item.isInplay
                  )}`
                }}
                {{
                  item.isInplay == 1
                    ? displayHomeAwayScore(item.scoreBenchmark, item.sportId)
                    : ''
                }}
              </div>
              <div class="item_line">
                <span v-if="item.kindsCode === 'FT_TTS'">
                  {{ enterGoalMap[item.betHandicap.toUpperCase()  as keyof typeof enterGoalMap] }}
                </span>
                {{ useSportFormatDetail(item)[3] }} @{{
                  getViewOddFn(
                    item.oddFinally,
                    item.marketTypeFinally,
                    item.marketType
                  )
                }}
              </div>
              <div
                class="item_line cursor-pointer"
                @click="
                  copyTest(row.id, t('注单号：{value}', { value: row.id }))
                "
              >
                {{ t('注单号:') }} {{ row.id }}
                <span class="inline-block">
                  <IconifyIconOffline :icon="Copy" />
                </span>
              </div>
              <div class="item_line">
                {{ t('投注时间:')
                }}{{
                  row.createTime
                    ? dayjs(row.createTime).format('MM-DD HH:mm:ss')
                    : ''
                }}
              </div>
              <div
                class="item_line"
                v-if="
                  row.billStatus === 1 &&
                  item.settleScore &&
                  !(
                    displayHomeAwayScore(
                      item.settleScore,
                      item.sportId,
                      'home'
                    ) == '' ||
                    displayHomeAwayScore(
                      item.settleScore,
                      item.sportId,
                      'away'
                    ) == ''
                  )
                "
              >
                {{ t('赛果：')
                }}{{ displayHomeAwayScore(item.settleScore, item.sportId) }}
              </div>
            </div>
          </template>
          <template #orderAcceptanceStatus="{ row }">
            <div class="h-full">
              <div
                class="match_item eq-height"
                v-for="item in row.combineOrderDetails"
                :key="item.betItemId"
              >
                <span
                  v-if="row.combineOrderDetails.length < 2"
                  class="status_btn"
                  :style="{
                    background: getBackgroundColor(row.billStatus).bgColor
                  }"
                >
                  {{
                    getVal(
                      row.billStatus,
                      row.status,
                      item.betResult,
                      item.settleStatus
                    )
                  }}
                </span>
                <span
                  v-else
                  :style="{
                    background: getBackgroundColor(row.billStatus).bgColor
                  }"
                  class="status_btn"
                >
                  {{
                    getVal1(
                      row.billStatus,
                      item.betResult,
                      item.settleStatus,
                      item
                    )
                  }}
                </span>
                <span class="block">
                  {{
                    rejectReasonMap[
                      item.riskType as keyof typeof rejectReasonMap
                    ]
                  }}
                </span>
              </div>
            </div>
          </template>
          <template #odd="{ row }">
            <div
              class="match_item odd_item eq-height al"
              v-for="item in row.combineOrderDetails"
              :key="item.id"
            >
              <div>
                {{
                  getViewOddFn(
                    item.oddFinally,
                    item.marketTypeFinally,
                    item.marketType
                  )
                }}
              </div>
              <div>{{ markeTypeMap[item.marketType] }}</div>
            </div>
          </template>
          <template #operation="{ row }">
            <div class="h-full" v-if="form.queryType !== 1">
              <div
                class="eq-height"
                v-for="item in row.combineOrderDetails"
                :key="item.betItemId"
              >
                <div
                  class="flex item-center flex-col"
                  v-if="item.settleStatus === 3 && !item.rejectStatus"
                >
                  <el-button
                    size="small"
                    @click="confirmBetClick(item.detailId)"
                    type="primary"
                  >
                    {{ t('确认注单') }}
                  </el-button>
                  <el-button
                    class="!ml-0 mt-2"
                    size="small"
                    :disabled="item.settleStatus === 1"
                    @click="refuseBetClick(item.detailId)"
                    type="danger"
                  >
                    {{ t('拒接注单') }}
                  </el-button>
                </div>
              </div>
            </div>
            <div v-else>-</div>
          </template>
        </pure-table>
        <div
            class="bottom_content absolute bottom-7 flex max-w-[50%] items-center text-sm flex-wrap"
        >
          <div>
            <label>{{ t('总计：') }}</label>
            <span>{{ totalInfo?.thisPageBetCount ?? 0 }}{{ t('单') }}</span>
          </div>
          <div>
            <label>{{ t('用户数：') }}</label>
            <span
            >{{ addThousandSeparator(totalInfo?.thisPageBetUserCount) ?? 0
              }}{{ t('人') }}</span
            >
          </div>
          <div>
            <label>{{ t('总计投注额：') }}</label>
            <span class="ml-1">
              {{
                addThousandSeparator(
                    totalInfo?.thisPageBetTotalAmount?.toFixed(2)
                ) ?? '0.00'
              }}</span
            >
          </div>
          <div>
            <label>{{ t('总输赢：') }}</label>
            <span class="ml-1">
              {{
                addThousandSeparator(
                    totalInfo?.thisPageBetTotalProfitAmount?.toFixed(2)
                ) ?? '0.00'
              }}</span
            >
          </div>
          <div>
            <label>{{ t('注单均赔率：') }}</label>
            <span class="ml-1">
              {{
                addThousandSeparator(
                    totalInfo?.thisPageAvgOdds?.toFixed(2)
                ) ?? '0.00'
              }}</span
            >
          </div>
        </div>

      </template>
    </PureTableBar>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUpdated } from 'vue';
import { PureTableBar } from '@/components/RePureTableBar';
import { useManualOrderRejectionHook } from './util/hook';
import SearchForm from './component/SearchForm.vue';
import { columns } from './component/TableColumnList';
import { t } from '@/plugins/i18n';
import dayjs from 'dayjs';
import { rejectReasonMap } from './util/types';
import Copy from '@iconify-icons/ep/copy-document';
import { adjustContentWithRowHeight } from '@/utils/adjustRowCoulmnHeight';
import {
  formatSeriesType,
  useSportFormatDetail,
  getViewOddFn,
  markeTypeMap,
  calculateSeriesTypeTotalBets,
  displayHomeAwayScore,
  getIsInplay, enterGoalMap
} from '@/utils/formatMatch';
import { usePublicHooks } from '@/hooks';
import {addThousandSeparator} from "@/utils/formatNumber";

defineOptions({ name: 'RISKMANAGEMENT_MANUALORDERREJECTION' });
const { tableHeaderStyle } = usePublicHooks();

onMounted(() => {
  adjustContentWithRowHeight();
});

onUpdated(() => {
  adjustContentWithRowHeight();
});

const getVal = (s1, s2, s3, s4) => {
  let val = '-';
  switch (true) {
    case s1 === 0 && s2 === 0 && s3 === 0:
      val = t('已接单');
      break;
    case s4 === 3:
      val = t('待确认');
      break;
    case s3 === 61:
      val = t('风控拒单');
      break;
  }
  return val;
};
const getVal1 = (billStatus, betResult, settleStatus, item) => {
  let val = '-';
  switch (true) {
    case billStatus === 0 && betResult === 0 && settleStatus === 0:
      val = t('已接单');
      item.rejectStatus = true;
      break;
    case settleStatus === 3:
      val = t('待确认');
      break;
    case betResult === 61 && settleStatus === 1:
      val = t('风控拒单');
      break;
  }
  return val;
};

const {
  loading,
  downloading,
  dataList,
  pagination,
  totalInfo,
  form,
  onSearch,
  handleTableWidthChange,
  handleCurrentChange,
  handleSelectionChange,
  copyTest,
  tenantList,
  confirmBetClick,
  refuseBetClick,
  tenantObj,
  exportFile,
  getBackgroundColor
} = useManualOrderRejectionHook();
</script>

<style lang="scss">
.is-horizontal {
  display: block !important;
  height: 10px !important;
}

.bottom_content {
  & > div {
    margin-left: 10px;
    display: flex;
    label {
      margin-left: 10px;
    }
  }
}
.match_item {
  margin-bottom: 10px;
  position: relative;
  &:last-child {
    margin-bottom: 0;
  }
}
.item_line {
  text-align: left;
  max-width: 250px;
}
.isInplay {
  position: absolute;
  right: 10px;
  top: 10px;
}
.win {
  padding: 2px 4px;
  font-style: normal;
  font-weight: 400;
  border-radius: 4px;
  color: #dd5454;
}
.lose {
  padding: 2px 4px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;

  color: green;
}
.color_blue {
  color: blue;
  font-size: 12px;
}
.status_btn {
  text-align: center;
  line-height: 25px;
  width: max-content;
  color: #fff;
  border-radius: 4px;
  padding: 0 8px;
  margin: 0 auto;
}

.operate {
  width: 100px;
}

.accept-status {
  padding: 0 8px;
  line-height: 25px;
  display: inline-block;
  color: white;
  border-radius: 4px;
}

.eq-height {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
}
</style>
