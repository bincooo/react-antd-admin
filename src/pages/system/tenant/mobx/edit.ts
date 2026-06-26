import equal from "fast-deep-equal";
import { action, computed, makeObservable, observable } from "mobx";

/**
 * 编辑页状态管理
 */
class State {
	private readonly _initialize: System.Tenant;

	@observable
	data: System.Tenant = {};

	constructor(initialize: System.Tenant) {
		this._initialize = initialize;
		this.data = { ...initialize };
		makeObservable(this);
	}

	update(changed: System.Tenant) {
		Object.assign(this.data, changed);
	}

	@computed
	get changed() {
		return !equal(this._initialize, this.data);
	}

	@computed
	get isEdit() {
		return !!this.data.id;
	}

	isDisabled(command: string[]) {
		if (command.includes("insert") && !this.isEdit) {
			return false;
		}
		if (command.includes("edit") && this.isEdit) {
			return false;
		}
		return true;
	}
}

export default function createState(initialize: System.Tenant) {
	return () => (new State(initialize));
};
