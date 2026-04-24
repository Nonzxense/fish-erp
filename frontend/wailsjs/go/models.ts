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
	export class ContainerSummary {
	    total: number;
	    atStore: number;
	    withCustomer: number;
	
	    static createFrom(source: any = {}) {
	        return new ContainerSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total = source["total"];
	        this.atStore = source["atStore"];
	        this.withCustomer = source["withCustomer"];
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
	export class CreateFishDetailInput {
	    name: string;
	    weightKg: number;
	    pricePerKg: number;
	
	    static createFrom(source: any = {}) {
	        return new CreateFishDetailInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.weightKg = source["weightKg"];
	        this.pricePerKg = source["pricePerKg"];
	    }
	}
	export class CreateFishContainerInput {
	    containerId: number;
	    isNewContainer: boolean;
	    newContainerId?: number;
	    newContainerType?: string;
	    newContainerColor?: string;
	    fishes: CreateFishDetailInput[];
	
	    static createFrom(source: any = {}) {
	        return new CreateFishContainerInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.containerId = source["containerId"];
	        this.isNewContainer = source["isNewContainer"];
	        this.newContainerId = source["newContainerId"];
	        this.newContainerType = source["newContainerType"];
	        this.newContainerColor = source["newContainerColor"];
	        this.fishes = this.convertValues(source["fishes"], CreateFishDetailInput);
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
	
	export class FishDetail {
	    ID: number;
	    FishContainerID: number;
	    name: string;
	    weightKg: number;
	    pricePerKg: number;
	
	    static createFrom(source: any = {}) {
	        return new FishDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.FishContainerID = source["FishContainerID"];
	        this.name = source["name"];
	        this.weightKg = source["weightKg"];
	        this.pricePerKg = source["pricePerKg"];
	    }
	}
	export class FishContainer {
	    id: number;
	    invoiceId: string;
	    containerId: number;
	    fishes: FishDetail[];
	
	    static createFrom(source: any = {}) {
	        return new FishContainer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.invoiceId = source["invoiceId"];
	        this.containerId = source["containerId"];
	        this.fishes = this.convertValues(source["fishes"], FishDetail);
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
	export class PageResult_fish_internal_domain_invoice_FishSaleInvoice_ {
	    data: invoice.FishSaleInvoice[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PageResult_fish_internal_domain_invoice_FishSaleInvoice_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], invoice.FishSaleInvoice);
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
	export class PageResult_fish_internal_domain_party_Party_ {
	    data: party.Party[];
	    total: number;
	
	    static createFrom(source: any = {}) {
	        return new PageResult_fish_internal_domain_party_Party_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.data = this.convertValues(source["data"], party.Party);
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

export namespace invoice {
	
	export class CreateFishSaleInvoiceInput {
	    type: string;
	    status: string;
	    note?: string;
	    createdAt: time.Time;
	    customerId: string;
	    isNewCustomer: boolean;
	    newCustomerName?: string;
	    items: container.CreateFishContainerInput[];
	    totalAmount: number;
	
	    static createFrom(source: any = {}) {
	        return new CreateFishSaleInvoiceInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.note = source["note"];
	        this.createdAt = this.convertValues(source["createdAt"], time.Time);
	        this.customerId = source["customerId"];
	        this.isNewCustomer = source["isNewCustomer"];
	        this.newCustomerName = source["newCustomerName"];
	        this.items = this.convertValues(source["items"], container.CreateFishContainerInput);
	        this.totalAmount = source["totalAmount"];
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
	export class FishSaleInvoice {
	    id: string;
	    createdAt: time.Time;
	    type: string;
	    status: string;
	    note?: string;
	    customerId: string;
	    customer: party.Party;
	    items: container.FishContainer[];
	    totalAmount: number;
	
	    static createFrom(source: any = {}) {
	        return new FishSaleInvoice(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.createdAt = this.convertValues(source["createdAt"], time.Time);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.note = source["note"];
	        this.customerId = source["customerId"];
	        this.customer = this.convertValues(source["customer"], party.Party);
	        this.items = this.convertValues(source["items"], container.FishContainer);
	        this.totalAmount = source["totalAmount"];
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
	export class InvoiceFilter {
	    id?: string;
	    type?: string;
	    name?: string;
	    fromDate?: time.Time;
	    toDate?: time.Time;
	    page: number;
	    pageSize: number;
	
	    static createFrom(source: any = {}) {
	        return new InvoiceFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.type = source["type"];
	        this.name = source["name"];
	        this.fromDate = this.convertValues(source["fromDate"], time.Time);
	        this.toDate = this.convertValues(source["toDate"], time.Time);
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

}

export namespace party {
	
	export class CreatePartyInput {
	    name: string;
	    phone?: string;
	    note?: string;
	
	    static createFrom(source: any = {}) {
	        return new CreatePartyInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.phone = source["phone"];
	        this.note = source["note"];
	    }
	}
	export class Party {
	    id: string;
	    name: string;
	    phone?: string;
	    note?: string;
	
	    static createFrom(source: any = {}) {
	        return new Party(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.phone = source["phone"];
	        this.note = source["note"];
	    }
	}
	export class PartyFilter {
	    name?: string;
	    type?: string;
	    phone?: string;
	    page: number;
	    pageSize: number;
	
	    static createFrom(source: any = {}) {
	        return new PartyFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	        this.phone = source["phone"];
	        this.page = source["page"];
	        this.pageSize = source["pageSize"];
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
	    amount: number;
	    type: string;
	    occurredAt: time.Time;
	    invoiceId?: string;
	    category?: string;
	    note?: string;
	
	    static createFrom(source: any = {}) {
	        return new Transaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.amount = source["amount"];
	        this.type = source["type"];
	        this.occurredAt = this.convertValues(source["occurredAt"], time.Time);
	        this.invoiceId = source["invoiceId"];
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

