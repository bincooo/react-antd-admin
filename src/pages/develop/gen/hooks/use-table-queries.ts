import type { UseQueryResult } from "@tanstack/react-query";
import { useQueries } from "@tanstack/react-query";
import {
	fetchDictList,
	fetchTableInfo,
	getMenuList,
} from "#src/api/develop/gen";

interface TableQueriesResult {
	isLoading: boolean
	tableInfo: UseQueryResult<Develop.TableMeta | undefined>
	menuList: UseQueryResult<Develop.Menu[] | undefined>
	dictList: UseQueryResult<{ list: Develop.Dict[], total: number, current: number } | undefined>
}

export function useTableQueries(tableId?: string): TableQueriesResult {
	const results = useQueries({
		queries: [
			{
				queryKey: ["tableInfo", tableId],
				queryFn: async () => {
					return (await fetchTableInfo(tableId as string))?.data;
				},
				enabled: !!tableId,
			},
			{
				queryKey: ["menuList"],
				queryFn: async () => {
					return (await getMenuList())?.data as unknown as Develop.Menu[];
				},
			},
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
