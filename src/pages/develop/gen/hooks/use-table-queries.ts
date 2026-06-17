import type { UseQueryResult } from "@tanstack/react-query";
import { useQueries } from "@tanstack/react-query";
import {
	fetchDictList,
	fetchTableInfo,
	getMenuList,
} from "#src/api/develop/gen";

/**
 * 代码生成器列表-表格查询 Hook
 * 封装数据源列表、表信息、菜单树、字典列表的并发查询
 */

/**
 * 表格查询结果类型
 */
interface TableQueriesResult {
	/** 是否正在加载 */
	isLoading: boolean
	/** 表信息（编辑页使用） */
	tableInfo: UseQueryResult<Develop.TableMeta | undefined>
	/** 菜单树列表 */
	menuList: UseQueryResult<Develop.Menu[] | undefined>
	/** 字典列表 */
	dictList: UseQueryResult<Develop.Dict[] | undefined>
}

/**
 * 代码生成器表格数据查询 Hook
 * @description 并发查询三个接口的数据，统一管理加载状态
 * @param tableId - 表 ID（编辑页传入，列表页传 undefined）
 * @returns 查询结果对象
 */
export function useTableQueries(tableId?: string): TableQueriesResult {
	const results = useQueries({
		queries: [
			// 查询表结构信息
			{
				queryKey: ["tableInfo", tableId],
				queryFn: async () => {
					return (await fetchTableInfo(tableId as string))?.data;
				},
				enabled: !!tableId,
			},
			// 查询菜单树
			{
				queryKey: ["menuList"],
				queryFn: async () => {
					return (await getMenuList())?.data as unknown as Develop.Menu[];
				},
			},
			// 查询字典列表
			{
				queryKey: ["optionSelect"],
				queryFn: async () => {
					return (await fetchDictList())?.data;
				},
			},
		],
	});

	const isLoading = results.some(x => x.isFetching);
	const [tableInfo, menuList, dictList] = results;

	return {
		isLoading,
		tableInfo,
		menuList,
		dictList,
	};
}
