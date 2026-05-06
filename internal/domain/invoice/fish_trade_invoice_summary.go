package invoice

type FishTradeInvoiceSummary struct {
	TotalInvoices int32 `json:"totalInvoice"`
	Pending       int32 `json:"pending"`
	Paid          int32 `json:"paid"`
}
