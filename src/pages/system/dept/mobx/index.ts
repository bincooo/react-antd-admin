import { action, makeObservable, observable } from "mobx";
import { createContext } from "react";

class State {
	@observable
	title?: string;

	@observable
	editId?: string | number;

	@observable
	editFormVisible: boolean = false;

	constructor() {
		makeObservable(this);
	}

	@action
	setTitle(title: string) {
		this.title = title;
	}

	@action
	setEditId(id?: string | number) {
		this.editId = id;
	}

	@action
	setEditFormVisible(visible: boolean) {
		this.editFormVisible = visible;
	}
}

export default createContext(new State());
