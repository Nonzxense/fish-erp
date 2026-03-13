export namespace container {
	
	export class Container {
	    id: number;
	    color: string;
	    type: string;
	    status?: string;
	
	    static createFrom(source: any = {}) {
	        return new Container(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.color = source["color"];
	        this.type = source["type"];
	        this.status = source["status"];
	    }
	}
	export class ContainerFilter {
	    id?: number;
	    type?: string;
	    color?: string;
	    status?: string;
	    page: number;
	    pageSize: number;
	
	    static createFrom(source: any = {}) {
	        return new ContainerFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.color = source["color"];
	        this.status = source["status"];
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	    }
	}
	export class CreateContainerInput {
	    id: number;
	    color: string;
	    type: string;
	    status?: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateContainerInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.color = source["color"];
	        this.type = source["type"];
	        this.status = source["status"];
	    }
	}

}

export namespace domain {
	
	export class PageResult_fish_internal_domain_container_Container_ {
	    data: container.Container[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PageResult_fish_internal_domain_container_Container_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], container.Container);
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PageResult_fish_internal_domain_transaction_Transaction_ {
	    data: transaction.Transaction[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PageResult_fish_internal_domain_transaction_Transaction_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], transaction.Transaction);
	        this.total = source["total"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace time {
	
	export class Time {
	
	
	    static createFrom(source: any = {}) {
	        return new Time(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace transaction {
	
	export class CreateTransactionInput {
	    occurredAt: time.Time;
	    type: string;
	    amount: number;
	    category?: string;
	    note?: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateTransactionInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.occurredAt = this.convertValues(source["occurredAt"], time.Time);
	        this.type = source["type"];
	        this.amount = source["amount"];
	        this.category = source["category"];
	        this.note = source["note"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Transaction {
	    id: string;
	    billId?: string;
	    type: string;
	    amount: number;
	    occurredAt: time.Time;
	    category?: string;
	    note?: string;
	
	    static createFrom(source: any = {}) {
	        return new Transaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.billId = source["billId"];
	        this.type = source["type"];
	        this.amount = source["amount"];
	        this.occurredAt = this.convertValues(source["occurredAt"], time.Time);
	        this.category = source["category"];
	        this.note = source["note"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TransactionFilter {
	    type?: string;
	    category?: string;
	    fromDate?: time.Time;
	    toDate?: time.Time;
	    minAmount?: number;
	    maxAmount?: number;
	    page: number;
	    pageSize: number;
	
	    static createFrom(source: any = {}) {
	        return new TransactionFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.category = source["category"];
	        this.fromDate = this.convertValues(source["fromDate"], time.Time);
	        this.toDate = this.convertValues(source["toDate"], time.Time);
	        this.minAmount = source["minAmount"];
	        this.maxAmount = source["maxAmount"];
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class TransactionSummary {
	    totalIncome: number;
	    totalExpense: number;
	    profit: number;
	
	    static createFrom(source: any = {}) {
	        return new TransactionSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalIncome = source["totalIncome"];
	        this.totalExpense = source["totalExpense"];
	        this.profit = source["profit"];
	    }
	}

}

