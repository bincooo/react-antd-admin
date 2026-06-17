import type {
  ActionType,
  ProColumns,
  ProCoreActionType,
} from "@ant-design/pro-components";

import type { SelectProps } from "antd";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Tag } from "antd";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as api from "#src/api/system/dept";
import { BasicContent } from "#src/components/basic-content";
import { BasicTable } from "#src/components/basic-table";
import PermissionButton from "#src/components/permission-button";

import { handleTree } from "#src/utils/tree";
import { getColumnList } from "./columns";
import Edit from "./components/edit";

export default function Page() {
  const { t } = useTranslation();
  const [editVisible, setEditVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deptList, setDeptList] = useState<System.Dept[]>([]);
  const [editId, setEditId] = useState<string | number>();

  const actionRef = useRef<ActionType>(null);
  const refreshTable = () => {
    actionRef.current?.reload();
  };

  const onCloseChange = (refresh?: boolean) => {
    setEditVisible(false);
    setEditId(undefined);
    if (refresh) {
      refreshTable();
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (ids: (string | number)[]) => {
      const { code, message } = await api.deleteByIds(ids);
      if (code !== 200) {
        window.$message?.error(message);
        throw new Error(message);
      }
      return true;
    },
  });

  const handleDeleteRow = async (
    ids: Array<string | number>,
    action?: ProCoreActionType<object>
  ) => {
    if (!ids || ids.length === 0) {
      window.$message?.error("请选择要删除的行");
      return;
    }

    window.$modal?.confirm({
      title: "确认删除部门？",
      content: "此操作不可恢复",
      onOk: async () => {
        const ok = await deleteMutation.mutateAsync(ids);
        if (!ok) return;

        if (action?.reload) {
          await action.reload();
        } else {
          refreshTable();
          setSelectedRowKeys([]);
        }
      },
    });
  };

  const columns: ProColumns<System.Dept>[] = [
    ...getColumnList(t, {
      status: ({ fieldProps, ...column }) => {
        // TODO - 自定列
        const { options } = (fieldProps ?? {}) as SelectProps;
        return {
          ...column,
          fieldProps: {
            options: options?.map(({ label, value }) => ({
              value,
              label: (
                <Tag
                  color={value === "1" ? "error" : "success"}
                  children={label}
                />
              ),
            })),
          },
        };
      },
    }),
    {
      title: "工具栏",
      valueType: "option",
      key: "option",
      minWidth: 120,
      fixed: "right",
      disable: true,
      render: (node, record) => {
        return [
          <PermissionButton
            key="update"
            type="link"
            size="small"
            perm="system:dept:update"
            onClick={() => {
              setEditId(record.deptId);
              setEditVisible(true);
            }}
          >
            编辑
          </PermissionButton>,
          <PermissionButton
            key="delete"
            type="link"
            size="small"
            danger
            perm="system:dept:delete"
            onClick={() => {
              handleDeleteRow([record.deptId!]);
            }}
          >
            删除
          </PermissionButton>,
        ];
      },
    },
  ];

  return (
    <BasicContent className="h-full">
      <BasicTable<System.Dept>
        adaptive
        rowKey="deptId"
        columns={columns}
        actionRef={actionRef}
        rowSelection={{
          selectedRowKeys,
          preserveSelectedRowKeys: true,
          onChange: (keys) => {
            setSelectedRowKeys(keys);
          },
        }}
        pagination={false}
        request={async (params) => {
          const response = await api.list(params);
          if (response.code === 200) {
            setDeptList(response.data);
          }
          return {
            ...response,
            data: handleTree(response.data, "deptId"),
          };
        }}
        toolBarRender={() => [
          <PermissionButton
            key="delete"
            icon={<DeleteOutlined />}
            danger
            perm="system:dept:delete"
            onClick={() => {
              handleDeleteRow([...selectedRowKeys.map(String)]);
            }}
          >
            删除
          </PermissionButton>,
          <PermissionButton
            key="create"
            icon={<PlusCircleOutlined />}
            type="primary"
            perm="system:dept:create"
            onClick={() => {
              setEditVisible(true);
            }}
          >
            新增
          </PermissionButton>,
        ]}
      />

      <Edit
        key={editId}
        pkId={editId}
        deptList={deptList}
        open={editVisible}
        onClose={onCloseChange}
      />
    </BasicContent>
  );
}
