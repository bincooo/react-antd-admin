/**
 * 由后台配置生成，不可手工修改
 */
import type { JSX } from "react";
import type { ProColumns } from "@ant-design/pro-components";
import type { TFunction } from "i18next";


type Merger<T extends { dataIndex: string }> = (option: T) => T;

function merge<T extends { dataIndex: string }>(
    columns: (T & { dataIndex: string })[],
    options?: { [column: string]: Merger<T> },
): T[] {
    for (const idx in columns) {
        const exec = options?.[columns[idx].dataIndex];
        if (exec) {
            columns[idx] = exec({ ...columns[idx] });
        }
    }
    return columns;
}

export function getColumnList(
    t: TFunction<"translation", undefined>,
    options?: { [column: string]: Merger<ProColumns<System.SqlModel> & { dataIndex: string }> },
): ProColumns<System.SqlModel>[] {
    return merge([
        {
            dataIndex: "index",
            title: "序号",
            valueType: "index",
            fixed: "left",
            width: 80,
        },
        {
            title: "唯一ID",
            dataIndex: "id",
            proFieldProps: {
                placeholder: "请输入唯一ID",
            },
        },
        {
            title: "模型名称",
            dataIndex: "name",
            proFieldProps: {
                placeholder: "请输入模型名称",
            },
        },
        {
            title: "主键类型",
            dataIndex: "javaType",
            search: false,
            proFieldProps: {
                placeholder: "请输入主键类型",
            },
            valueType: "select",
            fieldProps: {
                options: [
                    { value: "0", label: "数值" },
                    { value: "1", label: "字符" },
                ],
            },
        },
        {
            title: "sql语句",
            dataIndex: "sqlText",
            search: false,
            proFieldProps: {
                placeholder: "请输入sql语句",
            },
        },
        {
            title: "描述",
            dataIndex: "remark",
            search: false,
            proFieldProps: {
                placeholder: "请输入描述",
            },
        },
    ], options);
}
