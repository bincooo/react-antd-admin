declare namespace System {

	export interface Menu {
		/**
		 * 菜单ID
		 */
		menuId?: string | number

		/**
		 * 菜单名称
		 */
		menuName?: string

		/**
		 * 父菜单ID
		 */
		parentId?: string | number

		/**
		 * 显示顺序
		 */
		orderNum?: number

		/**
		 * 路由地址
		 */
		path?: string

		/**
		 * 组件路径
		 */
		component?: string

		/**
		 * 路由参数
		 */
		queryParam?: string

		/**
		 * 是否为外链（1=是, 0=否）
		 */
		isFrame?: string

		/**
		 * 是否缓存（1=缓存, 0=不缓存）
		 */
		keepAlive?: string

		/**
		 * 菜单类型（M=目录, C=菜单, F=按钮）
		 */
		menuType?: string

		/**
		 * 显示状态（0=显示, 1=隐藏）
		 */
		visible?: string

		/**
		 * 菜单状态（0=正常, 1=停用）
		 */
		status?: string

		/**
		 * 权限标识
		 */
		perms?: string

		/**
		 * 菜单图标
		 */
		icon?: string

		/**
		 * 创建部门
		 */
		createDept?: number

		/**
		 * 创建者
		 */
		createBy?: number

		/**
		 * 创建时间
		 */
		createTime?: string

		/**
		 * 更新者
		 */
		updateBy?: number

		/**
		 * 更新时间
		 */
		updateTime?: string

		/**
		 * 备注
		 */
		remark?: string

	}

}
