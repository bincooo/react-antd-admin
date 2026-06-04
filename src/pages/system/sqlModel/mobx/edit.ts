import { action, computed, makeObservable, observable } from "mobx";
import { createContext } from "react";

class State {
	@observable
	id?: string | number;

	constructor() {
		makeObservable(this);
	}

	@action
	setId(id?: string | number) {
		this.id = id;
	}

	@computed
	get isEdit() {
		return !!this.id;
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

export default createContext(new State());
