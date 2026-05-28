import type { ProColumns } from "@ant-design/pro-components";
import type { TFunction } from "i18next";

export type Render = (dataIndex: string) => (() => { label: string, value: string, desc?: string }[]) | undefined;

function chainFilter(dataIndex: string, renders?: Render[]) {
	if (!renders)
		return;
	for (const h of renders) {
		const callback = h(dataIndex);
		if (callback) {
			return callback();
		}
	}
}

export function getColumns(t: TFunction<"translation", undefined>, renders?: Render[]): ProColumns<Develop.Table>[] {
	return [
		{
			dataIndex: "index",
			title: "序号",
			valueType: "index",
			width: 50,
		},
		{
			title: "数据源",
			dataIndex: "dataName",
			disable: true,
			ellipsis: true,
			width: 120,
			valueType: "select",
			formItemProps: {
				rules: [
					{
						required: true,
						message: t("form.required"),
					},
				],
			},
			fieldProps: {
				options: chainFilter("dataName", renders),
			},
		},
		{
			disable: true,
			title: "表名称",
			dataIndex: "tableName",
			width: 120,
			filters: true,
			onFilter: true,
			ellipsis: true,
		},
		{
			disable: true,
			title: "表描述",
			dataIndex: "tableComment",
			width: 170,
		},
		{
			title: "实体",
			dataIndex: "className",
			search: false,
		},
		{
			title: "创建时间",
			dataIndex: "createTime",
			valueType: "date",
			width: 100,
			search: false,
		},
		{
			title: "更新时间",
			dataIndex: "updateTime",
			valueType: "date",
			width: 100,
			search: false,
		},
	];
}
