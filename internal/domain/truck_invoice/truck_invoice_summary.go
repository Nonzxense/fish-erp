package truckinvoice

type TruckInvoiceSummary struct {
	Pending       int64 `json:"pending"`
	Paid          int64 `json:"paid"`
}
