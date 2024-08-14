import editForm from '../form.vue';
import { message } from '@/utils/message';
// import { FormItemProps } from 'element-plus';
import { addDialog } from '@/components/ReDialog';
import type { PaginationProps } from '@pureadmin/table';
import { reactive, ref, h } from 'vue';
import { removeEmptyStringKeys } from '@/utils/utilFn';
import { searchFormType } from './types';
import { ElMessage, ElMessageBox } from 'element-plus';
import { t } from '@/plugins/i18n';
import { Delete } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

export function useTagsHook() {
  const formRef = ref();
  const dataList = reactive<OperateManagementDataAPI.OperateTagType[]>([]);
  const loading = ref(true);
  const router = useRouter();
  const route = useRoute();
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const form = reactive<searchFormType>({
    id: undefined,
    level: undefined,
    name: ''
  });

  function handleDelete(row: OperateManagementDataAPI.OperateTagType) {
    ElMessageBox.confirm(
      h('div', null, [
        h(
          'div',
          { style: 'font-weight: 600; font-size: 18px' },
          t('确认删除标签') + '?'
        ),
        h('div', null, t('标签删除后不能修复'))
      ]),
      t('操作确认'),
      {
        showCancelButton: true,
        cancelButtonText: t('取消'),
        confirmButtonText: t('确认'),
        type: 'warning',
        icon: markRaw(Delete),
        // center: true,
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = t('删除中') + '...';
            await API.deleteOperateTag(row);
            done();
            ElMessage({
              type: 'success',
              message: `${row.name}` + t('标签成功删除')
            });
            onSearch();
          } else {
            done();
          }
        }
      }
    );
  }
  function handleTableWidthChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val: any) {
    console.log('handleSelectionChange', val);
  }

  async function onSearch(type?: string) {
    if (type === 'reload') pagination.currentPage = 1;
    try {
      loading.value = true;
      const res: OperateManagementDataAPI.OperateTagListRes =
        await API.getOperateTagList({
          ...removeEmptyStringKeys(form),
          id: form.id ? Number(form.id) : undefined,
          pageSize: pagination.pageSize,
          pageNum: pagination.currentPage,
          category: route.path === '/operateManager/tags' ? 0 : 1
        });
      loading.value = false;
      if (res.code) return message(res.msg, { type: 'error' });
      dataList.length = 0;
      dataList.push(...res.data.records);
      pagination.total = res.data.total;
      pagination.pageSize = res.data.size as number;
    } catch (error) {
      loading.value = false;
    }
  }

  function openDialog(
    title: string,
    row?: OperateManagementDataAPI.OperateTagType
  ) {
    addDialog({
      title,
      props: {
        formInline: {
          name: row?.name ?? '',
          remark: row?.remark ?? '',
          level: row?.level ?? undefined,
          labelColor: row?.labelColor ?? ''
        }
      },
      width: '40%',
      draggable: true,
      fullscreenIcon: true,
      alignCenter: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (
        done,
        { options },
        okButtonLoading = null,
        okButtonText = null
      ) => {
        const FormRef = formRef.value.getRef();
        const curData: OperateManagementDataAPI.OperateTagType =
          options.props.formInline;
        function chores() {
          // message(`您${title}了标签名称为${curData.name}的这条数据`, {
          //   type: "success"
          // });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(async (valid: boolean) => {
          if (valid) {
            if (row) {
              updateOperateTag(
                {
                  ...curData,
                  id: row.id,
                  category: route.path === '/operateManager/tags' ? 0 : 1
                },
                () => chores(),
                okButtonLoading,
                okButtonText
              );
            } else {
              // 实际开发先调用编辑接口，再进行下面操作
              // chores();
              createOperateTag(
                {
                  ...curData,
                  category: route.path === '/operateManager/tags' ? 0 : 1
                },
                () => chores(),
                okButtonLoading,
                okButtonText
              );
            }
          }
        });
      }
    });
  }

  const updateOperateTag = async (
    curData: OperateManagementDataAPI.OperateTagType,
    cb: () => void,
    okButtonLoading: any,
    okButtonText: any
  ) => {
    if (okButtonLoading) okButtonLoading.value = true;
    if (okButtonText) okButtonText.value = t('编辑中');
    const res = await API.updateOperateTag(curData);
    setTimeout(() => {
      if (okButtonLoading) okButtonLoading.value = false;
      if (okButtonText) okButtonText.value = t('确定');
      if (!res.code) cb();
    }, 300);
    message(res.msg, { type: res.code ? 'error' : 'success' });
  };

  const createOperateTag = async (
    curData: OperateManagementDataAPI.OperateTagType,
    cb: () => void,
    okButtonLoading: any,
    okButtonText: any
  ) => {
    if (okButtonLoading) okButtonLoading.value = true;
    if (okButtonText) okButtonText.value = t('创建中');
    const res = await API.createOperateTag(curData);
    setTimeout(() => {
      if (okButtonLoading) okButtonLoading.value = false;
      if (okButtonText) okButtonText.value = t('确定');
      if (!res.code) cb();
    }, 300);

    message(res.msg, { type: res.code ? 'error' : 'success' });
  };

  const goToUserList = (row: OperateManagementDataAPI.OperateTagType) => {
    router.push({
      name:
        route.path === '/operateManager/tags'
          ? 'OPERATEMANAGER_SPORTPLAYERLIST'
          : 'OPERATEMANAGER_ESPORTPLAYERLIST',
      query: {
        tagId: row.id,
        labelType: row.labelType
      }
    });
  };

  return {
    loading,
    dataList,
    pagination,
    onSearch,
    openDialog,
    form,
    handleDelete,
    handleTableWidthChange,
    handleCurrentChange,
    handleSelectionChange,
    goToUserList
  };
}
