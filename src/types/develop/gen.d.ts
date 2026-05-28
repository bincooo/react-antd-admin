declare namespace Develop {

	export interface Table {
		tableId: string
		dataName: string
		tableName: string
		tableComment: string
		createTime: number
		updateTime: number

		genType: string
		options?: Record<string, any>
	}

	export interface DbTable {
		dataName: string
		tableName: string
		tableComment: string
		createTime: number
		updateTime: number
	}

	export interface TableColumn {
		capJavaField: string
		columnComment?: string
		columnId: string
		columnName: string
		columnType: string
		createBy?: string
		createDept?: number
		createTime?: number
		dictType: string
		htmlType: string
		isEdit?: string
		isIncrement?: string
		isInsert?: string
		isList?: string
		isPk?: string
		isQuery?: string
		isRequired?: string
		javaField: string
		javaType: string
		queryType: string
		sort: number
		superColumn: boolean
		tableId: string
		updateBy?: string
		updateTime?: number
		usableColumn: boolean
	}

	export interface TableMeta {
		info: {
			columns: TableColumn[]
			businessName?: string
			className?: string
			createBy?: string
			createDept?: string
			createTime?: number
			dataName: string
			functionAuthor: string
			functionName: string
			genPath: string
			genType: string
			moduleName: string
			options: Record<string, any>
			packageName: string
			parentMenuId: number
			pkColumn?: string
			remark?: string
			subTableFkName?: string
			subTableName?: string
			tableComment?: string
			tableId: string | number
			tableName: string
			tplCategory: string
			updateBy?: string
			updateTime?: number
		}
	}

	export interface Menu {
		component?: string
		createDept?: number
		createTime?: number
		icon?: string
		isCache?: string
		isFrame?: string
		menuId: number
		menuName: string
		menuType: string
		orderNum: number
		parentId: number
		path?: string
		perms?: string[]
		queryParam?: Record<string, any>
		remark?: string
		status?: string
		visible?: string
	}

	export interface MenuTree {
		children?: MenuTree[]
		icon?: string
		id: string | number
		label?: string
		menuType: string
		parentId: string | number
		status: number
		visible?: string
		weight?: number
	}

	export interface Dict {
		createTime?: number
		dictId: number
		dictName: string
		dictType: string
		remark?: string
	}
}
