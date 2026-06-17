import type { TreeNode } from "../constants";

/**
 * 菜单树工具函数
 * 用于将菜单列表转换为树形结构
 */

/**
 * 构建菜单树形数据
 * @description 将扁平的菜单列表转换为树形结构，用于 TreeSelect 等组件
 * - 仅保留 menuType === "M" 的目录节点
 * - 按 orderNum 升序排序
 * - 自动生成根节点 "根目录"
 * @param list - 菜单列表（扁平结构）
 * @returns 树形菜单数据（包含根节点）
 */
export function buildMenuTreeData(list: Develop.Menu[]): TreeNode[] {
	// 仅保留目录节点（menuType === "M"）
	const filtered = (list || []).filter(x => x.menuType === "M");

	// 第一轮遍历：构建节点映射表
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

	// 第二轮遍历：建立父子关系
	const rootChildren: TreeNode[] = [];
	for (const item of filtered) {
		const node = map.get(item.menuId)!;
		if (item.parentId === 0) {
			// 顶级菜单直接加入根节点
			rootChildren.push(node);
		}
		else {
			// 查找父节点，找不到则挂到根节点
			const parent = map.get(item.parentId);
			if (parent)
				parent.children!.push(node);
			else rootChildren.push(node);
		}
	}

	// 递归排序：按 orderNum 升序
	const sortTree = (nodes: TreeNode[]) => {
		nodes.sort((a, b) => (a.orderNum ?? 0) - (b.orderNum ?? 0));
		nodes.forEach(n => n.children?.length && sortTree(n.children));
	};
	sortTree(rootChildren);

	// 返回包含根节点的树形结构
	return [
		{
			key: 0,
			value: 0,
			title: "根目录",
			children: rootChildren,
		},
	];
}
