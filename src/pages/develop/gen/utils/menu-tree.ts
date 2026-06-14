import type { TreeNode } from "../constants";

export function buildMenuTreeData(list: Develop.Menu[]): TreeNode[] {
	const filtered = (list || []).filter(x => x.menuType === "M");
	const map = new Map<number, TreeNode>();
	for (const item of filtered) {
		map.set(item.menuId, {
			key: item.menuId,
			value: item.menuId,
			title: item.remark ?? "",
			orderNum: item.orderNum ?? 0,
			children: [],
		});
	}

	const rootChildren: TreeNode[] = [];
	for (const item of filtered) {
		const node = map.get(item.menuId)!;
		if (item.parentId === 0) {
			rootChildren.push(node);
		}
		else {
			const parent = map.get(item.parentId);
			if (parent)
				parent.children!.push(node);
			else rootChildren.push(node);
		}
	}

	const sortTree = (nodes: TreeNode[]) => {
		nodes.sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
		nodes.forEach(n => n.children?.length && sortTree(n.children));
	};
	sortTree(rootChildren);

	return [
		{
			key: 0,
			value: 0,
			title: "根目录",
			children: rootChildren,
		},
	];
}
