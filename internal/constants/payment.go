package constants

const (
	RefTruckInvoice        = "truck_invoice"
	RefFishSaleInvoice     = "fish_sale_invoice"
	RefFishPurchaseInvoice = "fish_purchase_invoice"
)

type PaymentDirection string

const (
	PaymentIn  PaymentDirection = "in"
	PaymentOut PaymentDirection = "out"
)
