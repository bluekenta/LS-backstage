import dayjs from 'dayjs';
import { handleTableWidth } from '@/utils/getTableWidth';
import { MATCH_STATUS } from '@/utils/maps/sports_map';
import { getLan } from '@/utils/utilFn';
const lan = getLan();
export const columns: TableColumnList = [
  {
    label: t('序号'),
    fixed: true,
    type: 'index',
    minWidth: 100,
    headerRenderer: d => handleTableWidth(d, t('序号'))
  },
  {
    prop: 'leagueNameCn',
    label: t('联赛名称'),
    fixed: true,
    align: 'left',
    headerRenderer: d => handleTableWidth(d, t('联赛名称'), 'auto'),
    minWidth: 160
  },
  {
    label: t('赛事ID'),
    prop: 'matchId',
    headerRenderer: d => handleTableWidth(d, t('赛事ID'))
  },
  {
    label: t('热门排序'),
    prop: 'level',
    headerRenderer: d => handleTableWidth(d, t('热门排序'))
  },
  {
    label: t('开赛时间'),
    prop: 'beginTimeLong',
    minWidth: 200,
    formatter: ({ beginTimeLong }) =>
      dayjs(beginTimeLong).format('YYYY-MM-DD HH:mm:ss'),
    headerRenderer: d => handleTableWidth(d, t('开赛时间'), 'auto')
  },
  {
    label: t('主队'),
    prop: 'homeTeamNameCn',
    minWidth: 150,
    align: 'left',
    formatter: ({ homeTeamNameCn }) => homeTeamNameCn ?? '-',
    headerRenderer: d => handleTableWidth(d, t('主队'), 'auto')
  },
  {
    label: t('客队'),
    prop: 'awayTeamNameCn',
    align: 'left',
    minWidth: 150,
    headerRenderer: d => handleTableWidth(d, t('客队'), 'auto')
  },
  /* {
    label: t('当前比分'),
    prop: 'currentScore',
    minWidth: 150,
    headerRenderer: d => handleTableWidth(d, t('当前比分'), 'auto'),
    formatter: ({ currentScore }) => {
      return currentScore ? parseMatchScore(currentScore) : '-';
    }
  }, */
  {
    label: t('比赛状态'),
    prop: 'status',
    formatter: ({ status }) =>
      MATCH_STATUS[status as keyof typeof MATCH_STATUS] ?? '-',
    headerRenderer: d => handleTableWidth(d, t('比赛状态'))
  },
  /* {
    label: t('熊猫匹配结果'),
    prop: 'pandaResult',
    formatter: ({ pandaResult }) => PANDA_MATCH_STATUS[pandaResult],
    headerRenderer: d => handleTableWidth(d, t('熊猫匹配结果'))
  }, */
  {
    label: t('是否中立场地'),
    prop: 'isNeutral',
    formatter: ({ isNeutral }) => (isNeutral ? t('是') : t('否')),
    headerRenderer: d => handleTableWidth(d, t('是否中立场地'))
  },
  {
    label: t('上半场结算'),
    prop: 'halfSettlementStatus',
    formatter: ({ halfSettlementStatus }) =>
      halfSettlementStatus === 0 ? (
        t('未结算')
      ) : (
        <el-text type="danger">{t('已结算')}</el-text>
      ),
    headerRenderer: d => handleTableWidth(d, t('上半场结算'))
  },

  {
    label: t('全场结算'),
    prop: 'fullSettlementStatus',
    formatter: ({ fullSettlementStatus }) =>
      fullSettlementStatus === 0 ? (
        t('未结算')
      ) : (
        <el-text type="danger">{t('已结算')}</el-text>
      ),
    headerRenderer: d => handleTableWidth(d, t('全场结算'))
  },
  {
    label: t('未结算'),
    prop: 'unSettlementEvents',
    headerRenderer: d => handleTableWidth(d, t('未结算'))
  },
  {
    label: t('操作'),
    slot: 'operation',
    minWidth: 150,
    fixed: 'right'
  }
];

export const yellow_red_column = [
  {
    headerRenderer: () => {
      return (
        <>
          <div class="border-b-[1px] border-solid border-[#f0f0f0] dark:border-[#303030]">
            {t('黄牌')}
          </div>
          <div class="flex justify-center">
            {t('主队')} : {t('客队')}
          </div>
        </>
      );
    },
    formatter: ({ t1Y, t2Y }: { t1Y: string; t2Y: string }) => {
      return `${t1Y ?? 0} : ${t2Y ?? 0}`;
    }
  },
  {
    headerRenderer: () => {
      return (
        <>
          <div class="border-b-[1px] border-solid border-[#f0f0f0] dark:border-[#303030]">
            {t('红牌')}
          </div>
          <div class="flex justify-center">
            {t('主队')} : {t('客队')}
          </div>
        </>
      );
    },
    formatter: ({ t1R, t2R }: { t1R: string; t2R: string }) => {
      return `${t1R ?? 0} : ${t2R ?? 0}`;
    }
  }
];

export const childColumns: TableColumnList = [
  {
    label: t('主队 : 客队'),
    prop: 't1',
    formatter: ({ t1, t2 }) => {
      return `${t1 ?? '-'} : ${t2 ?? '-'}`;
    }
  },
  {
    label: t('事件编码'),
    slot: 'eventCode'
  },
  {
    label: t('结算类型'),
    slot: 'settleType'
  },
  {
    label: t('比赛进行时间'),
    slot: 'eventTime',
    headerRenderer: d => handleTableWidth(d, t('比赛进行时间'))
  },
  {
    label: t('比赛阶段'),
    slot: 'matchPeriodId',
    width: lan === 'en' ? 240 : 180
  },
  {
    label: t('事件来源'),
    slot: 'homeAway'
  },
  {
    label: t('操作'),
    slot: 'operation'
  },
  {
    label: t('结算次数'),
    prop: 'settleTimes',
    formatter: ({ settleTimes }) => settleTimes ?? '-'
  },
  {
    label: t('确认时间'),
    prop: 'updatedAt',
    formatter: ({ updatedAt, settleTimes }) =>
      settleTimes > 0 ? dayjs(updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'
  },
  {
    label: t('数据商'),
    slot: 'dataSourceCode'
  }
];
