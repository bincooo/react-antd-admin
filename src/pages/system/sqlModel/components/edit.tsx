import { observer, useLocalObservable } from "mobx-react-lite";
import { useEffect } from "react";
import {
  DrawerForm,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
} from "@ant-design/pro-components";

import { Form } from "antd";
import { useQueries, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { ProCodeMirrorField } from "#src/components/code-mirror";
import createState from "../mobx/edit";
import * as api from "#src/api/system/sqlModel";

interface EditProps {
  pkId?: string | number;
  dictMap?: {
    [k: string]: {
      label: string;
      value: string;
    }[];
  };

  open?: boolean;
  onClose?: (refresh?: boolean) => void;
}

export default observer(
  ({ pkId, open = true, onClose, ...props }: EditProps) => {
    const { t } = useTranslation();
    const [form] = Form.useForm<System.SqlModel>();
    const context = useLocalObservable(createState({ id: pkId }));

    /** 加载数据 */
    const [sqlModel] = useQueries({
      queries: [
        {
          queryKey: ["form", pkId],
          queryFn: async () => {
            if (!pkId) {
              return null;
            }
            const { data } = await api.getById(pkId);
            return data;
          },
        },
      ],
    });

    /** 创建接口 */
    const createMutation = useMutation({
      mutationFn: async (data: System.SqlModel) => {
        const { code, message } = await api.create(data);
        if (code !== 200) {
          window.$message?.error(message);
          throw new Error(message);
        }
      },
    });

    /** 更新接口 */
    const updateMutation = useMutation({
      mutationFn: async (data: System.SqlModel) => {
        const { code, message } = await api.update(data);
        if (code !== 200) {
          window.$message?.error(message);
          throw new Error(message);
        }
      },
    });

    const onFinish = async (values: System.SqlModel) => {
      /* 有 id 则为修改，否则为新增 */
      if (pkId) {
        await updateMutation.mutateAsync({ ...form.getFieldsValue(true) });
        window.$message?.success(t("common.updateSuccess"));
      } else {
        await createMutation.mutateAsync(values);
        window.$message?.success(t("common.addSuccess"));
      }
      /* 刷新表格 */
      onClose?.(true);
      // 不返回不会关闭弹框
      return true;
    };

    useEffect(() => {
      if (open) {
        if (sqlModel.data) {
          form.setFieldsValue(sqlModel.data);
          context.update(sqlModel.data);
          return;
        }
        form.resetFields();
      }
    }, [open, sqlModel.data]);

    return (
      <DrawerForm<System.SqlModel>
        {...props}
        open={open}
        title={pkId ? "编辑sql模型" : "创建sql模型"}
        onValuesChange={(changed) => context.update(changed)}
        onOpenChange={(visible) => {
          if (visible === false) {
            onClose?.();
          }
        }}
        width="600px"
        resize={true}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 24 }}
        layout="horizontal"
        form={form}
        autoFocusFirstInput
        drawerProps={{
          destroyOnHidden: true,
        }}
        onFinish={onFinish}
        initialValues={{
          status: "0",
        }}
      >
        <ProFormText
          name="name"
          label="模型名称"
          placeholder="请输入模型名称"
          readonly={context.isDisabled(["insert", "edit"])}
          allowClear={false}
          rules={[{ required: true }]}
        />

        <ProFormSelect
          name="javaType"
          label="主键类型"
          placeholder="请选择主键类型"
          readonly={context.isDisabled(["insert", "edit"])}
          allowClear={false}
          rules={[{ required: true }]}
          options={[
            { value: "0", label: "数值" },
            { value: "1", label: "字符" },
          ]}
        />

        <ProCodeMirrorField
          name="sqlText"
          label="sql语句"
          placeholder="请输入sql语句"
          readonly={context.isDisabled(["insert", "edit"])}
          language="sql"
          rules={[{ required: true }]}
        />

        <ProFormTextArea
          name="remark"
          label="描述"
          placeholder="请输入描述"
          readonly={context.isDisabled(["insert", "edit"])}
          allowClear={false}
        />
      </DrawerForm>
    );
  }
);
